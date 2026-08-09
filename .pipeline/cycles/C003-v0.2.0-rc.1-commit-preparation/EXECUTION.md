---
kind: execution-log
cycle: C003-v0.2.0-rc.1-commit-preparation
updated: 2026-08-09
---

# HypoDoc v0.2.0-rc.1 原子提交准备执行记录

## 2026-08-09 - C003 创建，M1 开始

- **决定：** 用户选择“一个 RC，多条原子提交”，最终目标为 `v0.2.0-rc.1`。
- **提交策略：** 七条按子系统/证据分组的 commit，最后单独版本提交；保持依赖顺序。
- **边界：** 本地 commit only；不 push/tag/release；不改变 C002 已接受行为。
- **下一步：** 审计 untracked evidence、文件体积与 ignore，确定每条 commit 的 path ownership。

## 2026-08-09 - M1 完成，M2 开始

- **artifact 审计：** `reports/visual-baseline` 约 2.2 MB，均为 C002 审计/矩阵引用的版本化证据，保留；
  `Skills/LaTeX-workspace/iteration-1/review.html` 自包含 Markdown、PDF 与 image data，保留作为 eval 审阅器。
- **清理：** 删除 Skill eval outputs 下被 review HTML 重复嵌入的 PDF/PNG，并为该目录增加窄范围 ignore；
  不影响 reports 下正式 visual baseline/canonical PDF。
- **ownership：** model（含 immutable projection）→ web/VS Code → Desktop → LaTeX → Skill/evals →
  performance/evidence → workflow → version metadata。
- **提交纪律：** 每次使用明确 pathspec 暂存，并在 commit 前检查 staged paths 与 stat。

## 2026-08-09 - M2 前六条原子提交完成

- **render-model:** `c99d7ab`；7 targeted tests passed。
- **render-web/VS Code:** `b7b109c`；3 renderer tests passed，VS Code typecheck passed。
- **Desktop:** `a6f9caa`；4 tests 与 typecheck passed。
- **LaTeX:** `2fd48f6`；pinned Pandoc 3.10 下 `269 passed, 12 skipped`；系统 Pandoc 3.1.3
  按合同 fail-fast，未误判为代码回归。
- **Skill/evals:** `9cd9d48`；JSON parse 与 grading script compile passed；eval evidence 的本机绝对
  repo path 已归一为 `${REPO_ROOT}`，重复 PDF/PNG 未提交。
- **performance/evidence:** `1cb6dc7`；reports JSON parse、Playwright Python compile 与 staged
  whitespace check passed；保留被审计引用的 46 份 visual evidence。
- **下一步：** 提交 C002/C003 workflow 记录，随后统一更新 RC 版本元数据。
