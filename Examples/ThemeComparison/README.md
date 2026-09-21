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
