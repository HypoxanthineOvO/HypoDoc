---
name: hypodoc-authoring
description: Write renderer-neutral HypoDoc Markdown for shared Web/Desktop preview and LaTeX/PDF content, including semantic blocks, tables and review questions.
---

# HypoDoc 共享正文

在仓库中先读 `Docs/authoring.md`，用 `hypolatex init` 创建适合的源文件。构建 PDF 时使用 `Skills/LaTeX/SKILL.md`；模板随 Python 包分发。

- 新文档使用 `profile: book`、`article` 或 `beamer`。
- 指令写成 `::: {.note title="说明"}`，不用简写 `:::note`。
- 复习题容器需要标识和类型，例如 `:::: {.qa #q1 kind="open"}`；question、hint、answer、solution 放在容器内，子块用三冒号围栏。
- `answer_mode: student` 隐藏答案；review / teacher 显示，CLI 覆盖源文件设置。
- 简单表格直接使用 Markdown；受控表格用 `::: {.table #table-id kind="comparison" caption="比较"}`。
- 图片用真实存在的相对路径，不在共享指令上添加仅 LaTeX 支持的属性。
- 不把高级 LaTeX 布局扩展当作跨端保证。需要多栏或精确位置时先说明兼容范围。

共享语义规范位于独立的 `Spec/` 子模块；普通写作无需安装其参考工具链。预览与 PDF 可以采用不同字体和排版，但不应改变正文含义或答案可见性。
