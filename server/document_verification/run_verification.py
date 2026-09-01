import sys
import json
import traceback

from services.document_analyzer import analyze_document
from services.fusion_service import fuse_analysis


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "File path is required."
        }))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        # Run OCR + metadata + consistency + layout
        analysis = analyze_document(file_path)

        # Fuse all verification signals
        fused = fuse_analysis(analysis)

        result = {
            "success": True,
            "filename": file_path,
            "extracted_text": analysis.get(
                "extracted_text",
                ""
            ),
            "ocr": analysis.get("ocr", {}),
            "metadata": analysis.get(
                "metadata",
                {}
            ),
            "consistency": analysis.get(
                "consistency",
                {}
            ),
            "layout": analysis.get(
                "layout",
                {}
            ),
            "fusion": fused
        }

        print(json.dumps(result, default=str))

    except Exception as error:
        print(
            json.dumps({
                "success": False,
                "error": str(error),
                "traceback": traceback.format_exc()
            })
        )

        sys.exit(1)


if __name__ == "__main__":
    main()