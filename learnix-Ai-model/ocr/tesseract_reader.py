"""
ocr/tesseract_reader.py

Extracts text from:
    - Image PDFs (scanned or photographed)
    - Raw image files (JPG, PNG)

Uses Tesseract OCR engine under the hood.

Install dependencies:
    pip install pytesseract Pillow pymupdf

Install Tesseract system tool:
    Mac:   brew install tesseract
    Linux: sudo apt install tesseract-ocr
    Win:   https://github.com/UB-Mannheim/tesseract/wiki

Usage:
    python ocr/tesseract_reader.py your_scanned.pdf
"""

import os
import sys
import re
import pytesseract
import fitz                          # PyMuPDF — renders PDF pages to images
from PIL import Image, ImageFilter, ImageEnhance
import io

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.text_cleaner import clean_text


# ══════════════════════════════════════════════════════
# Part 1 — Image preprocessing
# ══════════════════════════════════════════════════════

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Cleans up an image before passing it to Tesseract.
    Better image quality = significantly better OCR accuracy.

    Steps:
        1. Convert to grayscale  — removes color noise
        2. Increase contrast     — makes text stand out more
        3. Sharpen               — makes blurry text crisper
        4. Convert to black/white (binarize) — pure black text on white
    """

    # Step 1: Grayscale — Tesseract works best on grayscale
    image = image.convert("L")

    # Step 2: Increase contrast — helps with faded or low quality scans
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)   # 2.0 = double the contrast

    # Step 3: Sharpen — helps with slightly blurry photos
    image = image.filter(ImageFilter.SHARPEN)

    # Step 4: Binarize — convert to pure black and white
    # Any pixel darker than 128 becomes black, lighter becomes white
    image = image.point(lambda x: 0 if x < 128 else 255, '1')
    image = image.convert("L")   # convert back to grayscale for Tesseract

    return image


# ══════════════════════════════════════════════════════
# Part 2 — Read text from a single image
# ══════════════════════════════════════════════════════

def read_image(image: Image.Image, lang: str = "eng") -> str:
    """
    Runs Tesseract OCR on a PIL Image and returns extracted text.

    The config string controls how Tesseract processes the image:
        --oem 3  = use the best available OCR engine (LSTM neural net)
        --psm 6  = assume the image is a block of text (good for documents)

    Other useful psm values:
        --psm 3  = fully automatic page segmentation (default)
        --psm 4  = single column of text
        --psm 11 = sparse text (for messy layouts)
    """
    preprocessed = preprocess_image(image)

    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(preprocessed, lang=lang, config=config)

    return text


# ══════════════════════════════════════════════════════
# Part 3 — Read text from image files (JPG, PNG etc)
# ══════════════════════════════════════════════════════

def read_image_file(image_path: str, lang: str = "eng") -> str:
    """
    Opens an image file and extracts text from it.
    Supports JPG, PNG, TIFF, BMP.

    Use this when your PYQ is a photo taken with a phone camera.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(image_path)
    text  = read_image(image, lang=lang)

    return text


# ══════════════════════════════════════════════════════
# Part 4 — Read text from image-based PDF
# ══════════════════════════════════════════════════════

def read_image_pdf(pdf_path: str, dpi: int = 300, lang: str = "eng") -> str:
    """
    Handles PDFs where each page is a scanned/photographed image.

    How it works:
        1. Use PyMuPDF to render each PDF page as a high-res image
        2. Pass each image to Tesseract for OCR
        3. Join all pages with PAGE BREAK markers

    DPI of 300 is standard for OCR — higher is more accurate but slower.
    If your images are very low quality, try dpi=400.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    doc    = fitz.open(pdf_path)
    pages  = []
    matrix = fitz.Matrix(dpi / 72, dpi / 72)   # scale to target DPI

    print(f"  Processing {doc.page_count} page(s) with OCR...")

    for page_num in range(doc.page_count):
        page   = doc[page_num]
        pixmap = page.get_pixmap(matrix=matrix)

        # Convert PyMuPDF pixmap to PIL Image
        image_bytes = pixmap.tobytes("png")
        image       = Image.open(io.BytesIO(image_bytes))

        # Run OCR
        text = read_image(image, lang=lang)
        pages.append(text)

        print(f"  Page {page_num + 1}/{doc.page_count} done", end="\r")

    doc.close()
    print()

    return "\n\n--- PAGE BREAK ---\n\n".join(pages)


# ══════════════════════════════════════════════════════
# Part 5 — Smart entry point
# ══════════════════════════════════════════════════════

def process_image_document(path: str, lang: str = "eng") -> tuple:
    """
    Auto-detects whether input is an image file or image PDF
    and runs the appropriate OCR function.

    Returns the same ("text", content) tuple as process_pdf()
    so it plugs directly into your existing pipeline.

    Args:
        path: path to image file or image PDF
        lang: tesseract language code
              "eng" = English
              "eng+hin" = English + Hindi (if installed)

    Returns:
        ("text", "extracted text string")
    """
    ext = os.path.splitext(path)[1].lower()

    if ext == ".pdf":
        print(f"Image PDF detected — running OCR on {path}")
        raw = read_image_pdf(path, lang=lang)
    elif ext in [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"]:
        print(f"Image file detected — running OCR on {path}")
        raw = read_image_file(path, lang=lang)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # Clean the OCR output same as digital PDFs
    cleaned = clean_text(raw)
    return ("text", cleaned)


# ══════════════════════════════════════════════════════
# Part 6 — Update process_pdf to handle image PDFs
# ══════════════════════════════════════════════════════

def process_any_pdf(pdf_path: str, lang: str = "eng") -> tuple:
    """
    Drop-in replacement for process_pdf() that handles BOTH
    digital PDFs and image/scanned PDFs automatically.

    Use this in build_dataset.py instead of process_pdf()
    so all your PDFs — digital or scanned — work the same way.

    How it detects type:
        Try to extract text with pdfplumber first.
        If we get meaningful text → digital PDF → use pdfplumber.
        If we get nothing         → image PDF  → use Tesseract OCR.
    """
    import pdfplumber

    # Try digital extraction first
    try:
        with pdfplumber.open(pdf_path) as pdf:
            sample = ""
            for page in pdf.pages[:3]:
                sample += (page.extract_text() or "")

        if len(sample.strip()) > 100:
            # Digital PDF — use your existing fast extractor
            from ocr.pdf_to_images import process_pdf
            return process_pdf(pdf_path)

    except Exception:
        pass

    # Image PDF — fall back to Tesseract OCR
    return process_image_document(pdf_path, lang=lang)


# ══════════════════════════════════════════════════════
# Test
# ══════════════════════════════════════════════════════

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None

    if not path:
        print("Usage: python ocr/tesseract_reader.py <path_to_image_or_pdf>")
        print("Supports: .pdf, .jpg, .jpeg, .png, .tiff")
        sys.exit(1)

    print(f"\nProcessing: {path}\n")
    result_type, text = process_any_pdf(path)

    print("\nExtracted text preview (first 1000 chars):")
    print("=" * 55)
    print(text[:1000])
    print("=" * 55)
    print(f"\nTotal characters extracted: {len(text)}")