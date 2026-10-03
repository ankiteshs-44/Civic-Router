"""Command-line entry point for the AI module.

Usage::

    python -m ai_module.cli "drain overflowing near sector 4"

Prints the structured JSON payload (pretty-printed) to stdout. This is handy
for manual smoke-testing and for demos without the FastAPI backend running.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Optional, Sequence

from ai_module import analyze_complaint


def build_parser() -> argparse.ArgumentParser:
    """Create the argument parser (kept separate so tests can import it)."""
    parser = argparse.ArgumentParser(
        prog="python -m ai_module.cli",
        description="Route a plain-language civic complaint to the right authority (JSON output).",
    )
    parser.add_argument(
        "text",
        help="The citizen's complaint text, e.g. 'drain overflowing near sector 4'.",
    )
    parser.add_argument(
        "--lang",
        dest="lang_hint",
        default=None,
        help="Optional language hint, e.g. 'en', 'hi', 'mr' (default: auto/en).",
    )
    parser.add_argument(
        "--location-answer",
        dest="location_answer",
        default=None,
        help="Optional answer to a follow-up question about the location.",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Parse args, run the analyzer and print pretty JSON. Returns an exit code."""
    args = build_parser().parse_args(argv)

    result = analyze_complaint(
        args.text,
        lang_hint=args.lang_hint,
        location_answer=args.location_answer,
    )

    # ensure_ascii=False keeps Devanagari / other scripts readable if present.
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())