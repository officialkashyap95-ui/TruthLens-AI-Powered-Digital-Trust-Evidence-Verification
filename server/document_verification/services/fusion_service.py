from typing import Any, Dict, List


def _severity_score(severity: str) -> float:
    """
    Convert evidence severity into a risk contribution.
    """
    return {
        "low": 20.0,
        "medium": 50.0,
        "high": 85.0,
        "critical": 100.0,
    }.get(str(severity).lower(), 0.0)


def _collect_evidence(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Collect evidence from all available analysis modules.
    """

    evidence = []

    # Consistency issues
    consistency = analysis.get("consistency", {})

    for issue in consistency.get("issues", []):
        evidence.append({
            "source": "consistency",
            "type": issue.get("type", "consistency_issue"),
            "severity": issue.get("severity", "medium"),
            "message": issue.get(
                "message",
                "A consistency issue was detected."
            ),
            "details": issue,
        })

    # Layout findings
    layout = analysis.get("layout", {})

    for finding in layout.get("findings", []):
        evidence.append({
            "source": "layout",
            "type": finding.get("type", "layout_issue"),
            "severity": finding.get("severity", "medium"),
            "message": finding.get(
                "message",
                "A layout issue was detected."
            ),
            "details": finding,
        })

    # Layout warnings
    for warning in layout.get("warnings", []):
        evidence.append({
            "source": "layout",
            "type": warning.get("type", "layout_warning"),
            "severity": warning.get("severity", "low"),
            "message": warning.get(
                "message",
                "A layout warning was detected."
            ),
            "details": warning,
        })

    return evidence


def _calculate_risk_score(evidence: List[Dict[str, Any]]) -> float:
    """
    Calculate an explainable risk score from collected evidence.

    This is intentionally an MVP evidence-fusion model.
    """

    if not evidence:
        return 0.0

    contributions = [
        _severity_score(item.get("severity", "low"))
        for item in evidence
    ]

    # Avoid allowing many duplicate/weak findings to push the
    # score unrealistically high.
    average_score = sum(contributions) / len(contributions)

    return round(min(average_score, 100.0), 2)


def _confidence_from_evidence(
    evidence: List[Dict[str, Any]],
    analysis: Dict[str, Any]
) -> str:
    """
    Estimate confidence based on the amount and quality of evidence.
    """

    ocr = analysis.get("ocr", {})
    extracted_text = analysis.get("extracted_text", "")

    evidence_count = len(evidence)

    if not extracted_text:
        return "low"

    if evidence_count >= 3:
        return "high"

    if evidence_count >= 1:
        return "medium"

    if isinstance(ocr, dict):
        text_confidence = ocr.get("confidence")

        if isinstance(text_confidence, (int, float)):
            if text_confidence >= 80:
                return "high"
            if text_confidence >= 50:
                return "medium"

    return "medium"


def _get_status(risk_score: float) -> str:
    """
    Convert risk score into an understandable verification status.
    """

    if risk_score >= 75:
        return "high_risk"

    if risk_score >= 40:
        return "review_required"

    return "low_risk"


def _get_recommendation(risk_score: float) -> str:
    """
    Generate an explainable recommendation.
    """

    if risk_score >= 75:
        return (
            "Document shows strong indicators of inconsistency or "
            "anomaly. Manual verification is recommended."
        )

    if risk_score >= 40:
        return (
            "Document contains some suspicious indicators. "
            "Additional manual verification is recommended."
        )

    return (
        "No major anomaly was detected by the available verification "
        "signals. Document appears structurally consistent."
    )


def fuse_analysis(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Combine OCR, metadata, consistency and layout analysis
    into one explainable verification result.
    """

    evidence = _collect_evidence(analysis)

    risk_score = _calculate_risk_score(evidence)

    confidence = _confidence_from_evidence(
        evidence,
        analysis
    )

    status = _get_status(risk_score)

    recommendation = _get_recommendation(risk_score)

    return {
        "status": status,
        "risk_score": risk_score,
        "confidence": confidence,
        "recommendation": recommendation,
        "evidence": evidence,
        "evidence_count": len(evidence),
    }
