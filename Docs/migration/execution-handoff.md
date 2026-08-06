# HypoDoc M2-M4 执行交接

当前 Cycle：`C001-hypodoc-monorepo-migration-release`

当前位置：`M2`，准备导入和整理 TypeScript 产品。`M1` 与 `S1` 已完成；下一个人工审阅点
是 `S2`。本文件面向接手执行的 V4 Flash 或等价主模型。

## 开始前读取

按顺序读取：

1. `.pipeline/INDEX.md`
2. `.pipeline/cycles/C001-hypodoc-monorepo-migration-release/PLAN.md`
3. `.pipeline/cycles/C001-hypodoc-monorepo-migration-release/PROGRESS.md`
4. `.pipeline/cycles/C001-hypodoc-monorepo-migration-release/EXECUTION.md`
5. `.pipeline/cycles/C001-hypodoc-monorepo-migration-release/DISCUSSION-SUMMARY.md`
6. `Docs/migration/decisions.md`
7. `Docs/migration/source-inventory.md`
8. `Docs/migration/import-design.md`

以用户最新消息和这些当前文件为准，不恢复已被 supersede 的“合并旧仓 Git 历史”或
“到 RC 再选择产品版本”方案。

## 已固定决策

- 这是业务整合，允许重写不完善的来源内容。
- 新仓建立干净产品历史，不合并旧仓 commit DAG。
- 来源仓、SHA、tag 与 patch 作为 provenance 保留。
- 首个整合产品版本是 `v0.1.0`；Spec 独立版本化。
- 第一方代码采用 MIT，根 `LICENSE` 已建立。
- S2 前不 push、不发布、不上传 Marketplace、不删除旧仓。

## 来源

- TypeScript：`../Hypo-Markdown`，锚点 `e4e7148494bed527e050867616d643353a6641d8`
- LaTeX：`../Hypo-LaTeX`，锚点 `b1ef2c7335e969f332aafb38c766ff9cbb46b182`
- Spec：`../HypoDoc-Spec`，基线 `1866c357fdcfef88f6435860e092f7897f47fbb9`
- 两处 dirty 内容的 safety ref、patch 和 SHA-256 见 source inventory；不得清理来源工作树。

## 执行要求

- 按 `M2 → M3 → M4` 连续推进，每个有意义 checkpoint 后同步 Progress 与 Execution。
- 每个迁移 commit 描述新产品中的真实业务结果，不使用“保留旧历史”的伪合并。
- 先检查再修改；来源实现与业务目标或 Spec 冲突时，明确记录取舍和验证证据。
- 不把 `.pipeline/runtime`、`.pipeline/local`、`.venv`、`node_modules`、build 或 release 输出迁入。
- 保持 portable TypeScript runtime 不依赖 Python/Pandoc；Python/Pandoc 只作为固定参考 oracle。
- 到达 `S2` 后将其标记为 `waiting-review`，展示 RC、验证报告、剩余风险和发布治理问题并停止。

## 验证基线

- TypeScript：`pnpm test`、`pnpm typecheck`、`pnpm build`、`pnpm conformance:portable`、`pnpm perf`
- Spec：固定 Pandoc 3.10 后运行 `uv run python -m pytest -q` 与 `uv run hypodoc registry check`
- LaTeX：`uv run hypolatex doctor`、`uv run python -m pytest -q tests`、代表性 TeX/PDF 构建和 PDF 证据检查
- Host：Desktop smoke、VSIX package；未实际运行的平台不得标为通过

## 必须停下的情况

- 需要清理或覆盖来源 dirty 内容。
- 需要改变 `v0.1.0`、MIT、Spec 独立边界或干净产品历史策略。
- 需要 push、创建远端、tag、Release、Marketplace 上传或其他公开副作用。
- 无法让 Plan/Progress 保持一致，或验证失败且原因不能被可靠定位。
