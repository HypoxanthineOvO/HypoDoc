# Longform And Semantic Authoring

Use `profile: book` for books/tutorials and `profile: article` for articles, project or assignment briefs, reviews, and cheatsheets. Let LaTeX number ordinary headings. Use `.manual-number` only for intentionally preserved written numbers and `.unnumbered` for unnumbered headings.

## Semantic Vocabulary

Use blocks for intent rather than visual decoration:

- `objective`: outcome.
- `info`: context or assumptions.
- `task`: action.
- `requirement`: non-negotiable constraint.
- `deliverable`: artifact or handoff.
- `checklist`: completion checks.
- `rubric`: grading or acceptance criteria.

Review content uses `question`, `hint`, `answer`, and `solution`, or nests them in `qa`. Question styles are `outline`, `card`, and canonical non-card `plain`; `text` and `inline` are legacy aliases for `plain`.

`answer_mode` is `student`, `review`, or `teacher`. CLI `--answer-mode` overrides frontmatter; frontmatter overrides the default `student`. Student hides answer/solution content, while review and teacher include it.

## Controlled Tables

Reserve `.table` for layout-sensitive tables. Ordinary Markdown tables outside `.table` remain ordinary Pandoc tables; do not wrap every table.

````markdown
::: {.table}
```yaml
type: comparison
density: compact
caption: Option comparison
label: tab:options
columns:
  - align: left
    width: 0.25
  - align: left
    weight: 2
```

| Option | Evidence |
| --- | --- |
| A | Fast setup |
| B | Strong controls |
:::
````

The block contains optional YAML followed by exactly one Markdown table. Types are `default`, `comparison`, `checklist`, `rubric`, `cheatsheet`, `compact`, and `long`; densities are `compact`, `normal`, and `comfortable`. `type: long` or `long: true` uses the multi-page `longtable` fallback. Row spans and column spans are unsupported.

## Cheatsheets

`hd:make-cheatsheet` is an AI-facing Skill workflow, not a CLI subcommand of `hypolatex`. It does not add `distill` or a deterministic extraction CLI surface. Read source material but do not modify it; write a new cheatsheet Markdown file and treat target pages as a hard constraint.

Output choices are `formulas`, `keypoints`, and `examples`. Compression priority is formulas > keypoints > examples. If the result cannot fit, stop with a conflict report rather than silently exceeding the target. The conflict report names target pages, actual pages, omitted candidates, blocking `keep`/high-priority cells, and a suggested user action.

A document with `profile: article` and no cheatsheet layout falls back to the standard article layout.

## Public And Private Material

Public validation uses synthetic templates and committed fixtures. Private corpus work uses ignored paths such as `tests/private/corpus` or `HYPOLATEX_TEST_CORPUS`, a local manifest/preparation workflow, and a small smoke pytest run. Keep private source material and real generated artifacts local and uncommitted; do not commit private corpus artifacts or results.
