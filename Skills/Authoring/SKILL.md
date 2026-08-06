---
name: hypodoc-authoring
description: Use this skill for renderer-neutral HypoDoc Markdown authoring — semantic blocks, review questions, answer visibility, and controlled tables — when writing documents that should render consistently across Web, Desktop, and LaTeX/PDF surfaces.
---

# HypoDoc Authoring Workflow

HypoDoc Markdown is the source format for all HypoDoc renderers. Authoring
rules here are renderer-neutral: Web preview, Desktop, and LaTeX/PDF must
agree on semantics. The normative authority is the pinned root `Spec/`
submodule; the detailed renderer-side guide lives at
`Renderers/LaTeX/docs/c3-authoring.md`.

## Semantic Blocks

Name the purpose of a section without forcing a fixed course schema. Common
vocabulary: `objective`, `info`, `task`, `requirement`, `deliverable`,
`checklist`, `rubric`. All blocks support `title="..."`; use explicit Chinese
titles in Chinese documents.

```markdown
::: {.objective title="目标"}
Produce a short PDF brief that can be reviewed from both Markdown and generated TeX.
:::
```

Do not fake module styling with Markdown separators; renderers map semantic
blocks to their own themed boxes.

## Review Questions

The vocabulary is `question`, `hint`, `answer`, and `solution`.

- `question`: prompt the reader or reviewer.
- `hint`: visible guidance that does not reveal the full response.
- `answer`: the concise expected answer.
- `solution`: a fuller explanation, rubric, or worked reasoning.

Use `qa` to keep all four parts in one outer card:

```markdown
::: {.qa title="复习题：导数与幂函数"}
::: {.question title="题目" numbered="false"}
求函数 $f(x)=x^3$ 的导数。
:::

:::hint
先确认幂函数求导规则。
:::

:::answer
$f'(x)=3x^2$。
:::

:::solution
根据幂函数求导规则，$\frac{d}{dx}x^n=nx^{n-1}$。
:::
:::
```

Canonical question styles: `outline` (default light framed prompt), `plain`
(true text flow), `card` (strong review card). `text` and `inline` are
accepted aliases for `plain`; prefer `plain` in new sources.

## Answer Visibility

`answer_mode` controls answer visibility: `student` (default, hides
`answer`/`solution`), `review`, and `teacher` (shows them for reviewer or
instructor builds). CLI overrides frontmatter; the default is `student`.

```yaml
---
title: Review Packet
answer_mode: student
---
```

## Controlled Tables

Use the HypoDoc table DSL (fenced table with YAML column configuration) for
predictable, renderer-stable tables. Configure column types and alignment in
the YAML block; do not rely on renderer-specific table markup.

## Figures

Prefer explicit, fixed figure placement for longform output:

```markdown
::: {.figure label="fig:example" src="assets/example.png" caption="Example figure" width="0.92" placement="H"}
:::
```

`width` is a fraction of the line width; `placement="H"` pins the figure at
its source location. Keep assets under `assets/` at the project root.

## Validation Boundary

Renderer output (PDF fidelity, HTML preview, TeX correctness) is renderer
evidence, not Spec authority. Passing a renderer's private AST or preview does
not by itself establish reference conformance; compare against the versioned
Spec fixtures and reference outputs. See `Spec/spec/ai-authoring.md` and
`Spec/spec/renderer-consumer-contract.md`.
