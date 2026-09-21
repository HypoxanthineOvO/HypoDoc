# LaTeX 专用多栏速查表

普通速查表先使用[共享模板](../src/hypolatex/resources/starters/cheatsheet.md)。下文的 grid/cell 是 PDF 后端专用扩展，不保证 Desktop/Web 预览兼容；仅在确实需要多栏时使用。

C5 增加的是面向紧凑速查表的 layout API。作者在 Markdown frontmatter 中写
`profile: article` 与 `layout: cheatsheet`，即可让同一篇 `article`
进入 cheatsheet 版式路径。这里的 API 是文档版式约定，不是新的命令行入口；
构建 PDF 仍使用已有 build 流程。

## layout API

`layout api` 只负责声明文档布局。当前 cheatsheet 公共契约的核心字段是：

```yaml
---
profile: article
layout: cheatsheet
---
```

`layout: cheatsheet` 会启用紧凑页面节奏、较密的模块间距，以及适合速查表的
grid/cell 渲染。它仍然属于 `article` 文档类型，因此正文、标题、受控表格和
C3 语义块保持兼容。

## grid/cell syntax

速查表内容建议放在 `cheatsheet-grid` 中，再用 `cheatsheet-cell` 表示每个知识
单元。grid 控制列数和间距，cell 记录类型、标题、优先级、跨度和是否必须保留。

```markdown
:::: {.cheatsheet-grid columns="3" gap="compact"}
::: {.cheatsheet-cell type="formula" title="Derivative Rules" priority="high" span="1" keep="true"}
- Power rule: $d(x^n)/dx = nx^{n-1}$
- Chain rule: $d(f(g(x)))/dx = f'(g(x))g'(x)$
:::

::: {.cheatsheet-cell type="concept" title="Review Checks" priority="medium" span="1" keep="false"}
- State assumptions.
- Keep formulas exact.
- Drop examples before formulas.
:::
::::
```

`cheatsheet-cell` 的 `priority="high"` 和 `keep="true"` 会影响 AI 工作流里的压缩
判断：这些单元应优先保留，除非用户明确放宽约束。

## article fallback

当文档是 `profile: article` 但没有设置 `layout: cheatsheet` 时，系统走
普通 article fallback 行为，也就是标准文章布局。换句话说，`article` 是稳定的
基础文档类型，`layout: cheatsheet` 是在这个基础上打开紧凑速查表布局；没有该
layout 时不会破坏原有 article 渲染。

## target pages

如果用户指定目标页数，应在构建后核对。内容无法在保持可读性的同时放入目标页数时，说明取舍并请用户决定，不静默增加页数或删掉重要内容。压缩顺序依据用户用途决定，不固定为某一种内容优先。

## compact table

速查表也可以使用受控表格 DSL。对高密度对照表，使用 `.table` 并声明
`type="cheatsheet"` 与 `density="compact"`。

```markdown
::: {.table type="cheatsheet" density="compact" width="0.92" caption="Sample quick reference" label="tab:sample-quick-reference"}
| Signal | Action | Evidence |
| --- | --- | --- |
| Formula | Keep exact | Equation visible |
| Keypoint | Merge when needed | One-line summary |
| Example | Omit first | Optional sample |
:::
```
