"""Rule-based (keyword/regex) complaint router -- the API's safety net.

If the LLM call fails, times out, or returns unparseable output, ``main.py``
calls :func:`route` so the API NEVER crashes and always returns a payload that
matches the shared contract (see :mod:`schemas`).

Handles English, Hindi, Marathi and Hinglish keywords. Authority contact
details are ILLUSTRATIVE demo data for a hackathon -- verify against official
sources before real use.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional

import config
from schemas import Authority, ComplaintResponse, TimelineStep


# --------------------------------------------------------------------------- #
# Category catalogue: the FIRST matching rule wins, so order = specificity.
# --------------------------------------------------------------------------- #
CATEGORY_RULES: List[Dict[str, object]] = [
    {
        "category": "Sewerage",
        "subject": "blocked / overflowing drain and sewerage",
        "keywords": [
            "drain", "drainage", "sewer", "sewage", "sewerage", "gutter",
            "manhole", "overflow", "overflowing", "choked", "nala", "nali",
            "gatar", "गटार", "नाला", "सीवर",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Sewerage & Drainage Department",
            "phone": "022-27571004",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Deploy a drainage cleaning team immediately to clear the blockage.",
            "Disinfect the affected area to prevent a disease outbreak.",
            "Inspect and repair the damaged drain cover and pipeline.",
        ],
    },
    {
        "category": "Water",
        "subject": "water supply / pipeline problem",
        "keywords": [
            "water", "supply", "tap", "leak", "leakage", "pipeline", "pipe",
            "borewell", "pani", "paani", "पानी", "पाणी",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Water Supply Department",
            "phone": "022-27571001",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Restore the water supply / fix the leak at the earliest.",
            "Inspect the pipeline and pumping station for faults.",
            "Inform residents of the expected restoration time.",
        ],
    },
    {
        "category": "Electrical",
        "subject": "street-light / electrical fault",
        "keywords": [
            "light", "streetlight", "street light", "lamp", "bulb", "dark",
            "wire", "electric", "electrical", "current", "shock", "transformer",
            "bijli", "vij", "वीज", "बत्ती", "बिजली",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Electrical Department (Street Lighting)",
            "phone": "022-27571002",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Inspect and repair the street-light / electrical fault.",
            "Replace the faulty lamp / cabling and restore lighting.",
            "Ensure the area is made safe immediately if a wire is exposed.",
        ],
    },
    {
        "category": "Solid Waste",
        "subject": "garbage collection / dumping",
        "keywords": [
            "garbage", "waste", "trash", "dump", "dumping", "dustbin", "bin",
            "kachra", "kachara", "safai", "कचरा", "कचरा उचल",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Solid Waste Management Department",
            "phone": "022-27571000",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Clear the accumulated garbage / debris from the location.",
            "Deploy a collection vehicle on a regular schedule.",
            "Penalise illegal dumping and install clearly marked bins.",
        ],
    },
    {
        "category": "PWD",
        "subject": "road / footpath repair",
        "keywords": [
            "road", "pothole", "footpath", "pavement", "bridge", "speed breaker",
            "mud", "sadak", "rasta", "रस्ता", "गड्ढा", "सड़क",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Public Works Department (PWD)",
            "phone": "022-27571003",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Inspect the reported road / footpath damage.",
            "Carry out pothole filling / resurfacing at the earliest.",
            "Erect warning signage until the repair is completed.",
        ],
    },
    {
        "category": "Encroachment",
        "subject": "illegal encroachment",
        "keywords": [
            "encroach", "encroachment", "illegal construction", "hawker",
            "vendor", "stall", "hutment", "atkraman", "अतिक्रमण",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Encroachment / Anti-Encroachment Department",
            "phone": "022-27571005",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Survey the reported encroachment at the location.",
            "Take action to remove the illegal structure / encroachment.",
            "Restore the footpath / public land for public use.",
        ],
    },
    {
        "category": "Health",
        "subject": "public health / sanitation hazard",
        "keywords": [
            "mosquito", "dengue", "malaria", "stagnant", "disease", "health",
            "hospital", "rat", "stray dog", "sanitation", "fogging",
            "स्वच्छता", "आरोग्य",
        ],
        "authority": {
            "name": "Navi Mumbai Municipal Corporation (NMMC)",
            "department": "Health Department",
            "phone": "022-27571006",
            "portal_url": "https://www.nmmc.gov.in",
            "portal_name": "NMMC Online Grievance Redressal Portal",
        },
        "actions": [
            "Inspect the site for the reported public-health hazard.",
            "Carry out fogging / disinfection and pest control.",
            "Eliminate stagnant water and prevent mosquito breeding.",
        ],
    },
    {
        "category": "Traffic",
        "subject": "traffic / parking problem",
        "keywords": [
            "traffic", "signal", "parking", "jam", "congestion", "accident",
            "zebra", "चौक", "वाहतूक",
        ],
        "authority": {
            "name": "Navi Mumbai Traffic Police",
            "department": "Traffic Control",
            "phone": "022-27891000",
            "portal_url": "https://mumbaipolice.gov.in",
            "portal_name": "Mumbai Traffic Police Portal",
        },
        "actions": [
            "Deploy traffic personnel at the location during peak hours.",
            "Take action against illegal parking / signal violations.",
            "Consider a permanent traffic-management solution at the spot.",
        ],
    },
]

# A catch-all used when no keyword matches.
DEFAULT_RULE: Dict[str, object] = {
    "category": "PWD",
    "subject": "civic issue",
    "keywords": [],
    "authority": {
        "name": "Navi Mumbai Municipal Corporation (NMMC)",
        "department": "Citizen Facilitation / Grievance Cell",
        "phone": "022-27571000",
        "portal_url": "https://www.nmmc.gov.in",
        "portal_name": "NMMC Online Grievance Redressal Portal",
    },
    "actions": [
        "Inspect the reported issue at the location.",
        "Take corrective action at the earliest.",
        "Inform the complainant of the resolution status.",
    ],
}

# Keywords that immediately escalate a complaint to HIGH urgency.
HIGH_URGENCY_KEYWORDS = {
    "open manhole", "manhole open", "uncovered manhole", "live wire",
    "electrocution", "electric shock", "fire", "gas leak", "collapse",
    "collapsed", "drowning", "flood", "flooding", "building collapse",
    "wall collapse", "deep pothole",
}

# Regexes tried in order to pull a location out of free text.
LOCATION_PATTERNS = [
    re.compile(r"\b(sector\s*\d+[a-z]?)\b", re.IGNORECASE),
    re.compile(r"\b(seawoods|vashi|nerul|belapur|cbd|kharghar|airoli|ghansoli|koparkhairane|ulwe|panvel|sanpada|juinagar|turbhe)\b", re.IGNORECASE),
    re.compile(
        r"\b(?:near|opposite|behind|beside|at|in|on)\s+([A-Za-z0-9][A-Za-z0-9 ,.'/-]{2,40}?)(?:[.,]|$|\s(?:since|for|and|but|which|that)\b)",
        re.IGNORECASE,
    ),
]

# Sentinels that mean "we still don't know where this is".
UNKNOWN_LOCATION = {
    "", "unknown", "n/a", "na", "not specified", "unspecified", "none",
    "not known", "somewhere",
}

FOLLOWUP_WARNING = (
    "**IMPORTANT:** We could not detect an exact location for this complaint. "
    "Please reply with your sector / locality so it can be routed to the correct "
    "ward office.\n\n"
)


def _match_rule(text: str) -> Dict[str, object]:
    """Return the first category rule whose keyword appears in ``text``."""
    haystack = text.lower()
    for rule in CATEGORY_RULES:
        for keyword in rule["keywords"]:  # type: ignore[union-attr]
            if str(keyword).lower() in haystack:
                return rule
    return DEFAULT_RULE


def extract_location(text: str) -> str:
    """Best-effort location extraction from free text ('' when not found)."""
    for pattern in LOCATION_PATTERNS:
        match = pattern.search(text)
        if match:
            value = match.group(1).strip(" .,")
            if value and value.lower() not in UNKNOWN_LOCATION:
                # Normalise "sector 4" -> "Sector 4".
                return value.title() if value.islower() else value
    return ""


def _is_high_urgency(text: str) -> bool:
    haystack = text.lower()
    return any(keyword in haystack for keyword in HIGH_URGENCY_KEYWORDS)


def _build_letter(
    location: str,
    rule: Dict[str, object],
    authority: Dict[str, str],
) -> str:
    """Compose a formal, multi-line complaint letter."""
    actions = rule.get("actions") or []
    action_lines = "\n".join(f"{i + 1}. {a}" for i, a in enumerate(actions))
    return (
        "To,\n"
        "The Commissioner,\n"
        f"{authority['name']},\n"
        "Navi Mumbai.\n"
        "\n"
        f"Subject: Complaint regarding {rule['subject']} near {location}\n"
        "\n"
        "Respected Sir/Madam,\n"
        "\n"
        f"I wish to report a {rule['category']} related civic issue near {location}. "
        "The problem is causing inconvenience and hardship to the residents and "
        "commuters in the area and requires your urgent attention.\n"
        "\n"
        "I therefore request the department to kindly:\n"
        f"{action_lines}\n"
        "\n"
        "I request you to acknowledge this complaint with a complaint/ticket "
        "number so that I can follow up.\n"
        "\n"
        "Thanking you,\n"
        "\n"
        "Yours faithfully,\n"
        "[Your Full Name]\n"
        "[Your Mobile Number]\n"
        "[Your Address / Sector]\n"
        "[Date]"
    )


def _build_timeline(authority: Dict[str, str], category: str) -> List[TimelineStep]:
    """Generic 5-step escalation timeline, parameterised by authority/category."""
    return [
        TimelineStep(
            step="Complaint submitted",
            day_offset=0,
            description=f"Your complaint is filed with the {authority['name']} portal / ward office.",
        ),
        TimelineStep(
            step="Acknowledgement + ticket number",
            day_offset=1,
            description="The department should acknowledge the complaint and share a reference number.",
        ),
        TimelineStep(
            step="Site inspection",
            day_offset=3,
            description="Field staff are expected to inspect the reported location.",
        ),
        TimelineStep(
            step="Reminder / escalation",
            day_offset=7,
            description="If unresolved, send a written reminder to the concerned Ward Officer.",
        ),
        TimelineStep(
            step="Target resolution",
            day_offset=15,
            description=f"Target date for resolving the {category.lower()} issue.",
        ),
    ]


def route(text: str, language: Optional[str] = "en") -> dict:
    """Return a contract-valid routing result using keyword rules only.

    This function never raises for normal input -- it always returns a dict that
    validates against :class:`schemas.ComplaintResponse`.
    """
    text = (text or "").strip()
    rule = _match_rule(text)
    authority_data: Dict[str, str] = dict(rule["authority"])  # type: ignore[arg-type]

    # Location + follow-up handling.
    location = extract_location(text)
    needs_followup = location == ""
    if not location:
        location = "Location not specified"

    # Urgency handling.
    urgency = "high" if _is_high_urgency(text) else "medium"
    if urgency == "high":
        # High-urgency complaints are routed via the NMMC Disaster helpline.
        authority_data["phone"] = config.NMMC_DISASTER_NUMBER

    letter = _build_letter(location, rule, authority_data)
    if needs_followup:
        letter = FOLLOWUP_WARNING + letter

    response = ComplaintResponse(
        category=str(rule["category"]),
        location=location,
        urgency=urgency,  # type: ignore[arg-type]
        authority=Authority(**authority_data),
        letter=letter,
        timeline=_build_timeline(authority_data, str(rule["category"])),
        needs_followup=needs_followup,
    )
    return response.model_dump()