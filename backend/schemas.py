"""Pydantic models defining the shared JSON contract.

The ``/complain`` response MUST match :class:`ComplaintResponse` exactly. Both
the AI router (``ai_router.py``) and the regex fallback (``fallback.py``) build
their output through these models, guaranteeing a stable contract for the
frontend.
"""

from __future__ import annotations

from typing import Any, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

#: Handling priority (matches the shared contract).
Urgency = Literal["low", "medium", "high"]
LocationSource = Literal["text", "user_input", "gps", "combined", "unknown"]
Category = Literal[
    "Solid Waste",
    "Water",
    "Electrical",
    "PWD",
    "Sewerage",
    "Encroachment",
    "Health",
    "Traffic",
    "Crime / Safety",
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
    location_source: LocationSource = Field(default="unknown", description="Where the location came from.")
    location_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Confidence in the detected location.")
    urgency: Urgency
    authority: Authority
    problem_summary: str = Field(default="", description="Natural-language summary of the actual complaint.")
    specific_details: List[str] = Field(default_factory=list, description="Observed facts extracted from the complaint.")
    impact: str = Field(default="", description="Why the issue matters to residents or commuters.")
    recommended_actions: List[str] = Field(default_factory=list, description="Actions relevant to the specific issue.")
    related_issues: List[str] = Field(default_factory=list, description="Secondary issues mentioned in the same complaint.")
    letter: str
    timeline: List[TimelineStep]
    needs_followup: bool = False

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        kwargs.setdefault("exclude_none", True)
        return super().model_dump(*args, **kwargs)


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
    location: Optional[str] = Field(default=None, description="Optional explicit location provided by the user.")
    location_source: Optional[LocationSource] = Field(default=None, description="Source for the location metadata.")
    latitude: Optional[float] = Field(default=None, description="Optional latitude from browser geolocation.")
    longitude: Optional[float] = Field(default=None, description="Optional longitude from browser geolocation.")

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Complaint text must not be blank.")
        return value