# HypoDoc Rendering Integration Closeout

Date: 2026-08-09
Cycle: `C002-hypodoc-rendering-quality-performance` / M8

## Result

The canonical slide path is integrated across parser/render-model, Web/Desktop/VS Code, and Hypo-LaTeX. The public Beamer template now parses as `profile=beamer`, `valid=true` with zero portable diagnostics and also builds through the strict XeLaTeX path. Waterfall, presentation, and PDF preserve the same nine-frame/page order and semantic membership for the canonical fixture.

The S2 revision now also fixes slide geometry at a `960x540` logical canvas. Mobile Fit contains the complete
16:9 frame without changing internal typography or coordinates; Readable Zoom enlarges the same frame with
controlled panning. The Desktop shell uses a flatter Typora-inspired content hierarchy with one global
toolbar, a quiet rail, and compact presentation controls.

The second S2 revision adds a generated brand mark and completes the Desktop file surface. Open now offers
file and folder paths; native folder selection enumerates only bounded Markdown entries and exposes reads
only for dialog-approved files. Save is icon-only, while Import Markdown, Export Markdown, Print/PDF, and
Settings are available from the toolbar. Settings persist theme and local-draft autosave.

The source editor now omits line numbers by default. Users who need line-based navigation can opt in through
Settings; the CodeMirror extension is installed only while that preference is enabled.

The original template/renderer diagnosis was correct: configuration, theme capability, assets, and visual roles were previously split across several late or silent validation boundaries. This cycle retained the Pandoc/Lua/TeX renderer but moved the product contract earlier and made failures explicit.

## Closed Findings

| Audit area | Resolution | Evidence |
| --- | --- | --- |
| Canonical slide source | Public and canonical deck sources use `profile: beamer`; the public controlled table uses a stable ID and portable `kind`/`caption` attributes. Legacy aliases remain read-only compatibility. | Portable parse check; `test_build_skill_beamer_template_to_pdf_evidence` |
| Shared slide structure | `SlideDeck` is projected from the portable render document and drives Web waterfall/presentation frame membership. | render-model tests; canonical 9-frame matrix |
| Theme capability | A registry declares supported profiles and rejects incompatible theme/profile pairs before Pandoc. No silent Beamer fallback. | theme/config tests |
| Configuration parsing | Frontmatter selection uses structured YAML and a validated configuration boundary; templates consume normalized values. | document-option/config tests |
| Resource containment | Absolute, parent-traversing, remote/data, and symlink-escape paths fail; corrupt assets fail; missing assets require explicit `--allow-placeholders`. | resource security/build tests |
| Raw path metadata | Path metadata is normalized/escaped instead of injected as raw TeX fragments. | filter/resource tests |
| Toolchain | `doctor`, convert, and build enforce exact Pandoc 3.10 plus required TeX/font/evidence dependencies. | doctor tests and paired eval evidence |
| Determinism | Missing date becomes empty, builds use deterministic metadata, and repeated representative builds are byte-identical. | deterministic build tests/eval hashes |
| Skill/config contract | The Skill is a 102-line product entry plus routed references; all five templates emit canonical `profile`, explicit compatible themes, and no default missing asset. | skill contract tests; M7 benchmark |
| Task-list regression | Pandoc checkbox markers emitted `\square`, but the packages did not load its definition. Both longform and Beamer now require `amssymb`, doctor checks it, and strict build regressions cover unchecked/checked items. | `test_build_task_list_markers_define_checkbox_symbols` |
| Desktop workspace boundary | Folder selection is native/browser-gated; Electron limits traversal depth and document count, skips symlinks, allowlists Markdown, and rechecks the enumerated `realpath` before each read. | Electron security contract; production smoke |
| Desktop product commands | Image-generated mark, file/folder Open, compact Save, Import, Markdown export, Print/PDF, theme, and autosave settings are implemented rather than represented by inert controls. | `m5r2-*` evidence; Playwright toolbar workflows |
| Editor default density | CodeMirror line numbers are default-off and available as a persisted Settings opt-in. | `m5r3-editor-default.png`; Playwright off/on/off assertions |

## Validation

- LaTeX: `269 passed, 12 skipped` with pinned Pandoc 3.10; the final public-template targeted set adds `19 passed` after the portable table migration.
- JavaScript/TypeScript: 34 tests passed across parser-core, render-model, render-web, Desktop, and VS Code; workspace typecheck passed. VS Code production build completed; the first root build was externally terminated after Desktop transform, then the isolated Desktop production build passed in 2m48s and its Electron smoke loaded the production renderer.
- Performance: the final `pnpm perf` returned `valid=true`; sample average/max 0.242/1.120 ms and approximately 1 MiB average/max 8.702/11.472 ms. Desktop initial and Mermaid bundle gates are both true.
- Skill eval: new Skill 18/18 assertions versus old snapshot 16/18. Both old failures were legacy `document_type` emission in new-authoring tasks.
- Visual evidence: the `m5r2-*` set covers 1440x900 desktop light/dark, 375x812 portrait Fit/Zoom, 812x375 landscape, Open/actions menus, and Settings. DOM assertions confirm a 960x540 logical canvas, stable 16:9 rendered geometry, unchanged internal font size, and intentional overflow only in Readable Zoom. The nine-page PDF remains 16:9 and membership-aligned.
- Editor preference: Desktop typecheck and four security/bridge tests pass; Playwright confirms no default `.cm-lineNumbers`, opt-in creation/persistence, and successful disable. The final Desktop production build and Electron smoke both pass.

## Residual Risks

1. Portable rendering is complete for the canonical slide surface, not for every LaTeX authoring extension. The longform/project/review/cheatsheet templates still exercise C3/C5 constructs that the portable registry either models differently or does not support (`cheatsheet-grid`, `cheatsheet-cell`, standalone review children, and some Pandoc fence forms). They remain valid Hypo-LaTeX sources; claiming cross-renderer parity for them would be inaccurate.
2. The Desktop main bundle (324.39 kB gzip) and optional Mermaid bundle (831.02 kB gzip) pass current 400,000/900,000 B gates but remain large. Further reduction requires deeper dependency-level splitting rather than another projection-copy optimization.
3. Desktop edit-to-preview timing stayed within the accepted +10% regression gate but did not meet the earlier aspirational absolute targets. Measurements include automation/input overhead and remain same-host comparisons.
4. The LaTeX pipeline is hardened at declared resource/configuration boundaries but is not a general sandbox for arbitrary trusted TeX execution. Raw TeX from untrusted repositories remains outside the supported threat model.
5. M7 used one paired run per configuration. Output assertions and PDF evidence are deterministic, but executor token/duration counters were unavailable from the collaboration runner and were not inferred from artifact sizes.
