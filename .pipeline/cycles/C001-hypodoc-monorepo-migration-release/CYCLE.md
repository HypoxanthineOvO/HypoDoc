---
kind: cycle
name: C001-hypodoc-monorepo-migration-release
status: active
started: 2026-08-06
updated: 2026-08-06
builds_on: []
plan: PLAN.md
progress: PROGRESS.md
execution: EXECUTION.md
---

# HypoDoc Monorepo 迁移、整理与发布

## 本轮目的

把当前迁移骨架建设为可构建、可测试、可审计发布的 HypoDoc 产品 Monorepo，
同时保留来源证据、保持 Spec 的独立语义权威，并留下可回退的旧工作区。

## 执行边界

本 Cycle 包含来源冻结、直接内容迁入、业务内容整合、目录与品牌整理、统一验证、发布准备、
首轮发布和非破坏性工作区切换。未经对应 Stone 接受，不导入下一阶段或产生远端
发布副作用；本 Cycle 不删除旧工作区，不伪造未实际完成的平台构建、签名或发布验证。

来源仓是需要批判性核验的实现证据，不是不可修改的唯一真理。业务目标、经确认的产品边界、
显式 Spec 合同和跨 renderer 验证共同决定整合结果；冲突应被修正规范或实现并留下理由，而不是
为保持来源原样而固化问题。

## 验证目标

来源状态与恢复锚点可审计；TypeScript、Python、Spec、代表性 Web/TeX/PDF、Desktop
与 VSIX 验证入口在干净 checkout 中可运行；发布资产、校验和、版本与来源 commit 可追溯；
最终切换保留明确回退路径。

## 关联

- 根仓：`README.md`、`MIGRATION.md`
- 来源：`../Hypo-Markdown`、`../Hypo-LaTeX`、`../HypoDoc-Spec`
- 长期决策：新产品建立干净 Git 历史，首个整合版本为 `v0.1.0`；Spec 独立版本化。
