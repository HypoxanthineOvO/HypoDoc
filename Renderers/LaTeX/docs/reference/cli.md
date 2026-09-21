# CLI

以下命令从 HypoDoc 仓库根目录执行。已通过 `uv tool install` 安装时，可省略 `uv run --project Renderers/LaTeX` 前缀。

## doctor

```sh
uv run --project Renderers/LaTeX hypolatex doctor
uv run --project Renderers/LaTeX hypolatex doctor --target convert --json
uv run --project Renderers/LaTeX hypolatex doctor --target evidence
```

`--target` 是 convert、build（默认）或 evidence。只检查选定任务的必需项；推荐字体、图标和输出检查工具不会阻止普通 PDF 构建。JSON 输出包含 `ok`、`target`、`required`、`optional`。成功返回 0，缺必需项返回 1，参数错误返回 2。

Pandoc 通过真实 Lua filter 探测，不要求版本完全等于参考版本。未验证版本会提示继续检查实际输出。

## convert

```sh
uv run --project Renderers/LaTeX hypolatex convert Renderers/LaTeX/src/hypolatex/resources/starters/project.md --output build/project.tex
```

输出可审阅 TeX；只需 Pandoc，不需要 TeX 编译工具。支持 `--theme`、`--answer-mode` 覆盖。

## build

```sh
uv run --project Renderers/LaTeX hypolatex build Renderers/LaTeX/src/hypolatex/resources/starters/longform.md --output build/document.pdf
uv run --project Renderers/LaTeX hypolatex build Renderers/LaTeX/src/hypolatex/resources/starters/review.md --answer-mode review --output build/review.pdf
uv run --project Renderers/LaTeX hypolatex build Renderers/LaTeX/src/hypolatex/resources/starters/beamer.md --output build/slides.pdf
```

输出 PDF。支持 `--theme`、`--answer-mode student|review|teacher`、`--paper a4paper|letterpaper`。只有明确接受缺图草稿时才使用 `--allow-placeholders`；损坏图片仍是错误。

CLI 参数的完整定义以 `hypolatex --help` 和子命令 `--help` 为准。安装问题见[安装指南](../../../../Docs/installation.md)。
