---
kind: discussion-summary
cycle: C003-v0.2.0-rc.1-commit-preparation
updated: 2026-08-09
---

# HypoDoc v0.2.0-rc.1 原子提交准备讨论摘要

- C002 已接受并关闭，但用户要求准备提交，不希望一次性提交全部改动。
- 版本判定为 minor RC：新增 slides/放映、Desktop workflows、LaTeX contract 与 Skill，超过 patch；
  尚未跑新版本远端 CI/跨平台安装器，因此先用 `v0.2.0-rc.1` 而不是稳定 `v0.2.0`。
- 用户确认采用同一个 RC 下的多条原子 commit，而不是拆成多个发布版本。
- 不推送、不发布；最终本地 history 和版本元数据完成后关闭本 Cycle。
