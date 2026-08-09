# Slides And Beamer

Use `profile: beamer`; `document_type: beamer`, `slides`, and `presentation` are legacy read aliases, not canonical output.

## Structure

- H1 (`#`) is a section and may create a section divider.
- H2 (`##`) is a subsection and may create a subsection divider.
- H3 (`###`) is a frame title.
- A thematic break (`---`) starts a new frame and may inherit the preceding H3 title.
- `strict_structure: true` rejects H2 without H1 and content without a frame title.

Use this canonical frontmatter:

```yaml
---
title: Function Matrix
profile: beamer
theme: minimal
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

`palette` is `red`, `blue`, `yellow`, `gray`, or `mono`. `aspectratio` is `43`, `54`, `149`, `1610`, `169`, or `32`. `footline` is `full`, `page`, or `none`. `continued_title_style` is `subtle`, `suffix`, or `none`.

Keep `frame_title_inheritance_limit` small. Continuations work for one short overflow frame; a new idea needs a new H3 title. Density/overfull lint is heuristic, so inspect every exported page.

## Slide Content

Supported semantic blocks include `objective`, `info`, `task`, `requirement`, `deliverable`, `checklist`, `rubric`, `question`, `hint`, `answer`, and `solution`. Controlled `.table` blocks work on slides. Prefer one claim or comparison per frame, short lists, and assets that remain legible at presentation distance.

Local asset paths must stay workspace-relative. Images preserve aspect ratio even when width and height are supplied. Add `stretch=true` only when deliberate distortion/fill is required. Standalone captionless images are centered and height-capped; side-by-side figures need explicit widths whose sum remains below 100%.

## Preview And Export

Use Desktop/VS Code waterfall view to check order and presentation view for keyboard/fullscreen behavior. Validate that title, H1/H2 dividers, H3 frames, continuation frames, callouts, tables, math, code, and footer roles appear in the same order in PDF. Browser wrapping and TeX typography may differ; semantic membership may not.
