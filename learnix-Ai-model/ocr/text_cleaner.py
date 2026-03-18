"""
ocr/text_cleaner.py

Cleans raw OCR text extracted from PDFs.
Removes noise, fixes hyphenation, normalizes spacing, and preserves line breaks.

Usage:
    python ocr/text_cleaner.py your_syllabus.pdf [--output cleaned.txt]
"""

import re
import sys
import os
from pathlib import Path
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.pdf_to_images import extract_text_skip_tables


def clean_text(raw_text: str) -> str:
    """
    Cleans raw OCR text:
    - Removes page breaks, page numbers, and common header/footer noise
    - Fixes broken words split across lines
    - Normalizes whitespace but keeps line breaks
    """

    text = raw_text

    # Remove page break markers
    text = re.sub(r'\n*--- PAGE BREAK ---\n*', '\n', text)

    # Fix hyphenated line breaks: "pro-\ngramming" → "programming"
    text = re.sub(r'-\n(\w)', r'\1', text)

    # Remove standalone page numbers and "Page X of Y"
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'Page\s+\d+(\s+of\s+\d+)?', '', text, flags=re.IGNORECASE)

    # Remove common header/footer noise
    noise_patterns = [
        r'curriculum\s*&?\s*syllabus',
        r'department\s+of\s+\w+',
        r'b\.?\s*tech',
        r'university\s+\w+',
        r'^\s*\*+\s*$',  # lines of just asterisks
        r'^\s*-+\s*$',   # lines of just dashes
    ]
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)

    # Normalize spacing but preserve line breaks
    # Strip trailing spaces on each line
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)
    # Collapse multiple blank lines into maximum of two
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Collapse multiple spaces inside lines
    text = re.sub(r' {2,}', ' ', text)

    return text.strip()


def main():
    parser = argparse.ArgumentParser(description="Clean OCR-extracted PDF text")
    parser.add_argument("pdf", help="Path to the PDF file to clean")
    parser.add_argument("--output", "-o", help="Optional output file for cleaned text")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.is_file():
        print(f"Error: PDF file not found: {pdf_path}")
        sys.exit(1)

    print(f"Reading: {pdf_path}")
    raw_text = extract_text_skip_tables(str(pdf_path))
    cleaned = clean_text(raw_text)

    preview_length = min(len(cleaned), 3000)
    print("\nCLEANED TEXT PREVIEW (first chars):")
    print("=" * 50)
    print(cleaned[:12000])
    print("=" * 50)
    print(f"\nTotal characters: {len(cleaned)}")

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(cleaned, encoding="utf-8")
        print(f"\nCleaned text saved to: {output_path}")


if __name__ == "__main__":
    main()