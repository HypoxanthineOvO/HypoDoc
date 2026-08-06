---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: waiting-review
updated: 2026-08-06T17:53:26+08:00
current: S1
next: 等待用户审阅来源基线、业务整合设计与 MIT 许可证建议
---

# HypoDoc Monorepo 迁移、整理与发布进度

## 当前状态

`M1` 已完成并验证，当前停在 `S1`。来源提交、dirty patch、验证结果、权威层级、历史导入
路线与拟议业务修改均已形成真实审阅包；尚未导入源码或产生远端发布副作用。

## 完整计划状态

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | `completed` | 根锚点 `1a35eb6`、Hypo-Markdown 锚点 `e4e7148`、两条 safety ref、两份恢复 patch；基线验证通过 | 已进入 `S1` |
| `S1` | 迁移基线与业务整合设计审阅 | `waiting-review` | `Docs/migration/source-inventory.md` 与 `import-design.md` 已提交为 `a85bc54` | 用户接受或拒绝审阅包 |
| `M2` | 导入 TypeScript 产品 | `pending` | 尚未开始 | 等待 `S1` 接受 |
| `M3` | 整合 Spec、LaTeX 与 Skills | `pending` | 尚未开始 | 等待 `M2` 验证通过 |
| `M4` | 统一产品结构、品牌、验证与发布工程 | `pending` | 尚未开始 | 等待 `M3` 验证通过 |
| `S2` | Release Candidate 与发布治理审阅 | `pending` | 尚未产生 RC | 等待 `M4` 验证通过 |
| `M5` | 发布首轮 Preview | `pending` | 尚未开始，无远端副作用 | 等待 `S2` 接受 |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- `S1` 人工审阅 gate；未接受前不进入 `M2`。

## 计划变化

- 用户于 2026-08-06 确认 Proposal 并开始执行；Hypo-LaTeX 的整合后版本仍推迟到 `S2` 重新计算。
- 用户明确本次是业务整合，允许正常内容修改；来源仓须批判性核验，不作为唯一真理。

## 下一步

用户审阅 `S1` 的真实产物；接受后进入 `M2`，拒绝则按反馈恢复相关 Milestone 修订。
