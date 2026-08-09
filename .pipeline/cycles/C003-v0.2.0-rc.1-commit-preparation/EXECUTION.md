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

## 2026-08-09 - M2 完成，M3 开始

- **workflow:** `7ee90a2` 归档 C002 accepted delivery，并记录 C003 commit preparation。
- **版本决定：** JavaScript/Desktop/VS Code 统一为 `0.2.0-rc.1`；Python distribution 使用
  PEP 440 等价 `0.2.0rc1`。
- **历史证据：** 不改写 `Docs/release/manifest.json` 的 v0.1.0 artifact/source hashes；新增独立
  `Docs/release/v0.2.0-rc.1.md`，明确 local candidate 与 stable 前置验证。
- **下一步：** 刷新 lock、核对版本与 staged scope，创建第八条 release commit。

## 2026-08-09 - M3 完成，M4 开始

- **版本：** 7 个 JavaScript workspace manifests 均为 `0.2.0-rc.1`；`uv lock` 将 Hypo-LaTeX
  distribution 从 `0.1.0` 更新为 `0.2.0rc1`，installed metadata 同步返回 `0.2.0rc1`。
- **清单：** VSCE `ls --no-dependencies` 通过并列出 187 个 package files；默认 `vsce ls` 的
  `npm list` 不理解 pnpm `workspace:*`，其依赖树告警不作为版本失败。
- **验证：** workspace typecheck 与 34 JS/TS tests passed；Desktop 和 VS Code production builds
  passed；Desktop 的现有 large-chunk warning 保持在 C002 accepted performance gates 内。
- **staged scope：** 7 个 JS manifests、Python project/lock、独立 RC note 与 C003 进度记录；
  `Docs/release/manifest.json` 保持 v0.1.0 历史内容。
- **下一步：** 创建第八条 commit，核对本地 history、clean status 与 no-remote boundary，关闭 C003。

## 2026-08-09 - M4 完成，C003 关闭

- **commit series:** 相对 `d2fcab0` 恰好 8 条；model、web、Desktop、LaTeX、Skill、evidence、
  workflow、release ownership 清楚，最终 release commit 以闭环 amend 后的 HEAD 为准。
- **版本审计：** 7 个 JS manifests 均为 `0.2.0-rc.1`；Python project/lock/installed metadata 均为
  `0.2.0rc1`；历史 v0.1.0 manifest 未改写。
- **最终验证：** workspace typecheck、34 JS/TS tests、pinned Pandoc full suite `269 passed,
  12 skipped`、Desktop/VS Code production builds、VSCE file list、JSON/Python compile、staged/path/
  history audit 与 `git diff --check` 全通过。
- **远端边界：** `main` 相对 `origin/main` ahead 8；HEAD 无 tag；未 push、未创建 Release、未发布。
- **结果：** M1-M4 全部完成，无阻塞，C003 closed；后续远端 CI/tag/release 需新的明确授权。
