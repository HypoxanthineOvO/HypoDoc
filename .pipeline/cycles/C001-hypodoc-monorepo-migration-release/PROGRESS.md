---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: active
updated: 2026-08-06T17:39:11+08:00
current: M1
next: 完成 M1 来源 inventory、恢复锚点和历史导入设计
---

# HypoDoc Monorepo 迁移、整理与发布进度

## 当前状态

用户已确认完整 Proposal 并授权开始。当前执行 `M1`，只建立来源 inventory、恢复锚点与
历史导入设计；到达 `S1` 时暂停，不提前迁移源码或产生远端发布副作用。

## 完整计划状态

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | `in_progress` | Proposal 已确认；开始盘点和建立本地恢复锚点 | 生成并验证 S1 审阅包 |
| `S1` | 迁移基线与业务整合设计审阅 | `pending` | 已确认来源仓不是唯一真理；审阅包尚未完成 | 等待 `M1` 验证通过 |
| `M2` | 导入 TypeScript 产品 | `pending` | 尚未开始 | 等待 `S1` 接受 |
| `M3` | 整合 Spec、LaTeX 与 Skills | `pending` | 尚未开始 | 等待 `M2` 验证通过 |
| `M4` | 统一产品结构、品牌、验证与发布工程 | `pending` | 尚未开始 | 等待 `M3` 验证通过 |
| `S2` | Release Candidate 与发布治理审阅 | `pending` | 尚未产生 RC | 等待 `M4` 验证通过 |
| `M5` | 发布首轮 Preview | `pending` | 尚未开始，无远端副作用 | 等待 `S2` 接受 |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- 无。

## 计划变化

- 用户于 2026-08-06 确认 Proposal 并开始执行；Hypo-LaTeX 的整合后版本仍推迟到 `S2` 重新计算。
- 用户明确本次是业务整合，允许正常内容修改；来源仓须批判性核验，不作为唯一真理。

## 下一步

完成 `M1` 的来源 inventory、恢复锚点与导入设计，验证后将 `S1` 标记为 `waiting-review`。
