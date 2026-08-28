---
kind: cycle-index
status: active
---

# Cycle 索引

## Active Cycles

| Cycle | 目的 | 状态 | 当前位置 / 下一步 |
| --- | --- | --- | --- |
| [C004-v0.2.0-stable-release](C004-v0.2.0-stable-release/CYCLE.md) | 将已接受的 RC 候选验证并发布为稳定版 `v0.2.0` | active | M1：稳定版本地候选与完整验证 |

## Closed Cycles

| Cycle | 目的 | 状态 | 结果 |
| --- | --- | --- | --- |
| [C003-v0.2.0-rc.1-commit-preparation](C003-v0.2.0-rc.1-commit-preparation/CYCLE.md) | 把 C002 交付拆为原子 commit series 并准备 v0.2.0-rc.1 | completed | 8 条原子本地 commit、跨生态 RC 版本与验证完成；未 push/tag/release；见 `SUMMARY.md` |
| [C002-hypodoc-rendering-quality-performance](C002-hypodoc-rendering-quality-performance/CYCLE.md) | 优化 Skill、幻灯片渲染、导出视觉一致性、性能与 LaTeX renderer 架构 | completed | 固定 SlideDeck、LaTeX 加固、性能/Skill、Typora-inspired Desktop 与完整文件工作流均完成；无发布；见 `SUMMARY.md` |
| [C001-hypodoc-monorepo-migration-release](C001-hypodoc-monorepo-migration-release/CYCLE.md) | 完成 HypoDoc 的可恢复迁移、产品整理与首轮发布 | completed | HypoDoc `v0.1.0` 已发布（GitHub Release 全资产 + GitLab mirror）；CI 全绿；Cycle Summary 见 `SUMMARY.md` |
