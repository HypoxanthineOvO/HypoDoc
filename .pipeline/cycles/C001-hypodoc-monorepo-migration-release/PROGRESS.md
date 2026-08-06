---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: active
updated: 2026-08-06T20:30:00+08:00
current: S2
next: 等待用户审阅 S2 Release Candidate 包（RC 内容、验证报告、剩余风险与发布治理问题）
---

# HypoDoc Monorepo 迁移、整理与发布进度

## 当前状态

TypeScript 产品已直接迁入新仓并建立根 pnpm 工作区；M2 的独立验证（typecheck、build、
非 Spec 依赖测试、perf、Desktop smoke、VSIX package）全部通过。Spec 依赖的验证项
（parser-core fixture 用例、conformance:portable）随 M3 的根 Spec 就位后补齐。尚未产生远端副作用。

## 完整计划状态

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | `completed` | 根锚点 `1a35eb6`、Hypo-Markdown 锚点 `e4e7148`、两条 safety ref、两份恢复 patch；基线验证通过 | 已进入 `S1` |
| `S1` | 迁移基线与业务整合设计审阅 | `completed` | 用户确认 MIT，接受干净产品历史、`v0.1.0`、Spec 独立修订、业务整合边界和 V4 Flash 主执行 | 已进入 `M2` |
| `M2` | 导入 TypeScript 产品 | `completed` | 产品 commit `d943569`；六个 TS 面就位；typecheck/build/perf/Desktop smoke/VSIX 通过；测试 9 例独立用例通过，13 例 Spec fixture 用例待 M3 | 已进入 `M3` |
| `M3` | 整合 Spec、LaTeX 与 Skills | `completed` | Spec 固定 `ef80abe` 于根 `Spec/`；LaTeX 迁入 `Renderers/LaTeX`（v0.1.0）；Skills 拆分完成；conformance 13/13、parser-core 18/18、LaTeX 253 passed、Spec 268 passed、PDF 证据通过 | 已进入 `M4` |
| `M4` | 统一产品结构、品牌、验证与发布工程 | `completed` | 品牌统一 HypoDoc；`scripts/validate-all.sh` 全绿（TS/Spec/LaTeX/PDF/VSIX）；CI 就位；许可报告与 Release manifest 建立；Linux 平台验证完整 | 已进入 `S2` |
| `S2` | Release Candidate 与发布治理审阅 | `completed` | 用户答复四项治理问题：gh/glab 建远端（GitHub canonical + GitLab mirror，仓库名大写 `HypoDoc`）、授权旧仓清理、授权平台验证（CI 须稳健）、授权 push Spec 修订 | 已进入 `M5` |
| `M5` | 发布 `v0.1.0` | `in_progress` | GitHub `HypoxanthineOvO/HypoDoc` 已建并 push；Spec 修订 `ef80abe` 已 push；tag `v0.1.0` 与 Release 已创建（VSIX + CHECKSUMS 资产）；GitLab mirror 已建并同步；Build Hosts 三平台构建通过；CI 全绿修复链进行中 | CI 全绿后收尾并进入 `S3` |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- `S2` 为 `waiting-review`：在用户接受前不 push、不创建 Release、不上传 Marketplace，也不声称 Windows/macOS、签名或 notarization 已验证。

## 计划变化

- 无新增；M2 与 M3 存在一处验证交叉：parser-core 的 Spec fixture 用例与
  `conformance:portable` 依赖根 `Spec/` 固定 revision，安排在 M3 就位后统一补齐并记录证据。

## 下一步

等 CI 全绿；回答 VS Code publisher/ID 发布路径（需用户 PAT）；旧仓远端删除需 `gh auth refresh` 授予 `delete_repo` scope；完成后进入 `S3` 已发布结果审阅。
