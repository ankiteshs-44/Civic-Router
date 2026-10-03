"""Rule-based classifier -- STUB (no implementation yet).

This module will hold the deterministic, keyword/regex-based fallback used when
the LLM is unavailable or low-confidence. It maps a complaint's text to a
category and an :class:`~ai_module.schema.Authority` using the curated data in
``ai_module/data/authorities.json``.

Nothing is implemented yet: :func:`ai_module.analyzer.analyze_complaint`
currently returns a hardcoded stub response.
"""