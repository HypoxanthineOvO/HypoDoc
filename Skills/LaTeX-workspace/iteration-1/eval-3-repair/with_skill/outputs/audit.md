# Broken Deck Repair Audit

## Outcome

The repaired source builds successfully as a four-page Beamer PDF with the
pinned Pandoc 3.10 toolchain. The build was strict: `--allow-placeholders` was
not used, no asset was copied or fabricated, and the PDF contains no missing
asset placeholder.

Effective configuration:

- Profile: `beamer`
- Theme: `minimal`
- Palette: `blue`
- Answer mode: renderer default (`student`)
- Section dividers: enabled
- Subsection dividers: enabled

## Material Changes

1. Replaced legacy `document_type: beamer` with canonical `profile: beamer`.
   The renderer reads `document_type` for compatibility, but repaired and newly
   authored sources must use the single canonical `profile` field.
2. Replaced `theme: classic-readable` with `theme: minimal`.
   `classic-readable` supports longform `book` and `article` profiles, so it is
   incompatible with `beamer`. `minimal` is an explicit Beamer-capable theme
   and preserves the restrained presentation intent without a silent fallback.
3. Removed the figure directive whose `src` was the absolute, missing path
   `/private/course/secret diagram.png`. Absolute paths are outside the allowed
   workspace-relative resource boundary, and the asset was unavailable. It was
   not copied, recreated, or replaced with a renderer placeholder.
4. Preserved the missing evidence requirement as visible source text:
   `TODO: Renderer architecture diagram.` The TODO retains the original caption
   intent and requires a verified workspace-relative asset before the deck can
   be considered complete.
5. Preserved the original title, heading/frame order, objective callout,
   explanatory bullet, blue palette, and both divider settings.

## Commands And Results

All renderer commands used this prefix:

```bash
PATH="${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH"
```

Dependency check:

```bash
${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex doctor
```

Result: exit 0. Doctor reported exact `pandoc 3.10`, XeLaTeX, latexmk,
required TeX packages, required Noto CJK fonts, and Poppler evidence tools as
available.

Strict build, run twice without `--allow-placeholders`:

```bash
${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex build Skills/LaTeX-workspace/iteration-1/eval-3-repair/with_skill/outputs/repaired.md --output Skills/LaTeX-workspace/iteration-1/eval-3-repair/with_skill/outputs/repaired.pdf
${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex build Skills/LaTeX-workspace/iteration-1/eval-3-repair/with_skill/outputs/repaired.md --output Skills/LaTeX-workspace/iteration-1/eval-3-repair/with_skill/outputs/repaired-repeat.pdf
```

Result: both builds exited 0 and were byte-identical (`cmp` exit 0).

## PDF Evidence

`pdfinfo repaired.pdf` reported:

- Pages: 4
- Page size: 453.54 x 255.12 pt (16:9 Beamer)
- PDF version: 1.5
- File size: 14,193 bytes
- Creation date: fixed at 2000-01-01 08:00:00 CST
- JavaScript: none
- Encrypted: no

`pdftotext repaired.pdf -` confirmed these representative markers in order:

1. `Broken Rendering Review`
2. `Rendering Review`
3. `Unsafe Inputs`
4. `Repair Contract`
5. `Goal`
6. `Make the deck deterministic and safe to export.`
7. `TODO: Renderer architecture diagram.`
8. `Do not restore the original absolute path.`
9. `Explain why the original configuration and asset path are invalid.`

All four pages were rasterized at 144 DPI with `pdftoppm` and visually
inspected. The title page, section divider, subsection divider, and content
frame were nonblank and correctly ordered. The content frame showed the goal
callout, full TODO, explanatory bullet, breadcrumb, title, and `4/4` footer with
no observed clipping, overlap, or placeholder image.

Determinism evidence:

```text
9e62eef7f1e731d511d34e0e7f3b5c628f7d6cdd5e31a5cbb193491162bb66e2  repaired.pdf
9e62eef7f1e731d511d34e0e7f3b5c628f7d6cdd5e31a5cbb193491162bb66e2  repaired-repeat.pdf
```

## Remaining Requirement

The renderer architecture diagram is still intentionally unresolved. A future
revision must add the real diagram using a verified workspace-relative path and
then repeat the strict build and PDF evidence checks. The present PDF is safe
and truthful because it exposes that omission as text instead of concealing it.
