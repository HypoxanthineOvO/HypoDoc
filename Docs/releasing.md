# 发布：同一提交，先验证，再生成草稿

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
