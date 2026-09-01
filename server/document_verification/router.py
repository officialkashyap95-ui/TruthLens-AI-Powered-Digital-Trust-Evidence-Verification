import os

from fastapi import APIRouter, File, UploadFile, HTTPException

from .services.document_analyzer import analyze_document
from .services.fusion_service import fuse_analysis

router = APIRouter(
    prefix="/api/document-verification",
    tags=["Document Verification"]
)


@router.post("/analyze")
async def verify_document(file: UploadFile = File(...)):
    """
    Upload a document and run TruthLens document verification.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided."
        )

    allowed_extensions = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp"
    }

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}"
        )

    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "uploads"
    )

    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(
        upload_dir,
        file.filename
    )

    try:
        contents = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        analysis = analyze_document(file_path)

        fusion = fuse_analysis(analysis)

        return {
            "success": True,
            "filename": file.filename,
            "verification": fusion,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document verification failed: {str(e)}"
        )

    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
