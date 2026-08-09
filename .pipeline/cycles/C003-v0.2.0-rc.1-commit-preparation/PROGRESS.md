---
kind: progress
cycle: C003-v0.2.0-rc.1-commit-preparation
plan: PLAN.md
status: active
updated: 2026-08-09
current: M2
next: 提交 workflow 记录并进入 RC 版本准备
---

# HypoDoc v0.2.0-rc.1 原子提交准备进度

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 审计提交输入 | `completed` | 已核对 tracked/untracked 路径、体积与引用；保留约 2.2 MB visual baseline 和自包含 eval review；重复 eval PDF/PNG 已清理并窄范围 ignore | 无 |
| `M2` | 创建功能提交序列 | `in_progress` | 前六条原子 commit 已创建并验证；workflow 记录正在作为第七条提交 | 提交 workflow，进入版本准备 |
| `M3` | 准备 RC 版本 | `pending` | 当前所有 product package 仍为 0.1.0 | 最后一条 version commit |
| `M4` | 验证并收尾 | `pending` | 等待 commit series | history/status/tests/no-remote audit |

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
