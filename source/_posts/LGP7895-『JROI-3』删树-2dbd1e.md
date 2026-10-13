---
title: LGP7895 『JROI-3』删树
date: '2021-10-05T12:14:55+08:00'
updated: '2021-10-05T15:05:14+08:00'
permalink: Solutions/LGP7895-『JROI-3』删树/cm34e3w5r00465vtng78ddg4y/
categories:
  - Solutions
tags:
  - dfn妙用
  - 交互题
mathjax: true
comments: false
excerpt: ' '
---

> 一棵以 $1$ 为根的树，边权未知，你可以进行三种操作：
> 
> 1.  询问一个点的 dfn
> 2.  询问一条路径上边权和
> 3.  删除所有度数为 $1$ 的点，并重标号  
>     要求在 $142$ 次操作内得到当前树的边权总和。
> 
> $$
> n\le 5000
> $$

<a id="solution"></a>

### Solution:

从[这题](https://www.luogu.com.cn/problem/CF176E)中，我们得到一个关于 $dfn$ 的小 $trick$ ，就是若你知道一些关键点的 $dfn$ ，那么这些关键点的生成子图边权和等于按 dfn 排序后相邻点距离加最后一个点与第一个点距离除以 $2$ 。

证明个人觉得还是十分简单的，考虑沿着 dfn 顺序，若为子树内节点则向下拉一条覆盖边，否则则向上拉到另一棵子树内，不难发现这样会一来一回经过生成子图上的边两次。

然后在本题中，我们考虑找到一些关键点，使其生成子图为整棵树，那么不难发现取的这些关键点是根 $1$ + 所有叶子。

那么对于一个大小为 $s$ 的关键点集合，我们想要借以求出整棵树的边权和，需要 $2s$ 次询问， $s$ 次询问求集合 dfn ， $s$ 次询问求两两路径和。设当前剩余操作次数为 $cur$ ， 若 $2s \le cur - 1$ ，那就可以直接做了，否则我们需要删掉所有度数为 $1$ 的点直到 $2s \le cur - 1$ 为止。为什么可以直接删？因为当不满足条件时叶子数是大于 $cur \over 2$ 的，所以你每次起码会删掉大于 $cur \over 2$ 个叶子。而这题点数 $5000$ ，注意到 $71 + 70 + 70 + 69 + 69 + 68 +68 + \dots = 5041 > 5000$ ，所以一定会在删完前得到一组可以计算的答案。

```cpp
/* ==============================
 *  Author : Odalys 
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
#define pii pair<int, int> 
#define vi vector<int> 
#define Debug(x) cout << #x << " = " << x << endl
#define For(i,l,r) for (int i = l; i <= r; ++i) 
#define foR(i,l,r) for (int i = l; i >= r; --i)
#define mck fflush(stdin)
#define gra fflush(stdout)
const int N = 5050;
int du[N];
int n;
int ck () {
	int res = 0;
	For (i, 1, n) if (du[i] == 1) res++; 
	if (du[1] != 1) res++; 
	return res;
}
struct Node {
	int id, dfn;
	Node( int Id = 0, int Dfn = 0) {
		id = Id, dfn = Dfn;
	}
	bool operator < (const Node &x) const {
		return dfn < x.dfn;
	}
} s[N];
int Get (int x) {
	printf ("dfn %d\n", x); mck, gra;
	int xx; read(xx); return xx;
}
int Val (int x, int y) {
	printf ("dis %d %d\n", x, y); mck, gra;
	int xx; read(xx); return xx;
}
int main() {
	read(n);
	For (i, 1, n) read(du[i]);
	int rem = 142;
	while (ck() > (rem - 1) / 2) {
		printf ("del\n"); mck, gra;
		rem--;
		read(n);
		For (i, 1, n) read(du[i]); 
	}
	int cnt = 0;
	For (i, 1, n) 
		if (du[i] == 1) s[++cnt] = Node(i, Get(i)); 
	if (du[1] != 1) s[++cnt] = Node(1, 1);
	sort (s + 1, s + cnt + 1); 
	int Ans = 0;
	For (i, 1, cnt - 1) {
		Ans += Val(s[i].id, s[i + 1].id);
	}
	Ans += Val(s[cnt].id, s[1].id);
	printf ("! %d\n", Ans / 2); mck, gra;
	return 0;
}
```
