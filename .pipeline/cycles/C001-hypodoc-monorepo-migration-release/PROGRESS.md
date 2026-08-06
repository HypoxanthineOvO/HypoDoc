---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: waiting-review
updated: 2026-08-06T18:04:05+08:00
current: S1
next: 等待用户确认 MIT 第一方许可证；其余 S1 核心决策已整理
---

# HypoDoc Monorepo 迁移、整理与发布进度

## 当前状态

`M1` 已完成并验证，当前停在 `S1`。来源提交、dirty patch、验证结果、权威层级、直接迁入
路线与拟议业务修改均已形成真实审阅包；尚未导入源码或产生远端发布副作用。

## 完整计划状态

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | `completed` | 根锚点 `1a35eb6`、Hypo-Markdown 锚点 `e4e7148`、两条 safety ref、两份恢复 patch；基线验证通过 | 已进入 `S1` |
| `S1` | 迁移基线与业务整合设计审阅 | `waiting-review` | 已确认干净产品历史、`v0.1.0`、Spec 独立修订和 V4 Flash 主执行；MIT 尚待确认 | 用户确认 MIT 后接受或继续修订 |
| `M2` | 导入 TypeScript 产品 | `pending` | 尚未开始 | 等待 `S1` 接受 |
| `M3` | 整合 Spec、LaTeX 与 Skills | `pending` | 尚未开始 | 等待 `M2` 验证通过 |
| `M4` | 统一产品结构、品牌、验证与发布工程 | `pending` | 尚未开始 | 等待 `M3` 验证通过 |
| `S2` | Release Candidate 与发布治理审阅 | `pending` | 尚未产生 RC | 等待 `M4` 验证通过 |
| `M5` | 发布 `v0.1.0` | `pending` | 尚未开始，无远端副作用 | 等待 `S2` 接受 |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- `S1` 人工审阅 gate；未接受前不进入 `M2`。

## 计划变化

- 用户决定新仓不合并旧 Git 历史，旧仓仅作为 provenance；首个整合产品版本固定为 `v0.1.0`。
- 用户明确本次是业务整合，允许正常内容修改；来源仓须批判性核验，不作为唯一真理。
- 用户认可 V4 Flash 的能力足以作为后续主执行模型；交接仍受 Workflow 和 Stone 约束。

## 下一步

用户确认或调整 MIT 第一方许可证决定；`S1` 接受后进入 `M2`。
