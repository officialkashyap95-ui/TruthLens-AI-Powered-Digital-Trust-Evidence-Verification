import re
from datetime import datetime
from typing import Any, Dict, List


DATE_PATTERNS = [
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
    r"\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b",
    r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b",
]


def normalize_text(text: str) -> str:
    """Normalize OCR text for consistency checks."""

    if not text:
        return ""

    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_dates(text: str) -> List[str]:
    """Extract date-like strings from OCR text."""

    dates = []

    for pattern in DATE_PATTERNS:
        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        dates.extend(matches)

    # Remove duplicates while preserving order
    unique_dates = []

    for date in dates:
        if date not in unique_dates:
            unique_dates.append(date)

    return unique_dates


def parse_date(date_string: str) -> Any:
    """Try to convert common date formats into datetime."""

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d %b %Y",
        "%d %B %Y",
        "%b %d %Y",
        "%B %d %Y",
        "%b %d, %Y",
        "%B %d, %Y",
    ]

    cleaned = date_string.replace(",", "")

    for date_format in formats:
        try:
            return datetime.strptime(
                cleaned,
                date_format
            )
        except ValueError:
            continue

    return None


def check_date_consistency(text: str) -> Dict[str, Any]:
    """
    Detect potentially inconsistent dates.

    This does NOT declare a document fake.
    It only produces an evidence signal.
    """

    dates = extract_dates(text)

    parsed_dates = []

    for date in dates:
        parsed = parse_date(date)

        if parsed:
            parsed_dates.append({
                "original": date,
                "parsed": parsed
            })

    issues = []

    # Check issue date vs expiry/validity date
    issue_keywords = [
        "issue date",
        "issued",
        "date of issue",
        "issued on"
    ]

    expiry_keywords = [
        "expiry",
        "expiration",
        "valid until",
        "valid upto",
        "valid up to"
    ]

    lower_text = text.lower()

    has_issue = any(
        keyword in lower_text
        for keyword in issue_keywords
    )

    has_expiry = any(
        keyword in lower_text
        for keyword in expiry_keywords
    )

    if has_issue and has_expiry and len(parsed_dates) >= 2:

        first_date = parsed_dates[0]
        second_date = parsed_dates[1]

        if second_date["parsed"] < first_date["parsed"]:
            issues.append({
                "type": "date_order_conflict",
                "severity": "high",
                "message": (
                    "A validity/expiry date appears earlier "
                    "than an issue date."
                ),
                "dates": [
                    first_date["original"],
                    second_date["original"]
                ]
            })

    return {
        "dates_found": dates,
        "parsed_dates": [
            {
                "original": item["original"],
                "date": item["parsed"].strftime("%Y-%m-%d")
            }
            for item in parsed_dates
        ],
        "issues": issues
    }


def check_repeated_identifiers(text: str) -> Dict[str, Any]:
    """
    Look for repeated document identifiers.

    This is an evidence signal, not proof of manipulation.
    """

    patterns = {
        "document_number": [
            r"(?:document|certificate|registration|id)\s*(?:no|number|#)\s*[:\-]?\s*([A-Z0-9\-\/]{5,})"
        ],
        "application_number": [
            r"(?:application|reference)\s*(?:no|number|#)\s*[:\-]?\s*([A-Z0-9\-\/]{5,})"
        ]
    }

    findings = {}

    for field, field_patterns in patterns.items():

        values = []

        for pattern in field_patterns:
            matches = re.findall(
                pattern,
                text,
                flags=re.IGNORECASE
            )

            values.extend(matches)

        if values:
            findings[field] = list(dict.fromkeys(values))

    issues = []

    for field, values in findings.items():

        if len(values) > 1:
            issues.append({
                "type": "multiple_identifier_values",
                "severity": "medium",
                "field": field,
                "values": values,
                "message": (
                    f"Multiple values were detected for {field}."
                )
            })

    return {
        "findings": findings,
        "issues": issues
    }


def analyze_consistency(
    text: str
) -> Dict[str, Any]:
    """
    Main consistency-analysis entry point.
    """

    normalized_text = normalize_text(text)

    date_analysis = check_date_consistency(
        normalized_text
    )

    identifier_analysis = check_repeated_identifiers(
        normalized_text
    )

    all_issues = (
        date_analysis["issues"]
        + identifier_analysis["issues"]
    )

    return {
        "status": "issues_detected" if all_issues else "no_obvious_issues",
        "issue_count": len(all_issues),
        "issues": all_issues,
        "date_analysis": date_analysis,
        "identifier_analysis": identifier_analysis,
    }