"""LLM-based complaint router (OpenAI SDK + Pydantic).

``route`` asks an OpenAI-compatible chat model (default ``gpt-4o-mini``) to
produce a JSON object matching the shared contract, using ``response_format``
for strict JSON output. The result is then validated against
:class:`schemas.ComplaintResponse` and post-processed:

* missing location  -> ``needs_followup=True`` and a bold warning in the letter;
* high urgency      -> authority phone forced to the NMMC Disaster helpline;
* image supplied    -> a vision check confirms the hazard, may raise urgency,
                       and appends an "Evidence:" note to the letter.

Any failure (no API key, network error, timeout, bad JSON) raises
:class:`AIRouterUnavailable`; ``main.py`` catches it and falls back to the
regex router in :mod:`fallback`.
"""

from __future__ import annotations

import asyncio
import base64
import json
import re
from typing import Any, Dict, Optional

from openai import AsyncOpenAI

import config
from schemas import Authority, ComplaintResponse, TimelineStep

# The 8 NMMC categories the model must choose from.
CATEGORIES = [
    "Solid Waste",
    "Water",
    "Electrical",
    "PWD",
    "Sewerage",
    "Encroachment",
    "Health",
    "Traffic",
]

# Sentinels for "location unknown" returned by the model.
UNKNOWN_LOCATION = {
    "", "unknown", "n/a", "na", "not specified", "unspecified", "none",
    "not known", "location not specified",
}

FOLLOWUP_WARNING = (
    "**IMPORTANT:** The exact location could not be determined from your "
    "description. Please reply with your sector / locality so this complaint "
    "can be routed to the correct ward office.\n\n"
)

SYSTEM_PROMPT = f"""You are a civic complaint routing assistant for Navi Mumbai \
Municipal Corporation (NMMC). The citizen may write in English, Hindi, Marathi \
or Hinglish. Understand the complaint in any language, but ALWAYS write the \
"letter" and "timeline" descriptions in formal English.

Classify the complaint into EXACTLY ONE of these 8 categories:
{", ".join(CATEGORIES)}.

Route to the correct authority. Use these departments:
- Solid Waste -> Solid Waste Management Department
- Water -> Water Supply Department
- Electrical -> Electrical Department (Street Lighting)
- PWD -> Public Works Department (PWD)
- Sewerage -> Sewerage & Drainage Department
- Encroachment -> Encroachment / Anti-Encroachment Department
- Health -> Health Department
- Traffic -> Navi Mumbai Traffic Police (department "Traffic Control")

Urgency:
- "high" for immediate danger to life/safety (open manhole, live wire, "
  "collapse, fire, gas leak, deep flooding).
- "medium" for significant civic problems affecting many people.
- "low" for minor or cosmetic issues.

Location: extract the sector / locality if present (e.g. "Sector 4, Navi Mumbai"
"or "Near Seawoods market"). If the location is genuinely missing, set "location" "
"to "Location not specified" and "needs_followup" to true.

Return ONLY a JSON object with these keys:
{{
  "category": string (one of the 8 above),
  "location": string,
  "location_source": "text" | "user_input" | "gps" | "combined" | "unknown",
  "location_confidence": number between 0 and 1,
  "urgency": "low" | "medium" | "high",
  "authority": {{
    "name": string,
    "department": string,
    "phone": string,
    "portal_url": string,
    "portal_name": string
  }},
  "problem_summary": string,
  "specific_details": [string],
  "impact": string,
  "recommended_actions": [string],
  "related_issues": [string],
  "letter": string (formal multi-line complaint letter, plain text, ending with \
a salutation block and [Your Full Name] / [Your Mobile Number] / [Your Address] \
/ [Date] placeholders),
  "timeline": [ {{ "step": string, "day_offset": integer, "description": string }} ],
  "needs_followup": boolean
}}

The "letter" MUST be a complete formal letter beginning with "To," and the \
authority address, including a "Subject:" line. The "timeline" MUST have 4-6 \
ordered steps with increasing "day_offset" values starting at 0. Do not invent a \
precise address if the citizen did not provide one. If the location is unavailable, \
keep "location": "Location not specified" and set "needs_followup": true."""


class AIRouterUnavailable(RuntimeError):
    """Raised when the LLM route cannot produce a valid response."""


def _client() -> AsyncOpenAI:
    """Build a fresh AsyncOpenAI client, or raise if unconfigured."""
    api_key = config.GROQ_API_KEY or config.OPENAI_API_KEY
    if not api_key:
        raise AIRouterUnavailable("No API key configured for Groq or OpenAI.")

    kwargs: Dict[str, Any] = {"api_key": api_key}
    base_url = config.GROQ_BASE_URL if config.GROQ_API_KEY else config.OPENAI_BASE_URL
    if base_url:
        kwargs["base_url"] = base_url
    return AsyncOpenAI(**kwargs)


