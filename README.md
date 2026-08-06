# HypoDoc

HypoDoc is the product workspace for authoring, previewing, and rendering
HypoDoc documents across editor, desktop, web, and LaTeX/PDF surfaces.

This repository is currently a migration scaffold. Product source still lives
in the existing `Hypo-Markdown`, `Hypo-LaTeX`, and `HypoDoc-Spec` workspaces.
Nothing has been copied or moved yet.

## Intended Layout

| Path | Responsibility |
| --- | --- |
| `Spec/` | Pinned HypoDoc language specification and compatibility fixtures |
| `Skills/` | Renderer-neutral authoring guidance and renderer-specific agent skills |
| `Packages/` | Shared parser, render model, theme, and reusable runtime packages |
| `Renderers/` | Output backends, including Web and LaTeX/PDF |
| `Apps/` | User applications, beginning with HypoDoc Desktop |
| `Extensions/` | Editor integrations, beginning with HypoDoc for VS Code |
| `Docs/` | Product architecture, contributor documentation, and release guidance |

See [MIGRATION.md](MIGRATION.md) for the staged migration design and safety
gates.

## Repository Boundary

The product implementation belongs here. The HypoDoc specification remains an
independently versioned semantic authority and is consumed through `Spec/` at a
pinned compatible revision.
