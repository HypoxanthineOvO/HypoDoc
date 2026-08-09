# Export, Diagnostics, And Evidence

Run `hypolatex doctor` before the first conversion/build in an environment. It must confirm exact Pandoc 3.10, XeLaTeX, latexmk, TeX packages, fonts, and Poppler tools. A version mismatch is a real failure, not a warning to ignore.

Use `hypolatex convert` to inspect the renderer-owned TeX surface. Use `hypolatex build` for deterministic PDF output. Never hand-edit generated TeX as the durable fix.

## Assets

All local assets must resolve inside allowed document roots. Absolute paths, external URLs, parent traversal, and symlink escape are invalid. Corrupt assets fail. Missing assets fail unless the user explicitly requests draft placeholders and the command includes `--allow-placeholders`.

## Evidence

After build:

```bash
pdfinfo OUTPUT.pdf
pdftotext OUTPUT.pdf -
pdftoppm -png -r 144 OUTPUT.pdf build/page
```

Check expected page size/count, representative text from every major section/frame type, and screenshots for title/divider/content/table/math/code/figure pages. For deterministic workflows, build the same source twice with the same pinned toolchain and compare hashes.

## Failure Triage

- Doctor failure: report the missing/wrong executable, package, or font and ask the user to fix the environment.
- Convert/Pandoc failure: inspect frontmatter shape, canonical profile, theme capability, heading structure, and directive syntax.
- Build/latexmk failure: inspect the summarized TeX error and resource list; fix source/configuration rather than suppressing it.
- Evidence failure: treat missing text, wrong page count, clipping, or blank pages as product failure even when the process exits zero.
