# HypoDoc Business Integration And Import Design

Status: proposed for Stone S1 review

## Decision Summary

Treat the three source repositories as versioned evidence and implementation material, not as
immutable truth. Keep their repositories, commit SHAs, tags and dirty patches as provenance, but do
not merge their Git histories into the new product `main`. Curate and modify the source content into
a clean product history whose commits describe the actual integration work.

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
and later integration commits build on it. Do not rewrite this anchor or attach unrelated source
histories as ancestors of the new product branch.

### Hypo-Markdown

Use `e4e7148494bed527e050867616d643353a6641d8` as the source anchor and archived comparison point.
Copy only the selected product-owned surfaces into the new repository, applying business changes as
part of reviewed integration commits. Do not merge or subtree-add the source commit into product history:

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

The source SHA and path mapping remain in the migration manifest and inventory. The old repository
stays available for `git log`, blame and recovery; the new repository records only meaningful product
integration commits.

### Hypo-LaTeX

Use `b1ef2c7335e969f332aafb38c766ff9cbb46b182` as the source snapshot and copy the curated renderer
content into `Renderers/LaTeX`. Keep the old repository and its six unpublished commits as archived
provenance, but do not merge that ancestry into product `main`. The integration commits will:

- remove the renderer-local Spec submodule and consume the root pinned Spec;
- keep `hypolatex` compatibility where it has demonstrated user value, while allowing product-facing
  names and package versions to change;
- separate renderer-neutral authoring guidance into `Skills/Authoring` and LaTeX build/verification
  guidance into `Skills/LaTeX`;
- reconcile duplicate docs, themes and release assumptions instead of copying them unchanged; and
- normalize product-facing version metadata for the new `v0.1.0` line and either apply or supersede
  the preserved `uv.lock` correction explicitly.

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

## License Decision

Adopt MIT for first-party integrated product code, matching HypoDoc-Spec and Hypo-LaTeX, while retaining
all third-party notices and license reports. The user explicitly accepted this decision at S1; the root
repository carries the resulting `LICENSE`. Hypo-Markdown's former lack of a first-party license file
does not remove any third-party attribution obligations.

## Product Version

The first integrated product release is `HypoDoc v0.1.0`. It starts a new product history and does not
inherit Hypo-LaTeX's `v0.4.0` sequence. HypoDoc Spec keeps its own independent version. Release and
package metadata must make that distinction explicit.

## S1 Acceptance Boundary

Accepting S1 authorizes the direct curated imports and subsequent business consolidation in M2/M3.
It does not authorize pushing a remote, publishing a package, creating a public Release or claiming
unsupported platform validation. Those remain behind S2. The product version is already fixed at
`v0.1.0`; S2 verifies release readiness rather than choosing a different inherited version line.

Acceptance should mean:

- the four baseline commits and two dirty patches are sufficient recovery evidence;
- the authority hierarchy permits critical content modification while preserving provenance outside
  the new product commit graph;
- the proposed path mapping and Spec reconciliation are suitable starting points;
- MIT is accepted as the intended first-party root license; and
- the known local-only and platform-validation limitations are understood.
