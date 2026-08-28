---
kind: plan
cycle: C004-v0.2.0-stable-release
mode: goal
status: completed
updated: 2026-08-28
progress: PROGRESS.md
execution: EXECUTION.md
---

# HypoDoc v0.2.0 稳定版发布 Plan

| ID | 阶段 | 期望结果 | 验证方式 |
| --- | --- | --- | --- |
| `M1` | 稳定化本地候选 | 产品与 Hypo-LaTeX 为 `0.2.0`，Spec 独立版本不变；完整本地验证通过并提交 | version audit、`scripts/validate-all.sh`、Git diff/status/log |
| `M2` | 推送与远端 CI | 最终候选推送至 GitHub `main`，普通 CI 四个 jobs 全绿 | remote SHA、`gh run watch`、job logs |
| `M3` | 跨平台发行构建 | 手动 Build Hosts 在同一 commit 产出 Linux/Windows/macOS/VSIX 资产 | workflow conclusion、artifact inventory、文件类型/非空检查 |
| `M4` | 发布稳定版 | SHA-256 清单完成；`v0.2.0` tag 和公开 GitHub Release 指向候选 commit | tag/release API、checksums、下载资产核对 |
| `M5` | 同步与归档 | GitLab mirror 同步 main/tag，发布状态和已知限制记录完整 | `ls-remote`、Release URL、Cycle Summary |
