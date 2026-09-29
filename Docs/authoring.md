# 写作指南

先用 `hypolatex init` 创建源文件，再替换成自己的内容；也可以[查看内置模板](../Renderers/LaTeX/src/hypolatex/resources/starters)。以下写法用于正文共享；主题、封面和紧凑排版在 PDF 与预览中可以有不同表现。

## 文档类型和主题

```yaml
---
title: 我的技术说明
profile: article
theme: tech-minimal
---
```

| 类型 | `profile` | 可用主题 |
| --- | --- | --- |
| 长文 | `book` | `plain`、`classic-readable`、`tech-minimal`、`warm-handbook`、`academic-clean` |
| 报告、题目、速查表 | `article` | 同上 |
| Slides | `beamer` | 推荐 `school`、`simple`、`nature`；旧 plain / minimal / shanghaitech / glass 继续兼容 |

PDF 文档另提供两个场景主题：`course-notes`（课程笔记）和 `professional-doc`（正式文档），均支持 `book` / `article`。它们统一中英文衬线字体、数学字体与页眉页脚，默认使用更宽松的 Box 和矢量封面；不要求 Web 预览呈现相同版式。

```sh
hypolatex init notes.md --template notes
hypolatex init report.md --template report
```

详细配置和设计边界见 [文档排版](../Renderers/LaTeX/docs/document-design.md)。

普通文档只需选类型和主题，不必设置字体、封面、色值。旧 `document_type` / `documentclass` 仅用于兼容已有文件，新文档用 `profile`，不要混写。

**短文直接用 `profile: article`**：默认首页标题／摘要与正文连续排版，不插入独立封面或目录。`init --template article` 创建短文，旧项目任务模板改用 `--template project`。`title_layout: cover` 可显式恢复整页封面，`toc: true` 可开启目录。Book 仍默认保留封面和目录。文档字体默认采用 Pagella＋Pagella Math＋Noto Serif CJK。

## 正文与提示块

常规标题、段落、列表、代码围栏、公式和 Markdown 表格可以直接使用。提示块使用显式的带花括号语法：

```markdown
::: {.note title="注意"}
这里是需要提醒读者的内容。
:::
```

常用块包括 `note`、`tip`、`warning`、`summary`、`objective`、`info`、`task`、`requirement`、`deliverable`、`checklist`、`rubric`。不要用未定义块名代替普通标题。

受控表格需要稳定标识：

```markdown
::: {.table #options kind="comparison" caption="方案比较"}
| 方案 | 特点 |
| --- | --- |
| 简短说明 | 快速阅读 |
| 完整报告 | 充分展开 |
:::
```

简单表格无需外层 `.table`。专用列宽、复杂密度或跨页设置见 [LaTeX 表格说明](../Renderers/LaTeX/docs/c3-authoring.md)，不要把这些扩展默认用于共享模板。

## 复习题与答案

`qa` 需要 `#标识` 和 `kind="open"`；`hint`、`answer`、`solution` 放在其中。嵌套使用不同长度围栏：

```markdown
:::: {.qa #question-one kind="open" title="练习"}
::: {.question}
这道题要回答什么？
:::
::: {.answer}
这里是答案。
:::
::::
```

默认 `answer_mode: student` 隐藏答案与解析。构建带答案版时：

```sh
uv run --project Renderers/LaTeX hypolatex build Renderers/LaTeX/src/hypolatex/resources/starters/review.md --answer-mode review --output build/review.pdf
```

`teacher` 也显示答案。CLI 参数优先于 frontmatter。

PDF 后端也支持 `kind="single-choice"` / `kind="multiple-choice"`：在 `.qa` 内使用 `.choices` 包住带 `#标识` 的 `.choice`，在 `.answer choices="选项ID"` 中指定答案（多选用逗号分隔）。输出按 A、B、C 排列；答案引用不存在的选项或单选题选中多项会报错，不静默忽略。完整例子见[文档排版](../Renderers/LaTeX/docs/document-design.md)。

## 图片

目录可以这样组织：

```text
my-document/
  document.md
  assets/
    diagram.png
```

在正文引用 `![流程图](assets/diagram.png)`。图片必须实际存在；不自动下载远程图片，不使用绝对路径或 `..` 越界。PNG / JPEG 是最直接的选择。进一步的图号与布局见 [图片说明](../Renderers/LaTeX/docs/figures.md)。

## Slides

使用 `hypolatex init slides.md --template slides --theme school` 开始。School 的 `school_cover` 可选 standard、diagonal；Simple 是简约细线，Nature 是摄影封面与浅几何正文。

`font_preset: preferred` 优先本机首选字体，缺少时明确后备；`portable` 使用开放的 TeX 字体。构建不需要克隆上游主题或安装商业字体。

从 [beamer.md](../Renderers/LaTeX/src/hypolatex/resources/starters/beamer.md) 开始：

- `#` 是章节，`##` 是子章节，`###` 是一页内容的标题。
- 默认模板关闭章节分隔页，生成标题页和三页内容。
- 单独一行 `---` 可继续新的一页；新观点更推荐用新的 `###`。
- 一页保留一个主要观点，避免长段落和超宽表格。
- 导出是 Beamer PDF，不是 `.pptx`。`build --json` 返回真实编译警告，`--strict` 在溢出/缺字时失败；仍需检查实际页面。

详见 [Slides 参考](../Skills/LaTeX/references/slides.md)。

## LaTeX 专用能力

速查表模板使用 `layout: cheatsheet` 获得紧凑 PDF，但正文仍是共享写法。`cheatsheet-grid` / `cheatsheet-cell` 多栏扩展、精确图片位置、复杂封面及高级字体覆盖不属于默认跨端模板；确实需要时再查 [LaTeX 详细指南](../Renderers/LaTeX/docs/user-guide.md)，并接受查看端可能不支持。
