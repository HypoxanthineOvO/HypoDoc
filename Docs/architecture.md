# Architecture

## System Shape

```text
HypoDoc source
    |
    v
parser-core  ------ reference differential ------> HypoDoc-Spec + Pandoc 3.10
    |
    v
render-model (hypodoc.renderer-model/v1)
    |
    +--------------------+
    |                    |
    v                    v
render-web          host diagnostics/navigation
    |                    |
    +----------+---------+
               |
       +-------+-------+
       |               |
       v               v
  VS Code Webview   Desktop / Electron
```

The reference oracle is a development and CI peer, not a runtime parent. The
portable model deliberately does not call itself `hypodoc.ir/v1`.

## Ownership

| Module | Owns | Does not own |
|---|---|---|
| `parser-core` | Block grammar, positions, feature validation, diagnostics | UI, file access, Pandoc IR |
| `render-model` | View projection, answer visibility, resource policy | Host URI schemes, layout |
| `render-web` | Safe HTML presentation, math/diagram/code adapters | Filesystem, network, process APIs |
| `theme` | Semantic surface/text/state tokens | Host-specific raw colors |
| VS Code | Native editor, Webview lifecycle, workspace URIs | Parser semantics |
| Desktop/Electron | Workbench state, native dialogs, packaging | Document-provided privileges |

## Failure Boundaries

- Parser size, complexity, syntax, profile, directive, and structural errors
  produce located diagnostics and mark the document invalid.
- Invalid documents render a recovery panel rather than partial semantic HTML.
- Raw HTML has no execution path. Diagram/highlighter failures are isolated to
  their block and never run source as code.
- Resource adapters deny remote, absolute, and traversal paths before creating
  host URIs.
- Electron IPC rejects unapproved write paths and oversized payloads.
- VS Code Webviews use nonce CSP, no network, and bounded local roots.

## Performance And Distribution

The source editor and base renderer form the initial path. Mermaid and scoped
Shiki language/theme sets are conditional chunks. `pnpm perf` enforces parser,
initial bundle, and heavy optional chunk budgets. Electron builds are configured
for Windows, macOS, and Linux; VS Code produces a self-contained VSIX Webview.

## Non-Goals

- Exact Pandoc AST reproduction inside the product runtime.
- WYSIWYG Markdown rewriting or Milkdown integration in this delivery.
- Remote collaboration, cloud sync, arbitrary HTML, script execution, or
  network-backed diagrams.
- Mobile binaries, slide playback, PDF/TeX fidelity, and stable Spec release.

## Follow-Up Backlog

- Apply restrained glass and stronger surface-color separation to additional
  host chrome while preserving contrast and native VS Code theme behavior.
- Measure Mermaid cold-load and memory cost on packaged Windows/macOS/Linux.
- Add signed release artifacts, icons, update channels, and platform notarization.
- Implement the Mobile WebView host from ADR 0001.
- Implement `SlideDeck`, waterfall view, and optional Reveal.js adapter from
  ADR 0002.
- Evaluate Milkdown only after exact fenced-div round-trip conformance exists.
