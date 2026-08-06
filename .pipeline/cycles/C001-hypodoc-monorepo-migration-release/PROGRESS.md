---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: active
updated: 2026-08-06T18:08:22+08:00
current: M2
next: 由接手主模型读取 execution handoff，开始 TypeScript 产品直接迁入与业务整理
---

# HypoDoc Monorepo 迁移、整理与发布进度

## 当前状态

用户已确认 MIT 并接受 `S1`。当前进入 `M2` 的交接准备：来源基线、直接迁入路线、
`v0.1.0`、Spec 边界、许可证和执行模型均已明确；尚未迁入产品源码或产生远端副作用。

## 完整计划状态

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | `completed` | 根锚点 `1a35eb6`、Hypo-Markdown 锚点 `e4e7148`、两条 safety ref、两份恢复 patch；基线验证通过 | 已进入 `S1` |
| `S1` | 迁移基线与业务整合设计审阅 | `completed` | 用户确认 MIT，接受干净产品历史、`v0.1.0`、Spec 独立修订、业务整合边界和 V4 Flash 主执行 | 已进入 `M2` |
| `M2` | 导入 TypeScript 产品 | `in_progress` | 执行交接入口已建立，尚未迁入源码 | 接手模型读取 Handoff 后执行直接迁入与验证 |
| `M3` | 整合 Spec、LaTeX 与 Skills | `pending` | 尚未开始 | 等待 `M2` 验证通过 |
| `M4` | 统一产品结构、品牌、验证与发布工程 | `pending` | 尚未开始 | 等待 `M3` 验证通过 |
| `S2` | Release Candidate 与发布治理审阅 | `pending` | 尚未产生 RC | 等待 `M4` 验证通过 |
| `M5` | 发布 `v0.1.0` | `pending` | 尚未开始，无远端副作用 | 等待 `S2` 接受 |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- 无。M2 已获准执行；远端与发布副作用仍受 S2 约束。

## 计划变化

- 用户决定新仓不合并旧 Git 历史，旧仓仅作为 provenance；首个整合产品版本固定为 `v0.1.0`。
- 用户明确本次是业务整合，允许正常内容修改；来源仓须批判性核验，不作为唯一真理。
- 用户认可 V4 Flash 的能力足以作为后续主执行模型；交接仍受 Workflow 和 Stone 约束。
- 用户确认新仓第一方代码采用 MIT，`S1` 已接受。

## 下一步

接手主模型读取 `Docs/migration/execution-handoff.md`，从 `M2` 继续。
