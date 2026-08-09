---
title: Reproducible Render Review
subtitle: Concise Project Brief
author: HypoDoc Engineering
date: 2026-08-09
profile: article
theme: tech-minimal
answer_mode: student
---

# Project Brief

::: {.objective title="Objective"}
Enable reviewers to compare browser preview and PDF export without losing semantic content, while allowing each rendering engine to retain native typography and line wrapping.
:::

::: {.task title="Task"}
Define one canonical fixture, verify title/divider/content ordering, compare semantic membership across browser and PDF projections, and record visual and performance evidence.
:::

::: {.requirement title="Requirements"}
- Use the pinned rendering toolchain.
- Resolve resources locally; do not use remote or parent-traversal paths.
- Treat missing or corrupt resources as failures rather than silent placeholders.
- Compare declared semantic roles and order before assessing visual differences.
:::

::: {.deliverable title="Deliverables"}
Provide the canonical Markdown fixture, reviewer PDF, visual comparison matrix, and performance summary with reproducible commands and pass/fail results.
:::

::: {.checklist title="Review Checklist"}
- Page/frame membership matches across projections.
- Title, divider, and content ordering is preserved.
- Representative PDF text is extractable.
- Visual evidence covers the declared roles without clipping or blank pages.
- Performance gates pass under the pinned toolchain.
:::

::: {.rubric title="Acceptance Rubric"}
- **Semantic fidelity:** every expected content marker belongs to the same page or frame role.
- **Evidence quality:** commands, outputs, and visual checks are specific enough to reproduce.
- **Export integrity:** PDF text is extractable and no resource failure is concealed.
- **Performance:** measured results satisfy the documented gates.
:::

## Controlled Comparison

::: {.table}
```yaml
type: comparison
density: compact
caption: Render-review comparison contract
label: tab:render-review-contract
columns:
  - align: left
    width: 0.20
  - align: left
    width: 0.35
  - align: left
    width: 0.35
```

| Review layer | Stable contract | Allowed variance |
| --- | --- | --- |
| Structure | Frame/page membership, semantic roles, content order | Pagination mechanics |
| Content | Titles, markers, table values, review answers | Line breaks and hyphenation |
| Visual | Declared hierarchy and emphasis | Native browser/TeX font metrics |
| Performance | Named fixtures, gates, and commands | Machine-specific elapsed time |

:::

## Reviewer Prompt

::: {.question title="Question" style="plain"}
Why is semantic membership more stable than pixel equality when comparing browser preview and PDF export?
:::

::: {.hint title="Hint"}
The browser and TeX use different layout engines.
:::

::: {.answer title="Answer"}
Semantic roles, content membership, and order can match even when typography, line wrapping, and pagination remain native to each engine.
:::

::: {.solution title="Solution"}
Compare frame or page identifiers and representative content markers first. Then inspect the declared visual roles, such as hierarchy and emphasis, instead of requiring pixel-identical output.
:::

:::summary
The review succeeds when source semantics remain stable, export evidence is reproducible, and engine-native visual differences stay within the declared contract.
:::
