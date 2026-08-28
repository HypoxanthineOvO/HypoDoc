export const SAMPLE_DOCUMENT = `---
title: Portable renderer workbench
subtitle: HypoDoc 0.2.0 live document
profile: article
answer_mode: review
---

# A focused writing surface

Write ordinary Markdown and registered HypoDoc directives in the same source.
The preview is produced locally by the portable TypeScript runtime.

::: {.objective title="Milestone objective"}
Keep source fidelity while sharing one renderer across Desktop and VS Code.
:::

## Portable Markdown

- [x] YAML frontmatter
- [x] Task lists and tables
- [x] Inline math $E = mc^2$
- [ ] Finish the next document section

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

| Surface | Runtime |
|---|---|
| Parser | TypeScript |
| Preview | Shared React renderer |

\`\`\`mermaid
flowchart LR
  Source --> Parser
  Parser --> Model
  Model --> Preview
\`\`\`

\`\`\`typescript
const marker = "::: {.warning}";
\`\`\`

::: {.warning title="Fail-closed preview"}
Unknown directives, active HTML, and unsafe resource paths pause rendering and
show a located diagnostic instead of guessing.
:::

## Assessment

::::: {.qa #portable-runtime kind="single-choice" title="Runtime boundary"}
::: {.question}
Which component ships in the product?
:::

:::: {.choices}
::: {.choice #portable}
The portable TypeScript implementation.
:::
::::

::: {.answer choices="portable"}
The Python/Pandoc reference remains a development and CI oracle.
:::
:::::
`;
