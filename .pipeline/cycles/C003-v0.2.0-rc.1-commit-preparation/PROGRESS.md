---
kind: progress
cycle: C003-v0.2.0-rc.1-commit-preparation
plan: PLAN.md
status: completed
updated: 2026-08-09
current: M4
next: Cycle 已关闭；远端 CI、tag 与发布需另行授权
---

# HypoDoc v0.2.0-rc.1 原子提交准备进度

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 审计提交输入 | `completed` | 已核对 tracked/untracked 路径、体积与引用；保留约 2.2 MB visual baseline 和自包含 eval review；重复 eval PDF/PNG 已清理并窄范围 ignore | 无 |
| `M2` | 创建功能提交序列 | `completed` | 七条原子 commit 已按依赖顺序创建；workflow commit 为 `7ee90a2` | 无 |
| `M3` | 准备 RC 版本 | `completed` | JS/TS packages 均为 `0.2.0-rc.1`；Python installed metadata/lock 均为 `0.2.0rc1`；历史 v0.1.0 manifest 不变；RC note 已添加 | 无 |
| `M4` | 验证并收尾 | `completed` | 恰好 8 条 commit；branch ahead 8；版本、commit paths、diff check、clean status、no-tag/no-push 均通过；C003 已关闭 | 无 |

## 阻塞

- 无；用户已授权本地提交与 `v0.2.0-rc.1` 方案。

## 已创建提交

| 顺序 | SHA | 提交 |
| --- | --- | --- |
| 1 | `c99d7ab` | `feat(render-model): add SlideDeck projection` |
| 2 | `b7b109c` | `feat(render-web): add fixed-canvas slide rendering` |
| 3 | `a6f9caa` | `feat(desktop): add presentation and document workflows` |
| 4 | `2fd48f6` | `fix(latex): harden configuration themes and resources` |
| 5 | `9cd9d48` | `feat(skill): restructure HypoDoc authoring workflow` |
| 6 | `1cb6dc7` | `perf(test): add rendering benchmarks and evidence` |
| 7 | `7ee90a2` | `docs(workflow): archive C002 delivery` |
| 8 | `HEAD` | `chore(release): prepare v0.2.0-rc.1`（闭环记录 amend 后以最终 HEAD 为准） |
