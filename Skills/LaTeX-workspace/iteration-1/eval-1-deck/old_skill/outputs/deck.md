---
title: Reliable Render Pipelines
subtitle: Deterministic stages, explicit contracts, auditable evidence
author: HypoDoc Engineering
date: 2026-08-09
theme: minimal
document_type: beamer
palette: blue
aspectratio: "169"
footline: full
section_dividers: true
subsection_dividers: true
frame_title_inheritance_limit: 1
continued_title_style: subtle
strict_structure: true
---

# Pipeline Reliability

## From Source To Evidence

### Define The Contract

::: {.objective title="Reliability Objective"}
Make every stage deterministic, observable, and independently verifiable so the
same accepted source yields the same reviewable artifact.
:::

- Parse into a canonical model before any renderer-specific transformation.
- Validate inputs and capabilities at stage boundaries.
- Preserve diagnostics as evidence, not as console-only side effects.

### Compare Pipeline Designs

::: {.table}
```yaml
type: comparison
density: compact
caption: Reliability properties by pipeline design
label: tab:pipeline-comparison
columns:
  - align: left
    width: 0.24
  - align: left
    width: 0.31
  - align: left
    width: 0.31
```

| Design | Failure behavior | Verification |
|---|---|---|
| Ad hoc chain | Late, implicit | Manual inspection |
| Shared model | Early, structured | Contract tests |
| Pinned toolchain | Reproducible | Hash and PDF evidence |

:::

For stage success probabilities $p_i$, end-to-end reliability is
$R=\prod_{i=1}^{n}p_i$; weak boundaries compound quickly.

### Build And Prove

Run the pinned renderer from a clean source, then validate the artifact rather
than trusting the build exit code alone.

```bash
hypolatex build deck.md --output deck.pdf
```

- Confirm the expected page geometry and exact page count.
- Extract text and check title, divider, frame, table, math, and command markers.
- Reject placeholder assets and unreported fallbacks.
