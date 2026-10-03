"""Tests for the AI module JSON contract.

Run with::

    pytest -q
"""

from __future__ import annotations

from ai_module import analyze_complaint
from ai_module.schema import ComplaintAnalysis


def test_stub_output_validates_against_schema():
    """The stub analyzer must return a payload that satisfies the contract."""
    result = analyze_complaint("drain overflowing near sector 4")

    # 1. It must be a plain dict (ready for FastAPI to JSON-serialise).
    assert isinstance(result, dict)

    # 2. It must round-trip through the Pydantic model without errors...
    model = ComplaintAnalysis.model_validate(result)

    # ...and re-serialising must produce the same keys (stable contract).
    dumped = model.model_dump()
    assert set(dumped) == set(result)

    # 3. All REQUIRED core fields are present.
    for key in ("category", "location", "urgency", "authority", "letter", "timeline"):
        assert key in dumped, f"missing required field: {key}"

    # 4. Values have the documented types / allowed values.
    assert dumped["urgency"] in {"low", "medium", "high"}
    assert isinstance(dumped["authority"], dict)
    for key in ("name", "department", "phone", "portal_url", "portal_name"):
        assert key in dumped["authority"]
    assert isinstance(dumped["timeline"], list)
    for step in dumped["timeline"]:
        assert set(step) == {"step", "day_offset", "description"}
        assert isinstance(step["day_offset"], int)

    # 5. The letter is formal and multi-line, as required.
    assert "\n" in dumped["letter"]

    # 6. The optional extras exist (with defaults) and the stub flags itself.
    for key in (
        "follow_up_question",
        "emergency",
        "language",
        "confidence",
        "source",
        "route_verified",
        "photo_check",
    ):
        assert key in dumped, f"missing optional field: {key}"
    assert dumped["source"] == "stub"
    assert dumped["language"] == "en"