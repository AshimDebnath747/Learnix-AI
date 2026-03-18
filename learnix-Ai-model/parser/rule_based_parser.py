import re
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.pdf_to_images import extract_text_skip_tables
from ocr.text_cleaner import clean_text

# ══════════════════════════════════════════════════════
# Regex patterns
# ══════════════════════════════════════════════════════

PATTERNS = {
    "semester": re.compile(r'^Semester\s+([IVXLC]+)', re.IGNORECASE | re.MULTILINE),
    "module": re.compile(r'^Module[-\s]*(\d+)\s*[:\-]?\s*(.*)', re.IGNORECASE | re.MULTILINE),
    "hours": re.compile(r'Number of class hours\s*[:\-]?\s*(\d+)', re.IGNORECASE),
    "outcomes_start": re.compile(r'Course Outcomes?', re.IGNORECASE),
    "content_start": re.compile(r'Detailed\s+(Course\s+Contents|content of the unit|content)', re.IGNORECASE),
    "references": re.compile(r'^References[:\-]?', re.IGNORECASE),
    "topic_numbering": re.compile(r'^\s*((?:\d+\.\d+)|(?:\d+))(?:[.,]?\s*)\s*(.+)', re.MULTILINE),
    "outcome_numbering": re.compile(r'^\s*(\d+[.,]?)\s*(.+)', re.MULTILINE)
}

def clean_lines(text):
    return [l.strip() for l in text.splitlines() if l.strip()]

def split_into_semesters(text: str):
    semesters = []
    matches = list(PATTERNS["semester"].finditer(text))
    for i, match in enumerate(matches):
        name = match.group(1).upper()
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        semesters.append({"name": name, "text": text[start:end]})
    return semesters

def split_into_courses(semester_text: str):
    courses = []
    splits = [m.start() for m in PATTERNS["outcomes_start"].finditer(semester_text)]
    if not splits:
        return [semester_text]
    splits.append(len(semester_text))
    for i in range(len(splits)-1):
        lookback = max(0, splits[i] - 300)
        chunk = semester_text[lookback:splits[i+1]]
        courses.append(chunk.strip())
    return courses

def extract_course_title(course_text: str):
    outcomes_match = PATTERNS["outcomes_start"].search(course_text)
    if not outcomes_match:
        return "Unknown Course"
    before = course_text[:outcomes_match.start()]
    lines = clean_lines(before)
    for line in reversed(lines):
        if line.lower().startswith("semester") or "syllabus" in line.lower():
            continue
        return line
    return "Unknown Course"

def extract_outcomes(course_text: str):
    outcomes = []
    start_match = PATTERNS["outcomes_start"].search(course_text)
    if not start_match:
        return outcomes
    text_after = course_text[start_match.end():]
    lines = clean_lines(text_after)
    collecting = True
    for line in lines:
        if PATTERNS["content_start"].search(line):
            break
        m = PATTERNS["outcome_numbering"].match(line)
        if m:
            outcomes.append(m.group(2).strip())
        else:
            outcomes.append(line.strip())
    return outcomes

def split_into_modules(course_text: str):
    modules = []
    matches = list(PATTERNS["module"].finditer(course_text))
    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(course_text)
        modules.append(course_text[start:end])
    return modules

def extract_module(module_text: str):
    heading = PATTERNS["module"].search(module_text)
    number = heading.group(1) if heading else "?"
    name = heading.group(2).strip() if heading else "Unknown Module"
    hours_match = PATTERNS["hours"].search(module_text)
    hours = int(hours_match.group(1)) if hours_match else 0

    # Topics: under content start until next module or references
    topics = []
    content_match = PATTERNS["content_start"].search(module_text)
    if content_match:
        text_after = module_text[content_match.end():]
        lines = clean_lines(text_after)
        for line in lines:
            if PATTERNS["module"].search(line) or PATTERNS["references"].search(line):
                break
            m = PATTERNS["topic_numbering"].match(line)
            if m:
                topics.append(m.group(2).strip())
            else:
                topics.append(line.strip())
    return {
        "module_number": number,
        "name": name,
        "hours": hours,
        "topics": topics
    }

def parse(clean_text: str):
    result = {"semesters":[]}
    for sem in split_into_semesters(clean_text):
        sem_data = {"semester": sem["name"], "courses":[]}
        for course_text in split_into_courses(sem["text"]):
            title = extract_course_title(course_text)
            outcomes = extract_outcomes(course_text)
            modules = [extract_module(m) for m in split_into_modules(course_text)]
            if title == "Unknown Course" and not modules:
                continue
            sem_data["courses"].append({
                "title": title,
                "outcomes": outcomes,
                "modules": modules
            })
        result["semesters"].append(sem_data)
    return result

if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv)>1 else "test_syllabus.pdf"
    raw = extract_text_skip_tables(pdf)
    cleaned = clean_text(raw)
    parsed = parse(cleaned)
    os.makedirs("output", exist_ok=True)
    out_path = "output/parsed_syllabus.json"
    with open(out_path,"w",encoding="utf-8") as f:
        json.dump(parsed,f,indent=2)
    print(f"Saved parsed JSON to {out_path}")