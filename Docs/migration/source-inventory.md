# HypoDoc Migration Source Inventory

Captured: 2026-08-06 (Asia/Shanghai)

## Purpose

This inventory freezes the observable source state before product integration. It is evidence for
recovery and comparison, not a declaration that any source repository is complete or authoritative.
The accepted integration policy is documented in `import-design.md` and in the project Memory.

## Repository Baselines

| Workspace | Branch and commit | Upstream / tag | Working state at capture | License evidence |
| --- | --- | --- | --- | --- |
| `HypoDoc` | `main` at `1a35eb6dec2da1230284b8cf1f65a8d9c4a4932f` | No remote; no tag | Clean immediately after the initial migration-workspace anchor | No root license yet |
| `Hypo-Markdown` | `main` at `e4e7148494bed527e050867616d643353a6641d8` | No remote; no tag | Superproject clean except for dirty content inside `spec/hypodoc` | No first-party license file; third-party report has no unresolved entries |
| `Hypo-LaTeX` | `main` at `b1ef2c7335e969f332aafb38c766ff9cbb46b182` | `origin/main` at `0c8d80eced5b9ff397d5644f531051c9247033d8`; ahead 6; tag `v0.4.0` | `uv.lock` has one version-line change | MIT |
| `HypoDoc-Spec` | `main` at `1866c357fdcfef88f6435860e092f7897f47fbb9` | Equal to `origin/main`; tag `v0.2.0-rc.1` | Clean | MIT |

Canonical remotes currently exist only for the two Python repositories:

- Hypo-LaTeX: `git@github.com:HypoxanthineOvO/hypodoc-latex.git`
- HypoDoc-Spec: `git@github.com:HypoxanthineOvO/hypodoc-spec.git`

The new product repository and Hypo-Markdown have no configured remote. No push or remote mutation
was performed during M1.

## Source Shape

| Workspace | Tracked files | Main implementation surface |
| --- | ---: | --- |
| `HypoDoc` | 26 at initial anchor | Migration scaffold and Workflow records |
| `Hypo-Markdown` | 94 | Four portable packages, Desktop app, VS Code extension, CI, research and reports |
| `Hypo-LaTeX` | 141 | Python CLI, Pandoc conversion, LaTeX package, themes, tests, docs and Skill |
| `HypoDoc-Spec` | 208 | Python reference validator, registry, schemas, fixtures, contracts and tests |

Generated or local-only trees such as `node_modules`, `.venv`, build output, release output and
`.pipeline/runtime` are not migration sources. The Hypo-Markdown initial anchor adds explicit ignore
rules for local Workflow runtime and Discussion state.

## Spec Divergence

There are three relevant Spec states:

1. The independent Spec workspace and Hypo-Markdown gitlink both start at
   `1866c357fdcfef88f6435860e092f7897f47fbb9` (`v0.2.0-rc.1`).
2. Hypo-Markdown's embedded checkout has four modified documents: `README.md`,
   `spec/ai-authoring.md`, `spec/migration.md` and `spec/renderer-consumer-contract.md`.
   The changes distinguish the pinned Python/Pandoc reference oracle from conforming independent
   runtimes. They are preserved in `recovery/hypo-markdown-embedded-spec.patch`.
3. Hypo-LaTeX points its Spec gitlink to `747bda01a9c747bf82b721d4ad8fd00ecf8be959`, one commit after
   the release tag. That commit only adds renderer-repository links to the Spec README.

These states must be reconciled in the independent Spec repository through reviewed content changes.
No nested renderer copy will become an accidental second semantic authority.

## Dirty-State Recovery

| Source | Local safety ref | Portable recovery artifact |
| --- | --- | --- |
| Hypo-Markdown embedded Spec | `refs/hypodoc-migration/safety/embedded-spec-dirty-20260806` at `d307ac0ea8fa310e29cae41c8591293ab18228b9` | `recovery/hypo-markdown-embedded-spec.patch` |
| Hypo-LaTeX `uv.lock` | `refs/hypodoc-migration/safety/uv-lock-dirty-20260806` at `a8661e7904d48aba31e33433b9a5d22e5070ebec` | `recovery/hypolatex-uv-lock.patch` |

Patch SHA-256 values are:

