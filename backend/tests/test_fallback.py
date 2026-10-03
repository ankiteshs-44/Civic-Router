"""Tests for the regex fallback and the shared contract (no network needed)."""

from __future__ import annotations

import os
import sys

# Make ``backend/`` importable (fallback/schemas/config live there).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import fallback  # noqa: E402
from schemas import ComplaintResponse  # noqa: E402


def _assert_contract(result: dict) -> None:
    model = ComplaintResponse.model_validate(result)  # raises if invalid
    assert set(model.model_dump()) == {
        "category",
        "location",
        "urgency",
        "authority",
        "letter",
        "timeline",
        "needs_followup",
    }
    assert model.urgency in {"low", "medium", "high"}
    assert isinstance(model.timeline, list) and model.timeline
    assert "\n" in model.letter


def test_drain_routes_to_sewerage_with_location():
    result = fallback.route("drain overflowing near sector 4")
    _assert_contract(result)
    assert result["category"] == "Sewerage"
    assert "Sector 4" in result["location"]
    assert result["needs_followup"] is False


def test_missing_location_sets_followup():
    result = fallback.route("there is a lot of garbage everywhere")
    _assert_contract(result)
    assert result["category"] == "Solid Waste"
    assert result["needs_followup"] is True
    assert result["letter"].startswith("**IMPORTANT:**")


def test_high_urgency_forces_disaster_number():
    result = fallback.route("open manhole near sector 7 causing danger")
    _assert_contract(result)
    assert result["urgency"] == "high"
    assert result["authority"]["phone"] == fallback.config.NMMC_DISASTER_NUMBER


def test_hindi_keyword_routes_to_sewerage():
    result = fallback.route("नाला overflow ho raha hai")
    _assert_contract(result)
    assert result["category"] == "Sewerage"