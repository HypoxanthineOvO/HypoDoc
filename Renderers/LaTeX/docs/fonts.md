# 文档字体

本文描述 book / article 的字体系统；Slides 保持独立字体配置。

## 默认角色

| 角色 | 首选 | 后备 |
| --- | --- | --- |
| 拉丁正文 | TeX Gyre Pagella | Latin Modern Roman |
| 中文正文 | Noto Serif CJK SC | FandolSong |
| 标题、Box 标题 | 正文家族的粗体 | 随正文 |
| 页眉页脚 | 正文家族的小字号 | 随正文 |
| 数学 | TeX Gyre Pagella Math | Latin Modern Math |
| 拉丁代码 | Cascadia Mono | Latin Modern Mono |
| 中文代码 | Noto Sans Mono CJK SC | FandolFang |
| 显式无衬线文字 | TeX Gyre Heros / Noto Sans CJK SC | Latin Modern Sans / FandolHei |

默认保留真实的 Latin 斜体、粗体与数学字形，不再让中文字体同时承担全部英文字形。标题不自动切换黑体，中文正文和标题也不混用宋体／黑体。字体随本机与 TeX 发行版提供，构建不会自动下载安装。

## 覆盖

```yaml
mainfont: TeX Gyre Pagella
cjkfont: Noto Serif CJK SC
mathfont: TeX Gyre Pagella Math
titlefont: TeX Gyre Pagella
cjktitlefont: Noto Serif CJK SC
monofont: Cascadia Mono
```

标题默认继承正文，不需要重复填写。`sansfont` 可覆盖显式无衬线内容的拉丁字体。显式配置的字体找不到时构建失败，避免配置看似生效、实际却悄悄后备。

`mathfont` 需要 OpenType 数学字体；普通文字字体不能替代。字体名称不能包含原始 TeX 或文件路径。`font_preset` 仍是 Slides 字段，不控制文档字体。

## 选型与验证

默认使用用户确认的 Pagella 与 Pagella Math，配合 Noto Serif CJK SC。Termes 可通过显式字体字段继续选用。字体改变会影响换行与分页，应以同一份中英混排样张检查，不仅看字体名。

样张源文件：`examples/document-design/font-sample.md`。检查 PDF 的嵌入字体、标题字重、斜体、公式、代码以及打印尺寸下的长段落。[完整配置](document-design.md)
