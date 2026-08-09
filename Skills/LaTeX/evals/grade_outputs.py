#!/usr/bin/env python3
"""Programmatically grade paired Hypo-LaTeX skill evaluation outputs."""

from __future__ import annotations

import json
from pathlib import Path
import re
import subprocess

import yaml


ROOT = Path(__file__).resolve().parents[3]
ITERATION = ROOT / "Skills/LaTeX-workspace/iteration-1"
ADVANCED_FIELDS = {
    "font", "fonts", "mainfont", "sansfont", "monofont", "cjkfont",
    "paper", "paper_size", "accent", "accent_color", "resource-root",
    "resource_root", "cover_layout", "cover_image",
}


def frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    loaded = yaml.safe_load(match.group(1))
    return loaded if isinstance(loaded, dict) else {}


def pdf_text(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        capture_output=True,
        check=True,
        text=True,
    )
    return result.stdout


def pdf_info(path: Path) -> str:
    result = subprocess.run(
        ["pdfinfo", str(path)], capture_output=True, check=True, text=True
    )
    return result.stdout


def grade(expectations: list[str], results: list[tuple[bool, str]], run_dir: Path) -> None:
    graded = [
        {"text": text, "passed": passed, "evidence": evidence}
        for text, (passed, evidence) in zip(expectations, results, strict=True)
    ]
    passed = sum(item["passed"] for item in graded)
    artifact_bytes = sum(
        path.stat().st_size
        for path in (run_dir / "outputs").iterdir()
        if path.is_file()
    )
    payload = {
        "expectations": graded,
        "summary": {
            "passed": passed,
            "failed": len(graded) - passed,
            "total": len(graded),
            "pass_rate": passed / len(graded),
        },
        "execution_metrics": {
            "total_tool_calls": 0,
            "errors_encountered": 0,
            "output_chars": 0,
            "transcript_chars": 0,
            "artifact_bytes": artifact_bytes,
        },
        "claims": [],
        "user_notes_summary": {"uncertainties": [], "needs_review": [], "workarounds": []},
        "eval_feedback": {"suggestions": [], "overall": "Assertions inspect source, PDF, and evidence."},
    }
    (run_dir / "grading.json").write_text(
        json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8"
    )


def grade_deck(run_dir: Path, expectations: list[str]) -> None:
    out = run_dir / "outputs"
    source = out / "deck.md"
    pdf = out / "deck.pdf"
    evidence_path = out / "evidence.md"
    metadata = frontmatter(source)
    markdown = source.read_text(encoding="utf-8")
    evidence = evidence_path.read_text(encoding="utf-8")
    extracted = pdf_text(pdf)
    info = pdf_info(pdf)
    headings = re.findall(r"^(#{1,3})\s+", markdown, re.MULTILINE)
    files_ok = all(path.is_file() and path.stat().st_size > 0 for path in (source, pdf, evidence_path))
    canonical = (
        metadata.get("profile") == "beamer"
        and "document_type" not in metadata
        and "documentclass" not in metadata
        and metadata.get("theme") == "minimal"
        and metadata.get("palette") == "blue"
    )
    structure = (
        headings.count("#") == 1
        and headings.count("##") == 1
        and headings.count("###") == 3
        and metadata.get("subsection_dividers") is True
        and all(token in markdown for token in (".objective", ".table", "$R", "```bash"))
    )
    pdf_ok = (
        "Pages:           6" in info
        and "453.54 x 255.12 pts" in info
        and all(token in extracted for token in ("Reliable Render Pipelines", "Objective", "Compare", "hypolatex build"))
    )
    evidence_folded = evidence.casefold()
    evidence_ok = all(token in evidence_folded for token in ("pandoc 3.10", "pages", "453.54", "pdftotext"))
    safe = (
        "--allow-placeholders" not in markdown
        and not re.search(r"src=|https?://|\.\./|/private/", markdown)
        and "--allow-placeholders" not in evidence
    )
    grade(expectations, [
        (files_ok, "Required source, PDF, and evidence files are non-empty."),
        (canonical, f"Frontmatter keys: {sorted(metadata)}; profile={metadata.get('profile')!r}."),
        (structure, f"Heading counts H1/H2/H3: {headings.count('#')}/{headings.count('##')}/{headings.count('###')}."),
        (pdf_ok, "pdfinfo reports 6 pages at 453.54 x 255.12 pt and requested frame text is extractable."),
        (evidence_ok, "Evidence names Pandoc 3.10, page facts, and pdftotext checks."),
        (safe, "No placeholder flag or local/external asset reference is present."),
    ], run_dir)


