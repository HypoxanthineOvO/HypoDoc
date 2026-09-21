# 导出与检查

从仓库根目录使用 `uv run --project Renderers/LaTeX hypolatex ...`；如果通过 `uv tool install` 安装过 CLI，也可直接调用 `hypolatex`。

- `doctor --target convert`：只检查 Pandoc 及 Lua filter 能力。
- `doctor` 或 `doctor --target build`：检查 PDF 构建依赖；推荐字体、图标和 Poppler 是可选项。
- `doctor --target evidence`：检查 Poppler。所有模式可加 `--json`。

Pandoc 不锁死到某个版本。未验证版本会给出提示；探测成功不是复杂文档的完整兼容保证。

`hypolatex build INPUT.md` 默认写同名 PDF，`convert` 默认写同名 TeX。新主题随包分发，不调用实验脚本。用 `build --json` 获取 `diagnostics`，其中 `tex_line` 是生成 TeX 的行号，`frame_title` 是可定位到的页面标题；不能把 TeX 行号当成原 Markdown 行号。`--strict` 在溢出/缺字时失败并保留旧 PDF，不把字体后备提示作为失败。

## 检查 PDF

```sh
pdfinfo OUTPUT.pdf
pdftotext OUTPUT.pdf -
pdftoppm -f 1 -singlefile -png -r 120 OUTPUT.pdf first-page
```

检查标题和主要内容、中文、答案可见性、页数与页面比例。对封面、正文、表格、代码、公式、图片和 Slides 检查裁切、重叠与溢出。可以使用宿主的 PDF 查看能力代替 Poppler；无法检查的项目应在交付时说明。

布局错误优先缩减单页内容、拆分表格或调整源文件，不把编译退出码为零视为排版合格。

## 排错

- 找不到命令：按根 `Docs/installation.md` 安装或修正 PATH。
- Pandoc / filter 错误：检查 profile、主题、围栏、标题结构和不支持的语法。
- latexmk 错误：读取具体缺失宏包、字体或 TeX 错误，修源文件或工具链。
- 图片错误：使用文档内的本地相对路径。损坏文件不替换成假图片，缺失文件不默认生成占位图。

真实用户素材和生成的文档保留在用户工作目录，不提交到 HypoDoc 仓库。
