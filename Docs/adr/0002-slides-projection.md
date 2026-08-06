# ADR 0002: Slides Share A Renderer-Owned SlideDeck Projection

Status: accepted for future implementation
Date: 2026-08-05

## Context

HypoDoc sources may declare `profile: beamer`. Existing documents use H1/H2/H3
hierarchy and thematic-break (`---`) frame boundaries. Future products need a
continuous waterfall reading view and a presentation view without changing the
source contract or treating Reveal.js as semantic authority.

## Decision

Add a renderer-owned `SlideDeck` projection derived from
`hypodoc.render-document/v1`:

- H1 defines deck/part context.
- H2 defines section context.
- H3 begins a titled frame.
- A thematic break begins the next frame in the current hierarchy.
- Source order, semantic directive IDs, code payloads, and workspace-relative
  resources are preserved in every frame.

The waterfall view renders `SlideDeck.frames` with the shared renderer. A
future presentation adapter may map the same frames to Reveal.js for playback.
Reveal.js state, transitions, speaker controls, and layout never enter parser
semantics or the source document.

## Failure Boundary

Projection is enabled only for `profile: beamer`. Content before any frame is
retained as deck preamble. Unsupported hierarchy produces located projection
diagnostics and falls back to the normal document view; it never silently drops
blocks. Unsafe resources retain the shared fail-closed policy.

## Verification Plan

- Fixtures cover H1/H2/H3 nesting, consecutive `---` boundaries, directives,
  Mermaid, code opacity, local resources, and preamble content.
- Waterfall and presentation adapters must produce the same ordered frame IDs
  and semantic node membership.
- Visual regression covers wide presentation, narrow waterfall, and print.
