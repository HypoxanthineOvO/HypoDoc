---
kind: cycle
name: C003-v0.2.0-rc.1-commit-preparation
status: closed
started: 2026-08-09
closed: 2026-08-09
updated: 2026-08-09
builds_on:
  - C002-hypodoc-rendering-quality-performance
plan: PLAN.md
progress: PROGRESS.md
execution: EXECUTION.md
summary: SUMMARY.md
---

# HypoDoc v0.2.0-rc.1 原子提交准备

## 本轮目的

把 C002 已接受、已验证的本地改动整理为按依赖顺序排列的原子 commit series，并在最后一个
提交统一准备 `v0.2.0-rc.1` 版本元数据。

## 执行边界

- 不改变 C002 已接受的产品行为，只允许提交分组、必要的版本字段/RC 说明与验证修复。
- JavaScript/Desktop/VS Code 使用 `0.2.0-rc.1`；Python distribution 使用 PEP 440 等价
  `0.2.0rc1`。
- 仅创建本地 commit；不 push、不 tag、不创建 Release、不上传资产。
- 不把临时缓存、重复中间图片、build/release 目录或敏感配置加入 Git。

## 验证目标

每个 staged commit 的文件范围与主题一致；最终版本字段一致、工作树干净、提交顺序可审阅，
并复用/重跑与版本元数据相关的最小必要验证。
