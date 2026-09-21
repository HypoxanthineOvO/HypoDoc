# 后端开发

统一入口见根目录的[开发说明](../../../Docs/development.md)和[测试说明](../../../Docs/testing.md)。

- CLI 位于 `src/hypolatex/cli.py`，配置与依赖诊断在相邻模块。
- Pandoc Lua filter 和 TeX templates 位于 `src/hypolatex/resources/`。
- TeX 宏包与主题位于 `tex/latex/hypolatex/`，打包时随 wheel 分发。
- 公开写作模板在根 `Renderers/LaTeX/src/hypolatex/resources/starters/`；普通源码构建无需初始化独立 `Spec/` 子模块。
- 修改工具链兼容性应以实际转换和构建测试为依据，不重新加入固定版本拒绝逻辑。

不要用测试锁定文档措辞或内部源码字符串。改动渲染时检查真实 PDF；改动打包时从新虚拟环境验证安装后的 CLI。
