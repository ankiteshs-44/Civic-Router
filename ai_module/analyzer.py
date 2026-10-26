"""Complaint analyzer -- the single entry point of the AI module.

CURRENT STATE: STUB.

``analyze_complaint`` returns a valid, hardcoded response for ANY input. The
response is built through
the :class:`~ai_module.schema.ComplaintAnalysis` Pydantic model and returned via
``model_dump()``, so it is guaranteed to satisfy the JSON contract.

This exists so the FastAPI backend teammate can ``import`` and call the function
in the first 20 minutes. Real classification (LLM via ``llm_client.py`` +
``classifier_rules.py`` + letter generation in ``letter.py``) will replace the
hardcoded body later WITHOUT changing the signature or the output shape.
"""

from __future__ import annotations

from typing import Optional

from ai_module.schema import (
    Authority,
    ComplaintAnalysis,
    EmergencyContact,
    TimelineStep,
)


def _stub_letter(location: str) -> str:
    """Build a formal, multi-line complaint letter for the stub response.

    Kept as a plain string with explicit newlines so the exact formatting is
    obvious both in Python and in the resulting JSON.
    """
    return (
        "To,\n"
        "The Commissioner,\n"
        "Navi Mumbai Municipal Corporation (NMMC),\n"
        "Palm Beach Road, CBD Belapur,\n"
        "Navi Mumbai - 400614\n"
        "\n"
        f"Subject: Complaint regarding continuous drain overflow near {location}\n"
        "\n"
        "Respected Sir/Madam,\n"
        "\n"
        f"I am writing to formally report a serious drainage problem near {location}. "
        "The storm-water drain in this area has been overflowing continuously, and "
        "untreated sewage water has spilled onto the road, emitting a strong odour "
        "and making it difficult for residents, shopkeepers and pedestrians to move around.\n"
        "\n"
        "This is a serious public-health and safety hazard, particularly for children "
        "and senior citizens. The stagnant water is a breeding ground for mosquitoes "
        "and increases the risk of water-borne diseases in the locality.\n"
        "\n"
        "I therefore request the Corporation to kindly:\n"
        "1. Deploy a drainage cleaning team immediately to clear the blockage.\n"
        "2. Disinfect the affected area to prevent any disease outbreak.\n"
        "3. Inspect and repair the damaged drain cover and pipeline.\n"
        "4. Inform residents of the expected time of resolution.\n"
        "\n"
        "I request you to acknowledge this complaint with a complaint/ticket number "
        "so that I can follow up.\n"
        "\n"
        "Thanking you,\n"
        "\n"
        "Yours faithfully,\n"
        "[Your Full Name]\n"
        "[Your Mobile Number]\n"
        "[Your Address / Sector]\n"
        "[Date]"
    )


def _stub_timeline() -> list[TimelineStep]:
    """Expected resolution steps for the hardcoded drain-overflow scenario."""
    return [
        TimelineStep(
            step="Complaint submitted",
            day_offset=0,
            description="Your complaint is filed with the NMMC Grievance Redressal Portal / ward office.",
        ),
        TimelineStep(
            step="Acknowledgement + ticket number",
            day_offset=1,
            description=(
                "NMMC should acknowledge the complaint and share a complaint number. "
                "If not received, follow up on the helpline."
            ),
        ),
        TimelineStep(
            step="Site inspection",
            day_offset=3,
            description="Ward-level drainage staff are expected to inspect the site and record the blockage.",
        ),
        TimelineStep(
            step="Reminder / escalation to Ward Officer",
            day_offset=7,
            description=(
                "If the drain is still overflowing, send a written reminder to the "
                "concerned Ward Officer."
            ),
        ),
        TimelineStep(
            step="Target resolution",
            day_offset=15,
            description="Target date for clearing the drain and disinfecting the affected stretch.",
        ),
    ]


def analyze_complaint(
    text: str,
    lang_hint: Optional[str] = None,
    photo_bytes: Optional[bytes] = None,
    location_answer: Optional[str] = None,
) -> dict:
    """Turn a citizen's free-text complaint into a structured routing payload.

    Parameters
    ----------
    text:
        The raw complaint text, e.g. ``"drain overflowing near sector 4"``.
    lang_hint:
        Optional BCP-47-ish language hint (e.g. ``"mr"``, ``"hi"``). Echoed into
        the ``language`` field; defaults to ``"en"`` when not provided.
    photo_bytes:
        Optional raw image bytes of a photo attached to the complaint. Unused by
        the stub; will drive the ``photo_check`` field once implemented.
    location_answer:
        Optional answer to a previous ``follow_up_question`` about the location.
        Unused by the stub.

    Returns
    -------
    dict
        A JSON-serialisable payload that validates against
        :class:`~ai_module.schema.ComplaintAnalysis`.

    Notes
    -----
    STUB: the return value is hardcoded and ignores ``text``/``photo_bytes``/
    ``location_answer`` for now. Only ``lang_hint`` is reflected back.
    """
    # Hardcoded demo values intentionally avoid a fixed city or sector so the
    # output cannot silently invent a location.
    location = "Location not specified"

    analysis = ComplaintAnalysis(
        category="Drainage / Sewage Overflow",
        location=location,
        urgency="high",
        authority=Authority(
            name="Navi Mumbai Municipal Corporation (NMMC)",
            department="Solid Waste Management & Drainage Department",
            phone="022-27571000",
            portal_url="https://www.nmmc.gov.in",
            portal_name="NMMC Online Grievance Redressal Portal",
        ),
        letter=_stub_letter(location),
        timeline=_stub_timeline(),
        # --- Optional extras (shown here so the shape is visible to consumers) ---
        follow_up_question=None,
        emergency=EmergencyContact(label="NMMC Emergency Control Room", number="022-27571000"),
        language=lang_hint or "en",
        confidence=1.0,
        source="stub",
        route_verified=True,
        photo_check=None,
    )

    # Validate + serialise: model_dump() returns plain dict/list/str/int/float/bool,
    # ready to be returned by FastAPI's JSONResponse.
    return analysis.model_dump()