---
kind: execution-log
cycle: C001-hypodoc-monorepo-migration-release
updated: 2026-08-06T19:00:00+08:00
---

# HypoDoc Monorepo 迁移、整理与发布执行记录

## 2026-08-06 19:00 - M3 Spec、LaTeX 与 Skills 整合完成

- **计划项：** `M3`
- **目的：** 固定独立 Spec revision 于根 `Spec/`，迁入 LaTeX renderer，拆分通用与专用 Skills，补齐 Spec 依赖验证。
- **动作：** 在独立 Spec 仓库审阅合并两处分歧（embedded independent-runtime contract patch 与 renderer-links commit），并改写为整合后产品形态（commit `ef80abe`）；以 submodule 固定到根 `Spec/`（URL 保持 canonical `hypodoc-spec`）；迁入 `Renderers/LaTeX`（版本归一到 `0.1.0`，消费根 Spec，删除 renderer-local submodule，私有语料排除）；拆分 `Skills/Authoring` 与 `Skills/LaTeX`；更新测试与文档中的旧路径/旧名称。
- **结果：** `M3` completed，`M4` in_progress；产品 commit `f5fcabf`。无远端副作用。
- **验证：** 根 Spec pytest 268 passed + registry valid；parser-core 18/18（含 13 例 Spec fixture）；conformance:portable 13/13 failures 0；LaTeX doctor 全过、pytest 253 passed/12 skipped；代表性 showcase PDF 13 页 A4 构建成功，TeX 可审阅，PDF 文本证据通过。
- **证据：** commit `f5fcabf`、`ef80abe`、`reports/differential-conformance.json`、`Renderers/LaTeX/build/showcase.pdf`。
- **遇到的问题：** uv lock 网络瞬时失败改用来源 lockfile + 版本修正；Spec M6 wheelhouse 类 4 例先构建 wheelhouse 后通过；skill 路径/名称引用按新布局更新。
- **剩余风险：** 品牌统一、CI、许可报告与 Release manifest 属 M4；VS Code publisher、平台构建与签名仍属 S2 范围。
- **下一步：** M4 统一产品结构、品牌、验证与发布工程。

## 2026-08-06 18:40 - M2 TypeScript 产品导入完成

- **计划项：** `M2`
- **目的：** 将 Hypo-Markdown 的 TypeScript 产品面直接迁入新仓，建立根 pnpm 工作区并验证便携运行时边界。
- **动作：** 按 import-design 映射筛选迁入 `Packages/parser-core|render-model|render-web|theme`、`Apps/Desktop`、`Extensions/VSCode`；建立根 `package.json`（`hypodoc@0.1.0`）、`pnpm-workspace.yaml`、`tsconfig.base.json`；调整工具与测试路径引用到新布局；`pnpm install` 基于源 lockfile 重算 importer 路径。
- **结果：** `M2` completed，`M3` in_progress；产品 commit `d943569`（源锚点 `e4e7148`）。未产生远端副作用。
- **验证：** `pnpm typecheck` 6 个 workspace 通过；`pnpm build` Desktop Vite 构建通过；`pnpm perf` valid（sample 0.228ms、1MiB 10.6ms、bundle 预算全过）；Desktop smoke（desktop/mobile 5 个截图流程）通过；`vsce package` 产出 2.69MB VSIX；render-model/render-web/desktop/vscode 测试 9 例通过。parser-core 13 例 Spec fixture 用例随 M3 补齐。
- **证据：** commit `d943569`、`reports/performance-baseline.json`、`release/hypodoc-vscode.vsix`。
- **剩余风险：** conformance:portable 与 parser-core fixture 用例待 M3；VS Code publisher/身份、签名与平台构建仍属 M4/S2 范围。
- **下一步：** M3 整合根 Spec、LaTeX renderer 与 Skills。

## 2026-08-06 18:08 - S1 接受并交接 M2

- **计划项：** `S1`
- **目的：** 记录最后一项许可证决定，正式关闭迁移基线审阅并使后续模型可恢复执行。
- **动作：** 用户明确确认 MIT；新增根 `LICENSE`，同步决策、Plan 和迁移文档，建立 `Docs/migration/execution-handoff.md`。
- **结果：** `S1` completed，`M2` in_progress；尚未迁入源码或产生远端副作用。
- **证据：** `LICENSE`、`Docs/migration/decisions.md`、`Docs/migration/execution-handoff.md`、`PROGRESS.md` 与本地 Discussion Ledger。
- **接受范围：** MIT、干净产品历史、`v0.1.0`、Spec 独立修订边界、业务整合方式和 V4 Flash 主执行均已确认；远端与发布治理不在本次接受范围。
- **剩余风险：** 三套 Spec 状态仍需在 M3 整理；Windows/macOS、签名、notarization 与公开发布仍未验证或授权。
- **下一步：** 接手主模型从 M2 开始直接迁入并整理 TypeScript 产品。
