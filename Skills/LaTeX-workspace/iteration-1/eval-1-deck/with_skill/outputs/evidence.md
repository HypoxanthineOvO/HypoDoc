# Reliable Render Pipelines: Export Evidence

## Artifact Contract

- Source: `deck.md`
- PDF: `deck.pdf`
- Effective profile/theme/palette: `beamer` / `minimal` / `blue`
- Aspect ratio: `169`
- Placeholder assets: none requested, referenced, or generated
- Renderer: `${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex`
- Pandoc path prefix: `${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin`

## Commands Run

```bash
PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex doctor

PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex \
  build deck.md --output deck.pdf

pdfinfo deck.pdf
pdftotext -layout deck.pdf -
pdftoppm -png -r 120 deck.pdf .visual-page
```

`hypolatex doctor` exited 0 and reported exact `pandoc 3.10`, XeLaTeX,
latexmk, all required TeX packages, all required Noto CJK fonts, and all three
Poppler evidence tools as available. Both PDF builds exited 0.

## PDF Geometry And Count

Actual `pdfinfo` evidence:

```text
Title: Reliable Render Pipelines - Deterministic stages, explicit contracts, verifiable evidence
Author: HypoDoc Engineering
Creator: LaTeX with Beamer class
Producer: xdvipdfmx (20220710)
CreationDate: Sat Jan  1 08:00:00 2000 CST
Pages: 6
Page size: 453.54 x 255.12 pts
Page rot: 0
File size: 31320 bytes
PDF version: 1.5
```

Result: exactly 6 pages at 16:9 Beamer geometry, with no rotation.

## Extracted Text Checks

`pdftotext -layout` confirmed the intended page sequence and representative
content:

| Page | Required role | Extracted marker(s) |
|---:|---|---|
| 1 | Metadata title | `Reliable Render Pipelines`; `HypoDoc Engineering`; `2026-08-09` |
| 2 | H1 divider | `Pipeline Contract` |
| 3 | H2 divider | `Verification Loop` |
| 4 | Content frame with objective | `Define Reliability Before Rendering`; `Pipeline Objective`; `pinned toolchain` |
| 5 | Content frame with comparison table | `Compare Failure Policies`; `Fragile behavior`; `Reliable behavior`; `Check pages, text, and geometry` |
| 6 | Content frame with math and code | `Measure And Reproduce`; `R = p/n`; `hypolatex build deck.md --output deck.pdf` |

Footer extraction on content pages reported `4 / 6`, `5 / 6`, and `6 / 6`,
confirming the three content frames occupy pages 4 through 6.

## Visual Checks

All six pages were rasterized with `pdftoppm` at 120 DPI and inspected:

- Page 1: title, subtitle, author, and explicit date are visible and unclipped.
- Pages 2-3: H1 and H2 divider hierarchy is distinct and uses the blue palette.
- Page 4: objective callout and all three bullets fit inside the frame.
- Page 5: comparison table remains within page bounds; wrapped cell text stays in its row.
- Page 6: inline equation, bullet list, and command block are legible and do not overlap the footer.
- No page is blank; no content, footer, table, or callout is clipped or overlapping.

## Determinism Check

The same source was built twice with the same pinned PATH and renderer. The
SHA-256 digest was identical for both outputs:

```text
77c3f293f03a34c1ff8fa9b516d1284cc0b3414bf477608b7f8e6d4570b5725f
```

This verifies byte-for-byte reproducibility for the two observed builds.
