---
name: hypolatex
description: Author or edit HypoDoc Markdown documents and Beamer slides, then convert to TeX or build and inspect PDF. Use for HypoDoc/Hypo-LaTeX materials, not arbitrary hand-written LaTeX or PowerPoint files.
---

# HypoDoc 写作与导出

交付用户需要的源文件与成品，不把开发日志当成文档。Markdown 是长期维护的来源，不手改生成的 TeX 解决问题。

## 准备一次

先检查 `hypolatex --version`。未安装时，读取 HypoDoc 仓库 README，从仓库根执行 `python3 scripts/setup.py`（Windows 用 `python`）。若命令未进入 PATH，使用脚本打印的完整 CLI 路径。

setup 自动准备本地 Python 环境；系统安装必须先说明并确认，不能自行加 `--install-system`。普通使用不需要 Node.js、Spec 或实验仓库。不要因为 Pandoc 版本不同强制重装。

用 `hypolatex doctor --json` 检查 PDF 构建依赖；只转 TeX 时加 `--target convert`。推荐字体与 Poppler 为可选项，不把它们当所有任务的硬门槛。

## 创建源文件

```sh
hypolatex init slides.md --template slides --theme school
```

`--template` 可选 document、article、slides、review、cheatsheet。初始化不会覆盖现有文件。用 `hypolatex themes` 查看完整主题表。

Slides 新主题：school（完整高校样式）、simple（简约细线）、nature（摄影封面／淡几何正文）。School 可在 frontmatter 中指定 `school_cover: standard` 或 `diagonal`。新源文件用 `profile`，不混入旧 document_type/documentclass。

字体默认优先使用本机首选字体并明确后备；需要开放字体环境时设 `font_preset: portable`。不要要求安装商业字体才能完成任务。

## 构建与检查

```sh
hypolatex build slides.md --json
hypolatex convert slides.md
```

默认生成同名 PDF / TeX，也可用 `--output` 指定路径。`--strict` 在溢出/缺字时失败，保留已有 PDF；带答案版加 `--answer-mode review`。

读 JSON diagnostics 中的具体问题。TeX 行号不是 Markdown 行号；frame_title 可帮助定位页面。修改源文件、配置或环境，不隐藏错误。主题资源随包提供，不另行克隆主题。

素材相对 Markdown 放置；缺图是错误，不默认用占位图替代。只有用户同意草稿占位时才加 `--allow-placeholders`。未知来源的任意原始 TeX 不是安全沙箱输入。

输出后按 `references/export-and-evidence.md` 检查正文、中文、公式、表格、图片和排版，再交付 Markdown、素材与 PDF，并说明未完成的检查。不要求启动 Desktop；浏览器打印不是 LaTeX 导出；不输出可编辑 pptx/docx。
