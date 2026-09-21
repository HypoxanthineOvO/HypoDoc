# 安装：先准备一次，以后直接构建

## 推荐：源码准备脚本

安装 Python 3.11+ 和 Git，克隆仓库后运行：

```sh
python3 scripts/setup.py
```

Windows 将 `python3` 换成 `python` 或 `py -3`。脚本在仓库根 `.venv` 中隔离安装 CLI；已有 uv 时用它加速，否则使用该虚拟环境的 pip。不会修改系统 Python、下载 Spec、安装 Node.js 或更改 shell 配置。

脚本默认创建用户级命令入口：Linux/macOS 为 `~/.local/bin/hypolatex`，Windows 为 `%LOCALAPPDATA%/HypoDoc/bin/hypolatex.cmd`。如果已有同名命令，脚本会保留它并打印本次 CLI 的完整路径，不强制覆盖。

常用选项：

- `--dry-run`：只看计划，不安装、不写文件。
- `--no-launcher`：只准备本地环境，不创建用户级命令。
- `--install-system`：明确授权在 apt 系 Linux 上执行打印出的系统安装命令。TeX 可能占用数 GB；AI 必须先说明并获得确认，再使用此选项。

重复执行可以更新本仓库的环境。发现已有但不属于本工具的 `.venv` 时会停止，而不是覆盖。Linux 若提示缺少 ensurepip，可先安装 `python3-venv` 后重试。

## 系统依赖

| 用途 | 必需工具 |
| --- | --- |
| 创建源文件 | Python CLI；不需要 Pandoc / TeX |
| 转成 TeX | Pandoc，能运行随包 Lua filter |
| 构建 PDF | Pandoc、XeLaTeX、latexmk、基础与中文 TeX 宏包 |
| 提取文字／截图 | 可选 Poppler：pdfinfo、pdftotext、pdftoppm |
| 查看 PDF | 任意 PDF 阅读器；无需开发环境 |

### Ubuntu / Debian

可以先预览，然后明确允许系统安装：

```sh
python3 scripts/setup.py --dry-run
python3 scripts/setup.py --install-system
```

等价的手工安装命令为：

```sh
sudo apt-get update
sudo apt-get install -y python3-venv pandoc texlive-xetex texlive-latex-extra texlive-lang-chinese latexmk fonts-noto-cjk poppler-utils
```

其他 Linux 发行版通过相应包管理器安装等价组件，再运行 setup；不要执行不适用的 apt 命令。

### macOS

使用 Python 3.11+、[Pandoc](https://pandoc.org/installing.html) 和 [MacTeX](https://tug.org/mactex/)。已有 Homebrew 时可用 `brew install python pandoc`；完整 MacTeX 更适合首次使用，BasicTeX 需要自己补中文与额外宏包。重开终端确认 `/Library/TeX/texbin` 可用，再运行 setup。需要 PDF 检查工具时可用 `brew install poppler`。

### Windows

最直接的已验证方向是 WSL + Ubuntu。原生 Windows 可使用 Python 3.11+、Git、[Pandoc 安装器](https://pandoc.org/installing.html) 与 [TeX Live](https://tug.org/texlive/)；或使用 [MiKTeX](https://miktex.org/howto/install-miktex)，但 latexmk 还需 Perl，并应先处理首次宏包安装的交互提示。

安装后重开终端，运行 `python scripts/setup.py`。命令未进入 PATH 时直接使用 `.venv\Scripts\hypolatex.exe`，或把脚本打印的用户命令目录加入自己的 PATH。脚本不会更改注册表。原生 Windows/macOS 的安装路径需要在目标机器实测，不能用 Desktop 安装包构建成功代替 PDF 工具链验证。

## 从 Release 安装 CLI

已有 uv 时，可以安装下载好的 wheel：

```sh
uv tool install /path/to/hypolatex-VERSION-py3-none-any.whl
```

将路径和版本替换成实际下载文件。也可在自行创建的 Python 虚拟环境中通过 pip 安装 wheel。不要默认从 PyPI 安装同名包。主题、模板、图片和必要说明随 wheel 提供，不要求工作目录内存在 HypoDoc 仓库。

## 字体不再成为隐含前提

新 Slides 主题默认 `font_preset: preferred`：英文优先 Times New Roman，代码优先 Consolas / Cascadia Mono；缺少时使用 TeX Gyre Termes / Latin Modern Mono。中文优先 Noto Serif CJK SC，缺少时使用 TeX 发行版的 Fandol 字体。数学使用 TeX Gyre Termes Math。

如需不依赖微软字体的可重复环境，可指定 `font_preset: portable`。后备选择会出现在构建提示里。方正小标宋、Times New Roman、Consolas 等系统字体文件不随包分发。

## 检查与排错

```sh
hypolatex doctor
hypolatex doctor --target convert --json
hypolatex doctor --target evidence
```

doctor 不要求 Pandoc 精确等于某个版本；通过真实 Lua filter 探测判断是否可用。已验证过 3.1.3 与 3.10，其他版本需检查实际结果。Spec 的固定参考版本不属于用户安装要求。

| 问题 | 处理 |
| --- | --- |
| `hypolatex` 找不到 | 使用 setup 打印的完整 CLI 路径；POSIX 为 `.venv/bin/hypolatex`，Windows 为 `.venv\Scripts\hypolatex.exe` |
| Pandoc / XeLaTeX / latexmk 找不到 | 补齐系统工具并重开终端；不要重装整套开发依赖 |
| 某个 `.sty` 不存在 | 用 TeX 发行版安装错误中指出的宏包 |
| 缺推荐字体 | 先查看后备字体提示和 PDF，不必因未装某款字体停止 |
| 图片找不到 | 将真实图片放在源文件旁，使用本地相对路径，不使用绝对路径或 `..` 越界 |
| 构建成功但提示溢出 | 修正内容或布局；`--strict` 可将溢出/缺字变成失败，不会覆盖已有 PDF |
| 导出的 TeX 如何保留 | 新主题的 TeX 旁会有带哈希的 `hypodoc-resources-*` 目录；移动时一起带上，以及原文图片 |

## 更新与卸载

源码方式：保存自己的修改，运行 `git pull --ff-only`，再运行 setup。冲突时不要强制覆盖。用户文档放在自己的目录，不放进工具源码。

卸载时先保留自己的 Markdown、素材和 PDF，再删除本仓库 `.venv` 及由 setup 创建的命令入口；确认入口包含 `Managed by HypoDoc setup`，不要删除其他安装方式提供的命令。`uv tool` 方式用 `uv tool uninstall hypolatex`。

Pandoc、TeX、Python 和字体可能被其他程序使用，不随 HypoDoc 自动卸载。
