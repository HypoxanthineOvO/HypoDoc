#!/usr/bin/env bash
# HypoDoc root validation entrypoint.
# Runs every reproducible check across TypeScript, Spec, LaTeX/PDF and packaging.
# Platform builds (Windows/macOS installers), signing and notarization are NOT
# covered here and must not be claimed as validated.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SPEC="$ROOT/Spec"

echo "== TypeScript workspace =="
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm audit --prod --audit-level high
pnpm licenses:report
pnpm perf

echo "== Spec (pinned revision) =="
uv sync --project "$SPEC" --frozen
if [ ! -x "$SPEC/.tools/pandoc/3.10/bin/pandoc" ]; then
  python3 "$SPEC/scripts/provision-pandoc.py" --version 3.10 --dest "$SPEC/.tools/pandoc"
fi
(cd "$SPEC" && HYPODOC_PANDOC="$SPEC/.tools/pandoc/3.10/bin/pandoc" uv run python -m pytest -q)
(cd "$SPEC" && uv run hypodoc registry check)
cd "$ROOT"
pnpm conformance:portable

echo "== LaTeX renderer =="
cd "$ROOT/Renderers/LaTeX"
uv sync --frozen
uv run hypolatex doctor
uv run python -m pytest -q tests
uv run hypolatex build examples/showcase/hypolatex-showcase.md --output build/validate-showcase.pdf
pdfinfo build/validate-showcase.pdf | grep -E "Pages|Page size"
cd "$ROOT"

echo "== VSIX packaging =="
pnpm --filter hypodoc-vscode build
mkdir -p release
pnpm --filter hypodoc-vscode exec vsce package --no-dependencies -o ../../release/hypodoc-vscode.vsix
sha256sum release/hypodoc-vscode.vsix

echo "ALL VALIDATION PASSED"
