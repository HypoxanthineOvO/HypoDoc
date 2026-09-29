# ImageGen 封面候选

2026-09-29 使用内置 ImageGen 分别生成三张无文字的背景图。此目录为候选，不是已选定的默认主题素材。原图保留在生成工具目录，项目副本保存在 `assets/`。

- A / `contour-atlas`：绿金等高线，偏课程笔记与数学手册。
- B / `wave-field`：蓝色波场，偏科学与数值计算。
- C / `material-structure`：纸艺构成，偏技术文档与正式报告。

文字由 LaTeX 使用 Pagella / Noto Serif CJK 排版，不烘焙进背景。当前第三版 `cover_layout: artwork` 把标题、副标题、署名和年份组合在上方；默认只用于 Book 封面，不给短 Article 加背景。图形为装饰，不代表数据。

原图约 1054×1492 像素，按 A4 输出约 128 dpi，适合屏幕与风格选样，不作为 300 dpi 印刷母版。确定方向后可另做印刷级版本；本次保留未经缩放或重绘的生成结果。

## 第三版：连贯的文字组

保留第二版较大的字体，但不再把作者与年份放在下方图形上：将它们作为一行署名放在副标题下方，去掉装饰横线，收紧标题与副标题间距。上半部集中信息，下半部保留完整插画；课程示例的年份只出现一次。原始背景不变，旧 PDF 版本仍保留供比较。

## 第二版封面文字（历史）

根据“副标题、作者和年份太小”的反馈，`artwork` 改用真正的封面字号：标题 44pt、副标题 24pt、作者 22pt、年份 20pt、顶部课程信息 14pt。重新组织上方标题组与左下署名组，保留背景图和可选文字。示例中的“作者姓名／文档作者”是排版占位文字，不是实际作者身份。Article 的首页标题区不受这一调整影响。

## 生成提示词

### contour-atlas

```text
Use case: stylized-concept. Asset type: a print-ready portrait A4 book-cover BACKGROUND for bilingual university course notes, no text. Create an elegant editorial illustration about mathematical understanding: richly layered jade and mineral-green topographic contour surfaces, delicate copper-gold contour lines, translucent paper strata and a few subtle discrete mesh nodes. Warm ivory cotton-paper background, tactile fine grain, refined restrained colors, real visual richness and depth rather than a plain geometric template. Composition: full flat rectangular background, not a photographed book or mockup. Keep the upper 45 percent and upper-left half very light and quiet for a large dark serif title/subtitle to be typeset later; a clean ivory lower-left area for author details; let the detailed illustration occupy the bottom half and flow up the right edge. Edge-to-edge art, no border. Printed ink / sophisticated scientific atlas mood. Absolutely NO words, letters, numbers, formulas, logos, watermarks, labels, page furniture or fake typography. Portrait roughly A4 aspect ratio.
```

### wave-field

```text
Use case: stylized-concept. Asset type: full-bleed portrait A4 cover BACKGROUND, for an elegant technical book or scientific course notebook. A sophisticated editorial art composition of flowing indigo, slate-blue and muted turquoise wave fields, fine translucent wireframe surfaces and luminous thin mathematical streamlines, ink suspended over finely textured warm white paper. Evoke numerical simulation, spatial structure and waves without depicting a literal chart or false data. The image should feel rich, crafted and calm, not an empty minimalist template and not neon cyberpunk. Flat print artwork, not a book mockup. Reserve the upper 45 percent as very pale, low-detail warm white negative space for real dark serif title text; the lower-left margin must stay quiet for author/date metadata. Place intricate layered sculptural waves in the bottom half and right edge, with gentle edges dissolving into paper above. No lettering, numbers, formulas, captions, logos, symbols, watermarks or text of any kind. Portrait A4 proportions.
```

### material-structure

```text
Use case: stylized-concept. Asset type: a portrait A4 print cover BACKGROUND for a professional technical document. Design a refined, visually rich abstract architectural editorial illustration: layered ivory paper planes, deep navy forms, muted terracotta and small warm brass accents, precise fine lines, subtle translucent tracing-paper overlays, tactile embossed textures and soft natural shadows. The composition should suggest organized thinking, construction and evidence; not a corporate slide template, not a literal building, not a stock photo. Upper 45 percent and upper-left must remain quiet luminous ivory, with only extremely subtle paper texture, for a dark serif title and subtitle added later. Put the detailed asymmetric constructed forms on the lower-right half, leaving lower-left clean for author information. Full rectangular edge-to-edge flat artwork, no surrounding frame or book mockup. Tasteful dimensional depth, visual sophistication, controlled saturation. NO words, lettering, numbers, pseudo-text, formulas, logos or watermarks. Portrait A4 proportions.
```
