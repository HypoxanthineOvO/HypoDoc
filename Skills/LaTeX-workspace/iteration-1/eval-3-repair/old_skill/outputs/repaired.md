---
title: Broken Rendering Review
profile: beamer
theme: minimal
palette: blue
section_dividers: true
subsection_dividers: true
---

# Rendering Review

## Unsafe Inputs

### Repair Contract

::: {.objective title="Goal"}
Make the deck deterministic and safe to export.
:::

::: {.requirement title="Missing Diagram TODO"}
TODO: Add the renderer architecture diagram after an approved asset is available
inside this document workspace. Reference it with a repository-relative path;
do not use an absolute, external, or private path.
:::

- The original `document_type` field was a legacy profile alias.
- The original longform theme was incompatible with the Beamer profile.
- The original figure targeted a missing file outside the document workspace.
