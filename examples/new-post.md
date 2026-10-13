---
title: 图片与数学公式示例
date: 2026-10-13 20:00:00
tags:
  - 笔记
categories:
  - Notes
---

这里写摘要，首页在分隔符处截断。

<!-- more -->

## 图片

将自己的图片放入 `source/images/文章名/`，例如：

```markdown
![图片说明](/images/文章名/example.png)
```

## 数学公式

行内公式：$E=mc^2$，下标：$a_i$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\begin{aligned}
a &= b+c \\
  &= d+e
\end{aligned}
$$

$$
A=\begin{pmatrix}1&2\\3&4\end{pmatrix}
$$

> 引用块也可以包含公式：
>
> $$
> f(x)=x^2
> $$

这是构建时的 KaTeX 数学语法支持；不执行完整 LaTeX 文档或任意宏包。
