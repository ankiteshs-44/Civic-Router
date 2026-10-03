"""API integration coverage for the contract, fallback and SQLite logging."""

from __future__ import annotations

import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import ai_router  # noqa: E402
import config  # noqa: E402
from main import app  # noqa: E402


def test_complain_falls_back_and_logs_contract(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "DB_PATH", str(tmp_path / "complaints.db"))

    async def unavailable(*args, **kwargs):
        raise ai_router.AIRouterUnavailable("test fallback")

    monkeypatch.setattr(ai_router, "route", unavailable)

    with TestClient(app) as client:
        response = client.post(
            "/complain",
            json={"text": "open manhole near sector 7", "language": "en"},
        )
        assert response.status_code == 200
        assert response.headers["x-route-source"] == "fallback"
        result = response.json()

        assert set(result) == {
            "category",
            "location",
            "urgency",
            "authority",
            "letter",
            "timeline",
            "needs_followup",
        }
        assert result["urgency"] == "high"
        assert result["authority"]["phone"] == "1800-222-309"
        assert client.get("/stats").json()["by_category"]["Sewerage"] == 1
