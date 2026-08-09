# HypoDoc Preview/PDF Visual Consistency Matrix

Date: 2026-08-09

## Canonical Evidence

- Source: `research/fixtures/canonical-slides.md`
- Original Web/Desktop comparison: `reports/visual-baseline/m5-{waterfall,presentation}-{desktop,mobile}.png`
- Revised fixed-canvas evidence: `reports/visual-baseline/m3r1-*.png`
- Revised brand/workflow evidence: `reports/visual-baseline/m5r2-*.png`
- PDF: `reports/visual-baseline/m5-canonical-slides.pdf`
- PDF pages: `reports/visual-baseline/m5-canonical-pdf/page-{1..9}.png`
- Viewports: 1440x900 desktop, 375x812 portrait, and 812x375 landscape
- PDF geometry: 453.54x255.12 pt (16:9), 9 pages

## Frame/Page Membership

| Index | Canonical source role | Web/Desktop | LaTeX PDF |
| --- | --- | --- | --- |
| 1 | Metadata title and subtitle | Title frame | Title page |
| 2 | H1 `Rendering Contract` | Part divider | Section divider |
| 3 | H2 `Shared Structure` | Section divider | Subsection divider |
| 4 | H3 frame with objective and list | Content frame | Content frame |
| 5 | Thematic-break continuation | Continued content frame | Continued content frame |
| 6 | Math and code | Content frame | Content frame |
| 7 | H2 `Evidence` | Section divider | Subsection divider |
| 8 | Comparison table | Content frame | Content frame |
| 9 | Success callout | Content frame | Content frame |

## Visual Roles

| Role | Shared contract | Renderer-native expression |
| --- | --- | --- |
| Title | Dominant title, supporting subtitle, no content footer | Web uses workbench UI font; PDF uses Beamer theme title typography |
| Context divider | H1 and opt-in H2 receive dedicated surfaces | Web uses left accent rail; PDF uses numbered section/subsection pages |
| Frame header | Title above body with a clear separation rule | Both preserve part/section breadcrumb and source order |
| Body | Readable serif content with stable margins | Geometry and line wrapping remain renderer-native |
| Callout | Accent identity, label, and contained body | Default palette is red in both; semantic variants keep their role colors |
| Table | Strong header/body distinction and aligned columns | Web uses bordered cells; PDF uses Beamer table rules and header fill |
| Math/code | Math typesetting and monospace code remain distinct | KaTeX/browser and TeX use their native engines |
| Footer | Deck title/context and page count on content frames only | Presentation controls remain host UI and are not exported |

## Fixed Canvas Revision

Every Web slide now has a `960x540` logical canvas. Responsive behavior measures the host viewport and
applies one transform to the complete canvas; typography, spacing, frame padding, and content coordinates
do not reflow at mobile breakpoints. Waterfall and presentation Fit mode contain the full 16:9 frame.
Readable Zoom enlarges that same canvas and exposes controlled two-axis panning instead of changing its
internal layout.

The Playwright regression asserts the logical width/height, 16:9 rendered ratio, unchanged slide font size,
Fit containment, Zoom enlargement, keyboard navigation, dark mode, and portrait/landscape behavior. The
seven `m3r1-*` screenshots cover desktop waterfall, desktop presentation light/dark, mobile waterfall,
mobile presentation Fit/Zoom, and mobile landscape presentation.

The Desktop shell was also revised from stacked chrome and panel-heavy framing to a Typora-inspired,
content-first editor hierarchy: one quiet global toolbar, a light outline/filmstrip rail, unframed mode tabs,
and compact presentation controls. This is an interaction and hierarchy reference, not Typora brand parity.

## Brand and File Workflow Revision

The Desktop toolbar now uses an image-generated HypoDoc mark, a compact icon-only Save command, an Open
menu that distinguishes file and folder selection, and a document-actions menu for Import Markdown,
Export Markdown, Print/PDF, and Settings. Settings controls light/dark appearance and local draft autosave.
At 375px the document identity collapses while the brand mark, Open, Save, overflow, and view modes remain
available without overlap.

The `m5r2-*` evidence includes desktop light/dark presentation, desktop/mobile waterfall, mobile Fit/Zoom
and landscape, plus explicit Open menu, document-actions menu, and Settings screenshots. Playwright verifies
the generated PNG loads, menu labels are reachable, Markdown export downloads, Print/PDF invokes the system
print path, Import opens a file chooser, Settings persist autosave, and all prior slide geometry checks remain
unchanged.

The final editor-default revision removes the CodeMirror line-number gutter from fresh profiles. The
preference remains available as an opt-in Settings checkbox and persists in `hypodoc.lineNumbers`.
`m5r3-editor-default.png` shows the split editor without a gutter; Playwright verifies default-off,
on-state gutter creation, persistence, and return to off.

## Review Result

The canonical source projects to 9 ordered Web frames and 9 ordered PDF pages with identical content membership. Revised desktop and mobile screenshots show stable 16:9 geometry, no internal responsive reflow, no incoherent control overlap, and intentional panning only in Readable Zoom. The toolbar commands remain discoverable at desktop and mobile widths, and the dark brand treatment remains legible. Pixel identity is intentionally not required: browser workbench controls and native TeX typography remain renderer-owned.

The public `Skills/LaTeX/templates/beamer.md` was also migrated to canonical `profile: beamer` and a stable-ID controlled table using portable `kind`/`caption` attributes. A final portable parse reported `valid=true` with zero diagnostics, and its strict Hypo-LaTeX PDF build test passed.