def grade_project(run_dir: Path, expectations: list[str]) -> None:
    out = run_dir / "outputs"
    source = out / "project.md"
    pdf = out / "project.pdf"
    evidence_path = out / "evidence.md"
    metadata = frontmatter(source)
    markdown = source.read_text(encoding="utf-8")
    evidence = evidence_path.read_text(encoding="utf-8")
    extracted = pdf_text(pdf)
    info = pdf_info(pdf)
    required_blocks = ("objective", "task", "requirement", "deliverable", "checklist", "rubric", "question", "hint", "answer", "solution")
    files_ok = all(path.is_file() and path.stat().st_size > 0 for path in (source, pdf, evidence_path))
    canonical = (
        metadata.get("profile") == "article"
        and metadata.get("theme") == "tech-minimal"
        and "document_type" not in metadata
        and "documentclass" not in metadata
        and not ADVANCED_FIELDS.intersection(metadata)
    )
    semantic = all(re.search(rf":::\s*(?:\{{[^}}]*\.)?{name}\b", markdown) for name in required_blocks)
    controlled = (
        markdown.count("::: {.table}") == 1
        and "type: comparison" in markdown
        and "columns:" in markdown
    )
    reviewer = all(token in extracted for token in ("Answer", "Solution", "Semantic", "Compare"))
    evidence_folded = evidence.casefold()
    evidence_ok = (
        "pandoc 3.10" in evidence_folded
        and "--answer-mode review" in evidence_folded
        and "pages" in evidence_folded
        and "595 x 842" in evidence_folded
        and "placeholder" in evidence_folded
        and "Pages:" in info
    )
    grade(expectations, [
        (files_ok, "Required source, PDF, and evidence files are non-empty."),
        (canonical, f"Frontmatter keys: {sorted(metadata)}; profile={metadata.get('profile')!r}."),
        (semantic, f"All requested block names present: {semantic}."),
        (controlled, "Exactly one controlled comparison table with YAML columns is present."),
        (reviewer, "Extracted PDF contains Answer, Solution, and supplied semantic comparison concepts."),
        (evidence_ok, "Evidence records pinned toolchain, review override, A4 page facts, and no-placeholder status."),
    ], run_dir)


def grade_repair(run_dir: Path, expectations: list[str]) -> None:
    out = run_dir / "outputs"
    source = out / "repaired.md"
    pdf = out / "repaired.pdf"
    audit_path = out / "audit.md"
    metadata = frontmatter(source)
    markdown = source.read_text(encoding="utf-8")
    audit = audit_path.read_text(encoding="utf-8")
    extracted = pdf_text(pdf)
    info = pdf_info(pdf)
    files_ok = all(path.is_file() and path.stat().st_size > 0 for path in (source, pdf, audit_path))
    canonical = (
        metadata.get("profile") == "beamer"
        and metadata.get("theme") in {"plain", "shanghaitech", "minimal", "glass"}
        and metadata.get("theme") != "classic-readable"
        and "document_type" not in metadata
        and "documentclass" not in metadata
    )
    safe = not re.search(r"/private/|src=|--allow-placeholders", markdown)
    markdown_folded = markdown.casefold()
    todo = "todo" in markdown_folded and "renderer architecture diagram" in markdown_folded
    audit_ok = all(token in audit for token in ("document_type", "profile", "classic-readable", "absolute", "placeholder"))
    pdf_ok = (
        "Pages:           4" in info
        and "453.54 x 255.12 pts" in info
        and all(token in extracted.casefold() for token in ("repair contract", "todo", "renderer architecture"))
    )
    grade(expectations, [
        (files_ok, "Required repaired source, PDF, and audit files are non-empty."),
        (canonical, f"Frontmatter profile/theme: {metadata.get('profile')!r}/{metadata.get('theme')!r}."),
        (safe, "No absolute private path, figure src, or placeholder flag remains."),
        (todo, "Source contains an explicit Renderer architecture diagram TODO."),
        (audit_ok, "Audit explains legacy profile, incompatible theme, absolute asset, and placeholder policy."),
        (pdf_ok, "pdfinfo reports 4-page 16:9 output and repair/TODO text is extractable."),
    ], run_dir)


def main() -> None:
    eval_dirs = sorted(ITERATION.glob("eval-*"))
    graders = (grade_deck, grade_project, grade_repair)
    for eval_dir, grader in zip(eval_dirs, graders, strict=True):
        metadata = json.loads((eval_dir / "eval_metadata.json").read_text(encoding="utf-8"))
        expectations = metadata["assertions"]
        for config in ("with_skill", "old_skill"):
            grader(eval_dir / config, expectations)


if __name__ == "__main__":
    main()
