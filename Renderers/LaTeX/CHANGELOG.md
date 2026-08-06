# Changelog

## v0.4.0

本版本为 Beamer 视觉系统专项版本：主题机制激活，新增 shanghaitech / minimal / glass 三个 Beamer 主题，目录与章节分隔页系统重做，数学与正文切换 Times/宋体系。仍为本地发布：release assets 只在本地生成和检查，尚未上传 CTAN 或 PyPI。

Beamer 视觉系统重设计（`tex/latex/hypolatex/hypolatex-beamer.sty`）：

- 头部：去掉整条实心色带帧标题，改为 muted 面包屑（section/subsection）+ 墨色粗体标题 + 短 accent 线段过渡为全宽细分隔线。
- 脚部：细分隔线 + muted 元信息（短标题 / 作者 / `n/total` 页码），`full`/`page`/`none` 三档语义不变；标题页不再显示脚部。
- 标题页与章节分隔页改为白底编辑式排版：accent kicker（organization/course）、大号墨色标题、accent 分隔线；分隔页带浅 tint 大章节号。
- 语义块改为无边框中性面板 + 左侧色条 + 同色标签：C3 块用 palette accent，`note`/`tip`/`warning`/`summary` 用各自角色色（slate/green/amber/blue），代码块用 muted 灰。
- 字体：Latin 正文 TeX Gyre Termes（Times 系），中文 Noto Serif CJK SC（标题用 Bold），代码 Noto Sans Mono（含 CJK 变体）；启用 `professionalfonts`，字体缺失时静默回退。数学一律使用 TeX Gyre Termes Math，缺失时回退 beamer serif 数学。
- 表格：受控 `.table` 的表头行渲染为 accent 色块（`main!82` 调淡）+ 白色粗体；新增 `rowheaders: true` 可将首列渲染为浅色块加粗（适合首列为行标签的对比表）。

新增 `minimal` 与 `glass` Beamer 主题（Beamer 专用，无长文变体）：

- `minimal`：瑞士扁平极简——白底、墨色衬线标题、细分隔线、平面灰块；palette 仅残留在列表标记和块标签。
- `glass`：浅色现代渐变玻璃拟态——accent 色轻渐变画布（palette 联动：red 玫瑰红 / blue 靛蓝 / yellow 琥珀 / gray 石板 / mono 中性灰），真半透明玻璃面板（tikz fill opacity），衬线（Noto Serif CJK + TeX Gyre Termes）；封面为顶部小型玻璃卡。
- 修复 CJK 正文/表格长期使用 sans 而非宋体的问题：`\CJKfamilydefault` 在 beamer 类加载时被冻结为 `\CJKsfdefault`，基础包现显式设为 `\CJKrmdefault`。
- 主题字体现在显式钉住（`family=` 写入 beamer 字体属性），并修复 `\familydefault` 变更后未 `\normalfont` 导致帧体继承错误字族的问题。
- Beamer 表格字号统一下调一档（`\small`）。
- 新增 `toc: true` 选项：标题页后自动插入目录页（`\tableofcontents`），无需手写目录；`toc_depth: 1|2` 控制粒度（1 = 只列 section）。
- 目录页设计：section 用编号圆球（accent 底白字），subsection 用 `1.1` 式编号（muted 小字），条目行距自适应撑满帧高；各主题有自己的整页版式（glass 为玻璃卡容器，shanghaitech 为左侧红色面板 + 校徽水印，minimal 为左刊头 + 右侧灰块卡）。目录内容超过单栏容量时自动按 1-4 / 5-16 分段双栏渲染，8 章节 × 2 子节的极端密度不再溢出。
- 章节分隔页与议程合并：不再单独占用议程页。minimal 为左刊头 + 右侧竖版迷你议程；shanghaitech 为左右分栏分隔卡（左：章节号 + 标题，右：卡内编号议程），当前章高亮、其余变淡；glass 分隔页为纯玻璃卡（章节号 + 标题 + 短线），不内嵌任何议程；长标题与多章节（8+）均实测不溢出。
- `spec/hypodoc` 子模块指针更新：README 新增渲染器仓库指引（Hypo-LaTeX 与 Hypo-Markdown）。
- 修复 frontmatter 中 `logo`/`logolong`/`logonegative`/`cover_image` 图片不被拷贝进构建目录的问题（此前仅正文 AST 中的图片会被发现，相对路径的封面图片会编译失败）。

`shanghaitech` 主题新增 `cover_layout` 三式封面（`cover-e` 默认 / `cover-b` 圆角通栏 / `cover-c` 三段式 + 校训，`motto` 可覆盖）与 `motto` 元数据键；logo 图片要求透明背景。
- 五个 palette（red/blue/yellow/gray/mono）的 accent 色值微调。
- 列表标记全局契约：一级实心圆点、二级空心圆点、三级实心方块，直径均为字高约三分之一。
- `theme` 在 Beamer 侧激活：`\HypoUseTheme` 按需加载 `hypolatex-beamer-<theme>.sty`，未命中时回退基础视觉。

新增 `shanghaitech` Beamer 主题（Beamer 专用，无长文变体）：

- 校徽红 `#8B0000`（取样自官方校徽）；`palette` 在该主题下不生效。
- Cover E 式封面（参照 Awesome Marp）：右侧通高斜边红色块、左上红色方块校徽（`logonegative`，缺省降级为白底描边方块 + `logo`）、主色标题/副标题、右下块内白色横版校名 logo（`logolong`，需浅色版）、左下作者/课程/日期区。
- 章节分隔页为浅底上的红色悬浮卡（投影 + 白色大章节号 + 白色标题）。
- 帧头为经典全宽色带（面包屑 + 白色粗体标题）；语义块为经典边框盒（彩色边框 + 标题带 + 浅色底，按角色着色）。
- 作者列表支持多人：封面逐行显示，脚部按逗号分隔（模板改用 `\author[short]{long}`）。

