"""
parser/test_parser.py

Tests that the parser is extracting the right structure from the syllabus.
Run this any time you change rule_based_parser.py to make sure nothing broke.

Usage:
    python parser/test_parser.py your_syllabus.pdf
"""

import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from parser.pipeline import run


def test_has_semesters(parsed: dict):
    """
    Checks that at least one semester was detected.
    If this fails, the "Semester III" heading pattern isn't matching.
    """
    assert len(parsed["semesters"]) > 0, \
        "FAIL — no semesters found. Check PATTERNS['semester'] regex."
    print(f"  PASS — found {len(parsed['semesters'])} semester(s)")


def test_semesters_have_courses(parsed: dict):
    """
    Checks that every semester has at least one course.
    If this fails, the course splitting logic isn't working.
    """
    for sem in parsed["semesters"]:
        assert len(sem["courses"]) > 0, \
            f"FAIL — Semester {sem['semester']} has no courses."
    print(f"  PASS — all semesters have courses")


def test_courses_have_titles(parsed: dict):
    """
    Checks that no course has an "Unknown Course" title.
    If this fails, extract_course_title() isn't finding the title line.
    """
    unknown = []
    for sem in parsed["semesters"]:
        for course in sem["courses"]:
            if course["title"] == "Unknown Course":
                unknown.append(f"Semester {sem['semester']}")

    assert len(unknown) == 0, \
        f"FAIL — unknown course titles in: {unknown}"
    print(f"  PASS — all courses have titles")


def test_courses_have_modules(parsed: dict):
    """
    Checks that at least some courses have modules.
    If every course has 0 modules, the module pattern isn't matching.
    """
    total_modules = sum(
        len(course["modules"])
        for sem in parsed["semesters"]
        for course in sem["courses"]
    )
    assert total_modules > 0, \
        "FAIL — no modules found anywhere. Check PATTERNS['module'] regex."
    print(f"  PASS — found {total_modules} module(s) total")


def test_some_modules_have_topics(parsed: dict):
    """
    Checks that at least some modules have topics.
    Not all modules will have topics (some PDFs only list module names),
    so we just check that it's not zero across the entire syllabus.
    """
    total_topics = sum(
        len(mod["topics"])
        for sem in parsed["semesters"]
        for course in sem["courses"]
        for mod in course["modules"]
    )
    assert total_topics > 0, \
        "FAIL — no topics found anywhere. Check PATTERNS['topic'] regex."
    print(f"  PASS — found {total_topics} topic(s) total")


def test_hours_are_numbers(parsed: dict):
    """
    Checks that module hours are integers, not 0 everywhere.
    If all hours are 0, the hours pattern isn't matching.
    """
    non_zero = sum(
        1 for sem in parsed["semesters"]
        for course in sem["courses"]
        for mod in course["modules"]
        if mod["hours"] > 0
    )
    assert non_zero > 0, \
        "FAIL — all module hours are 0. Check PATTERNS['hours'] regex."
    print(f"  PASS — {non_zero} module(s) have hours > 0")


def print_summary(parsed: dict):
    """
    Prints a quick readable summary of what was parsed —
    useful for visually checking the output looks right.
    """
    print("\nSUMMARY")
    print("=" * 50)
    for sem in parsed["semesters"]:
        print(f"\nSemester {sem['semester']} — {len(sem['courses'])} course(s)")
        for course in sem["courses"]:
            total_topics = sum(len(m["topics"]) for m in course["modules"])
            print(f"  {course['title']}")
            print(f"    {len(course['modules'])} modules, {total_topics} topics, {len(course['outcomes'])} outcomes")


# ══════════════════════════════════════════════════════
# Run all tests
# ══════════════════════════════════════════════════════

if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else "test_syllabus.pdf"

    print(f"Running tests on: {pdf}\n")

    parsed = run(pdf)

    tests = [
        test_has_semesters,
        test_semesters_have_courses,
        test_courses_have_titles,
        test_courses_have_modules,
        test_some_modules_have_topics,
        test_hours_are_numbers,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test(parsed)
            passed += 1
        except AssertionError as e:
            print(f"  {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed out of {len(tests)} tests")

    print_summary(parsed)