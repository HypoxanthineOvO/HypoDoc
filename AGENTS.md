# 使用 HypoDoc

- 普通任务先读 README、Docs/installation.md、Docs/ai-guide.md 和 Skills/LaTeX/SKILL.md。
- v0.3.0 本次发布范围为 LaTeX CLI、文档与 Slides 主题；HTML/Marp 后续工作不属于该版本。
- 用户只想生成 PDF 时，不要先安装 Node.js、拉取 Spec 子模块或启动 Desktop。
- 源码 ZIP 也能安装：运行 `python3 scripts/setup.py --smoke-test`（Windows 用 `python`）。系统安装、大体积下载先说明并征得同意。
- 使用 setup 打印的本次 CLI 完整路径检查版本与主题，避免 PATH 中的旧安装。新上科大主题为 `profile: beamer` + `theme: school`，需要 0.3.0+。
- 安装失败要报告真实依赖与错误，不自动降级主题、不隐藏缺字/溢出、不用浏览器打印冒充 LaTeX PDF。
- 保留用户源文件和工作区已有改动；生成用户文档不需要改本工具的代码。
