"""ai_module -- AI + data layer for the "Civic Complaint Router for Navi Mumbai".

This package owns ONLY the intelligence/data layer. It turns a citizen's
free-text complaint into a structured JSON payload that the FastAPI backend
consumes and the React frontend renders.

Public API (the ONE function the backend teammate needs)::

    from ai_module import analyze_complaint

    payload = analyze_complaint("drain overflowing near sector 4")

The schema models are re-exported here too, so tests and the backend can
validate payloads without importing submodules directly.
"""

from __future__ import annotations

from ai_module.analyzer import analyze_complaint
from ai_module.schema import (
    Authority,
    ComplaintAnalysis,
    EmergencyContact,
    PhotoCheck,
    TimelineStep,
)

__all__ = [
    "analyze_complaint",
    "ComplaintAnalysis",
    "Authority",
    "TimelineStep",
    "EmergencyContact",
    "PhotoCheck",
]