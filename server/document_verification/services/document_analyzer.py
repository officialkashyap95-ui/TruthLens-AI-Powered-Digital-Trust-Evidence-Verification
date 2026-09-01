import os

from .ocr_service import extract_text_from_file
from .metadata_service import analyze_metadata
from .consistency_service import analyze_consistency
from .layout_service import analyze_layout


def analyze_document(file_path: str) -> dict:
    """
    Run the complete document verification analysis pipeline.

    Pipeline:
        1. OCR
        2. Metadata
        3. Text consistency
        4. Layout analysis
    """

    filename = os.path.basename(file_path)

    # =====================================================
    # 1. OCR
    # =====================================================

    ocr_result = extract_text_from_file(
        file_path,
        filename
    )

    if isinstance(ocr_result, dict):
        extracted_text = ocr_result.get(
            "text",
            ""
        )
    else:
        extracted_text = str(
            ocr_result or ""
        )

    # =====================================================
    # 2. METADATA
    # =====================================================

    metadata_result = analyze_metadata(
        file_path
    )

    # =====================================================
    # 3. CONSISTENCY
    # =====================================================

    consistency_result = analyze_consistency(
        extracted_text
    )

    # =====================================================
    # 4. LAYOUT
    # =====================================================

    layout_result = analyze_layout(
        file_path,
        extracted_text
    )

    # =====================================================
    # FINAL ANALYSIS
    # =====================================================

    return {
        "filename": filename,

        "extracted_text":
            extracted_text,

        "ocr":
            ocr_result,

        "metadata":
            metadata_result,

        "consistency":
            consistency_result,

        "layout":
            layout_result,
    }