# Reliable Render Pipelines: Build Evidence

## Result

PASS. `deck.pdf` contains exactly 6 Beamer pages. Every page has the same 16:9
geometry, the requested structural pages and content frames are present in order,
and the source contains no image or placeholder asset references.

## Toolchain

The build used:

```text
PATH=${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH
${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex
```

`hypolatex doctor` exited 0 before the build. It reported Pandoc 3.10 from the
pinned path, XeLaTeX and latexmk available, all required TeX packages available,
all required Noto CJK fonts available, and all Poppler evidence tools available.

Build command, run from this output directory:

```bash
hypolatex build deck.md --output deck.pdf
```

The build exited 0.

## PDF Geometry And Count

Command:

```bash
pdfinfo -f 1 -l 6 -box deck.pdf
```

Observed evidence:

```text
Pages:           6
Page    1 size:  453.54 x 255.12 pts
Page    2 size:  453.54 x 255.12 pts
Page    3 size:  453.54 x 255.12 pts
Page    4 size:  453.54 x 255.12 pts
Page    5 size:  453.54 x 255.12 pts
Page    6 size:  453.54 x 255.12 pts
```

`pdfinfo` also reported the title
`Reliable Render Pipelines - Deterministic stages, explicit contracts, auditable evidence`,
author `HypoDoc Engineering`, no JavaScript, no forms, and no encryption.

## Extracted Text Checks

Each check used `pdftotext -f PAGE -l PAGE deck.pdf -` and exited successfully:

```text
PASS page 1: Reliable Render Pipelines
PASS page 2: Pipeline Reliability
PASS page 3: From Source To Evidence
PASS page 4: Reliability Objective
PASS page 5: Pinned toolchain
PASS page 6: hypolatex build deck.md --output deck.pdf
```

Additional extracted markers:

- Page 1 contains the subtitle, author, and fixed date `2026-08-09`.
- Page 4 contains the objective callout text and three pipeline-contract bullets.
- Page 5 contains all three comparison rows and the inline reliability expression;
  Poppler extracts the expression as `R = product p_i` with mathematical glyphs.
- Page 6 contains the fenced build command and the three evidence checks.

## Asset And Placeholder Check

Command:

```bash
rg -n '!\[[^]]*\]\(' deck.md
```

The command found no Markdown image references. No local or remote assets are
used. The word `placeholder` in extracted PDF text belongs only to the authored
acceptance bullet `Reject placeholder assets and unreported fallbacks`; it is not
a missing-resource diagnostic.

## Artifact Digests

```text
deck.md   437d47a7f9cdbf99c205f7ce739cdd15a368d5f09c261fda09ed488c4ccd4ef8
deck.pdf  d639650d193a90b09efa845647f449ec673dbcf3b01bed59068424cbf86f115d
```
