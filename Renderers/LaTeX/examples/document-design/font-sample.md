---
title: 中英文字体对照
profile: article
theme: course-notes
cover: false
toc: false
---

# 连续阅读 Continuous Reading

应用数值计算（Applied Numerical Computing）需要在中文解释、英文术语和数学公式之间来回阅读。字体的选择不仅影响标题，也影响正文的灰度、标点、数字，以及页眉页脚的协调性。

Numerical methods approximate continuous problems using finite representations. A useful note explains the assumptions, derives the method, and checks the result with a worked example.

**中文粗体与 Bold Latin；** *Italic text should remain a real italic face.* 数字与符号：0123456789，$x_i$、$\Delta t$、$\alpha$、$\lambda$。

## 公式与正文 Mathematics in Context

对充分光滑的函数，中心差分具有二阶截断误差：

$$f'(x)=\frac{f(x+h)-f(x-h)}{2h}+O(h^2).$$

这里的 $O(h^2)$ 描述步长趋于零时误差的量级，并不保证步长越小，计算结果就一定越准确。还需要考虑浮点舍入误差（round-off error）。

::: {.note title="重点提示 Key Observation"}
Box 的标题与正文沿用同一套衬线体系，使用字重、颜色和间距区分层级。它不应像另一种应用程序的界面卡片。

当内容包含两段文字、公式或列表时，应有足够留白，而不是贴着边框排列。
:::

### 判断标准 Evaluation Criteria

- 中英文并排时，字号与视觉重量是否接近？
- 细节是否清楚，长段落是否容易阅读？
- 标题、正文、公式、页眉页脚是否属于同一套视觉体系？

`for i in range(10):` 是代码，不用正文衬线字体冒充等宽字体。
