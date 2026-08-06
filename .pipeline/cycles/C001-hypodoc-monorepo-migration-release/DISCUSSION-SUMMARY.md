---
kind: discussion-summary
cycle: C001-hypodoc-monorepo-migration-release
updated: 2026-08-06T18:04:05+08:00
raw_discussion: local/discussions/C001-hypodoc-monorepo-migration-release/
---

# HypoDoc Monorepo 迁移、整理与发布讨论摘要

## 已确认需求

- 在本仓完成 HypoDoc 的迁移、整理和发布；来源见本 Cycle 的本地 Discussion Ledger。

## 已作决定

- 用户先确认可以不沿用 Hypo-LaTeX 当前版本号，随后进一步决定首个整合产品版本固定为 `HypoDoc v0.1.0`；较早的“到 RC 再计算产品版本”方案已被替代。
- Spec 保持独立语义权威；此项延续仓库已有迁移边界，最终接入方式在 `S1` 审阅。
- 用户明确三个来源仓均不完善，不能把仓库现状当作唯一真理；本次工作是业务整合，内容修改、去重、重命名与接口重构属于正常范围。历史保留用于 provenance 与回退，不等于原样照搬。
- 用户决定不把旧仓 Git 历史合并进新仓 `main`；旧仓、来源 SHA、tag、patch 与测试证据继续保留，筛选后的内容直接建立干净产品历史。
- 用户决定首个整合产品版本为 `HypoDoc v0.1.0`；它不继承 Hypo-LaTeX `v0.4.0`，Spec 继续独立版本化。
- 用户认可 V4 Flash 可作为 M2 至 M4 的主执行模型；交接必须包含完整 Workflow 与迁移决策上下文，并在 S2 停止等待审阅。

## 接受与拒绝

- 用户已选择“确认并开始”，接受完整 Proposal，并授权执行 `M1`；后续仍受 `S1`、`S2`、`S3` 人工审阅门约束。
- `M1` 审阅包已完成，当前等待用户对 `S1` 的接受或拒绝；尚未授权进入 `M2`。
- 用户选择保持 `S1` 等待审阅，没有授权进入 `M2`，并要求用日常业务语言解释清楚审阅内容。

## 纠正与分歧

- `S1` 首次说明过于工程化。后续审阅说明应先讲清业务含义、授权范围和实际风险，再给技术证据。
- 原 Plan 的“合并来源 Git 历史”路线已被后续讨论替代；改为“保留来源证据、直接整理迁入、建立干净产品历史”。

## 未决问题

- MIT 许可证最终确认。
- canonical remote 与 mirror 方向。
- VS Code publisher/extension ID、签名与 notarization 策略。
