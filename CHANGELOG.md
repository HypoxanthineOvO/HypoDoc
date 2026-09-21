# 更新记录

## 0.3.0

本次公开发布专注 **LaTeX CLI、文档与 Slides 主题**。不包含新的 HTML/Marp、Desktop 或 VS Code 构建，也不要求用户安装 Node.js 或 Spec 子模块。

- 正式提供 school（上海科技大学）、simple、nature 三个 Slides 主题，所有样式、校标和模板随 wheel/source ZIP 分发。
- School 标准封面改为 2 mm 圆角标题块、小校标及多作者区域；支持斜切封面。导航居中，多章节显示进度；内容块使用圆角和明确层级；页脚包含日期，长文本自动省略。
- 修复旧启动器仍指向旧安装、导致新主题不可用的问题；安装和 AI 指导明确区分新 school 与旧 shanghaitech。
- setup 支持实际构建两种 School 封面的 `--smoke-test`、无 uv 的 pip 安装；doctor 补齐 Slides 所需宏包检测与修复提示。
- 提供可直接下载的源码 ZIP、wheel、sdist、指南/Skill ZIP、两种封面 PDF 及可编辑 Markdown；manifest 和 SHA-256 记录对应提交和附件。
- 验证源码 ZIP 无 Git/Node/Spec、含空格路径、uv/pip 两种安装方式，以及脱离源码后的 wheel 构建。

**首次使用**：下载 `hypodoc-source-0.3.0.zip`，解压后运行 `python3 scripts/setup.py --smoke-test`（Windows 用 `python`）。Python 需要 3.11+；PDF 仍需 Pandoc、XeLaTeX、latexmk。脚本不会未经确认安装系统软件。新主题使用 `profile: beamer` + `theme: school`，不要用 v0.2.0 安装包搭配新版指南。

**发布边界**：Linux PDF 工具链有实际构建证据；原生 Windows/macOS 的完整安装仍需目标机验证。不是零安装 PDF 服务，不发布 PyPI/CTAN，不包含商业字体；学校标识和第三方资源保持原有条款。

下载后可先打开 `School-standard.pdf` / `School-diagonal.pdf` 看效果；对应 `.md` 可直接修改。本次不重新上传旧 Desktop/VSIX，也不将 HTML 预览描述为 LaTeX 的等价输出。

## 0.3.0-rc.1

本轮候选聚焦“从材料到文档/Slides”，不新增 Desktop 功能。

- 新增 `school`、`simple`、`nature` 正式 Slides 主题，School 支持 standard / diagonal 封面；样式与素材随 Python 包提供。
- 新增 `hypolatex init` 与主题列表；构建默认生成同名 PDF，转换默认生成同名 TeX。
- 新增源码环境准备入口，普通用户无需 Node.js 或 Spec 子模块。
- Pandoc 按能力检查，不再锁死参考版本；推荐字体可后备，并明确报告选择。
- 构建成功时也保留溢出、缺字、字体提示；支持 JSON 与严格输出检查。
- 修复共享表格 kind / 标识到 PDF 的映射，以及不同 Pandoc 版本的图片兼容。
- 重写用户安装/AI 指导，重整行为与发行包测试，清理历史 Cycle 与过时验收输出。

### 使用变化与边界

- 模板从包内通过 `init` 创建，不再依赖旧 `Skills/LaTeX/templates` 路径。
- 旧 plain / minimal / shanghaitech / glass 主题继续兼容。
- 新主题的 TeX 导出会带一个哈希命名的资源目录，移动时需一起保留。
- 原生 macOS/Windows PDF 工具链仍需目标机验证；不把桌面打包成功等同于 PDF 渲染验证。
- Desktop 仍是查看端；无可编辑 pptx/docx 导出。安装器签名、公证和商店上架不属于本轮。
- 学校标识、上游设计与摄影素材有独立来源和条款，不统一按第一方 MIT 处理。

## 0.2.0

已有 Desktop/Web/VS Code 预览、Slides 演示与 Hypo-LaTeX 导出。历史发布记录见 GitHub Release。