修复：

- `palette` / `footline` 元数据此前只做单层展开，`\ifstrequal` 比较的是未展开的条件记号，非默认取值（如 `palette: blue`、`footline: page`）会静默回退到 red/full；现经 `\edef` 展平后再应用，非默认 palette 与 footline 真正生效。
- `logo` 等路径型元数据此前经 pandoc 模板转义，含下划线的文件名会被破坏（如 `logo_RGB.png` 变成 `logoTU\textunderscore...`）；Lua 过滤器现将 `logo`/`logolong`/`logonegative` 以 raw LaTeX 原样注入模板。

## v0.3.0

本版本对应 Cycle C6「Beamer / AI-Friendly Slides DSL」，仍为本地发布：release assets 只在本地生成和检查，尚未上传 CTAN 或 PyPI。

新增：

- `document_type: beamer`：完整的 Beamer 幻灯片输出路径。`hypolatex build` 可直接把 HypoDoc Markdown 编译成 16:9 Beamer PDF，支持中文（XeLaTeX + ctex）。
- AI-Friendly Slides DSL：H1 = section，H2 = subsection，H3 = 帧标题，`---` = 帧分隔符，带继承计数与 `continued_title_style`（subtle / suffix / none）。`normalize_slides_markdown()` 公开 API；严格结构检查（`strict_structure`）、帧过满 lint、继承超限检查。
- `hypolatex-beamer.sty`：Beamer 宏包，包含 HypoBlockBox（tcolorbox，palette 派生色），blockquote 左竖线样式，面包屑帧标题栏（subsection 名 + 具体子题），section divider page，自适应帧标题栏，footline（full / page / none）。
- Palette 系统：red / blue / yellow / gray / mono，via `palette:` frontmatter；`\HypoApplyPalette` 统一切换所有 palette 派生色。
- 图片适配盒：独立无题注图行自动居中，`width=NN%` 映射 `\linewidth`，高度封顶 `0.75\textheight`，`keepaspectratio`；`stretch=true` 显式关闭纵横比锁定。
- `plain` Beamer 主题适配（`themes/plain/beamer.sty`）；`themes/plain/tokens.yaml` 新增 `beamer_palettes` 和 `beamer_blocks` 配置段。
- Beamer 文档（`docs/beamer.md`）与 Skill 模板（`skill/templates/beamer.md`）。
- 公共回归 fixture：`tests/fixtures/beamer/function-matrix.md` 与 `tests/fixtures/beamer/minimal-inheritance.md`。

改进：

- `document_options` 新增 Beamer 专属字段（`section_dividers`、`subsection_dividers`、`frame_title_inheritance_limit`、`continued_title_style`、`strict_structure`）。
- Pandoc convert 路径扩展至 `--slide-level=3`，Beamer 16:9 aspect ratio，Beamer template 注入。

本次 release assets 范围与 v0.2.0 相同：wheel、sdist、release handbook PDF、quickstart PDF。

## v0.2.0

本版本对应 Cycle C5「Cheatsheet Compact Layout and AI-Friendly Authoring」，仍为本地发布：release assets 只在本地生成和检查，尚未上传 CTAN 或 PyPI。

新增：

- `layout: cheatsheet`：`article` 之上的紧凑速查表布局模式（小字号、密间距、轻量标题标记、multicols 自然换列并带列级 needspace 标题保护），不设置时 article 行为不变。
- `cheatsheet-grid` / `cheatsheet-cell` 指令：多栏顺排容器与小 callout 提示盒（盒子作为强调手段，正文保持流式）。
- `hd:make-cheatsheet` Skill workflow 与内置模板 `skill/templates/cheatsheet.md`：目标页数为硬约束，压缩优先级 formulas > keypoints > examples。
- 受控表格新增 `type: cheatsheet` 的紧凑速查表尺度。

改进与修复：

- 行内代码（`\texttt` 盒）宽度感知：超过 0.6 行宽自动降级为可折行 accent 色文本，修复窄栏与 showcase 中的行内盒溢出。
- `hypolatex-core.sty` 引入 amsmath；cheatsheet 版式放宽换行容差并收紧 display skip，支持 `aligned` 拆分过宽等式链。
- 重建 `build/showcase/hypolatex-showcase.pdf` 与 `assets/readme/showcase-banner.png`（0 overfull）。
- 文档同步：`docs/c5-cheatsheet.md` 新增，`docs/user-guide.md`、`docs/release/handbook.md`、README 补充 cheatsheet 公开写法。

本次 release assets 范围与 v0.1.0 相同：wheel、sdist、release handbook PDF、quickstart PDF。

## v0.1.0

这是 Hypo-LaTeX 的首个本地发布卫生版本，重点是把 HypoDoc Markdown 到 LaTeX/PDF renderer 的公开包装信息、构建资产边界和发布前说明整理清楚。当前版本面向本地验证、内部试用和后续发布准备，不代表已经完成远端发布。

本次 release assets 范围包括：

- Python wheel (`.whl`)。
- Python sdist / source distribution (`.tar.gz`)。
- Hypo-LaTeX release handbook PDF（发布手册 PDF）。
- Hypo-LaTeX quickstart PDF（快速开始 PDF）。

目前这些资产仅作为本地 release artifacts 生成和检查使用，尚未发布或上传到 CTAN 或 PyPI。后续如果进行 CTAN/PyPI 发布，应在发布动作完成后再更新本 changelog 的状态说明。
