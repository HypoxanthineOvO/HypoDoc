---
name: hypolatex
description: Use this skill whenever a user wants to author, edit, repair, preview, convert, compile, or validate a HypoDoc/Hypo-LaTeX Markdown document. This includes longform books and articles, project or review packets, cheatsheets, Beamer slides/presentations, Desktop or VS Code preview, TeX conversion, PDF export, renderer diagnostics, and PDF evidence. Do not use it for arbitrary hand-written LaTeX projects that do not use the HypoDoc Markdown contract.
---

# HypoDoc Authoring And Export

Treat the Markdown source as canonical. Preview, presentation, TeX, and PDF are projections of that source, so fix source/configuration problems instead of patching generated output.

## Route The Task

Read only the reference needed for the current task:

| Task | Start from | Read |
| --- | --- | --- |
| Book, article, project, review packet, controlled table, or cheatsheet | `templates/longform.md`, `project.md`, `review.md`, or `cheatsheet.md` | `references/authoring.md` |
| Slides, deck, presentation, waterfall preview, or Beamer | `templates/beamer.md` | `references/slides.md` |
| Convert/build failures, assets, PDF export, or evidence | Existing source | `references/export-and-evidence.md` |

For mixed tasks, read the authoring/slides reference first and the export reference only when producing or diagnosing TeX/PDF.

Copy or edit the selected Markdown template into the user's requested output path; do not modify the bundled template in place.

## Core Workflow

1. Inspect the source and workspace before editing. Preserve user content and existing project conventions.
2. Choose one canonical `profile`: `book`, `article`, or `beamer`. Legacy `document_type`/`documentclass` values are read compatibility only; migrate AI-authored files to `profile` and never emit both forms.
3. Choose a compatible theme. Ordinary AI authoring is theme-first: use `theme` as the only normal style field. Fonts, paper, accent, resource roots, and cover fields are optional advanced overrides used only for explicit constraints.
4. Author semantic Markdown and keep generated `.tex`/`.pdf` out of the source editing loop.
5. For slides, inspect waterfall or presentation preview before export. Frame order and content membership should match the PDF even though browser and TeX typography remain native.
6. Before conversion/build, run the dependency and exact-toolchain check:

```bash
hypolatex doctor
```

Pandoc `3.10`, XeLaTeX, latexmk, required TeX packages, fonts, and Poppler evidence tools must be available. If diagnostics report a missing or wrong dependency, explain the error and ask the user to install or select the required toolchain. Do not fake or pretend that dependencies are installed.

7. Generate reviewable TeX when source-to-TeX inspection is useful:

```bash
hypolatex convert INPUT.md --output OUTPUT.tex
```

8. Build with the XeLaTeX-first PDF path:

```bash
hypolatex build INPUT.md --output OUTPUT.pdf
```

Use `--theme THEME_ID` or `--answer-mode review` only as intentional CLI overrides. Read convert, Pandoc, latexmk, and build stderr/diagnostics; do not hide failures behind a different command.

9. Validate the output rather than stopping at exit code 0. Use `pdfinfo` for page geometry/count, `pdftotext` for content markers, and `pdftoppm` plus visual inspection when layout matters.

## Canonical Configuration

Longform default:

```yaml
---
title: Example Document
profile: book
theme: classic-readable
---
```

Beamer default:

```yaml
---
title: Example Deck
profile: beamer
theme: minimal
palette: red
aspectratio: "169"
---
```

Theme capabilities are explicit:

- `book`/`article`: `plain`, `classic-readable`, `tech-minimal`, `warm-handbook`, `academic-clean`.
- `beamer`: `plain`, `shanghaitech`, `minimal`, `glass`.

Reject an incompatible theme/profile pair before conversion. Do not rely on a silent fallback.

Optional advanced overrides include `font`, `fonts`, `mainfont`, `sansfont`, `monofont`, `cjkfont`, `paper`, `paper_size`, `accent`, `accent_color`, `resource-root`, `resource_root`, `cover_layout`, and `cover_image`. They tune a valid theme; they do not replace profile/theme selection.

## Safety And Failure Policy

- Use local workspace-relative assets. Reject remote/data URLs, absolute paths, `..` traversal, and symlink escapes.
- A corrupt image is a build error. A missing image is also an error by default because a successful PDF must not silently conceal missing evidence.
- Use `--allow-placeholders` only when the user explicitly accepts placeholder output for a draft. Record missing asset names in the handoff.
- Keep public fixtures synthetic. Private corpus sources, excerpts, PDFs, TeX, logs, screenshots, and result files remain local and must not be committed.
- Do not edit generated TeX to work around unsupported Markdown. Diagnose the source, renderer configuration, or toolchain boundary.

## Current Product Boundary

HypoDoc supports browser/Desktop/VS Code preview and Hypo-LaTeX PDF export. A Textual/TUI authoring application is not supported and is outside the current product surface. The public `hypolatex` CLI exposes `doctor`, `convert`, and `build`; use `hypolatex --help` when command help is required.

## Handoff

Report the source and outputs changed, effective profile/theme/answer mode, commands run, page/frame count, content evidence, visual checks, placeholders (if any), and unresolved diagnostics. When export could not run, state the exact dependency or source failure instead of claiming success.
