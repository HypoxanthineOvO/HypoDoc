---
title: 应用数值计算
subtitle: Applied Numerical Computing
course: 课程笔记 · 概念与推导
author: 学习笔记
theme: course-notes
profile: book
abstract: 从问题、假设和离散化出发，理解数值方法，再用例题检查结论。
---

# 从连续问题到数值方法

数值方法（Numerical Methods）把连续模型转化为有限规模的计算。记录笔记时，先解释未知量与假设，再展开公式推导。

## 有限差分 Finite Difference

对足够光滑的函数，Taylor 展开给出

$$f(x+h)=f(x)+hf'(x)+\frac{h^2}{2}f''(x)+O(h^3).$$

因此，前向差分 $D_h^+f(x)=[f(x+h)-f(x)]/h$ 的误差为 $O(h)$。步长减半时，主导截断误差约减半，但舍入误差仍需单独考虑。

::: {.note title="理解误差，而不只记住公式"}
一致性描述离散方程对连续模型的近似；稳定性描述扰动怎样传播。二者的含义不同，不能仅凭某次计算结果接近就判断方法可靠。
:::

## 用例题检查理解

:::: {.qa #difference kind="open" title="前向差分"}
::: {.question title="计算与解释"}
取 $f(x)=x^2$，计算 $D_h^+f(x)$ 并与精确导数比较。
:::
::: {.hint title="先展开分子"}
写出 $(x+h)^2-x^2$，再除以步长。
:::
::: {.answer title="参考答案"}
$D_h^+f(x)=2x+h$，精确导数为 $2x$，误差为 $h$。
:::
::::

# 方法比较

| 方法 | 公式 | 截断误差 |
| --- | --- | --- |
| 前向差分 | $[f(x+h)-f(x)]/h$ | $O(h)$ |
| 中心差分 | $[f(x+h)-f(x-h)]/(2h)$ | $O(h^2)$ |

普通解释用正文；只有需要提醒、总结或练习时才用 Box。
