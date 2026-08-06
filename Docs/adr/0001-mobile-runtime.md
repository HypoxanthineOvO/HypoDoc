# ADR 0001: Mobile Uses The Portable Core In A Local WebView

Status: accepted for future implementation
Date: 2026-08-05

## Context

Mobile is future work. It must edit local/offline HypoDoc files and switch to a
rendered view without requiring Python, Pandoc, Electron, a network service, or
the Desktop navigation model.

## Decision

The mobile application will embed `parser-core`, `render-model`, `render-web`,
and shared semantic theme tokens in an ordinary local WebView. It may use a
separate native shell and mobile-specific navigation. The bridge may expose
only document open/save, workspace-scoped resources, and lifecycle events.

The mobile renderer consumes `hypodoc.render-document/v1`. It never calls the
reference Python distribution or Pandoc. Differential conformance remains a CI
activity performed outside the shipped app.

## Constraints

- All assets and parser/runtime code are bundled for offline use.
- Local resource resolution uses a platform URI adapter after the same
  traversal/scheme checks as Desktop and VS Code.
- Editor and render modes are separate on phones; split mode is optional on
  tablets where stable width allows it.
- Touch targets are at least 44 CSS pixels, safe areas are respected, and text
  scaling cannot hide primary actions.
- Heavy Mermaid and Shiki modules remain conditional imports. The shell must
  survive memory pressure by falling back to source/plain-code rendering.
- No mobile-only syntax or semantic fields enter the shared parser model.

## Consequences

Core correctness and most renderer tests are reusable. Native file APIs,
background persistence, accessibility, and WebView memory behavior require a
separate host test suite. Electron APIs are forbidden in shared packages.
