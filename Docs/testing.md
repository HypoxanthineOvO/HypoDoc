# 测试

测试保护用户行为，不规定文档用词、阶段编号、模板题材或源码必须包含某段字符串。独立 Spec 的参考测试继续在子模块中维护；这里测试产品实现。

## 快速检查：不需要 TeX

```sh
uv sync --project Renderers/LaTeX --group dev
uv run --group dev --project Renderers/LaTeX python -m pytest -q Renderers/LaTeX/tests/unit
```

`tests/unit` 检查配置、依赖诊断、资源边界、Slides 分页及图片归一化。缺少系统工具不影响这组测试。

共享预览端：

```sh
git submodule update --init Spec
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

所有公开模板必须通过 parser-core。既有解析器、渲染模型与宿主测试按实际行为保留，不把测试全绿等同于视觉审查通过。

## 真实 PDF：需要完整工具链和 Poppler

```sh
uv run --project Renderers/LaTeX hypolatex doctor
uv run --project Renderers/LaTeX hypolatex doctor --target evidence
uv run --group dev --project Renderers/LaTeX python -m pytest -q Renderers/LaTeX/tests/integration
```

这组测试不因缺少工具而静默跳过。覆盖公开模板复制到外部目录后的构建、中英文内容、复习题答案可见性、Slides 页数/比例/顺序、主题、图表代码、长表尾行和失败时保留已有输出。可提取文字和生成截图不等于视觉合格；修改布局后仍应人工检查代表页面。

## 首次使用与发行包

```sh
python3 tools/test-install.py
```

在临时目录中复制当前源码，不带 `.venv`、Spec、Node.js；执行 README 中实际列出的 uv 命令。随后构建 wheel，在另一个新虚拟环境中安装并从仓库外构建 PDF，验证随包资源，而不是只检查打包配置。

此测试需要联网或已有包缓存，复用系统 Pandoc/TeX，不替代干净操作系统上的依赖安装验证。不会运行 sudo 或安装系统软件。全部产物在临时目录，退出后清除。

## 完整本地检查

安装好开发与 PDF 依赖后运行 `./scripts/validate-all.sh`。它执行产品测试、构建及首次使用检查，不自动装系统依赖，也不为用户工具链强制替换 Pandoc。

仅修改规范兼容行为时，另跑参考工具链：

```sh
uv sync --project Spec --frozen
python3 Spec/scripts/provision-pandoc.py --version 3.10 --dest Spec/.tools/pandoc
pnpm conformance:portable
```

该固定版本只服务参考规范验证，不是普通 PDF 构建要求。CI 分别测试系统 Pandoc 与固定参考 Pandoc 的实际 PDF 输出。
