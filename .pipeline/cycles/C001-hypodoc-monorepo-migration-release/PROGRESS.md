---
kind: progress
cycle: C001-hypodoc-monorepo-migration-release
plan: PLAN.md
status: active
updated: 2026-08-06T19:00:00+08:00
current: M4
next: 统一根级产品结构、品牌、验证入口与发布工程，形成 v0.1.0 RC 前的完整产品面
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
| `M4` | 统一产品结构、品牌、验证与发布工程 | `in_progress` | 尚未开始 | 根级验证入口、CI、品牌与 Release manifest |
| `S2` | Release Candidate 与发布治理审阅 | `pending` | 尚未产生 RC | 等待 `M4` 验证通过 |
| `M5` | 发布 `v0.1.0` | `pending` | 尚未开始，无远端副作用 | 等待 `S2` 接受 |
| `S3` | 已发布结果审阅 | `pending` | 尚无公开 Release | 等待 `M5` 验证通过 |
| `M6` | 非破坏性切换与 Cycle 收尾 | `pending` | 尚未开始 | 等待 `S3` 接受 |

## 阻塞

- 无。M2 已获准执行；远端与发布副作用仍受 S2 约束。

## 计划变化

- 无新增；M2 与 M3 存在一处验证交叉：parser-core 的 Spec fixture 用例与
  `conformance:portable` 依赖根 `Spec/` 固定 revision，安排在 M3 就位后统一补齐并记录证据。

## 下一步

统一根级产品面：品牌（HypoDoc 表面命名）、根验证入口（TS/Python/Spec/LaTeX/PDF）、
CI（整合路径）、许可报告与 Release manifest；随后进入 `S2` 审阅。
