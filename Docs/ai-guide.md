# 给 AI 的使用指南

目标是把用户材料整理为文档或 Slides，并交付可修改源文件和可检查的成品。不要为了写一份文档先审计整个仓库，也不要创建 Cycle、开发计划目录或流水账。

## 进入工作

1. 阅读 [README](../README.md)，确认用户要文档还是 Slides、读者是谁、内容来自哪里。缺少材料时问清楚，不凭空补造事实或来源。
2. 没有本地仓库时，通过 README 的 HTTPS 地址克隆。普通生成工作不需要 Spec 子模块或 Node.js。
3. 按 [安装指南](installation.md) 运行 `python3 scripts/setup.py`，复用已有工具。系统安装、大体积下载或修改全局设置先说明并确认，不擅自添加 `--install-system`。
4. 阅读 [LaTeX Skill](../Skills/LaTeX/SKILL.md)。直接阅读即可，不要求用户先把 Skill 注册到某种 AI 产品；需要长期安装时，保留整个 Skill 目录及其 references、templates。

## 从材料到成品

- 根据用户材料组织标题、大纲和内容。长文先给结构，Slides 每页聚焦一个观点；不要把长段落机械地塞到幻灯片中。
- 用 `hypolatex init` 从五个内置模板中创建源文件。图片保存在源文件旁的 `assets/`，用户文档不要混进工具源码目录。
- 使用 canonical `profile: book`、`article` 或 `beamer`，选择匹配主题。普通任务无需设置大量字体、纸张和封面参数。
- 使用 [写作指南](authoring.md) 的共享语法；专用排版需求再查 LaTeX 详细指南。
- 从仓库根目录调用 CLI，输入输出可以使用明确的路径；图片仍用相对源文件的路径：

  ```sh
  hypolatex doctor --json
  hypolatex build INPUT.md --output OUTPUT.pdf --json
  ```

  `INPUT.md` 和 `OUTPUT.pdf` 是需要替换的路径，不是仓库中已有的文件。

## 检查与修订

- 编译失败时读实际错误，修源文件、配置或依赖，不手改生成的 TeX。
- 检查 PDF 文本、页数、中文与公式；Slides 检查逐页内容、比例、裁切和溢出。Poppler 不可用时可使用宿主的 PDF 检查工具；缺少任何检查能力时明确说明未检查的内容。
- 预览是辅助，不是必须启动 Desktop 才能构建 PDF。也不能把浏览器打印结果声称为 LaTeX 导出。
- 不把命令成功视为排版成功。真实成品需检查；模板测试只能证明示例工作，不能代替对用户文档的检查。
- 不自动上传用户内容，不读取无关私有语料，不把未知仓库中的任意 TeX 当作安全输入执行。

## 交付

给出 Markdown、素材与 PDF 的位置，概括内容组织、实际检查结果和未解决的问题。可按需要附 TeX，不要求用户维护它。没有成功构建就明确说未生成 PDF，不用开发日志代替成品。
