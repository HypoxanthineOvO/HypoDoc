# Skill Benchmark: hypolatex

**Model**: GPT-5 Codex
**Date**: 2026-08-09T05:43:07Z
**Evals**: 1, 2, 3 (1 run each per configuration)

## Summary

| Metric | With Skill | Without Skill | Delta |
|--------|------------|---------------|-------|
| Pass Rate | 100% ± 0% | 89% ± 10% | +0.11 |
| Executor timing/tokens | unavailable | unavailable | n/a |

The collaboration runner did not expose per-agent duration or token counters, so the benchmark does not infer them from artifact byte counts.

The new skill passed 18/18 assertions. The old snapshot passed 16/18 and emitted legacy `document_type` fields in both new-authoring tasks.
