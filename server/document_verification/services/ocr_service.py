import pytesseract
import pymupdf
from PIL import Image
import io
from typing import Dict, Any


def extract_text_from_image(image: Image.Image) -> Dict[str, Any]:
    """
    Extract text from an image using Tesseract OCR.
    """

    text = pytesseract.image_to_string(image)

    data = pytesseract.image_to_data(
        image,
        output_type=pytesseract.Output.DICT
    )

    words = []

    for i, word in enumerate(data["text"]):
        word = word.strip()

        if not word:
            continue

        confidence = data["conf"][i]

        try:
            confidence = float(confidence)
        except (ValueError, TypeError):
            confidence = 0.0

        words.append({
            "text": word,
            "confidence": confidence,
            "left": data["left"][i],
            "top": data["top"][i],
            "width": data["width"][i],
            "height": data["height"][i],
        })

    valid_confidences = [
        item["confidence"]
        for item in words
        if item["confidence"] >= 0
    ]

    average_confidence = (
        sum(valid_confidences) / len(valid_confidences)
        if valid_confidences
        else 0
    )

    return {
        "text": text.strip(),
        "words": words,
        "word_count": len(words),
        "average_confidence": round(average_confidence, 2),
    }


def extract_text_from_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extract text from a PDF.

    First attempts native PDF text extraction.
    If the PDF contains scanned pages, OCR is performed.
    """

    document = pymupdf.open(stream=pdf_bytes, filetype="pdf")

    pages = []
    all_text = []

    for page_number, page in enumerate(document, start=1):

        native_text = page.get_text("text").strip()

        # Native PDF text exists
        if native_text:
            pages.append({
                "page": page_number,
                "method": "native",
                "text": native_text,
                "average_confidence": 100.0,
            })

            all_text.append(native_text)

        # Scanned/image PDF → OCR
        else:
            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2),
                alpha=False
            )

            image_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(image_bytes))

            result = extract_text_from_image(image)

            pages.append({
                "page": page_number,
                "method": "ocr",
                "text": result["text"],
                "average_confidence": result["average_confidence"],
            })

            all_text.append(result["text"])

    document.close()

    return {
        "text": "\n\n".join(all_text).strip(),
        "pages": pages,
        "page_count": len(pages),
        "ocr_used": any(
            page["method"] == "ocr"
            for page in pages
        ),
    }


def extract_text_from_file(
    file_bytes: bytes,
    filename: str
) -> Dict[str, Any]:
    """
    Automatically choose OCR strategy based on file type.
    """

    extension = filename.lower().split(".")[-1]

    if extension == "pdf":
        return extract_text_from_pdf(file_bytes)

    if extension in {"png", "jpg", "jpeg", "webp", "bmp", "tiff"}:
        image = Image.open(io.BytesIO(file_bytes))

        result = extract_text_from_image(image)

        return {
            "text": result["text"],
            "pages": [{
                "page": 1,
                "method": "ocr",
                "text": result["text"],
                "average_confidence": result["average_confidence"],
            }],
            "page_count": 1,
            "ocr_used": True,
        }

    raise ValueError(
        f"Unsupported document type: .{extension}"
    )