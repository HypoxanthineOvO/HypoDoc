# Beamer Slides DSL

Hypo-LaTeX treats Beamer as a first-class document type for the current Slides DSL. It does not provide an automatic Marp-to-LaTeX or arbitrary LaTeX-deck converter; authors write the supported Markdown structure directly.

## Frontmatter

Use `document_type: beamer`. The aliases `slides` and `presentation` resolve to the same Beamer branch.

```yaml
---
title: Function Matrix
theme: plain
document_type: beamer
palette: red
aspectratio: "169"
footline: full
section_dividers: true
subsection_dividers: false
frame_title_inheritance_limit: 3
continued_title_style: subtle
strict_structure: true
---
```

Slides options:

- `palette`: deck color system, one of `red`, `blue`, `yellow`, `gray`, or `mono`; default `red`.
- `aspectratio`: Beamer slide geometry, one of `43`, `54`, `149`, `1610`, `169`, or `32`; default `169`.
- `footline`: footer style, one of `full`, `page`, or `none`; default `full`.
- `logo`: optional local image path shown on the title page.
- `toc`: when `true`, inserts an automatic table-of-contents page after the title page; entries come from H1 sections and H2 subsections, rendered with numbered ball markers and `1.1`-style numbered subsections. Each theme styles the page (glass: entries inside a glass card; shanghaitech: left accent panel with seal watermark).
- `toc_depth`: `1` lists sections only, `2` (default) also lists subsections. Requires `toc: true`.
- `section_dividers`: whether H1 sections create divider slides; default `true`.
- `subsection_dividers`: whether H2 subsections create divider slides; default `false`.
- `frame_title_inheritance_limit`: how many separator-created frames may inherit the previous H3 frame title; default `3`.
- `continued_title_style`: continuation title behavior, one of `subtle`, `suffix`, or `none`.
- `strict_structure`: reject unsafe heading order; default `true`.

## Visual Design

Beamer decks use a light "editorial" visual system owned by `tex/latex/hypolatex/hypolatex-beamer.sty`:

- Header: muted section breadcrumb, ink frame title, and a short accent rule merging into a full-width hairline; no solid title band. The `shanghaitech` theme uses the classic full-width band, `minimal` an ink hairline, and `glass` a floating translucent bar.
- Footer: hairline plus muted metadata; `full` shows short title, author, and page `n/total`, `page` shows only the page number, `none` hides the footer. The title page is always footer-free.
- Title page and section dividers are white-canvas layouts: accent kicker, large ink title, accent rule; dividers add a large light-tinted section number. With `theme: shanghaitech`, `cover_layout` selects among `cover-e` (slanted block), `cover-b` (rounded band), and `cover-c` (strip + band + motto), and dividers become floating red cards. All cover logo images must have transparent backgrounds.
- `palette` retunes the single accent color used by rules, labels, and markers. `red`, `blue`, `yellow`, `gray`, and `mono` remain the supported values; under `theme: shanghaitech` the accent is fixed to the university red.
- Semantic blocks are borderless neutral panels with a colored west bar and label: palette accent for C3 blocks, and role colors for `note` (slate), `tip` (green), `warning` (amber), and `summary` (blue).
- Fonts: TeX Gyre Termes (Times-like) for Latin text and Noto Serif CJK SC for Chinese, with bold cuts for titles; Noto Sans Mono (with its CJK variant) for code. Math always uses TeX Gyre Termes Math, with beamer serif math as fallback. Missing fonts fall back silently.
- List markers: level 1 solid dot, level 2 hollow ring, level 3 solid square, all at roughly one third of the font size. This is a global contract shared by all Beamer themes.
- Cover logos: optional `logo` (primary square logo), `logonegative` (negative variant for the red cover square), and `logolong` (horizontal wordmark) frontmatter paths. Multiple authors in the `author` list render one per line on the cover and comma-separated in the footer.

## Heading Contract

- H1 (`#`) is a Beamer section.
- H2 (`##`) is a Beamer subsection.
- H3 (`###`) is a frame title.
- `---` is a frame separator that starts a new frame. When allowed by `frame_title_inheritance_limit`, it can inherit the previous H3 frame title and apply `continued_title_style`.
- With `strict_structure: true`, H2 without a preceding H1 is invalid.

## Content Contract

The existing semantic blocks are supported on slides and frames: `objective`, `info`, `task`, `requirement`, `deliverable`, `checklist`, `rubric`, `question`, `hint`, `answer`, and `solution`.

Controlled `.table` blocks are supported for slide tables, but dense tables still need author judgment. Density and overfull lint checks are heuristics for likely crowded frames; they are limited lint signals, not a layout guarantee.

Slide assets must be local assets. Use relative paths or a local `resource-root`/`resource_root`; remote URLs are not fetched, and public examples must not depend on private or remote files.

Image sizing defaults to an aspect-ratio-preserving fit box. Width/height Markdown image attributes are allowed, but Beamer keeps the original image proportions by default.

A standalone image line (one or more caption-less images, nothing else on the line) is horizontally centered and rewritten to a fit box: the given `width` percent maps to `\linewidth`, and the image height is capped at `0.75\textheight` with `keepaspectratio` so tall figures cannot overflow the frame. Several images on the same line become one centered row and share the same per-image fit-box rules:

```markdown
![](assets/left.png){width=62%} ![](assets/right.png){width=30%}
```

A lone image with a non-empty caption stays in Markdown, so pandoc renders it as a centered figure with the caption; indented images (for example inside a list item) and images mixed with text on the same line are left untouched.

To intentionally stretch an image to both dimensions, opt in with `stretch=true`, for example:

```markdown
![Result](assets/result.png){width=50% height=40% stretch=true}
```

`stretch=true` disables the aspect-ratio guarantee for that image; the stretched image is still centered.
