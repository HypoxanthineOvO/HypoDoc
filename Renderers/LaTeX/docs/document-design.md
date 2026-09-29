# 文档与课程笔记排版

这组功能只用于 LaTeX/PDF，不改变 Web 或 Slides 的主题契约。已有模板继续保留；新场景使用显式主题，不强制迁移用户文档。

## 两个场景

| 主题 | 起步命令 | 默认封面 | 正文重点 |
| --- | --- | --- | --- |
| `course-notes` | `hypolatex init notes.md --template notes` | Book 默认 `notebook`；Article 默认首页标题区 | 连续解释、推导、例题；较舒展的行距 |
| `professional-doc` | `hypolatex init report.md --template report` | Article 默认首页标题区；Book 默认 `editorial` | 背景、方案、约束、证据；较克制的行距 |

两者均支持 `profile: book` / `article`。主题不是内容生成器：普通章节不自动变成 Box，图形封面中的线条与柱形仅为装饰，不表达数据。

## Article 不是缩小的 Book

`profile: article` 默认把标题、副标题、作者、日期与摘要排在正文第一页，关闭独立封面和目录。正文采用单栏连续排版、较克制的节标题、首尾约 24–26mm 的页边距，第一页不重复显示页眉；续页用短标题与页码帮助定位。没有摘要／作者时不会留下对应的占位块。

```sh
hypolatex init brief.md --template article
hypolatex build brief.md --strict
```

```yaml
title: 一份技术说明
subtitle: A Technical Note
profile: article
theme: professional-doc
article_label: 技术札记
short_title: 技术说明
abstract: 简短说明问题、方法与结论。
```

`article_label` 是可选的标题上方小标签；`short_title` 是可选的续页页眉。长标题自然换行，不自动缩小到不可读的字号。

短代码块会按行数预留页内空间，减少仅剩一行被切到下一页的情况；长代码仍允许跨页。预留是基于源码行数的估计，特别长的自动折行仍需检查 PDF。

| 配置 | Article 默认 | Book 默认 |
| --- | --- | --- |
| `title_layout` | `inline`：首页标题区 | `cover`：独立封面 |
| `toc` | `false` | `true` |
| 一级标题 | 节 | 章 |
| 分页 | 连续流，不为每节新开一页 | 章节起新页 |

`title_layout` 可选 `inline` / `cover` / `none`。`cover: true` 是开启独立封面的兼容写法；`cover: false` 在 Article 中仍显示首页标题区，在 Book 中不显示封面。要完全不生成标题区，用 `title_layout: none`。两个字段冲突时会报错。

Article 显式设置 `toc: true` 时，目录与正文连续排版，不强制独占一页。旧 Article 若希望保留“整页封面＋目录”，请显式设置 `title_layout: cover` 和 `toc: true`。速查表仍走自己的紧凑布局。

新的 `article` 起步模板使用普通叙述、公式与小表格。旧项目任务模板仍可通过 `--template project` 创建；`report` 也是 Article，不默认生成额外封面。

可复现样张在 `examples/document-design/`：`article-note.md`（单页课程札记）、`article-brief.md`（单页项目简报）、`article-review.md`（自然续排的多页技术说明）。

默认正文为 11pt。中英文正文、标题与页眉页脚保持衬线体系，通过字重、字号与留白区分层次。数学字体单独配置，代码保持等宽字体。Box 的左右内边距为 12pt、上下 10pt、标题上下 6pt、框前后 12pt；组合题卡的内部段落也保留间距。速查表仍有独立的紧凑布局。

## 字体与高级配置

```yaml
---
title: 我的课程笔记
subtitle: Course Notes
profile: book
theme: course-notes
course: 课程名称
author: 作者
date: 2026 秋
abstract: 一段简短的内容介绍。
# 以下均为可选覆盖，不必每次填写：
mainfont: TeX Gyre Pagella
cjkfont: Noto Serif CJK SC
mathfont: TeX Gyre Pagella Math
monofont: Cascadia Mono
accent: "#286759"
paper: a4
fontsize: 11pt
line_stretch: 1.12
box_density: comfortable
cover: true
toc: true
number_headings: true
---
```

