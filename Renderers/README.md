# Renderers

Output backends that are not end-user host applications.

| Renderer | Responsibility |
| --- | --- |
| `LaTeX` | `hypolatex` CLI, Pandoc Lua filter, LaTeX package, themes, templates, tests, and PDF evidence tooling |

The Web/HTML renderer lives in `Packages/render-web` and is shared by the
Desktop app and VS Code extension. All renderers consume the pinned root
`Spec/` revision; none may silently redefine shared syntax or treat a private
AST as new semantic authority.

Imported from the Hypo-LaTeX source anchor `b1ef2c7` as curated product content.
