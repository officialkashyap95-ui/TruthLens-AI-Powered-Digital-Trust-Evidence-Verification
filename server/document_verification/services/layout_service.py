import os
import re
from typing import Dict, Any


def analyze_layout(file_path: str, extracted_text: str = "") -> Dict[str, Any]:
    """
    Basic document layout analysis for the TruthLens MVP.

    This service produces structural signals rather than claiming
    definitive forgery detection.
    """

    findings = []
    warnings = []

    text = extracted_text or ""

    # Text density
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    line_count = len(lines)

    if line_count == 0:
        warnings.append({
            "type": "no_text_detected",
            "severity": "medium",
            "message": "No readable text was detected in the document."
        })

    # Detect suspiciously fragmented text
    if line_count > 20:
        short_lines = sum(1 for line in lines if len(line) < 5)

        if short_lines / line_count > 0.35:
            findings.append({
                "type": "fragmented_text_layout",
                "severity": "medium",
                "message": "The document contains an unusually high number of very short text fragments."
            })

    # Detect repeated blocks
    normalized_lines = [
        re.sub(r"\s+", " ", line.lower())
        for line in lines
    ]

    duplicates = set()

    for line in normalized_lines:
        if len(line) >= 15 and normalized_lines.count(line) > 1:
            duplicates.add(line)

    if duplicates:
        findings.append({
            "type": "repeated_text_blocks",
            "severity": "low",
            "message": "Repeated text blocks were detected in the extracted document text.",
            "details": {
                "count": len(duplicates)
            }
        })

    # File existence
    if not os.path.exists(file_path):
        findings.append({
            "type": "file_not_found",
            "severity": "high",
            "message": "The document file could not be accessed."
        })

    status = "issues_detected" if findings or warnings else "normal"

    return {
        "status": status,
        "line_count": line_count,
        "findings": findings,
        "warnings": warnings
    }
