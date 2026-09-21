# 同一份 Markdown，三个正式主题

先安装 CLI（根目录 `python3 scripts/setup.py`），然后运行：

```sh
python3 Examples/ThemeComparison/build.py --all-school-covers
```

产物在 `build/experiments/theme-comparison/`：三种主题的 PDF / TeX、两种 School 封面、逐页预览、三列对照 PDF 与构建诊断。

本例现在只调用正式 `hypolatex convert/build`，不克隆上游仓库、不维护私有模板、不使用第二套渲染逻辑。主题的唯一实现与素材位于 [正式资源目录](../../Renderers/LaTeX/src/hypolatex/resources/slides)。

正常写作不需要运行这个对照脚本：

```sh
hypolatex init slides.md --template slides --theme school --school-cover diagonal
hypolatex build slides.md
```

字体、主题来源、学校标识及摄影素材的说明见 [NOTICE](../../Renderers/LaTeX/src/hypolatex/resources/slides/NOTICE.md)。源稿 [Experiment.md](Experiment.md) 中的数字只是示意数据，不代表真实实验。原始流程图源码保留在 `assets/pipeline.tex`。

## School 排版约定

- 导航固定高度、上下居中；不超过四章时等宽排列并显示可点击的页点，单章超过十二页改显示页数；超过四章时显示当前章节及章节进度，避免无限挤压。过长的导航标题以省略号收尾，正文标题不删减。
- 双行页脚分别放作者／机构和标题／日期／页码，使用独立宽度和固定行高。长元数据仅在页脚省略；可以用 `short_title`、`short_author` 指定易读简称。未提供日期时留空，不自动编造日期。
- 标准封面采用右上方小校标、加厚圆角标题色块（2 mm 圆角）、居中作者区；斜切封面的标题、副标题、作者、机构和日期按顺序排版，避免独立定位导致重叠。
- 内容块使用圆角、浅色标题带和一致的内边距。仅改主题呈现，不改变源稿的内容。

多作者使用 YAML 列表，姓名之间留间距，并在可用宽度不足时换行：

```yaml
author:
  - 张明
  - 李华
  - 王芳
short_author: 科研排版团队
short_title: 科研文档与排版
date: 2026 年 9 月 21 日
```

真实 PDF 回归测试位于 `Renderers/LaTeX/tests/integration/test_school_layout.py`，覆盖八章节、长章节名、六作者、长机构名、单章十四页、标准封面 16:9 / 4:3 以及斜切封面 16:9。极端长标题或作者名单仍需要精简或单独安排介绍页；建议始终用 `hypolatex build slides.md --strict` 检查溢出。
