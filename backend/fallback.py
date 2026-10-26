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


def extract_location(
    text: str,
    explicit_location: Optional[str] = None,
    location_source: str = "unknown",
) -> tuple[str, str, float]:
    """Best-effort location extraction from free text and optional user-provided input."""
    explicit = (explicit_location or "").strip()
    if explicit and explicit.lower() not in UNKNOWN_LOCATION:
        if text and re.search(r"\b(?:sector|near|opposite|behind|beside|at|in|on)\b", text, re.IGNORECASE):
            return explicit, "combined", 0.92
        return explicit, "user_input", 0.94

    for pattern in LOCATION_PATTERNS:
        match = pattern.search(text)
        if match:
            value = match.group(1).strip(" .,")
            if value and value.lower() not in UNKNOWN_LOCATION:
                return value.title() if value.islower() else value, "text", 0.78
    return "", str(location_source or "unknown").strip() or "unknown", 0.0


def _is_high_urgency(text: str) -> bool:
    haystack = text.lower()
    return any(keyword in haystack for keyword in HIGH_URGENCY_KEYWORDS)


def _categorical_keywords(category: str) -> List[str]:
    mapping = {
        "Solid Waste": ["garbage", "waste", "trash", "dump", "dustbin", "kachra", "kachara", "safai"],
        "Water": ["water", "supply", "leak", "pipeline", "pani", "paani"],
        "Electrical": ["streetlight", "light", "wire", "electrical", "electric", "bulb", "bijli", "vij"],
        "PWD": ["road", "pothole", "footpath", "repair", "sadak", "gaddha"],
        "Sewerage": ["drain", "sewer", "overflow", "nala", "gutter", "sewage"],
        "Encroachment": ["encroach", "hawker", "stall", "vendor", "illegal", "construction"],
        "Health": ["mosquito", "dengue", "sanitation", "health", "stray dog", "stagnant"],
        "Traffic": ["traffic", "parking", "jam", "signal", "accident", "congestion"],
    }
    return mapping.get(category, [])


def _related_issues(text: str, primary: str) -> List[str]:
    haystack = text.lower()
    related = []
    for category in [
        "Solid Waste",
        "Water",
        "Electrical",
        "PWD",
        "Sewerage",
        "Encroachment",
        "Health",
        "Traffic",
    ]:
        if category == primary:
            continue
        if any(keyword in haystack for keyword in _categorical_keywords(category)):
            related.append(category)
    return related[:3]


def _problem_summary(location: str, rule: Dict[str, object], text: str) -> str:
    lower = text.lower()
    subject = str(rule["subject"])
    if "pothole" in lower or "gaddha" in lower or "road" in lower and "damage" in lower:
        return f"A dangerous pothole and road surface damage have developed near {location}, creating a risk for commuters and pedestrians."
    if "light" in lower or "streetlight" in lower or "bulb" in lower:
        return f"The street lighting and visibility are failing near {location}, leaving the area unsafe after dark."
    if "garbage" in lower or "waste" in lower or "trash" in lower or "kachra" in lower:
        return f"Garbage and waste are accumulating near {location}, creating unhygienic conditions and public inconvenience."
    if "drain" in lower or "sewer" in lower or "overflow" in lower or "nala" in lower:
        return f"The drainage system is blocked or overflowing near {location}, resulting in waterlogging and sanitation issues."
    if "water" in lower or "supply" in lower or "pani" in lower:
        return f"The water supply or pipeline issue is affecting residents near {location}."
    if "wire" in lower or "electric" in lower or "live wire" in lower:
        return f"An exposed electrical fault or hanging wire has been reported near {location}, creating a serious safety hazard."
    if "parking" in lower or "traffic" in lower or "encroach" in lower:
        return f"A traffic or encroachment problem is affecting movement and access near {location}."
    return f"A {subject} issue has been reported near {location} and is causing civic inconvenience."


def _specific_details(text: str, category: str, location: str) -> List[str]:
    lower = text.lower()
    details: List[str] = []
    if category == "PWD" and ("pothole" in lower or "gaddha" in lower):
        details.append("A pothole or damaged road surface is present at the site.")
    if "rain" in lower or "monsoon" in lower or "barish" in lower:
        details.append("The problem has reportedly worsened after rainfall or waterlogging.")
    if "night" in lower or "dark" in lower or "andhera" in lower:
        details.append("The issue is impacting visibility or safety at night.")
    if "two" in lower or "bikes" in lower or "bike" in lower or "accident" in lower:
        details.append("The issue is creating a traffic or safety risk for commuters.")
    if "five days" in lower or "days" in lower and ("garbage" in lower or "waste" in lower):
        details.append("The waste has reportedly remained uncleared for several days.")
    if "overflow" in lower or "blocked" in lower or "choked" in lower:
        details.append("The drain or sewer appears to be blocked or overflowing.")
    if "water" in lower and ("enter" in lower or "inside" in lower or "house" in lower):
        details.append("Water is entering residential or public spaces as a result of the issue.")
    if "wire" in lower or "electric" in lower:
        details.append("An exposed or hanging electrical line has been reported near the affected area.")
    if not details:
        details.append(f"Citizen complaint details indicate a {category.lower()} issue near {location}.")
    return details[:5]


