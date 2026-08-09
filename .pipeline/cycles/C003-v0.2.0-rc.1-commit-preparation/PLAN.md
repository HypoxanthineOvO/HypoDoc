---
kind: plan
cycle: C003-v0.2.0-rc.1-commit-preparation
mode: goal
status: active
updated: 2026-08-09
progress: PROGRESS.md
execution: EXECUTION.md
---

# HypoDoc v0.2.0-rc.1 原子提交准备 Plan

| ID | 阶段 | 期望结果 | 验证方式 |
| --- | --- | --- | --- |
| `M1` | 审计提交输入 | 所有 tracked/untracked 改动按真实 ownership 分组；临时与重复产物不进入提交 | `git status --short --untracked-files=all`、文件体积/类型审计、ignore 检查 |
| `M2` | 创建功能提交序列 | 依次创建 render-model、render-web、Desktop、LaTeX、Skill、performance/evidence、workflow 七条原子提交 | 每次提交前检查 `git diff --cached --stat` 与 staged paths；提交后记录 SHA |
| `M3` | 准备 RC 版本 | JS/Desktop/VS Code 为 `0.2.0-rc.1`，Python 为 `0.2.0rc1`；RC 元数据不篡改 v0.1.0 历史资产 | version grep、lock refresh、package/Skill targeted tests |
| `M4` | 验证并收尾 | 八条 commit 顺序清楚，工作树干净，本地验证通过，C003 关闭且无远端副作用 | `git log`、`git status`、typecheck/tests、version audit、no tag/push/release check |

## 目标提交序列

1. `feat(render-model): add SlideDeck projection`
2. `feat(render-web): add fixed-canvas slide rendering`
3. `feat(desktop): add presentation and document workflows`
4. `fix(latex): harden configuration themes and resources`
5. `feat(skill): restructure HypoDoc authoring workflow`
6. `perf(test): add rendering benchmarks and evidence`
7. `docs(workflow): archive C002 delivery`
8. `chore(release): prepare v0.2.0-rc.1`
