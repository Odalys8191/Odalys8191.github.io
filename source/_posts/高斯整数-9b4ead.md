---
title: 高斯整数
date: '2022-02-24T21:07:00+08:00'
updated: '2022-02-24T21:22:11+08:00'
permalink: Notes/高斯整数/cm34e3w6e005x5vtn6bi6a2fe/
categories:
  - Notes
tags:
  - 数论
  - 高斯整数
mathjax: true
comments: false
excerpt: ' '
---

> 由于完全不懂什么

<a id="1define"></a>

## 1.Define

通俗理解，高斯整数就是实部虚部都为整数的虚数。

然后对于乘法加法满足交换律，形成一个交换环

它的**模**就是虚数那一套，由于完全平方数的性质，它不能表示为 $4k+1$ 。

高斯整环也是欧几里得环，具有很多与整数相同的性质，于是**可以辗转相除，裴蜀定理，中国剩余定理，唯一分解定理…**

可以类似定义高斯素数，性质什么的就不学了

**唯一分解**

类似整数拉

**最大公约数**

两个高斯整数的 gcd 并不唯一，而是，$d,-d,di,-di$

```cpp
Complex div(Complex a, Complex b) {
	long double mo = b.norm();
	Complex c = a * b.conj();
	long double r = 1. * c.r / mo, i = 1. * c.i / mo;
	return Complex(round(r), round(i));
}
Complex gcd(Complex a, Complex b) {
	if (b.r == 0 && b.i == 0) return a;
	Complex c = div(a, b);
	return gcd(b, a - b * c);
}
```

**同余和剩余系**

两个高斯整数，若差是另一个高斯整数的整数倍，就称模意义下同余

这也是一种等价关系，可据此将高斯整数分为若干等价类。

鸽了，不知道有啥用。
