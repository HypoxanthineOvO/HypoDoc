# LaTeX 后端用户指南

普通使用请先读统一的[安装指南](../../../Docs/installation.md)与[写作指南](../../../Docs/authoring.md)，不要额外安装 Spec 参考工具链。

从仓库根目录执行：

```sh
uv run --project Renderers/LaTeX hypolatex doctor
uv run --project Renderers/LaTeX hypolatex build Renderers/LaTeX/src/hypolatex/resources/starters/longform.md --output build/document.pdf
```

## 需要时再查的高级功能

- [主题与覆盖项](themes.md)、[字体](fonts.md)、[封面](cover-layouts.md)
- [Slides](beamer.md)、[图片](figures.md)
- [表格和语义模块](c3-authoring.md)、[多栏速查表](c5-cheatsheet.md)
- [CLI 参数](reference/cli.md)

这些参考包含 LaTeX 后端专用扩展和旧源文件兼容写法，不代表 Web/Desktop 对所有语法均支持。新文档默认使用根 `Renderers/LaTeX/src/hypolatex/resources/starters/` 中的共享模板。只有明确需要时才采用高级布局。
