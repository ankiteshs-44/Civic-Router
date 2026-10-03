"""LLM client wrapper -- STUB (no implementation yet).

This module will hold the thin wrapper around an OpenAI-compatible chat client
(see ``openai`` in ``requirements.txt``) used to turn free text into the
structured JSON defined in :mod:`ai_module.schema`.

Environment variables consumed here (copy ``.env.example`` -> ``.env``)::

    LLM_API_KEY   API key for the LLM provider.
    LLM_BASE_URL  Base URL of an OpenAI-compatible endpoint (e.g. https://api.openai.com/v1).
    LLM_MODEL     Model name to call (e.g. gpt-4o-mini).

Nothing is implemented yet: :func:`ai_module.analyzer.analyze_complaint`
currently returns a hardcoded stub response so the backend can integrate early.
"""