- embedded Spec: `4cc6c52504e3149ef3fe52ca139d8fba13e75b353ecd9a5100bdf026157c35ae`
- Hypo-LaTeX lock: `ed3a4ac325cfa2c635e6b3ae9d14d0a0b30ee99744bf34cfa637292465376997`

The safety refs were created with `git stash create` plus `git update-ref`; creating them did not
change either working tree. To recover on another clone, checkout the recorded base commit and run:

```sh
git apply --check /path/to/HypoDoc/Docs/migration/recovery/<patch>
git apply /path/to/HypoDoc/Docs/migration/recovery/<patch>
```

To inspect the local ref without applying it, compare the relevant base commit to the ref with
`git diff <base> <ref>`.

## Baseline Validation

| Source | Validated command or observation | Result |
| --- | --- | --- |
| Hypo-Markdown | `pnpm test` | Passed: 27 tests across parser, model, Web, Desktop and VS Code |
| Hypo-Markdown | `pnpm typecheck` | Passed for all declared TypeScript workspaces |
| Hypo-Markdown | `pnpm build` | Passed; Vite/esbuild reported large-chunk warnings but no build failure |
| Hypo-Markdown | `pnpm conformance:portable` | Passed: 13 cases, 0 failures |
| Hypo-Markdown | `pnpm perf` | Passed all parser and bundle budget checks |
| HypoDoc-Spec | `HYPODOC_PANDOC=.tools/pandoc/3.10/bin/pandoc uv run python -m pytest -q` | Passed: 268 tests |
| HypoDoc-Spec | `uv run hypodoc registry check` | Valid; all four contract documents current |
| Hypo-LaTeX | `uv run hypolatex doctor` | All required executables, TeX packages, fonts and PDF evidence tools available |
| Hypo-LaTeX | `uv run python -m pytest -q tests` | Passed: 255 tests, 10 skipped |

The host `pandoc` is `3.1.3`; Spec conformance requires the repository-provisioned exact `3.10`
binary. Both Python repositories also contain `.venv/bin/pytest` launchers with stale absolute
shebangs from their former locations. The reproducible command is `uv run python -m pytest`, not a
direct invocation of the copied virtualenv launcher. Local virtual environments are disposable.

Tool versions observed for the baseline were Node `22.22.3`, pnpm `10.5.0`, uv `0.10.9`, Python
`3.12.3`, Git `2.43.0`, XeTeX from TeX Live 2023 and latexmk `4.83`.

## License Position

Hypo-LaTeX and HypoDoc-Spec contain matching MIT licenses. Hypo-Markdown has no first-party license
file even though its generated production dependency report contains no unresolved license metadata
(`238` MIT packages plus compatible or separately attributable licenses). The integrated repository
must not claim a settled first-party license until S1 accepts an explicit root license decision.

## Baseline Risks

- Hypo-Markdown had no commit or remote before M1; its new commit is a local provenance anchor only.
- The product root has no remote, so both new anchors must remain local until remote governance is
  accepted later.
- Spec content is divergent across one clean release, one post-release README commit and one dirty
  contract edit set. Blindly selecting any one tree would discard relevant intent.
- Hypo-LaTeX is six commits ahead of its remote and its lock file lags the project version.
- Current build success is Linux-local evidence. It is not Windows/macOS, signing, notarization or
  public installer evidence.
- Large Web/VS Code bundles build successfully but deserve deliberate code-splitting review during
  product consolidation rather than automatic preservation.

## M1 Conclusion

All source content needed for S1 is recoverable from recorded commits plus portable patches. The
baseline is strong enough to design the import, but not strong enough to treat source structure,
versioning, contracts, branding or release claims as final product truth.

## Post-Release Cleanup (2026-08-06)

After `v0.1.0` release and user authorization, the local workspaces
`Hypo-Markdown` and `Hypo-LaTeX` were removed. All recovery evidence remains
in this repository: source SHAs (above), `recovery/hypo-markdown-embedded-spec.patch`
and `recovery/hypolatex-uv-lock.patch` (SHA-256 verified), and the release
manifest. `HypoDoc-Spec` remains as the independent semantic authority.
Deletion of the GitHub `hypodoc-latex` remote is pending a token with the
`delete_repo` scope.
