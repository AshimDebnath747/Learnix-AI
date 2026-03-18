"""
ocr/pdf_to_images.py

Extracts text from a PDF using pdfplumber, skipping table content.
For scanned PDFs, falls back to rendering pages as images via PyMuPDF.

Install: pip install pdfplumber pymupdf
"""

import os
import fitz
import pdfplumber
from itertools import groupby


def extract_text_skip_tables(pdf_path: str) -> str:
    """
    Extracts plain text from a digital PDF using pdfplumber.
    Skips any content inside table bounding boxes.

    Groups words by their vertical (top) position to reconstruct
    proper line breaks — much more accurate than get_text().
    """
    pages_text = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            clean_lines = []

            # Find all tables and store their bounding boxes
            tables = page.find_tables()
            table_rects = [t.bbox for t in tables]

            # Extract all words with their positions
            words = page.extract_words()

            # Filter out words that fall inside any table bounding box
            non_table_words = []
            for w in words:
                rect = (w["x0"], w["top"], w["x1"], w["bottom"])
                inside_table = any(
                    rect[0] >= tr[0] and rect[1] >= tr[1] and
                    rect[2] <= tr[2] and rect[3] <= tr[3]
                    for tr in table_rects
                )
                if not inside_table:
                    non_table_words.append(w)

            # Group words into lines by their vertical position
            for _, group in groupby(non_table_words, key=lambda w: round(w["top"], 1)):
                line_text = " ".join(w["text"] for w in group)
                if line_text.strip():
                    clean_lines.append(line_text)

            pages_text.append("\n".join(clean_lines))

    return "\n\n--- PAGE BREAK ---\n\n".join(pages_text)


def is_digital_pdf(pdf_path: str) -> bool:
    """
    Checks if the PDF has embedded text (digital) or is a scanned image.
    Uses pdfplumber to extract a sample — if we get back meaningful
    text it's digital, otherwise it's scanned.
    """
    with pdfplumber.open(pdf_path) as pdf:
        sample = ""
        for page in pdf.pages[:3]:         # check first 3 pages
            text = page.extract_text() or ""
            sample += text
    return len(sample.strip()) > 100


def render_to_images(pdf_path: str, output_dir: str, dpi: int) -> list:
    """
    For scanned PDFs only. Renders each page as a PNG using PyMuPDF.
    These images are passed to Tesseract for OCR in the next stage.
    """
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    matrix = fitz.Matrix(dpi / 72, dpi / 72)
    image_paths = []

    for page in doc:
        pixmap = page.get_pixmap(matrix=matrix)
        path = os.path.join(output_dir, f"page_{page.number + 1:03d}.png")
        pixmap.save(path)
        image_paths.append(path)
        print(f"  Page {page.number + 1}/{doc.page_count} → {path}")

    doc.close()
    return image_paths


def process_pdf(pdf_path: str, output_dir: str = "output/pages", dpi: int = 300):
    """
    Main entry point. Auto-detects digital vs scanned PDF.

    Returns:
        ("text",   "full clean text string")     — digital PDF
        ("images", ["page_001.png", ...])         — scanned PDF
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Cannot find PDF: {pdf_path}")

    if is_digital_pdf(pdf_path):
        print("Digital PDF detected — extracting text with pdfplumber")
        text = extract_text_skip_tables(pdf_path)
        return ("text", text)
    else:
        print("Scanned PDF detected — rendering pages as images")
        image_paths = render_to_images(pdf_path, output_dir, dpi)
        return ("images", image_paths)


if __name__ == "__main__":
    import sys
    pdf = sys.argv[1] if len(sys.argv) > 1 else "test_syllabus.pdf"
    result_type, result = process_pdf(pdf)
    if result_type == "text":
        print(result[:800])
    else:
        for p in result:
            print(" ", p)