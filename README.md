# HypoDoc

HypoDoc is a product workspace for authoring, previewing, and rendering
HypoDoc documents across desktop, web, and LaTeX/PDF surfaces. Authors keep
structured Markdown sources; renderers produce reviewable TeX, PDFs, and live
previews from a shared semantic model.

## Layout

| Path | Responsibility |
| --- | --- |
| `Spec/` | Pinned HypoDoc language specification (independent repo, pinned revision) |
| `Packages/` | Portable TypeScript parser, render model, Web renderer, and theme tokens |
| `Renderers/` | Output backends, beginning with LaTeX/PDF (`hypolatex`) |
| `Apps/` | End-user hosts, beginning with HypoDoc Desktop |
| `Extensions/` | Editor integrations, beginning with HypoDoc for VS Code |
| `Skills/` | Renderer-neutral authoring skill and LaTeX-specific build skill |
| `Docs/` | Architecture, security, migration, and release records |

## Validation

Run the full reproducible check with:

```sh
./scripts/validate-all.sh
```

This covers TypeScript typecheck/tests/build, npm audit, third-party license
report, parser performance budgets, Spec pytest and registry check, portable
conformance differential, LaTeX doctor/pytest, a representative PDF build with
PDF evidence, and VSIX packaging.

Platform installers for Windows and macOS, code signing, and notarization are
not yet validated; see `Docs/release/manifest.json` for the honest validation
matrix.

## Repository Boundary

The product implementation belongs here. The HypoDoc specification remains an
independently versioned semantic authority, consumed through `Spec/` at a
pinned compatible revision. Renderers must not silently redefine shared syntax
or treat a private AST as new semantic authority.

## License

HypoDoc first-party code is licensed under the [MIT License](LICENSE).
Third-party components retain their own licenses and attribution requirements;
see `reports/third-party-licenses.md`.
