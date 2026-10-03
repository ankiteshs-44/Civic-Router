"""Pydantic v2 models defining the JSON contract for the AI module.

This contract is the stable interface between this module, the FastAPI backend
and the React frontend (see ``src/mock/mockResponse.js``). The six CORE fields
below are REQUIRED and always present. The remaining fields are OPTIONAL with
defaults, so older consumers that only read the core fields keep working when
new fields are added later.

Core contract::

    {
      "category": str,
      "location": str,
      "urgency": "low" | "medium" | "high",
      "authority": {
        "name": str, "department": str, "phone": str,
        "portal_url": str, "portal_name": str
      },
      "letter": str,                       # formal, multi-line complaint letter
      "timeline": [ {"step": str, "day_offset": int, "description": str} ]
    }

Optional extras (always present thanks to defaults): ``follow_up_question``,
``emergency``, ``language``, ``confidence``, ``source``, ``route_verified``,
``photo_check``.
"""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

# --- Enumerated value types (kept as Literals so they appear in the JSON schema) ---

#: How urgently the complaint should be handled.
Urgency = Literal["low", "medium", "high"]

#: Which engine produced the answer: the LLM, the rule-based fallback, or the stub.
Source = Literal["llm", "rules", "stub"]


class Authority(BaseModel):
    """The government body responsible for handling the complaint."""

    name: str = Field(..., description="Name of the authority, e.g. 'Navi Mumbai Municipal Corporation (NMMC)'.")
    department: str = Field(..., description="Relevant department within the authority.")
    phone: str = Field(..., description="Contact phone number for the department.")
    portal_url: str = Field(..., description="URL of the official complaint portal.")
    portal_name: str = Field(..., description="Human-friendly name of the complaint portal.")


class TimelineStep(BaseModel):
    """A single step in the expected resolution timeline."""

    step: str = Field(..., description="Short label for the step.")
    day_offset: int = Field(
        ..., ge=0, description="Days from today when this step is expected (0 = today)."
    )
    description: str = Field(..., description="What is expected to happen at this step.")


class EmergencyContact(BaseModel):
    """An emergency number to surface for high-urgency complaints."""

    label: str = Field(..., description="What the number is for, e.g. 'Fire Brigade'.")
    number: str = Field(..., description="The dialable phone number.")


class PhotoCheck(BaseModel):
    """Result of inspecting an optional citizen-supplied photo."""

    status: str = Field(..., description="Short status, e.g. 'ok' or 'unclear'.")
    note: str = Field(..., description="Human-readable explanation of the status.")


class ComplaintAnalysis(BaseModel):
    """The full structured result returned by :func:`ai_module.analyzer.analyze_complaint`.

    Core (required) fields are declared first to preserve the documented JSON
    key order; optional extras follow with defaults so existing consumers never
    break when the contract grows.
    """

    # --- Required core contract -------------------------------------------------
    category: str = Field(..., description="Complaint category, e.g. 'Drainage / Sewage Overflow'.")
    location: str = Field(..., description="Normalised location string.")
    urgency: Urgency = Field(..., description="Handling priority.")
    authority: Authority = Field(..., description="Responsible authority and its contact details.")
    letter: str = Field(..., description="Formal, multi-line complaint letter (plain text).")
    timeline: List[TimelineStep] = Field(
        ..., description="Ordered list of expected resolution steps."
    )

    # --- Optional extras (defaulted, backwards-compatible) ----------------------
    follow_up_question: Optional[str] = Field(
        default=None,
        description="A clarifying question to ask the citizen, if the input was ambiguous.",
    )
    emergency: Optional[EmergencyContact] = Field(
        default=None,
        description="Emergency contact to surface, if applicable (e.g. waterlogging).",
    )
    language: str = Field(default="en", description="Detected/assumed language code, e.g. 'en'.")
    confidence: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Model confidence in the result, in [0, 1]."
    )
    source: Source = Field(default="stub", description="Which engine produced this result.")
    route_verified: bool = Field(
        default=False, description="True if the authority routing was verified against data."
    )
    photo_check: Optional[PhotoCheck] = Field(
        default=None, description="Result of checking an optional photo, if one was provided."
    )