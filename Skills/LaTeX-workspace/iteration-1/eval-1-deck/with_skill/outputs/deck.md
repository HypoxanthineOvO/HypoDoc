---
title: Reliable Render Pipelines
subtitle: Deterministic stages, explicit contracts, verifiable evidence
author: HypoDoc Engineering
date: 2026-08-09
profile: beamer
theme: minimal
palette: blue
aspectratio: "169"
footline: full
section_dividers: true
subsection_dividers: true
frame_title_inheritance_limit: 1
continued_title_style: subtle
strict_structure: true
---

# Pipeline Contract

## Verification Loop

### Define Reliability Before Rendering

::: {.objective title="Pipeline Objective"}
Given identical source and a pinned toolchain, produce the same semantic frame
order and a PDF that passes explicit structural and content checks.
:::

- Parse once into a typed intermediate representation.
- Keep preview and export as projections of that shared representation.
- Fail at configuration, resource, or toolchain boundaries with actionable diagnostics.

### Compare Failure Policies

::: {.table}
```yaml
type: comparison
density: compact
caption: Reliability choices at renderer boundaries
label: tab:failure-policies
columns:
  - align: left
    width: 0.22
  - align: left
    width: 0.30
  - align: left
    width: 0.30
```

| Boundary | Fragile behavior | Reliable behavior |
|---|---|---|
| Configuration | Guess a fallback | Validate profile and theme |
| Resources | Hide missing files | Reject or explicitly allow placeholders |
| Toolchain | Accept any version | Pin and verify exact versions |
| Evidence | Trust exit code zero | Check pages, text, and geometry |

:::

### Measure And Reproduce

Reliability can be tracked as the successful-check ratio $R = p / n$, where
$p$ checks pass out of $n$ required checks; release requires $R = 1$.

- Record page count and page geometry with `pdfinfo`.
- Extract representative frame text with `pdftotext`.
- Rebuild under the same pinned environment and compare artifacts.

```bash
hypolatex build deck.md --output deck.pdf
```
