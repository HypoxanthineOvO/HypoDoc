# 开发说明

HypoDoc 的目标是让人或 AI 维护 Markdown 源文件，生成可阅读、可修改、可验证的文档和 Slides。用户入口是根 README；这里仅说明开发边界。

## 产品约定

- 根 README 和安装指导面向使用者，不写迁移过程、任务编号和执行日志。
- Markdown 是作者维护的源文件；不要把手工修改生成的 TeX 作为长期解决办法。
- `Spec/` 是独立版本化的格式规范。产品实现可以改进，但新增共享语法需要明确规范与各渲染器的兼容关系。
- Desktop / Web / VS Code 负责查看和预览；LaTeX 后端负责 TeX / PDF。查看端不因此引入 Python、Pandoc 或 TeX 运行时。
- 用户工具链按能力检查；参考规范测试可以固定版本，不把固定参考环境当作用户安装要求。
- 公开示例自包含。用户素材、私有语料、生成文件和执行日志不提交。
- 第一方代码使用 MIT；第三方依赖保留各自许可证与署名要求。
- 产品版本不继承整合前旧仓库的版本；Spec 独立版本化。历史迁移和发布过程查 Git 历史，不重新建立 Cycle 管理目录。

## 目录

| 目录 | 用途 |
| --- | --- |
| `Renderers/LaTeX` | Python CLI、Pandoc filter、TeX 宏包和主题 |
| `Skills` | AI 写作指导与公开模板 |
| `Packages` | TypeScript 解析器、渲染模型、Web 预览和主题 |
| `Apps/Desktop`、`Extensions/VSCode` | 查看端 |
| `Spec` | 独立规范子模块；普通 PDF 用户不需要初始化 |

## 开发环境

Node.js 22、pnpm（版本见根 `package.json`）、Python 3.11+ 和 uv。

```sh
git submodule update --init Spec
pnpm install --frozen-lockfile
uv sync --project Renderers/LaTeX --group dev
```

测试入口与依赖见 [测试说明](testing.md)。产品改变时更新对应用户指导和行为测试，不新增要求文档包含某种措辞的测试。
