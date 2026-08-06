# HypoDoc Business Integration And Import Design

Status: proposed for Stone S1 review

## Decision Summary

Treat the three source repositories as versioned evidence and implementation material, not as
immutable truth. Preserve their Git provenance, then make business-driven consolidation changes in
separate commits whose purpose, compatibility effect and verification are visible.

## Authority Hierarchy

When sources disagree, use this order:

1. User-approved business goals, product boundary and release claims.
2. Explicit HypoDoc Spec and compatibility contracts, including reviewed changes to those contracts.
3. Repeatable cross-renderer conformance and user-visible output evidence.
4. Current implementation details in Hypo-Markdown and Hypo-LaTeX.

The independent Spec remains the location where shared semantic decisions are published. That does
not make its current checkout infallible: contract defects or missing integration modes are fixed in
the Spec repository, reviewed, versioned and then pinned by the product.

## Git Import Strategy

### Product root

Keep `1a35eb6dec2da1230284b8cf1f65a8d9c4a4932f` as the pre-import root anchor. Migration documents
and later integration commits build on it. Do not rewrite this anchor after S1.

### Hypo-Markdown

Use `e4e7148494bed527e050867616d643353a6641d8` as the source anchor. Fetch it as a local source remote
and add it without squash under a temporary import prefix so its commit remains reachable from the
product history. A following organization commit maps only the product-owned surfaces:

| Source | Target | Integration treatment |
| --- | --- | --- |
| `packages/parser-core` | `Packages/parser-core` | Keep portable boundary; revise names/contracts where product evidence requires it |
| `packages/render-model` | `Packages/render-model` | Audit the renderer-owned model against the revised Spec integration modes |
| `packages/render-web` | `Packages/render-web` | Preserve behavior, then address bundle shape and shared product imports |
| `packages/theme` | `Packages/theme` | Consolidate tokens with renderer themes without pretending all media share identical styling |
| `apps/desktop` | `Apps/Desktop` | Rename product surface, retain Electron hardening, replace scaffold release packaging |
| `extensions/vscode` | `Extensions/VSCode` | Preserve native editor model, revise identity/publisher only after governance decision |
| `.github`, `tools`, reports and docs | Root CI, tools and `Docs/` | Curate and rewrite for the integrated paths; do not retain obsolete repository assumptions |
| nested `.pipeline` | Not imported as product content | Durable decisions are consulted, but source Workflow runtime is not product source |
| `spec/hypodoc` | Not retained as a nested dependency | Reconciled into the independent root Spec workflow |

Because the source has only one anchor commit, a temporary prefixed import plus a separate mapping
commit provides both provenance and a readable organization boundary. The temporary tree is removed
after mapping; its source commit remains in history.

### Hypo-LaTeX

Fetch `b1ef2c7335e969f332aafb38c766ff9cbb46b182` and import it without squash at
`Renderers/LaTeX`. Preserve its six unpublished commits and full existing ancestry. Then apply a
separate integration commit that:

- removes the renderer-local Spec submodule and consumes the root pinned Spec;
- keeps `hypolatex` compatibility where it has demonstrated user value, while allowing product-facing
  names and package versions to change;
- separates renderer-neutral authoring guidance into `Skills/Authoring` and LaTeX build/verification
  guidance into `Skills/LaTeX`;
- reconciles duplicate docs, themes and release assumptions instead of copying them unchanged; and
- applies or supersedes the preserved `uv.lock` correction only after the integrated version is chosen.

### HypoDoc Spec

Replace the placeholder `Spec/README.md` with the independent Spec repository as a root submodule (or
an equivalently pinned independent Git dependency if tooling evidence rejects submodules). Start from
`v0.2.0-rc.1`, then review and port both divergent inputs:

- the post-release renderer-links commit `747bda0`; and
- `recovery/hypo-markdown-embedded-spec.patch`, especially its explicit independent-runtime mode.

Rewrite obsolete names and links for the integrated HypoDoc product. Run the full pinned-Pandoc test
suite and registry checks before updating the root gitlink. No renderer may silently redefine shared
syntax or call a private AST `hypodoc.ir/v1` without satisfying the complete schema.

## Expected Business Changes

The import is not a mechanical case conversion. Expected normal changes include:

- product and package naming (`HypoDoc`, Desktop, VS Code and LaTeX surfaces);
- directory imports, workspace references, CI paths and release scripts;
- shared-vs-renderer ownership of syntax, compatibility data, themes and authoring guidance;
- removal of duplicate nested Spec references and obsolete repository-local assumptions;
- correction of incomplete license, version, installer and release metadata;
- interface changes needed to make Web and LaTeX implementations agree on tested semantics; and
- documentation rewrites that describe the integrated product rather than the former repositories.

Compatibility shims are retained only when there is a demonstrated consumer or migration need. Source
behavior is not preserved merely because it exists.

## License Recommendation

Adopt MIT for first-party integrated product code, matching HypoDoc-Spec and Hypo-LaTeX, while retaining
all third-party notices and license reports. This recommendation needs explicit S1 acceptance because
Hypo-Markdown currently lacks a first-party license file.

## S1 Acceptance Boundary

Accepting S1 authorizes the local history-preserving imports and subsequent business consolidation in
M2/M3. It does not authorize pushing a remote, publishing a package, choosing the final integrated
version, creating a public Release or claiming unsupported platform validation. Those remain behind S2.

Acceptance should mean:

- the four baseline commits and two dirty patches are sufficient recovery evidence;
- the authority hierarchy permits critical content modification while preserving provenance;
- the proposed path mapping and Spec reconciliation are suitable starting points;
- MIT is accepted as the intended first-party root license; and
- the known local-only and platform-validation limitations are understood.
