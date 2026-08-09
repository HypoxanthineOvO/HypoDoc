---
title: Reproducible Render Review
subtitle: Concise Project Brief
author: HypoDoc Engineering
theme: tech-minimal
document_type: article
answer_mode: student
---

# Project Brief

This project establishes a reproducible review path for comparing HypoDoc browser preview and PDF output without treating engine-specific line wrapping as a defect.

::: {.objective title="Objective"}
Enable reviewers to verify that browser preview and PDF preserve the same semantic content, membership, and ordering while each renderer retains native typography and layout.
:::

::: {.task title="Task"}
Define one canonical fixture, test title/divider/content ordering, compare both render paths, and record visual and performance evidence from the pinned toolchain.
:::

::: {.requirement title="Requirements"}
- Use the pinned rendering toolchain.
- Resolve assets locally; do not fetch remote resources.
- Fail visibly when an asset is missing or corrupt; do not substitute silent placeholders.
- Compare semantic membership before inspecting visual roles.
:::

::: {.deliverable title="Deliverables"}
- Canonical HypoDoc Markdown fixture.
- Reviewer PDF with extractable text.
- Preview/PDF comparison matrix.
- Performance summary with stated gates and measured results.
:::

::: {.checklist title="Review Checklist"}
- Verify that every title, divider, and content unit belongs to the same page or frame in both paths.
- Extract the expected markers from the PDF.
- Classify visual differences by declared role rather than pixel identity.
- Confirm that performance measurements pass the agreed gates under the pinned toolchain.
:::

::: {.rubric title="Acceptance Rubric"}
- **Semantic fidelity:** page or frame membership and source order match.
- **Evidence quality:** the matrix, extracted text, and performance results are reproducible.
- **Failure integrity:** missing or corrupt resources produce explicit failures.
- **Review clarity:** expected native layout differences are separated from semantic regressions.
:::

## Controlled Comparison

::: {.table}
```yaml
type: comparison
density: compact
caption: Cross-renderer review contract
label: tab:render-review-contract
columns:
  - align: left
    width: 0.20
  - align: left
    width: 0.34
  - align: left
    width: 0.36
```

| Review Layer | Must Match | May Differ |
|---|---|---|
| Structure | Frame or page membership; content order | Pagination mechanics |
| Semantics | IDs, roles, titles, and content markers | Font metrics and line breaks |
| Visual roles | Hierarchy, emphasis, and table intent | Exact spacing and glyph rasterization |
| Performance | Declared gates and reproducible method | Renderer-specific timing profile |

:::

## Reviewer Question

::: {.question label="q:semantic-membership" title="Review Question" style="card"}
Why is semantic membership more stable than pixel equality when comparing browser preview and PDF?
:::

::: {.hint title="Hint"}
The browser and TeX use different layout engines.
:::

::: {.answer title="Answer"}
Semantic roles, identifiers, membership, and source order can match even when typography, wrapping, and pagination remain native to each engine.
:::

::: {.solution title="Solution"}
Compare frame or page IDs and content markers first. Then inspect whether each declared visual role is represented consistently, while allowing renderer-specific font metrics, wrapping, and spacing.
:::
