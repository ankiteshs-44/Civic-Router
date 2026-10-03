"""Pydantic models defining the shared JSON contract.

The ``/complain`` response MUST match :class:`ComplaintResponse` exactly. Both
the AI router (``ai_router.py``) and the regex fallback (``fallback.py``) build
their output through these models, guaranteeing a stable contract for the
frontend.
"""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

#: Handling priority (matches the shared contract).
Urgency = Literal["low", "medium", "high"]
Category = Literal[
    "Solid Waste",
    "Water",
    "Electrical",
    "PWD",
    "Sewerage",
    "Encroachment",
    "Health",
    "Traffic",
]


class Authority(BaseModel):
    """The municipal body responsible for the complaint."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., description="Authority name, e.g. 'Navi Mumbai Municipal Corporation (NMMC)'.")
    department: str = Field(..., description="Department within the authority.")
    phone: str = Field(..., description="Contact phone number.")
    portal_url: str = Field(..., description="Official complaint portal URL.")
    portal_name: str = Field(..., description="Human-friendly portal name.")


class TimelineStep(BaseModel):
    """One step in the escalation timeline."""

    model_config = ConfigDict(extra="forbid")

    step: str = Field(..., description="Short step label.")
    day_offset: int = Field(..., ge=0, description="Days from today (0 = today).")
    description: str = Field(..., description="What happens at this step.")


class ComplaintResponse(BaseModel):
    """The exact response body returned by ``POST /complain``."""

    model_config = ConfigDict(extra="forbid")

    category: Category
    location: str
    urgency: Urgency
    authority: Authority
    letter: str
    timeline: List[TimelineStep]
    needs_followup: bool = False


class ComplaintRequest(BaseModel):
    """Request body for ``POST /complain``."""

    model_config = ConfigDict(extra="forbid")

    text: str = Field(..., min_length=1, max_length=5000, description="The citizen's complaint text.")
    image_base64: Optional[str] = Field(
        default=None,
        max_length=12_000_000,
        description="Optional base64-encoded image (data URL prefix allowed).",
    )
    language: Optional[Literal["en", "hi", "mr"]] = Field(
        default="en",
        description="Complaint language: 'en' | 'hi' | 'mr'.",
    )

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Complaint text must not be blank.")
        return value