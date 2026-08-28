---
kind: progress
cycle: C004-v0.2.0-stable-release
plan: PLAN.md
status: completed
updated: 2026-08-28
current: M5
next: Cycle 已关闭；后续功能开发另建 Cycle
---

# HypoDoc v0.2.0 稳定版发布进度

| ID | 阶段 | 状态 | 当前结果 / 证据 | 下一步 |
| --- | --- | --- | --- | --- |
| `M1` | 稳定化本地候选 | `completed` | 产品/Hypo-LaTeX 已为 `0.2.0`；Spec 保持独立 RC；showcase 缺失资源以 `182ff9b` 修复；`scripts/validate-all.sh` 最终完整通过 | 无 |
| `M2` | 推送与远端 CI | `completed` | 最终候选 `3f84e76`；CI run `33161677765` 四组全绿；首次 browser 失败已修复并由新 run 验证 | 无 |
| `M3` | 跨平台发行构建 | `completed` | Build Hosts run `33162169706` 四 jobs 全绿；Linux/Windows/macOS arm64/VSIX artifacts 均来自 `3f84e76` | 无 |
| `M4` | 发布稳定版 | `completed` | 云端 publish run `33164168894` 26 秒完成；`v0.2.0` stable Release 含 8 个包和 CHECKSUMS | 无 |
| `M5` | 同步与归档 | `completed` | GitHub/GitLab main 均同步发布工具提交；两端 `v0.2.0` 均指向 `3f84e76`；C004 已归档 | 无 |

## 阻塞

- 无。
