---
kind: progress
cycle: C004-v0.2.0-stable-release
plan: PLAN.md
status: active
updated: 2026-08-28
current: M2
next: 提交并推送稳定候选，监督 GitHub CI
---

# HypoDoc v0.2.0 稳定版发布进度

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 稳定化本地候选 | `completed` | 产品/Hypo-LaTeX 已为 `0.2.0`；Spec 保持独立 RC；showcase 缺失资源以 `182ff9b` 修复；`scripts/validate-all.sh` 最终完整通过 | 无 |
| `M2` | 推送与远端 CI | `in_progress` | `cee4d9c` 已推送；首次 CI 三组通过、browser 发现 46px/48px 合同冲突与过时交互路径；本地修复 smoke 已全通过 | 提交修复、再次推送并监督 CI |
| `M3` | 跨平台发行构建 | `pending` | 未开始 | M2 通过后触发 Build Hosts |
| `M4` | 发布稳定版 | `pending` | 未创建 tag 或 Release | M3 通过后核验资产并发布 |
| `M5` | 同步与归档 | `pending` | 未开始 | 发布后同步 mirror 并归档 |

## 阻塞

- 无。
