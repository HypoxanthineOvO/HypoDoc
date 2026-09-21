---
title: 同一份内容，三种表达
subtitle: HypoDoc Theme Comparison
author: HypoDoc
institute: 主题对照实验
date: 2026 年 9 月
profile: beamer
aspectratio: "169"
school_cover: standard
---

# 实验目标

### 只改变主题，不改变内容

本实验比较 **School、Simple、Nature** 三条主题路线。

- 使用同一份 Markdown，不为某个主题单独改写正文。
- 保持相同字体、页面比例、图片及表格宽度。
- 比较标题、导航、页脚、背景与内容块的整体关系。

::: {.objective title="实验目标"}
让设计差异来自主题，而不是来自内容多少或字号大小。
:::

### 三种路线，三种完整的设计

::: {.table #theme-comparison kind="comparison" caption="主题定位与主要视觉差异"}
```yaml
columns:
  - weight: 1
  - weight: 2
  - weight: 3
```

| 路线 | 页面框架 | 主要特征 |
|:---|:---|:---|
| School | 完整页眉与页脚 | 章节导航、标识区域、主题色标题带 |
| Simple | 精简的固定边界 | 白底、较少装饰、必要页码 |
| Nature | 自然背景与层次 | 摄影封面、淡几何背景、协调的彩色内容块 |
:::

三种路线共享排版能力，不互相替代。

# 内容组件

### 数学表达：从问题到证据

以检索增强生成为例，先检索相关证据，再组织回答：

$$
\mathcal{D}_k(q)=\operatorname{TopK}_{d\in\mathcal{C}}s(q,d)
$$

$$
y^{\star}=\operatorname*{arg\,max}_{y}\;p_{\theta}\!\left(y\mid q,\mathcal{D}_k(q)\right)
$$

::: {.note title="符号说明"}
$q$ 为问题，$\mathcal{C}$ 为语料库；$k$ 控制候选证据数量。
:::

### 表格：保留数据，降低装饰干扰

::: {.table #results kind="comparison" caption="示意数据：仅用于排版，不代表真实实验"}
```yaml
columns:
  - weight: 2.3
  - weight: 1
  - weight: 1
  - weight: 1
```

| 方案 | 相关性 | 忠实度 | 延迟 / s |
|:---|---:|---:|---:|
| 基础检索 | 0.72 | 0.78 | 0.45 |
| 检索 + 重排 | 0.81 | 0.85 | 0.68 |
| 混合检索 + 重排 | 0.87 | 0.89 | 0.82 |
:::

表格按正文区域的 **80% 宽度**排版，数值右对齐。

表头采用主题衍生浅色，而不是复制标题栏的深色。

### 图片：按内容区域的比例放置

从问题出发，逐步缩小证据范围，再组织答案。

![证据使用流程](assets/pipeline.pdf){width=80% height=42%}

图片保持原始比例，同时为图注、标题与页脚留出空间。

### 代码：保持缩进与等宽节奏

```python
def answer(query, index, model):
    candidates = index.search(query, top_k=20)
    evidence = rerank(query, candidates)[:5]
    response = model.generate(query, evidence)
    return attach_citations(response, evidence)
```

代码采用 **Cascadia Mono**；中文注释使用独立的中文等宽字体。

不要通过整页缩字，容纳本应拆分的长程序。

# 内容块与检查

### 内容块：定义、建议与提醒

::: {.info title="定义 · Definition"}
主题决定视觉表达，不应改变源文件的内容含义。
:::

::: {.objective title="建议 · Proposal"}
优先沿用成熟母版的布局，再调整字体与素材。
:::

::: {.tip title="提醒 · Reminder"}
标题、正文、表格与代码应各自拥有清晰的层级。
:::

### 内容块：问题、挑战与评论

::: {.warning title="问题 · Problem"}
编译成功，不代表页面没有溢出或内容没有被遮挡。
:::

::: {.task title="挑战 · Challenge"}
在信息完整、字号可读和页面边界之间取得平衡。
:::

::: {.note title="评论 · Comment"}
先读取真实 TeX 警告，再决定调整布局还是拆分内容。
:::

### 阅读说明与素材来源

::: {.summary title="这份实验应该回答什么"}
三条主题路线是否有明确差异？字体是否协调？表格、图片和内容块是否融入主题？
:::

- 中文：Noto Serif CJK SC；英文：Times New Roman。
- 数学：TeX Gyre Termes Math；代码：Cascadia Mono。
- School 使用上海科技大学标识，布局参考 FZU Beamer。
- Nature 基于 Slate Blocks；封面背景作者 Hao ZHANG，CC BY 4.0。

本实验只做视觉对照，不表示就读于示例学校，也不代表正式产品已接入这些主题。
