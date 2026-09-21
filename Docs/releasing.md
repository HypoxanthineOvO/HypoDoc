# 发布：同一提交，先验证，再生成草稿

## LaTeX 专项发布

仅发布 PDF 后端和主题、不等待 HTML/宿主应用时，用 **Release LaTeX** workflow。它不安装 Node.js、不构建 Desktop/VSIX、不拉取 Spec；在干净提交上运行 Python/真实 PDF 回归，构建 wheel、sdist、源码 ZIP、指南/Skill ZIP 和 School PDF/Markdown，再对这些实际附件执行解压安装测试，最后创建草稿。

```sh
python3 tools/release.py check
python3 tools/release.py build --latex-only --output release/latex
python3 tools/test-install.py --source-zip release/latex/hypodoc-source-0.3.0.zip --wheel release/latex/hypolatex-0.3.0-py3-none-any.whl
```

构建要求干净提交；源码 ZIP 取自同一 HEAD，不接受 dirty 预览混入正式附件。版本需替换为实际目标版本。确认 Actions 成功、manifest 提交和哈希正确后，经用户授权公开草稿并标为 latest。**草稿不是用户可见的交付**：发布后用 GitHub Release API 和匿名下载核实附件可见、可下载且哈希一致。

仅 LaTeX 发布不宣称新 Desktop/HTML 功能已发布。以下流程保留用于包含所有宿主安装包的完整产品发布。

不创建 Cycle，不把执行日志放进用户 README。版本从根 `package.json` 读取，Python RC 版本按 PEP 440 映射。

## 本地准备

```sh
python3 tools/release.py version 0.3.0-rc.1
python3 tools/release.py check
./scripts/validate-all.sh
python3 tools/release.py build --allow-dirty
```

`version` 更新组件版本和 Python lock；检查 diff 后再提交。`build --allow-dirty` 仅供本地预览，manifest 会如实标记 dirty，不能拿来正式发布。再次构建需指定新的空目录，避免混入旧包。

发布前整理为可回退的逻辑提交：指导与清理、工具链/正式渲染接入、测试、发布工具。提交前核对第三方条款和学校素材使用边界。不要把本机字体文件或私人文档打包。

## GitHub 草稿

经明确授权推送已验证提交后，从 Actions 运行 **Release**，选择该提交所在的分支/tag。无需手填旧 CI run ID、文件名或架构。

流程在同一源码提交上完成：产品检查 → Python/指南/Skill 打包 → Windows/macOS/Linux 与 VSIX 打包 → 校验版本和哈希 → 创建 Draft Release。RC 自动标记 prerelease，不会设成稳定 latest，也不自动公开草稿。

草稿的附件包含 wheel、sdist、指南/Skill zip、既有查看端安装包、VSIX、manifest、SHA-256 与发布说明。人工核对后再发布；脚本不会替你 push 或公开发布。

## 从候选转正式版

验收候选的安装与构建路径后，将版本改为 `0.3.0`，更新对应 Changelog，重新走同一流程。正式版必须来自重新验证的同一提交，不能只给旧包换文件名。

Spec 保持独立版本，不随产品发布机械升级。macOS/Windows PDF 测试和签名状态按真实证据注明，不扩大承诺。
