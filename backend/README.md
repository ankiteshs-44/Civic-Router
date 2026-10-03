# Civic Complaint Router — Backend (FastAPI + SQLite + OpenAI)

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then fill in OPENAI_API_KEY
```

## Run

```bash
# from inside backend/
uvicorn main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/complain` | Route a complaint (AI → regex fallback), log it |
| `GET` | `/stats` | Complaint counts by category |
| `GET` | `/health` | Liveness + whether the LLM is configured |
| `GET` | `/complaints/recent` | Last N complaints (debug/demo) |

### `POST /complain`

Request:

```json
{ "text": "drain overflowing near sector 4", "image_base64": null, "language": "en" }
```

Response (the shared contract):

```json
{
  "category": "Sewerage",
  "location": "Sector 4",
  "urgency": "high",
  "authority": {
    "name": "Navi Mumbai Municipal Corporation (NMMC)",
    "department": "Sewerage & Drainage Department",
    "phone": "1800-222-309",
    "portal_url": "https://www.nmmc.gov.in",
    "portal_name": "NMMC Online Grievance Redressal Portal"
  },
  "letter": "To,\n... formal complaint letter ...",
  "timeline": [
    { "step": "Complaint submitted", "day_offset": 0, "description": "..." }
  ],
  "needs_followup": false
}
```

The routing engine used is returned in the `X-Route-Source` response header
(`ai` or `fallback`).

## Behaviour / edge cases

* **8-second timeout** on the AI call → automatic regex fallback.
* **Missing location** → `needs_followup: true` + bold warning prefixed to the letter.
* **High urgency** (open manhole, live wire, …) → phone forced to the NMMC
  Disaster Management helpline (`1800-222-309`).
* **Photo attached** → vision check confirms the hazard and appends an
  `Evidence:` note to the letter.
* **Marathi/Hindi/Hinglish** input is understood; the letter/timeline are always English.

## Tests

```bash
pytest -q
```

> Authority phone numbers / portals are **illustrative demo data** — verify
> against official NMMC sources before real use.