def _impact_text(text: str, category: str) -> str:
    lower = text.lower()
    if category == "PWD":
        return "This creates a road-safety risk for drivers, riders and pedestrians, especially during poor visibility or after rain."
    if category == "Electrical":
        return "This compromises visibility and increases the risk of accidents, electrocution or unsafe movement after dark."
    if category == "Solid Waste":
        return "This creates unhygienic conditions, attracts stray animals and increases the risk of public health concerns."
    if category == "Water":
        return "This causes hardship to households and public users and can disrupt daily living or sanitation."
    if category == "Sewerage":
        return "This causes waterlogging, foul smells and sanitation risks for nearby residents and commuters."
    if category == "Health":
        return "This creates a public-health risk for nearby residents and can spread disease or pest activity."
    if category == "Traffic":
        return "This obstructs movement, reduces visibility and creates congestion and safety risk for road users."
    if category == "Encroachment":
        return "This blocks public access and creates obstruction for pedestrians and vehicular movement."
    return "This issue is affecting everyday movement, access or safety in the area."


def _build_letter(
    location: str,
    rule: Dict[str, object],
    authority: Dict[str, str],
    problem_summary: str,
    specific_details: List[str],
    impact: str,
    recommended_actions: List[str],
) -> str:
    """Compose a formal, multi-line complaint letter based on the actual issue details."""
    action_lines = "\n".join(f"{i + 1}. {action}" for i, action in enumerate(recommended_actions or rule.get("actions") or []))
    detail_lines = "\n".join(f"- {detail}" for detail in specific_details)
    return (
        "To,\n"
        "The Commissioner,\n"
        f"{authority['name']},\n"
        "Navi Mumbai.\n"
        "\n"
        f"Subject: Complaint regarding {problem_summary.lower().split(' near ')[0].rstrip('.')} at {location}\n"
        "\n"
        "Respected Sir/Madam,\n"
        "\n"
        f"{problem_summary} The issue is affecting the local community because {impact}\n"
        "\n"
        "The complaint involves the following facts:\n"
        f"{detail_lines}\n"
        "\n"
        "I therefore request the concerned department to:\n"
        f"{action_lines}\n"
        "\n"
        "I request you to acknowledge this complaint and provide a reference number for follow-up.\n"
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


def route(
    text: str,
    language: Optional[str] = "en",
    location: Optional[str] = None,
    location_source: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> dict:
    """Return a contract-valid routing result using keyword rules only."""
    text = (text or "").strip()
    if not text:
        text = "civic issue"
    rule = _match_rule(text)
    authority_data: Dict[str, str] = dict(rule["authority"])  # type: ignore[arg-type]

    detected_location, source, confidence = extract_location(text, explicit_location=location, location_source=location_source or "unknown")
    needs_followup = not detected_location or detected_location.lower() in UNKNOWN_LOCATION
    if not detected_location:
        detected_location = "Location not specified"
        source = "unknown"
        confidence = 0.0

    urgency = "high" if _is_high_urgency(text) else "medium"
    if urgency == "high":
        authority_data["phone"] = config.NMMC_DISASTER_NUMBER

    related = _related_issues(text, str(rule["category"]))
    problem_summary = _problem_summary(detected_location, rule, text)
    specific_details = _specific_details(text, str(rule["category"]), detected_location)
    impact = _impact_text(text, str(rule["category"]))
    recommended_actions = list(rule.get("actions") or [])
    if needs_followup:
        recommended_actions = [
            "Ask the complainant to share a sector, locality or nearby landmark for ward-level routing.",
            *recommended_actions,
        ]

    letter = _build_letter(
        detected_location,
        rule,
        authority_data,
        problem_summary,
        specific_details,
        impact,
        recommended_actions,
    )
    if needs_followup:
        letter = FOLLOWUP_WARNING + letter

    response = ComplaintResponse(
        category=str(rule["category"]),
        location=detected_location,
        location_source=source if source in {"text", "user_input", "gps", "combined", "unknown"} else "unknown",
        location_confidence=float(confidence),
        urgency=urgency,  # type: ignore[arg-type]
        authority=Authority(**authority_data),
        problem_summary=problem_summary,
        specific_details=specific_details,
        impact=impact,
        recommended_actions=recommended_actions,
        related_issues=related,
        letter=letter,
        timeline=_build_timeline(authority_data, str(rule["category"])),
        needs_followup=needs_followup,
    )
    return response.model_dump()