# Broken Deck Repair Audit

## Result

The deck was repaired without modifying the source input, copying or fabricating
an asset, or enabling placeholder rendering. The repaired Markdown builds
successfully as a four-page 16:9 Beamer PDF with the pinned Pandoc 3.10 toolchain.

## Material Changes

| Original | Repair | Reason |
|---|---|---|
| `document_type: beamer` | `profile: beamer` | Migrates the legacy profile alias to the canonical configuration field. |
| `theme: classic-readable` | `theme: minimal` | `classic-readable` is a longform theme and is incompatible with Beamer. `minimal` is a Beamer-only, content-first theme that preserves the restrained intent of this review deck. |
| Absolute figure source `/private/course/secret diagram.png` | Figure directive removed | The path is absolute, private, outside the document workspace, and missing. Keeping it would violate the local-resource boundary and make a strict build fail. |
| Missing architecture figure | Textual `Missing Diagram TODO` requirement | Preserves the requirement without inventing/copying an image. The TODO requires a future approved asset to live in the document workspace and use a repository-relative path. |
| Request to explain the invalid inputs | Three explicit audit bullets | Makes the profile alias, incompatible theme, and unsafe missing path visible in the repaired deck itself. |

The title, section/subsection/frame hierarchy, objective, blue palette, and both
divider settings were preserved.

## Build Procedure

Environment check:

```bash
PATH="${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH" \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex doctor
```

The doctor check passed for exact `pandoc 3.10`, XeLaTeX, latexmk, required TeX
packages, required fonts, and Poppler evidence tools.

Strict build command:

```bash
PATH="${REPO_ROOT}/Spec/.tools/pandoc/3.10/bin:$PATH" \
  ${REPO_ROOT}/Renderers/LaTeX/.venv/bin/hypolatex build \
  Skills/LaTeX-workspace/iteration-1/eval-3-repair/old_skill/outputs/repaired.md \
  --output Skills/LaTeX-workspace/iteration-1/eval-3-repair/old_skill/outputs/repaired.pdf
```

The command exited `0`. It intentionally did not use `--allow-placeholders`.
The repaired Markdown contains no figure `src`, absolute private path, or missing
asset reference.

## PDF Evidence

`pdfinfo` reported:

- Title: `Broken Rendering Review`
- Creator: `LaTeX with Beamer class`
- Pages: `4`
- Page size: `453.54 x 255.12 pts` (16:9)
- PDF version: `1.5`
- File size: `19,783 bytes`
- Creation date: `Sat Jan 1 08:00:00 2000 CST`
- JavaScript: `no`; encrypted: `no`

`pdftotext -layout` confirmed these expected markers in the exported PDF:

- `Broken Rendering Review`
- `Rendering Review / Unsafe Inputs`
- `Repair Contract`
- `Make the deck deterministic and safe to export.`
- `Missing Diagram TODO`
- The repository-relative-path requirement
- All three repair explanation bullets

Raster inspection with `pdftoppm` covered pages 1 and 4. Page 1 has a clean,
fully visible title layout. Page 4 shows the objective, textual TODO, audit
bullets, breadcrumb, footer, and `4/4` page number without clipping, overlap, or
a fabricated image placeholder.

Two consecutive strict builds were byte-identical:

```text
SHA-256  806d1e3d9d659acd14d58a4e738f3acf229a285cbcd9450b08481a4faf3fdaf2
cmp      identical (exit 0)
```

This provides direct evidence that the repaired source produced deterministic
PDF bytes in the specified environment.
