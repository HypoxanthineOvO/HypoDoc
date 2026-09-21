# 更新记录

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
