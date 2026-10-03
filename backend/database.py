"""SQLite persistence for processed complaints.

Deliberately dependency-free (Python's built-in ``sqlite3``) so the hackathon
backend has zero extra moving parts. Every call opens a short-lived connection,
which keeps things thread-safe under FastAPI's default thread pool.
"""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Dict, Iterator, List

import config


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    """Open a connection, commit on success, always close."""
    conn = sqlite3.connect(config.DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create the ``complaints`` table if it does not exist."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS complaints (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT    NOT NULL,
                text      TEXT    NOT NULL,
                category  TEXT    NOT NULL,
                urgency   TEXT    NOT NULL,
                location  TEXT    NOT NULL
            )
            """
        )


def log_complaint(text: str, category: str, urgency: str, location: str) -> int:
    """Insert one processed complaint and return its new row id."""
    timestamp = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO complaints (timestamp, text, category, urgency, location)
            VALUES (?, ?, ?, ?, ?)
            """,
            (timestamp, text, category, urgency, location),
        )
        return int(cursor.lastrowid or 0)


def get_stats() -> Dict[str, object]:
    """Return ``{"total": int, "by_category": {category: count}}``."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT category, COUNT(*) AS count
            FROM complaints
            GROUP BY category
            ORDER BY count DESC, category ASC
            """
        ).fetchall()
        total_row = conn.execute("SELECT COUNT(*) AS count FROM complaints").fetchone()

    return {
        "total": int(total_row["count"]) if total_row else 0,
        "by_category": {row["category"]: int(row["count"]) for row in rows},
    }


def recent_complaints(limit: int = 20) -> List[Dict[str, object]]:
    """Return the most recent complaints (handy for debugging / demos)."""
    limit = max(1, min(int(limit), 200))
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, timestamp, text, category, urgency, location
            FROM complaints
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]