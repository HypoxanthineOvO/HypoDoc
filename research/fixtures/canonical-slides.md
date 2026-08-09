---
title: HypoDoc Slide Surface
subtitle: Canonical cross-renderer fixture
profile: beamer
theme: plain
section_dividers: true
subsection_dividers: true
frame_title_inheritance_limit: 3
---

# Rendering Contract

## Shared Structure

### One Source, Ordered Frames

::: {.objective title="Frame Goal"}
Keep source order, semantic blocks, and frame identity stable across preview and PDF.
:::

- H1 and H2 provide presentation context.
- H3 begins a titled frame.
- A thematic break creates a continuation frame.

---

The continuation keeps the same title and receives its own stable frame ID.

### Math And Code

Inline math remains readable: $E = mc^2$.

```typescript
const surface = "hypodoc.slide-deck/v1";
```

## Evidence

### Comparison Table

::: {.table #surface-map kind="comparison" caption="Cross-renderer surface map"}
| Surface | Expected evidence |
|---|---|
| Waterfall | Ordered frame IDs |
| Presentation | Keyboard navigation |
| PDF | Matching semantic content |
:::

### Completion

::: {.summary title="Review Signal"}
The deck is ready when every renderer preserves the same content membership.
:::
