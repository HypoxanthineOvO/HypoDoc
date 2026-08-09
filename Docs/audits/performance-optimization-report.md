# HypoDoc Performance Optimization Report

Date: 2026-08-09

## Change

`createRenderDocument` now treats parsed AST nodes and outlines as immutable. It reuses unchanged nodes and only copies a directive ancestor when answer-mode filtering actually changes its children. Diagnostics and metadata remain renderer-owned copies.

## Before/After

| Metric | M1 baseline | Optimized | Change / gate |
| --- | ---: | ---: | --- |
| 1 MiB parse + render p95 | 15.335 ms | 9.097 ms | -40.7% |
| 1 MiB render projection p95 | 6.271 ms | 0.046 ms | -99.3% |
| 1 MiB SlideDeck p95 | 3.332 ms | 3.417 ms | +2.6%, within noise/budget |
| 1 MiB slide projection p95 | 10.349 ms | 2.984 ms | -71.2% |
| Desktop cold document ready | 2361.638 ms | 2132.155 ms | -9.7% |
| Desktop edit-to-preview median | 179.657 ms | 188.396 ms | +4.9% |
| Desktop edit-to-preview p95 | 456.935 ms | 489.672 ms | +7.2%, below +10% gate |
| Desktop initial JS gzip | 315125 B | 318216 B | +1.0%, below 400000 B |
| Desktop Mermaid JS gzip | 817697 B | 817697 B | unchanged, below 900000 B |
| VS Code webview gzip | 322820 B | 325487 B | +0.8% |
| Representative Beamer PDF | 4.51 s | 4.47-4.48 s | no regression |

The coarse retained-heap measurement is not used as a release gate because it runs without forced GC. Correctness is covered by an identity-sharing regression test plus the full parser/model/renderer suites.

## Evidence

- `reports/rendering-audit-baseline.json`
- `reports/rendering-audit-optimized.json`
- `reports/performance-baseline.json`
- `reports/performance-optimized.json`
- `reports/desktop-performance-baseline.json`
- `reports/desktop-performance-optimized.json`

## M8 Revalidation

The final `pnpm perf` run returned `valid=true`: sample parse average/max 0.228/1.050 ms and approximately 1 MiB average/max 9.588/12.581 ms. Desktop initial and Mermaid bundle checks also passed at 318,216 B and 817,697 B gzip. Workspace typecheck, production build, and all 33 JavaScript/TypeScript tests passed. The pinned LaTeX suite passed 269 tests with 12 environment/private-corpus skips.
