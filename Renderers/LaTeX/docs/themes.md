# Hypo-LaTeX 主题

Hypo-LaTeX 采用以主题为中心的写作方式。普通 AI 生成或维护的文档，frontmatter 里通常只需要写 `theme:`，字体、颜色、封面和语义块样式由主题负责。

## 最小主题配置

```yaml
---
title: Example Document
author: Example Author
theme: classic-readable
---
```

只有当文档有明确的成品约束时，才应该使用字体、纸张、强调色、封面或资源目录等额外字段。不要因为字段存在，就在普通草稿里默认写一堆样式覆盖项。

## 公开主题预设

### `school`（推荐上科大主题，0.3.0+）

使用 `profile: beamer`、`theme: school`。封面参数为 `school_cover: standard`（圆角色块、右上角小校标）或 `diagonal`（斜切色块）。学校标识随包提供，不需要手动配置图片路径。导航、内容块、多作者和页脚排版见 [School 说明](../../../Examples/ThemeComparison/README.md)。

另外提供 `simple`、`nature` 两个正式 Slides 主题，使用相同的正文转换与字体后备。用 `hypolatex themes` 查看安装版本实际支持的主题。下述 `shanghaitech` 为旧兼容主题，封面参数不与 `school` 混用。

### `plain`

基础兼容主题，适合调试、最小文档和渲染器测试。需要尽量排除视觉样式干扰时使用它。

`plain` 也提供 Beamer theme adapter。Beamer deck 使用 canonical `profile: beamer`（旧 `document_type`/`slides`/`presentation` 为读入别名），H1 section、H2 subsection、H3 frame title，`---` 作为 frame separator/new frame。`frame_title_inheritance_limit` default `3`，`continued_title_style` 支持 `subtle`、`suffix`、`none`，并可配合 `section_dividers`、`subsection_dividers` 和 `strict_structure`。H2 without H1 invalid。Slide semantic blocks 包括 `objective`、`info`、`task`、`requirement`、`deliverable`、`checklist`、`rubric`、`question`、`hint`、`answer`、`solution`；density/overfull lint 是 limited heuristic，不是布局保证。local asset 使用相对路径或 local `resource-root`/`resource_root`，remote asset 不会 fetch。

### `shanghaitech`（Beamer 专用）

上海科技大学校园演示主题，仅用于 `profile: beamer`，暂无长文变体。主色为校徽红 `#8B0000`（`palette` 在该主题下不生效）。封面通过 `cover_layout` 可选三式：`cover-e`（默认，右侧通高斜边红色块 + 左上红色方块校徽 + 主色标题 + 块内白色横版 logo + 左下作者区）、`cover-b`（圆角通栏红带 + 白色标题 + 下方居中作者区）、`cover-c`（顶部白条校徽校名 + 全宽红带标题/作者 + 底部校训，`motto` 可覆盖默认校训）。章节页为浅底红色悬浮卡。可选 frontmatter 图片键：`logo`（方形校徽）、`logonegative`（红底白形校徽）、`logolong`（横版校名 logo，用于色块内需白色/浅色版；图片背景必须透明）。作者列表支持多人（frontmatter `author` 列表），封面逐行显示，脚部以逗号分隔。

### `minimal`（Beamer 专用）

瑞士扁平极简主题，仅用于 `profile: beamer`。黑白灰纪律：白底、墨色衬线标题、细分隔线、无圆角无阴影，palette 仅残留在列表标记和块标签上。

### `glass`（Beamer 专用）

浅色现代渐变玻璃拟态主题，仅用于 `profile: beamer`。accent 色轻渐变画布（`palette` 联动换色：red 玫瑰 / blue 靛蓝 / yellow 琥珀 / gray 石板 / mono 中性灰），角落有淡化光斑；帧头为悬浮半透明玻璃条（真透明填充），语义块为圆角玻璃卡；文字为衬线（Noto Serif CJK + TeX Gyre Termes）。封面为顶部小型玻璃卡（标题/副标题），作者信息置于卡下画布上。

### `classic-readable`

长文默认选择，适合教程、书籍感资料和一般 PDF 输出。它优先保证中文排版稳定、正文可读和纸面阅读舒适度。

适合：

- 长文教程
- 解释型书稿
- 文章合集
- 需要人工审阅的正文草稿

### `tech-minimal`

克制的技术主题，适合模型评测、工程指南、榜单、表格和技术报告。它会保持页面安静，同时给密集信息更清晰的结构。

适合：

- 模型评测笔记
- 技术教程
- 对比表格
- 榜单式资料

### `warm-handbook`

更亲和的手册主题，适合课程笔记、解释型材料和不希望过于正式的学习资料。

适合：

- 学习手册
- 课程讲义
- 复习资料
- 分步骤讲解

### `academic-clean`

正式、克制的学术主题，适合研究风格报告、正式笔记和考试复习资料。

适合：

- 研究笔记
- 正式阅读材料
- 学术风格报告
- 考试复习文档

## 高级覆盖项

高级覆盖项用于微调一个已经选好的主题，不应该替代以 `theme:` 为核心的普通写作方式。

字体字段示例：

```yaml
mainfont: Sarasa Gothic SC
sansfont: MiSans
monofont: LXGW WenKai Mono
cjkfont: Sarasa Gothic SC
```

纸张和强调色字段示例：

```yaml
paper: a4
accent: "#2F5F8F"
```

封面字段示例：

```yaml
cover_layout: full-bleed-card
cover_image: assets/cover.png
```

资源目录字段示例：

```yaml
resource-root: assets
```

当前中文字体的角色分配见 `docs/fonts.md`。封面布局的可用值见 `docs/cover-layouts.md`。

## CLI 覆盖主题

构建时可以用 CLI 临时覆盖 frontmatter 里的主题：

```bash
uv run hypolatex build input.md --theme tech-minimal --output build/output.pdf
```

提交到仓库的正式文档源文件，建议优先在 frontmatter 里写 `theme:`。这样源文件本身就能说明自己的渲染意图。
