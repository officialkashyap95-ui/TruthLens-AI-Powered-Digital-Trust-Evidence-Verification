from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    type: str
    severity: str
    message: str
    details: Optional[Dict[str, Any]] = None


class VerificationSignal(BaseModel):
    name: str
    score: float = Field(ge=0, le=100)
    status: str
    evidence: List[EvidenceItem] = []


class DocumentVerificationResult(BaseModel):
    status: str
    risk_score: float = Field(ge=0, le=100)
    confidence: str
    recommendation: str

    filename: Optional[str] = None
    file_type: Optional[str] = None

    extracted_text: Optional[str] = None

    signals: List[VerificationSignal] = []
    evidence: List[EvidenceItem] = []

    analysis: Dict[str, Any] = {}
