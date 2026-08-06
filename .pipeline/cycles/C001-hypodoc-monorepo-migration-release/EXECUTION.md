---
kind: execution-log
cycle: C001-hypodoc-monorepo-migration-release
updated: 2026-08-06T17:53:26+08:00
---

# HypoDoc Monorepo 迁移、整理与发布执行记录

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