- `mainfont` / `cjkfont`：拉丁正文／中文正文；默认标题与页眉页脚继承。
- `titlefont` / `cjktitlefont`：仅覆盖拉丁／中文标题字体。
- `sansfont`：显式无衬线内容使用的拉丁字体，不会把标题强制切回无衬线。
- `monofont`：拉丁代码字体；中文代码仍使用独立的 CJK 等宽后备。
- `mathfont`：必须是可用于 `unicode-math` 的 OpenType 数学字体。
- 字体字段仅接受字体名称，不接受 TeX 代码、路径或 fontspec 选项。显式字体不存在时构建失败，不悄悄替换。省略字段时才使用后备。
- `paper`：`a4` / `letter`；`build --paper` 优先于 YAML，`convert` 也保留纸张配置。
- `fontsize`：`10pt` / `11pt` / `12pt`；`line_stretch`：1.0–1.6。
- `box_density`：`compact` / `normal` / `comfortable`。它控制框的留白，不缩小正文。
- `cover` / `toc`：布尔开关；默认值由文档类型决定，见上表。书籍目录使用罗马页码，正文重新从 1 编号；默认单面、不为奇数页插入空白页。
- `number_headings: false` 允许手写编号；默认仍检查未标记的手写编号，避免重复。

这些默认字体是开放字体，不要求购买商业字体；构建不会自动安装字体。`font_preset` 是 Slides 配置，不用于这里的字体覆盖。

## 封面与资源

`notebook` / `editorial` 是新增矢量封面；旧的 `plain`、`paper-ink`、`info-panel`、`integrated-art`、`full-bleed-card`、`top-title-image` 仍可通过 `cover_layout` 选择。需要背景图时使用支持图片的旧布局并设置 `cover_image`。矢量封面不自动显示背景图片。

`cover_layout: artwork` 是为无文字背景设计的新布局，需要显式 `cover_image`：标题、副标题与署名／年份组合在浅色上部，下半部完整留给图像，避免把署名孤立地叠在插画上。三张 ImageGen 候选背景、排版源文件及完整提示词在 [候选目录](../examples/document-design/cover-candidates/README.md)。它们尚未成为默认主题素材；Article 要使用完整封面，需同时设置 `title_layout: cover`。所有封面文字由 LaTeX 排版，可选中、搜索，不烘焙进图片。

`resource-root: assets`（或兼容名 `resource_root`）可声明文档目录内的素材目录。引用 `plot.png` 时先在这里查找，再保留既有的源文件目录／父目录查找行为。显式资源根必须存在，不能用绝对路径、远程地址、`..` 或越界符号链接。

```markdown
::: {.figure #fig_error src="plot_error.png" caption="误差随步长变化" width="85%" placement="H"}
:::

::: {.ref target="fig_error"}
:::
```

`#ID` 和旧 `label` 均可用，同时写时必须相同。支持数字比例、百分比、像素和安全尺寸。图片路径允许下划线与空格；标识中的下划线不会作为正文转义。`.ref` 对图片、受控表格、带标识的题目分别显示图／表／题编号。缺失、隐藏、重复目标报错；尚不是任意章节或文献的通用引用系统。

## 单选与多选

```markdown
:::: {.qa #stability kind="single-choice" title="概念检查"}
::: {.question}
下面哪项描述稳定性？
:::
::::: {.choices}
::: {.choice #approximation}
离散方程逼近连续方程。
:::
::: {.choice #perturbation}
扰动的传播在指定条件下受到控制。
:::
:::::
::: {.answer choices="perturbation" title="参考答案"}
稳定性关心扰动传播；相容性关心离散近似。
:::
::::
```

多选改为 `kind="multiple-choice"`，答案写 `choices="a,b"`。选项按源文件顺序标为 A–Z。不存在的选项、重复选项、错误数量、空选项组会阻止转换。`student` 在生成 TeX 前移除答案和解析，`review` / `teacher` 保留。旧 LaTeX 专用、不带 `kind` 的组合题卡继续兼容。

## 验收与已有课程笔记

字体对照源文件在 `examples/document-design/font-sample.md`。同一正文应分别检查封面、目录、长段落、公式、跨页 Box、图片、表格与页眉页脚；`--strict` 仅检查日志，不代替视觉验收。

独立 `.tex` 文档若没有加载 `hypolatex`，不会因这些改动自动更新。需要单独迁移或接入样式包，不应覆盖原稿。已有 Markdown 中的原始 LaTeX 字体／标题命令仍可覆盖主题，也不会自动清除。
