"""
parser/pipeline.py

Single entry point for the entire OCR → clean → parse flow.
Every other part of the app (app.py, training scripts) calls this.
Nobody needs to know about pdf_to_images, text_cleaner, or rule_based_parser.
They just call run() and get back clean structured JSON.

Usage:
    python parser/pipeline.py your_syllabus.pdf
"""

import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.pdf_to_images import process_pdf
from ocr.text_cleaner import clean_text
from parser.rule_based_parser import parse


def run(pdf_path: str) -> dict:
    """
    The one function you call from anywhere in the project.

    Runs the full pipeline in three steps:
      1. process_pdf()  — extracts raw text from the PDF (skips tables)
      2. clean_text()   — removes noise, headers, page numbers
      3. parse()        — detects structure, returns nested dict

    Returns:
        A dict with the full parsed syllabus structure, e.g:
        {
            "semesters": [
                {
                    "semester": "III",
                    "courses": [
                        {
                            "title": "Computer Programming",
                            "outcomes": [...],
                            "modules": [
                                {
                                    "module_number": "1",
                                    "name": "Introduction of Programming",
                                    "hours": 8,
                                    "topics": ["Intro to Problem Solving", ...]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    """

    # Step 1 — Extract text from PDF
    result_type, raw = process_pdf(pdf_path)

    if result_type == "images":
        raise NotImplementedError(
            "Scanned PDF detected. OCR support via Tesseract coming in tesseract_reader.py"
        )

    # Step 2 — Clean the raw text
    cleaned = clean_text(raw)

    # Step 3 — Parse into structured dict
    parsed = parse(cleaned)

    return parsed


if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else "test_syllabus.pdf"

    print(f"Running pipeline on: {pdf}\n")
    result = run(pdf)

    # Save output
    os.makedirs("output", exist_ok=True)
    out_path = "output/parsed_syllabus.json"
    with open(out_path, "w") as f:
        json.dump(result, f, indent=2)

    print(json.dumps(result, indent=2)[:2000])
    print(f"\nFull output saved to {out_path}")