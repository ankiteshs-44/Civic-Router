"""Central configuration for the Civic Complaint Router backend.

All values come from environment variables (loaded from a local ``.env`` file
when present) with safe defaults, so the server boots even with no config.
"""

from __future__ import annotations

import os
import math
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env if it exists (does not override real environment variables).
load_dotenv(Path(__file__).resolve().parent / ".env")

BASE_DIR = Path(__file__).resolve().parent

# --- LLM --------------------------------------------------------------------
# Groq is OpenAI-compatible, so support both providers without changing the app
# code that calls the OpenAI SDK.
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip() or "https://api.groq.com/openai/v1"
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL: str | None = os.getenv("OPENAI_BASE_URL", "").strip() or None
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

# --- Server / data ----------------------------------------------------------
DB_PATH: str = os.getenv("DB_PATH", str(BASE_DIR / "complaints.db")).strip() or str(
    BASE_DIR / "complaints.db"
)


def _as_float(value: str, default: float) -> float:
    """Parse a float defensively; fall back to ``default`` on bad input."""
    try:
        parsed = float(value)
        return parsed if math.isfinite(parsed) else default
    except (TypeError, ValueError):
        return default


AI_TIMEOUT_SECONDS: float = min(
    8.0,
    max(0.1, _as_float(os.getenv("AI_TIMEOUT_SECONDS", "8"), 8.0)),
)

# NMMC Disaster Management helpline, forced as the authority phone for
# high-urgency complaints (open manhole, live wire, etc.).
NMMC_DISASTER_NUMBER: str = os.getenv("NMMC_DISASTER_NUMBER", "1800-222-309").strip() or "1800-222-309"

# CORS origins allowed to call the API (the Vite dev server by default).
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]