---
kind: execution-log
cycle: C001-hypodoc-monorepo-migration-release
updated: 2026-08-06T18:08:22+08:00
---

# HypoDoc Monorepo 迁移、整理与发布执行记录

## 2026-08-06 18:08 - S1 接受并交接 M2

- **计划项：** `S1`
- **目的：** 记录最后一项许可证决定，正式关闭迁移基线审阅并使后续模型可恢复执行。
- **动作：** 用户明确确认 MIT；新增根 `LICENSE`，同步决策、Plan 和迁移文档，建立 `Docs/migration/execution-handoff.md`。
- **结果：** `S1` completed，`M2` in_progress；尚未迁入源码或产生远端副作用。
- **证据：** `LICENSE`、`Docs/migration/decisions.md`、`Docs/migration/execution-handoff.md`、`PROGRESS.md` 与本地 Discussion Ledger。
- **接受范围：** MIT、干净产品历史、`v0.1.0`、Spec 独立修订边界、业务整合方式和 V4 Flash 主执行均已确认；远端与发布治理不在本次接受范围。
- **剩余风险：** 三套 Spec 状态仍需在 M3 整理；Windows/macOS、签名、notarization 与公开发布仍未验证或授权。
- **下一步：** 接手主模型从 M2 开始直接迁入并整理 TypeScript 产品。

## 2026-08-06 18:04 - S1 决策路线整理

- **计划项：** `S1`
- **目的：** 将用户关于产品历史、首发版本和执行模型的讨论收敛为无冲突的正式决策。
- **动作：** 废止“合并来源 Git 历史”路线；改为保留来源证据并直接整理迁入。固定首个产品版本为 `v0.1.0`，确认 Spec 独立版本化，并记录 V4 Flash 可作为 M2 至 M4 主执行模型。
- **结果：** Plan、Migration、Import Design、Progress、Discussion Summary 与决策清单已对齐；S1 仍等待 MIT 许可证确认。
- **证据：** `Docs/migration/decisions.md`、`Docs/migration/import-design.md`、`MIGRATION.md`、`PLAN.md`、`PROGRESS.md`。
- **计划影响：** Plan ID 与 Stone 顺序不变；M2/M3 的导入方式和 M5 的版本目标发生明确修订。
- **遇到的问题：** 无。
- **下一步：** 用户确认或调整 MIT 第一方许可证；之后决定是否接受 S1。

## 2026-08-06 17:53 - 来源基线与业务整合设计完成

- **计划项：** `M1`
- **目的：** 使所有来源内容可恢复，并为 `S1` 提供事实与建议分离的真实审阅包。
- **动作：** 创建根仓与 Hypo-Markdown 初始锚点；为两处 dirty 状态创建 safety ref 和 portable patch；运行来源基线验证；编写 source inventory 与 import design。
- **结果：** `M1` 完成，`S1` 进入 `waiting-review`。没有导入产品源码、push、Release 或 Marketplace 副作用。
- **证据：** 根 commit `1a35eb6`；Hypo-Markdown commit `e4e7148`；审阅包 commit `a85bc54`；`Docs/migration/source-inventory.md`；`Docs/migration/import-design.md`；恢复 patch SHA-256 见 inventory。
- **验证：** Hypo-Markdown 27 tests、typecheck、build、13-case conformance、perf 通过；Spec 268 tests 与 registry check 通过；Hypo-LaTeX doctor 和 255 tests 通过、10 skipped；恢复 patch 在 clean detached worktree 正向检查通过。
- **计划影响：** `S1` 接受标准增加批判性业务整合与来源权威层级，Plan ID 和后续顺序不变。
- **遇到的问题：** 系统 Pandoc 版本不匹配、嵌套 pytest 收集和旧 `.venv` shebang 曾导致无效失败；使用仓库固定 Pandoc 与 `uv run python -m pytest` 后验证通过。恢复 patch 的合法上下文空格需从通用 whitespace check 中排除。
- **下一步：** 等待用户接受或拒绝 `S1`。

## 2026-08-06 17:39 - Proposal 已确认，开始来源冻结

- **计划项：** `M1`
- **目的：** 建立迁移前可恢复、可审计的来源基线。
- **动作：** 用户选择“确认并开始”；Plan 转为 active，`M1` 转为 `in_progress`。
- **结果：** 获准盘点来源并建立本地 Git 锚点；尚未迁移源码或产生远端副作用。
- **证据：** `PLAN.md`、`PROGRESS.md`、`DISCUSSION-SUMMARY.md` 与本地 Discussion Ledger。
- **计划影响：** 无；按原 Proposal 推进至 `S1`。
- **遇到的问题：** 无。
- **下一步：** 采集仓库事实、运行来源基线验证并生成审阅包。
