"""FastAPI application for the Civic Complaint Router.

Endpoints:
    POST /complain  -> route a complaint (AI first, regex fallback), log it.
    GET  /stats     -> complaint counts by category.
    GET  /health    -> liveness + whether the LLM is configured.
    GET  /complaints/recent -> last N complaints (debug/demo aid).

Run (from inside ``backend/``)::

    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import ai_router
import config
import database
import fallback
from schemas import ComplaintRequest, ComplaintResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("civic")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create the SQLite table on startup."""
    database.init_db()
    logger.info("SQLite ready at %s", config.DB_PATH)
    yield


app = FastAPI(
    title="Civic Complaint Router API",
    description="Routes a plain-language Navi Mumbai civic complaint to the right authority.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Liveness probe; also reports whether the LLM router is configured."""
    return {
        "status": "ok",
        "ai_configured": ai_router.is_configured(),
        "model": config.OPENAI_MODEL,
        "timeout_seconds": config.AI_TIMEOUT_SECONDS,
    }


@app.post("/complain")
async def complain(payload: ComplaintRequest, response: Response) -> dict:
    """Route a complaint, log it, and return the shared JSON contract.

    The AI call is wrapped in a strict ``AI_TIMEOUT_SECONDS`` (default 8s)
    timeout. On ANY failure the regex router in :mod:`fallback` is used, so the
    endpoint always returns a valid payload.
    """
    text = payload.text.strip()
    language = (payload.language or "en").strip() or "en"

    source = "ai"
    location_value = payload.location.strip() if payload.location else None
    location_source = payload.location_source or "unknown"
    try:
        result = await asyncio.wait_for(
            ai_router.route(
                text,
                language=language,
                image_base64=payload.image_base64,
                location=location_value,
                location_source=location_source,
                latitude=payload.latitude,
                longitude=payload.longitude,
            ),
            timeout=min(config.AI_TIMEOUT_SECONDS, 8.0),
        )
    except (ai_router.AIRouterUnavailable, asyncio.TimeoutError) as exc:
        logger.warning("AI routing unavailable (%s); using regex fallback.", exc)
        source = "fallback"
        result = fallback.route(
            text,
            language=language,
            location=location_value,
            location_source=location_source,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
    except Exception as exc:  # noqa: BLE001 - never 500 on an unexpected AI error
        logger.error("Unexpected AI error (%s); using regex fallback.", exc)
        source = "fallback"
        result = fallback.route(
            text,
            language=language,
            location=location_value,
            location_source=location_source,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )

    if payload.image_base64 and source == "fallback":
        result["letter"] += (
            "\n\nEvidence: A photograph was attached to this complaint. "
            "Automated visual confirmation was unavailable."
        )

    # Guarantee the response matches the contract before returning.
    try:
        validated = ComplaintResponse.model_validate(result)
    except Exception as exc:  # noqa: BLE001 - last-resort guard
        logger.error("Result failed validation (%s); using regex fallback.", exc)
        source = "fallback"
        validated = ComplaintResponse.model_validate(fallback.route(text, language=language))

    final = validated.model_dump()

    # Log to SQLite (never fail the request because of logging issues).
    try:
        database.log_complaint(
            text=text,
            category=final["category"],
            urgency=final["urgency"],
            location=final["location"],
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to log complaint: %s", exc)

    # Expose the routing source as a header (keeps the JSON body on-contract).
    response.headers["X-Route-Source"] = source
    return final


@app.get("/stats")
def stats() -> dict:
    """Return the total complaint count and a breakdown by category."""
    return database.get_stats()


@app.get("/complaints/recent")
def recent(limit: int = 20) -> dict:
    """Return the most recent complaints (debug/demo convenience)."""
    return {"items": database.recent_complaints(limit=limit)}


@app.get("/")
def root() -> dict:
    """Tiny index so hitting the base URL is not a 404."""
    return {"service": "Civic Complaint Router API", "docs": "/docs", "health": "/health"}