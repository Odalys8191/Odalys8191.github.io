---
title: AGC001E BBQ Hard
date: '2021-10-10T20:13:48+08:00'
updated: '2021-10-10T20:28:02+08:00'
permalink: Solutions/AGC001E-BBQ-Hard/cm34e3w5500275vtndowz84fw/
categories:
  - Solutions
tags:
  - 格路基础
  - 组合意义
  - Dp
mathjax: true
comments: false
excerpt: ' '
---

> 给 $n$ 个数对 $(a_i, b_i)$ , 要求
> 
> $$
> \sum\limits_{i=1}^n\sum\limits_{i<j}^n\binom{a_i+a_j+b_i+b_j}{a_i+b_i}
> $$
> 
> $$
> n\le 2\times 10^5, a_i, b_i \le 2020
> $$

<a id="solution"></a>

### Solution:

看妙题推荐来的…

但可能我们平时对这类问题的训练比较多，这个组合意义十分一眼

这个柿子显然有组合意义从 $(0,0)$ 到 $(a_i+a_j, b_i + b_j)$ 只准向上向右走到方案数。

注意到值域很小，于是平移下坐标，以每个 $(-a_i, -b_i)$ 为起点到每个 $(a_j, b_j)$ 方案数之和除以 $2$ 就好

这显然可以直接 $dp$

```cpp
/* ==============================
 *  Author : Odalys 
 *
 *  Blog : Odalys8191.github.io
 *
 *  Mail : minyuenu@gmail.com
 * =============================== */
#include <bits/stdc++.h>
using namespace std;
template <typename T> inline void read(T &a){
	T w=1; a=0;
	char ch=getchar();
	for(;ch < '0' || ch > '9';ch=getchar()) if(ch == '-') w=-1;
	for(;ch>='0'&&ch<='9';ch=getchar()) a=(a<<3)+(a<<1)+(ch^48);
	a*=w;
}
template <typename T> inline void ckmax(T &a, T b){a = a > b ? a : b;}
template <typename T> inline void ckmin(T &a, T b){a = a < b ? a : b;}
#define fi first
#define se second
#define pb push_back
#define mp make_pair
#define mii map<int, int> 
#define pii pair<int, int> 
#define vi vector<int> 
#define Debug(x) cout << #x << " = " << x << endl
#define For(i,l,r) for (int i = l; i <= r; ++i) 
#define foR(i,l,r) for (int i = l; i >= r; --i)
const int N = 2020;
const int M = 2e5 + 10;
const int Mod = 1e9 + 7;
inline int Mul (int x, int y) {
	return (1ll * x * y) >= Mod ? (1ll * x * y % Mod) : (x * y);
}
inline int Add (int x, int y) {
	return (x + y) >= Mod ? (x + y - Mod) : (x + y); 
}
inline int Sub (int x, int y) {
	return (x < y) ? (x + Mod - y) : (x - y);  
}
int f[N << 1][N << 1];

#define dp(x,y)	f[x + 2001][y + 2001]
int n;
int qpow (int a, int b) {
	int Ans = 1, base = a;
	while (b) {
		if (b & 1) Ans = Mul(Ans, base);
		base = Mul(base, base); 
		b >>= 1;
	}
	return Ans; 
}
int a[M], b[M];
int fac[N * 10], ifac[N * 10];
inline void Init (int M) {
	fac[0] = ifac[0] = 1;
	For (i, 1, M) fac[i] = Mul(fac[i - 1], i);
	ifac[M] = qpow (fac[M], Mod - 2);
	foR (i, M - 1, 1) ifac[i] = Mul(ifac[i + 1], i + 1);
}
int bin (int x, int y) {
	if (x < y || x < 0 || y < 0) return 0;
	return Mul(fac[x], Mul(ifac[y], ifac[x - y])); 
}
#define inv2 500000004 
int main() {
	Init ((N * 10) - 10); 
	read(n);
	memset (f, 0, sizeof f); 
	int mx = 0, my = 0, det = 0;
	For (i, 1, n) {
		read(a[i]), read(b[i]);  
		ckmax(mx, a[i]), ckmax(my, b[i]); 
		dp(-a[i], -b[i])++;
		det = Add(det, bin(2 * (a[i] + b[i]), 2 * a[i]));
	}
	For (i, -2000, mx) For (j, -2000, my)  
		dp(i, j) = Add(dp(i, j), Add(dp(i - 1, j), dp(i, j - 1)));
	int Ans = 0;
	For (i, 1, n) 
		Ans = Add(Ans, dp(a[i], b[i]));
	printf ("%d\n", Mul(Sub(Ans, det), inv2));
}
```
