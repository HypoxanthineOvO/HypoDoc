---
kind: cycle
name: C004-v0.2.0-stable-release
status: closed
started: 2026-08-28
closed: 2026-08-28
updated: 2026-08-28
builds_on:
  - C003-v0.2.0-rc.1-commit-preparation
plan: PLAN.md
progress: PROGRESS.md
execution: EXECUTION.md
summary: SUMMARY.md
---

# HypoDoc v0.2.0 稳定版发布

## 本轮目的

将 C003 已完成的本地 `v0.2.0-rc.1` 候选稳定化为 `v0.2.0`，在同一最终源码提交上完成
本地验证、GitHub CI、Linux/Windows/macOS/VSIX 打包、校验和、tag、GitHub Release 与 mirror 同步。

## 执行边界

- 产品 JavaScript/Desktop/VS Code 与 Hypo-LaTeX distribution 升为 `0.2.0`。
- HypoDoc Spec 保持独立版本 `0.2.0-rc.1`，不改写其子模块历史或 IR 合同。
- 安装器保持 unsigned，macOS 不做 notarization；不发布 VS Code Marketplace 或 Python registry。
- 任一验证或打包失败时停止 tag/Release，先在未打 tag 的提交上修复并重跑。

## 验证目标

- 本地完整验证通过，版本与 release note 一致，工作树和提交可审阅。
- GitHub CI 四个 jobs 全绿，Build Hosts 三平台与 VSIX jobs 全绿。
- 所有发行资产来自同一 commit，非空且有 SHA-256；Release 与 tag 指向该 commit。
- GitHub canonical 与 GitLab mirror 的 `main` 和 `v0.2.0` 一致。
