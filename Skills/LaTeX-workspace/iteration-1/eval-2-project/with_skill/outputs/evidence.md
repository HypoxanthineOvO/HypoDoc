# Reviewer PDF Evidence

## Effective Contract

- Source: `project.md`
- Output: `project.pdf`
- Profile: `article`
- Theme: `tech-minimal`
- Frontmatter answer mode: `student`
- Effective build answer mode: `review` via CLI override
- Assets/placeholders: none

## Commands

All Hypo-LaTeX commands used the required executable with Pandoc 3.10 prepended to `PATH`:

```bash
PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex doctor

PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex build \
  project.md --output project.pdf --answer-mode review

pdfinfo project.pdf
pdftotext -layout project.pdf -
pdftoppm -png -r 120 project.pdf evidence-page
sha256sum project.pdf .project-second.pdf
```

`hypolatex doctor` passed every required check: exact `pandoc 3.10`, XeLaTeX, latexmk, required TeX packages, Noto CJK fonts, and Poppler tools.

## PDF Facts

- Pages: 4
- Page size: 595 x 842 pt (A4)
- PDF version: 1.5
- File size at validation: 32,080 bytes
- Creation date: fixed to 2000-01-01 by the deterministic build environment
- SHA-256, first build: `e9c74a6da0709c87cf0c370d83f8149f8ec60e285e3998a277412fe1e1faacd9`
- SHA-256, repeated build: `e9c74a6da0709c87cf0c370d83f8149f8ec60e285e3998a277412fe1e1faacd9`
- Determinism result: byte-identical

## Content Evidence

`pdftotext -layout` extracted representative markers for every requested semantic surface:

- `Objective`, `Task`, `Requirements`, `Deliverables`
- `Review Checklist`, `Acceptance Rubric`
- `Render-review comparison contract`
- `Question 1: Question`, `Hint`, `Answer`, `Solution`
- The answer text beginning `Semantic roles, content membership, and order can match`
- The solution text beginning `Compare frame or page identifiers`

The visible `Answer` and `Solution` blocks confirm that CLI `--answer-mode review` took precedence over frontmatter `answer_mode: student`.

## Visual Evidence

All four pages were rasterized at 120 DPI and inspected:

- Page 1: restrained title page with title, subtitle, author, and fixed date.
- Page 2: legible contents page with correct section destinations.
- Page 3: objective, task, requirement, deliverable, checklist, and rubric blocks are visually distinct and fully contained.
- Page 4: the three-column comparison table is readable; question, hint, answer, solution, and summary blocks have clear hierarchy.
- No page is blank. No text, table, or block is clipped or overlapped.

## Build Note

The first build attempt used Markdown task-list markers inside the semantic checklist and exposed an undefined `\square` command in the current renderer/toolchain. The durable source was corrected to ordinary checklist bullets while preserving the `.checklist` semantic block; the reviewer build then succeeded. No generated TeX was edited.