def _normalise_image(image_base64: str) -> str:
    """Return a usable ``data:image/...;base64,...`` URL from raw or data input.

    Raises :class:`AIRouterUnavailable` when the value is not valid base64.
    """
    value = (image_base64 or "").strip()
    if not value:
        raise AIRouterUnavailable("Empty image payload.")

    if value.startswith("data:image"):
        match = re.fullmatch(
            r"data:image/(?:jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/]+={0,2})",
            value,
            flags=re.IGNORECASE,
        )
        if not match:
            raise AIRouterUnavailable("Image data URL has an unsupported or invalid format.")
        try:
            base64.b64decode(match.group(1), validate=True)
        except ValueError as exc:
            raise AIRouterUnavailable(f"Invalid image data URL: {exc}") from exc
        return value

    # Raw base64 string: validate, then wrap as a data URL.
    try:
        base64.b64decode(value, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise AIRouterUnavailable(f"Invalid base64 image: {exc}") from exc
    return f"data:image/jpeg;base64,{value}"


def _user_content(text: str, image_base64: Optional[str]) -> Any:
    """Build the message content (text + optional image) for the model."""
    language_note = ""
    content: Any = f'Complaint (may be in Hindi/Marathi/Hinglish):\n"""{text}"""'
    if image_base64:
        content = [
            {
                "type": "text",
                "text": (
                    "Analyse the citizen's complaint AND the attached photo. "
                    "Use the photo only to CONFIRM the hazard and gauge severity; "
                    "do not change the category unless the photo clearly shows a "
                    "different issue.\n\n" + language_note + str(content)
                ),
            },
            {"type": "image_url", "image_url": {"url": _normalise_image(image_base64)}},
        ]
    return content


async def _call_model(text: str, image_base64: Optional[str]) -> str:
    """Call the chat model and return the raw JSON string content."""
    client = _client()
    completion = await asyncio.wait_for(
        client.chat.completions.create(
            model=config.OPENAI_MODEL,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "civic_complaint_response",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "category": {"type": "string", "enum": CATEGORIES},
                            "location": {"type": "string"},
                            "location_source": {"type": "string", "enum": ["text", "user_input", "gps", "combined", "unknown"]},
                            "location_confidence": {"type": "number"},
                            "urgency": {"type": "string", "enum": ["low", "medium", "high"]},
                            "authority": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "name": {"type": "string"},
                                    "department": {"type": "string"},
                                    "phone": {"type": "string"},
                                    "portal_url": {"type": "string"},
                                    "portal_name": {"type": "string"},
                                },
                                "required": ["name", "department", "phone", "portal_url", "portal_name"],
                            },
                            "problem_summary": {"type": "string"},
                            "specific_details": {"type": "array", "items": {"type": "string"}},
                            "impact": {"type": "string"},
                            "recommended_actions": {"type": "array", "items": {"type": "string"}},
                            "related_issues": {"type": "array", "items": {"type": "string"}},
                            "letter": {"type": "string"},
                            "timeline": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "additionalProperties": False,
                                    "properties": {
                                        "step": {"type": "string"},
                                        "day_offset": {"type": "integer"},
                                        "description": {"type": "string"},
                                    },
                                    "required": ["step", "day_offset", "description"],
                                },
                            },
                            "needs_followup": {"type": "boolean"},
                        },
                        "required": [
                            "category",
                            "location",
                            "location_source",
                            "location_confidence",
                            "urgency",
                            "authority",
                            "problem_summary",
                            "specific_details",
                            "impact",
                            "recommended_actions",
                            "related_issues",
                            "letter",
                            "timeline",
                            "needs_followup",
                        ],
                    },
                },
            },
            temperature=0.2,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _user_content(text, image_base64)},
            ],
        ),
        timeout=config.AI_TIMEOUT_SECONDS,
    )
    content = completion.choices[0].message.content if completion.choices else None
    if not content:
        raise AIRouterUnavailable("Model returned an empty response.")
    return content


