# HypoDoc LaTeX / PDF

这是 HypoDoc 的 PDF 后端：把结构化 Markdown 转成可审阅的 TeX，再由 XeLaTeX 生成文档与 Beamer Slides。

- 首次使用请从 [HypoDoc 首页](../../README.md) 开始。
- [安装指南](../../Docs/installation.md)区分 Python、Pandoc、TeX 和可选 PDF 检查工具。
- [AI 使用指南](../../Docs/ai-guide.md)与 [Skill](../../Skills/LaTeX/SKILL.md)说明如何从材料生成成品。
- [写作指南](../../Docs/authoring.md)与[模板](src/hypolatex/resources/starters)提供可直接使用的源文件。

## 从本目录运行

```sh
uv sync --no-dev
uv run hypolatex doctor
uv run hypolatex build src/hypolatex/resources/starters/longform.md --output build/document.pdf
uv run hypolatex build src/hypolatex/resources/starters/beamer.md --output build/slides.pdf
```

只输出 TeX 时使用 `hypolatex convert`。查看真实命令选项用 `hypolatex --help` 或子命令 `--help`。PDF 构建不要求初始化 Spec 子模块。

## 详细参考

[用户指南](docs/user-guide.md) · [主题](docs/themes.md) · [字体](docs/fonts.md) · [Slides](docs/beamer.md) · [图片](docs/figures.md) · [CLI](docs/reference/cli.md)

输出为 PDF/TeX，不输出 PowerPoint/Word。复杂 LaTeX 布局并不全部受 Web 预览支持。第一方代码使用 [MIT](LICENSE)。
