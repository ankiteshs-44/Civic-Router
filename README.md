# Civic Complaint Router for Navi Mumbai

A mobile-first React app that routes a civic complaint to an NMMC department,
generates a formal letter and provides an escalation timeline. The FastAPI
backend uses OpenAI when configured and falls back to a local keyword router
when the model is unavailable. Complaints are recorded in SQLite.

## Setup

### Frontend

From the repository root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` to use the API. If
the API is unreachable, the frontend automatically uses local mock results and
shows a Demo Mode badge.

To scaffold an equivalent React + Vite app from scratch (not needed for this
repository):

```bash
npm create vite@latest frontend -- --template react
```

### Backend

In a second terminal, from the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Add an `OPENAI_API_KEY` to `backend/.env` to enable GPT-4o-mini routing and
vision analysis. The API remains functional without a key by using its regex
router. Start the server:

```bash
uvicorn main:app --reload --port 8000
```

The SQLite database is created as `backend/complaints.db` on startup. API
documentation is available at `http://localhost:8000/docs`.

## AI module (`ai_module/`)

The `ai_module` package is the AI + data layer. It turns a citizen's free-text
complaint into a structured JSON payload. It is owned and maintained separately
from the FastAPI backend and the React frontend; both consume it through the
stable contract below.

### Setup

Python 3.11+ is required. From the repository root:

```bash
python3.11 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt    # openai, pydantic>=2, python-dotenv, pytest, pillow
cp .env.example .env               # fill in LLM_* only when the real LLM client lands
```

> No `python3.11` locally? Any 3.11+ interpreter works the same way, e.g.
> `python3 -m venv .venv`. The stub has no version-specific code.

### How the backend imports and calls it

The module exposes exactly one public function:

```python
from ai_module import analyze_complaint

# text is the only required argument; everything else is optional.
payload = analyze_complaint(
    "drain overflowing near sector 4",
    lang_hint="en",          # optional: "en" | "hi" | "mr" ...
    photo_bytes=None,        # optional: raw image bytes
    location_answer=None,    # optional: answer to a previous follow_up_question
)

# payload is a plain dict -> return it directly from FastAPI, e.g.
# return JSONResponse(content=analyze_complaint(request.text))
```

`analyze_complaint` returns a JSON-serialisable `dict` that always validates
against `ai_module.schema.ComplaintAnalysis`. **Current state: STUB** — it
returns a valid hardcoded response (drain overflow in Sector 4, Vashi, handled
by NMMC) for any input, so the backend and frontend can integrate before the
real classifier exists. The signature and output shape will not change.

You can also validate a payload yourself:

```python
from ai_module import ComplaintAnalysis
ComplaintAnalysis.model_validate(payload)  # raises if the contract is broken
```

### JSON contract

Six **core** fields are always present and required. The remaining fields are
**optional** with defaults, so older consumers keep working as the contract grows.

```json
{
  "category": "str",
  "location": "str",
  "urgency": "low | medium | high",
  "authority": {
    "name": "str",
    "department": "str",
    "phone": "str",
    "portal_url": "str",
    "portal_name": "str"
  },
  "letter": "str",
  "timeline": [
    { "step": "str", "day_offset": 0, "description": "str" }
  ],

  "follow_up_question": null,
  "emergency": { "label": "str", "number": "str" },
  "language": "en",
  "confidence": 0.0,
  "source": "llm | rules | stub",
  "route_verified": false,
  "photo_check": { "status": "str", "note": "str" }
}
```

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `category` | `str` | yes | — | Complaint category, e.g. `"Drainage / Sewage Overflow"`. |
| `location` | `str` | yes | — | Normalised location string. |
| `urgency` | `"low"｜"medium"｜"high"` | yes | — | Handling priority. |
| `authority` | `object` | yes | — | Responsible body (`name`, `department`, `phone`, `portal_url`, `portal_name`). |
| `letter` | `str` | yes | — | Formal, multi-line complaint letter. |
| `timeline` | `array` | yes | — | Ordered `{step, day_offset, description}` steps. |
| `follow_up_question` | `str \| null` | no | `null` | Clarifying question if the input was ambiguous. |
| `emergency` | `object \| null` | no | `null` | Emergency contact (`label`, `number`) when relevant. |
| `language` | `str` | no | `"en"` | Detected/assumed language code. |
| `confidence` | `float` | no | `0.0` | Confidence in `[0, 1]`. |
| `source` | `"llm"｜"rules"｜"stub"` | no | `"stub"` | Which engine produced the result. |
| `route_verified` | `bool` | no | `false` | `true` if routing was verified against data. |
| `photo_check` | `object \| null` | no | `null` | `{status, note}` from inspecting an optional photo. |

### CLI smoke test

```bash
python -m ai_module.cli "drain overflowing near sector 4"
python -m ai_module.cli "kacra paani sadad" --lang mr
```

Prints the pretty-printed JSON payload to stdout.

### Environment variables

Copy `.env.example` to `.env`. These are only required once the real LLM client
(`ai_module/llm_client.py`) is implemented; the current stub runs without them.

| Variable | Example | Purpose |
| --- | --- | --- |
| `LLM_API_KEY` | `sk-...` | API key for your LLM provider. |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | Base URL of an OpenAI-compatible endpoint. |
| `LLM_MODEL` | `gpt-4o-mini` | Model name to call. |

## API

`POST /complain` accepts:

```json
{
  "text": "Open manhole near Sector 4, Vashi",
  "image_base64": null,
  "language": "en"
}
```

The response uses the shared contract: `category`, `location`, `urgency`,
`authority`, `letter`, `timeline`, and `needs_followup`. The supported routing
categories are Solid Waste, Water, Electrical, PWD, Sewerage, Encroachment,
Health and Traffic. AI calls have a maximum eight-second timeout; failures use
the regex router. `GET /stats` returns complaint totals and counts by category.

## Validation

```bash
# From repository root, with the backend environment active
pytest -q backend/tests tests

# In frontend/
npm run build
```

Phone numbers and portals in the demo are illustrative. Confirm current
official contact details before using the app for real-world submissions.