def _coerce_model(payload: Dict[str, Any]) -> ComplaintResponse:
    """Validate the model's parsed JSON against the contract.

    Tolerant of minor shape drift: unknown categories are kept as-is, missing
    optional keys get sensible defaults, and timeline entries are normalised.
    """
    if not isinstance(payload, dict):
        raise AIRouterUnavailable("Model JSON was not an object.")

    authority_raw = payload.get("authority") or {}
    if not isinstance(authority_raw, dict):
        raise AIRouterUnavailable("Model 'authority' was not an object.")

    timeline_raw = payload.get("timeline") or []
    timeline = []
    if isinstance(timeline_raw, list):
        for step in timeline_raw:
            if isinstance(step, dict) and step.get("step"):
                try:
                    day_offset = int(step.get("day_offset", 0))
                except (TypeError, ValueError):
                    day_offset = 0
                timeline.append(
                    TimelineStep(
                        step=str(step.get("step", "")).strip() or "Step",
                        day_offset=max(0, day_offset),
                        description=str(step.get("description", "")).strip(),
                    )
                )
    if not timeline:
        # Guarantee a non-empty timeline so the frontend always renders.
        timeline = [TimelineStep(step="Complaint submitted", day_offset=0, description="Your complaint has been filed.")]

    urgency = str(payload.get("urgency", "medium")).lower()
    if urgency not in {"low", "medium", "high"}:
        urgency = "medium"

    authority = Authority(
        name=str(authority_raw.get("name", "")).strip() or "Navi Mumbai Municipal Corporation (NMMC)",
        department=str(authority_raw.get("department", "")).strip() or "Grievance Cell",
        phone=str(authority_raw.get("phone", "")).strip() or "022-27571000",
        portal_url=str(authority_raw.get("portal_url", "")).strip() or "https://www.nmmc.gov.in",
        portal_name=str(authority_raw.get("portal_name", "")).strip() or "NMMC Online Grievance Redressal Portal",
    )

    location_source = str(payload.get("location_source", "unknown") or "unknown").strip() or "unknown"
    if location_source not in {"text", "user_input", "gps", "combined", "unknown"}:
        location_source = "unknown"
    try:
        location_confidence = float(payload.get("location_confidence", 0.0) or 0.0)
    except (TypeError, ValueError):
        location_confidence = 0.0
    location_confidence = max(0.0, min(1.0, location_confidence))

    specific_details = payload.get("specific_details")
    if not isinstance(specific_details, list):
        specific_details = []
    recommended_actions = payload.get("recommended_actions")
    if not isinstance(recommended_actions, list):
        recommended_actions = []
    related_issues = payload.get("related_issues")
    if not isinstance(related_issues, list):
        related_issues = []

    return ComplaintResponse(
        category=(
            str(payload.get("category", "")).strip()
            if str(payload.get("category", "")).strip() in CATEGORIES
            else "PWD"
        ),
        location=str(payload.get("location", "")).strip(),
        location_source=location_source,  # type: ignore[arg-type]
        location_confidence=location_confidence,
        urgency=urgency,  # type: ignore[arg-type]
        authority=authority,
        problem_summary=str(payload.get("problem_summary", "") or "").strip(),
        specific_details=[str(item).strip() for item in specific_details if str(item).strip()],
        impact=str(payload.get("impact", "") or "").strip(),
        recommended_actions=[str(item).strip() for item in recommended_actions if str(item).strip()],
        related_issues=[str(item).strip() for item in related_issues if str(item).strip()],
        letter=str(payload.get("letter", "")).strip(),
        timeline=timeline,
        needs_followup=bool(payload.get("needs_followup", False)),
    )


def _post_process(
    response: ComplaintResponse,
    image_supplied: bool,
) -> ComplaintResponse:
    """Apply the deterministic edge-case rules on top of the model output."""
    location = response.location.strip()
    needs_followup = response.needs_followup or location.lower() in UNKNOWN_LOCATION

    letter = response.letter
    if needs_followup:
        if not location:
            response.location = "Location not specified"
        # Prepend the warning only once.
        if not letter.startswith(FOLLOWUP_WARNING):
            letter = FOLLOWUP_WARNING + letter

    if image_supplied:
        # The model already saw the photo; record it as evidence in the letter.
        evidence = (
            "\n\nEvidence: A photograph was submitted with this complaint to "
            "confirm the reported issue."
        )
        if "Evidence:" not in letter:
            letter = letter + evidence

    # High urgency -> route via the NMMC Disaster Management helpline.
    if response.urgency == "high":
        response.authority.phone = config.NMMC_DISASTER_NUMBER

    response.location = response.location.strip() or "Location not specified"
    response.letter = letter
    response.needs_followup = needs_followup
    return response


async def route(
    text: str,
    language: Optional[str] = "en",
    image_base64: Optional[str] = None,
    location: Optional[str] = None,
    location_source: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> dict:
    """Route a complaint through the LLM and return a contract-valid dict.

    Raises :class:`AIRouterUnavailable` on any failure so the caller can fall
    back to :func:`fallback.route`.
    """
    try:
        raw = await _call_model(text, image_base64)
        payload = json.loads(raw)
        if location and isinstance(payload, dict):
            payload["location"] = location.strip() or "Location not specified"
            payload["location_source"] = (location_source or "user_input").strip() or "user_input"
            payload["location_confidence"] = 0.96 if payload["location_source"] in {"user_input", "gps", "combined"} else 0.8
        parsed = _coerce_model(payload)
        processed = _post_process(parsed, image_supplied=bool(image_base64))
        return processed.model_dump()
    except AIRouterUnavailable:
        raise
    except asyncio.TimeoutError as exc:
        raise AIRouterUnavailable(
            f"AI call timed out after {config.AI_TIMEOUT_SECONDS}s."
        ) from exc
    except Exception as exc:  # noqa: BLE001 - any SDK/JSON error means "fall back"
        raise AIRouterUnavailable(f"AI route failed: {exc}") from exc


def is_configured() -> bool:
    """True when an API key is present (used for a friendly ``/health``)."""
    return bool(config.GROQ_API_KEY or config.OPENAI_API_KEY)