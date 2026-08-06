---
kind: discussion-summary
cycle: C001-hypodoc-monorepo-migration-release
updated: 2026-08-06T17:53:26+08:00
raw_discussion: local/discussions/C001-hypodoc-monorepo-migration-release/
---

# HypoDoc Monorepo 迁移、整理与发布讨论摘要

## 已确认需求

- 在本仓完成 HypoDoc 的迁移、整理和发布；来源见本 Cycle 的本地 Discussion Ledger。

## 已作决定

- 用户确认可以不沿用 Hypo-LaTeX 当前版本号；整合后的版本在兼容性与发布范围明确后重新计算。
- Spec 保持独立语义权威；此项延续仓库已有迁移边界，最终接入方式在 `S1` 审阅。
- 用户明确三个来源仓均不完善，不能把仓库现状当作唯一真理；本次工作是业务整合，内容修改、去重、重命名与接口重构属于正常范围。历史保留用于 provenance 与回退，不等于原样照搬。

## 接受与拒绝

- 用户已选择“确认并开始”，接受完整 Proposal，并授权执行 `M1`；后续仍受 `S1`、`S2`、`S3` 人工审阅门约束。
- `M1` 审阅包已完成，当前等待用户对 `S1` 的接受或拒绝；尚未授权进入 `M2`。

## 纠正与分歧

- 无。

## 未决问题

- MIT 许可证最终确认。
- canonical remote 与 mirror 方向。
- 首发版本、VS Code publisher/extension ID、签名与 notarization 策略。
