# 文档与专用 PDF 排版

普通长文、项目说明和复习题使用根 `Docs/authoring.md` 中的共享语法。优先选择主题，不默认堆叠高级覆盖项。

## 答案

`answer_mode` 默认 student；review / teacher 显示答案，CLI 优先。question、hint、answer、solution 放在带标识和 `kind` 的 qa 容器中。精确题目卡片样式属于 LaTeX 扩展，不加入默认共享模板。

## 表格

简单资料用普通 Markdown 表格。需要语义分类时使用带 `#identifier` 和 `kind` 的 `.table`。精确列宽、长表、密度、复杂类型可查仓库内 `Renderers/LaTeX/docs/c3-authoring.md`，这些是 PDF 后端能力，不保证全部预览兼容。

## 速查表

用 `hypolatex init notes.md --template cheatsheet` 开始，按主题压缩信息，优先保留常用概念、公式和易错点，不改写原始材料。`layout: cheatsheet` 控制紧凑 PDF；正文使用普通标题、列表、表格。不要为了页数要求无限缩小字号。

确需多栏时再查 `Renderers/LaTeX/docs/c5-cheatsheet.md`。`cheatsheet-grid` / `cheatsheet-cell` 是 LaTeX 专用扩展，应说明查看端兼容限制。目标页数、内容完整性或可读性无法同时满足时，说明取舍，不静默删掉重要内容。

## 高级覆盖

字体、纸张、强调色、封面和图片位置只在用户明确约束时调整。主题注册与 profile 不匹配时换用适配主题，不依赖静默回退。素材应随源文件一起交付。
