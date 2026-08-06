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

## 2026-08-06 19:10 - M4 产品面统一完成，S2 进入等待审阅

- **计划项：** `M4` → `S2`
- **目的：** 把整合后的产品形成一致产品面与可审计发布记录，并生成 S2 审阅包。
- **动作：** 品牌统一为 HypoDoc（Desktop 表面、标题、VSIX displayName、smoke 断言）；建立根 `scripts/validate-all.sh` 统一验证入口；迁入并改写 CI（portable-runtime、reference-differential、latex-renderer、browser、build-hosts）；整理 `Docs/`（architecture、security、ADR）；运行许可报告（271 包 0 未解决）；创建 `Docs/release/manifest.json`（组件版本、来源 SHA、平台验证矩阵、签名状态）。
- **结果：** `M4` completed，`S2` `waiting-review`。产品 commit `e4460c6`（+ 修正 commit）。无远端副作用。
- **验证：** `./scripts/validate-all.sh` EXIT=0：TS typecheck/test/build/audit/licenses/perf 全过；Spec 268 passed + registry valid；conformance 13/13；LaTeX doctor 全过、253 passed/12 skipped、showcase PDF 13 页 A4 与 PDF 证据通过；VSIX package 成功（sha256 `aaf23a4c93fe38e6d1d4f8e668bada5a453babc9834ae818ea3e5e30e46d591e`）。
- **证据：** commit `e4460c6`、`scripts/validate-all.sh`、`Docs/release/manifest.json`、`reports/third-party-licenses.json`、`release/hypodoc-vscode.vsix`。
- **遇到的问题：** 根 `.gitignore` 的 `release/` 规则曾误忽略 `Docs/release/` 与 `Renderers/LaTeX/docs/release`，改为 `/release/` 后修正；validate-all 中 Spec/LaTeX pytest 需在对应目录运行，registry check 需在 Spec 目录运行。
- **剩余风险（S2 审阅范围）：** canonical remote 与 mirror 方向未定；VS Code publisher/extension ID、代码签名与 notarization 未配置；Windows/macOS 平台构建未在真实宿主验证（CI 工作流已就位但未运行）；三套 Spec 分歧已合并但新修订 commit `ef80abe` 尚未 push，干净 clone 的 submodule 验证依赖远端可达。
- **下一步：** 用户审阅 S2 包并决定接受/拒绝。

## 2026-08-06 20:30 - S2 治理确认，M5 发布进行中

- **计划项：** `S2` → `M5`
- **目的：** 落实用户对四项治理问题的决定，执行 v0.1.0 发布动作。
- **用户决定：** ① 用本地 gh/glab 建远端，仓库名必须大写 `HypoDoc`，旧产品仓可清理；② VS Code publisher/ID 路径待落实（需 PAT）；③ 授权 Windows/macOS 验证，但 CI 验收必须稳健（避免过度精细断言）；④ 授权 push Spec 修订 `ef80abe`。
- **动作：** push Spec `ef80abe` 到 hypodoc-spec 远端；创建 GitHub `HypoxanthineOvO/HypoDoc`（public）并 push main；打 `v0.1.0` tag；创建 GitHub Release（VSIX + CHECKSUMS 资产）；创建 GitLab mirror `heyx/HypoDoc` 并同步 main + tag（HTTPS 需凭证，改 SSH 成功）；触发 Build Hosts 三平台构建；修复 CI 脆弱点（PDF 存在性 gate、SKIP_VISUAL_DIFF、latex job submodule/working-directory/pandoc 3.10、fontawesome5 降级为 optional、snapshot 对齐 pandoc 3.10）。
- **结果：** S2 completed，M5 in_progress。Build Hosts Linux/Windows/macOS 三平台 electron-builder --dir 构建 + VSIX 打包全部通过（run 31098566878）；CI 四个 job 中三个已绿，latex-renderer 修复链已推送等待全绿。
- **证据：** GitHub 远端与 Release `v0.1.0`（https://github.com/HypoxanthineOvO/HypoDoc/releases/tag/v0.1.0）、GitLab mirror、`Docs/release/manifest.json`（平台验证已更新）、commit 链至 `893bc03`。
- **遇到的问题：** gh token 缺 `delete_repo` scope 无法删除 hypodoc-latex 远端（需用户 `gh auth refresh`）；GitLab HTTPS 推送需凭证（改 SSH）；CI latex job 依次修复 submodule 初始化、工作目录、pandoc 3.10 与快照对齐。
- **剩余风险：** VS Code Marketplace 上传需用户 PAT；旧仓远端删除待 delete_repo scope；CI latex job 全绿待确认。
- **下一步：** CI 全绿 → 收尾 M5 → `S3` 已发布结果审阅。

## 2026-08-06 21:40 - M5 发布完成，S3 接受，M6 收尾关闭

- **计划项：** `M5` → `S3` → `M6`
- **目的：** 完成 v0.1.0 发布与 Cycle 收尾。
- **动作：** 上传 Windows NSIS exe、macOS arm64 dmg/zip 到 Release（含全量 CHECKSUMS）；CI 全绿确认（run `31102885070`，四 job success）；三平台安装器打包通过（run `31103596261`）；干净 clone 验证通过（GitHub clone + submodule `ef80abe` 远端拉取 + `pnpm install --frozen-lockfile` + typecheck）；旧仓本地工作区按授权清理（Hypo-Markdown、Hypo-LaTeX 已删，恢复 patch/SHA 证据保留在 `Docs/migration/recovery/` 与 inventory）；撰写 `SUMMARY.md` 并关闭 Cycle。
- **结果：** `M5`/`S3`/`M6` completed，Cycle 关闭。Release `v0.1.0` 资产齐全。
- **证据：** Release 页面、run `31102885070`/`31103596261`、`SUMMARY.md`、`Docs/migration/source-inventory.md`、`Docs/migration/recovery/*.patch`。
- **剩余事项（Cycle 外）：** GitHub `hypodoc-latex` 远端删除需 `gh auth refresh -h github.com -s delete_repo`；VS Code Marketplace publisher 注册需 PAT；macOS Intel/签名/notarization；Web/Desktop 幻灯片模式。
