from pathlib import Path
from typing import Dict, Any
import hashlib
import mimetypes
import pymupdf


def calculate_file_hash(file_bytes: bytes) -> str:
    """Generate SHA-256 hash of the uploaded file."""
    return hashlib.sha256(file_bytes).hexdigest()


def get_basic_metadata(
    file_bytes: bytes,
    filename: str
) -> Dict[str, Any]:
    """Extract basic file information."""

    extension = Path(filename).suffix.lower()

    mime_type, _ = mimetypes.guess_type(filename)

    return {
        "filename": filename,
        "extension": extension,
        "mime_type": mime_type or "unknown",
        "file_size_bytes": len(file_bytes),
        "sha256": calculate_file_hash(file_bytes),
    }


def get_pdf_metadata(file_bytes: bytes) -> Dict[str, Any]:
    """Extract PDF metadata and structural information."""

    try:
        document = pymupdf.open(
            stream=file_bytes,
            filetype="pdf"
        )

        metadata = document.metadata or {}

        pages = document.page_count

        encrypted = document.is_encrypted

        fonts = set()
        images = 0

        for page in document:
            # Collect fonts
            for font in page.get_fonts(full=True):
                if len(font) > 3:
                    fonts.add(str(font[3]))

            # Count images
            images += len(page.get_images(full=True))

        result = {
            "pages": pages,
            "encrypted": encrypted,
            "title": metadata.get("title") or None,
            "author": metadata.get("author") or None,
            "subject": metadata.get("subject") or None,
            "creator": metadata.get("creator") or None,
            "producer": metadata.get("producer") or None,
            "creation_date": metadata.get("creationDate") or None,
            "modification_date": metadata.get("modDate") or None,
            "font_count": len(fonts),
            "fonts": sorted(fonts),
            "image_count": images,
        }

        document.close()

        return result

    except Exception as error:
        return {
            "error": str(error)
        }


def analyze_metadata(
    file_bytes: bytes,
    filename: str
) -> Dict[str, Any]:
    """
    Main metadata analysis function.
    """

    result = get_basic_metadata(
        file_bytes,
        filename
    )

    if filename.lower().endswith(".pdf"):
        result["pdf"] = get_pdf_metadata(file_bytes)

    return result