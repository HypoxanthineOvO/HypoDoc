# Reviewer PDF Evidence

## Result

- Source: `project.md`
- Reviewer artifact: `project.pdf`
- Profile: longform `article`
- Theme: `tech-minimal`
- Source answer mode: `student`
- Build override: `--answer-mode review`
- SHA-256: `b5469b71ed4d57e2bd94b15eb761768cdfb2dd3ee89ff630ea67d152f690c81a`

## Toolchain And Build

The required doctor check passed for Pandoc, XeLaTeX, latexmk, TeX packages, fonts, and Poppler evidence tools. The pinned executable reported `pandoc 3.10`.

Reviewer build command:

```bash
PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex \
  build project.md --theme tech-minimal --answer-mode review --output project.pdf
```

The first build exposed an undefined `\square` generated from Markdown task-box syntax inside the checklist. The checklist remained a semantic `checklist` block, but its items were changed to ordinary imperative bullets. The second build completed with exit code 0.

## PDF Facts

`pdfinfo project.pdf` reported:

- Pages: 4
- Page size: 595 x 842 pt (A4)
- PDF version: 1.5
- File size: 32,284 bytes
- Encrypted: no
- JavaScript: no
- Creation date: 2000-01-01 08:00:00 CST

`pdffonts project.pdf` reported five embedded fonts. The Noto Serif CJK body/title fonts and CMSY10 expose Unicode mappings; the Font Awesome icon font is embedded but does not expose a Unicode map. This affects extracted icon glyphs, not the semantic text.

## Text Evidence

`pdftotext -layout project.pdf -` extracted the title and all requested semantic markers, including:

- `Objective`, `Task`, `Requirements`, `Deliverables`
- `Review Checklist`, `Acceptance Rubric`
- `Controlled Comparison`
- `Review Question`, `Hint`, `Answer`, `Solution`
- the question phrase `semantic membership more stable than pixel equality`

The extracted `Answer` and `Solution` prove that the CLI reviewer override took precedence over frontmatter `answer_mode: student`.

## Visual Evidence

Pages 1, 3, and 4 were rasterized at 120 DPI, inspected, and retained beside the requested artifacts as `project-page-1.png`, `project-page-3.png`, and `project-page-4.png`.

- Page 1: restrained, centered engineering cover with clear title/subtitle/author hierarchy.
- Page 3: objective, task, requirement, deliverable, checklist, and rubric modules stay within margins with no overlap or clipping.
- Page 4: the single comparison table fits the text width; question, hint, answer, and solution are visibly distinct and fully contained on the page.

No assets, remote resources, placeholders, or advanced style overrides were used.
