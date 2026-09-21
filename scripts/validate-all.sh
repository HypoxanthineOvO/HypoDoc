#!/usr/bin/env bash
# Product checks. Install dependencies first; never mutate the system toolchain.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== TypeScript: types, behavior, public templates, build =="
pnpm typecheck
pnpm test
pnpm build

echo "== Python: configuration, toolchain, resources, slides =="
uv run --group dev --project Renderers/LaTeX python -m pytest -q Renderers/LaTeX/tests/unit

echo "== PDF: actual public templates and content =="
uv run --project Renderers/LaTeX hypolatex doctor
uv run --project Renderers/LaTeX hypolatex doctor --target evidence
uv run --group dev --project Renderers/LaTeX python -m pytest -q Renderers/LaTeX/tests/integration

echo "== README quickstart and installed distribution =="
python3 tools/test-install.py
echo "ALL PRODUCT CHECKS PASSED"
