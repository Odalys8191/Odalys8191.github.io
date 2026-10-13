---
title: LOJ6669 Nauuo and Binary Tree
date: '2021-10-10T21:50:55+08:00'
updated: '2021-10-10T22:04:39+08:00'
permalink: Solutions/LOJ6669-Nauuo-and-Binary-Tree/cm34e3w5s004a5vtn98w8ekv8/
categories:
  - Solutions
tags:
  - 妙题
  - 重链剖分
  - 交互
mathjax: true
comments: false
excerpt: ' '
---

> 一棵不确定的二叉树，以 $1$ 为根，每次可询问两点间距离，还原这棵树。  
> $n\le 3000$ 询问次数 30000

<a id="solution"></a>

### Solution

喵喵的题

首先用 $n$ 次询问我们能把每个点的深度求出来

然后我们按深度从小到大处理

深度为 $1$ 显然爹就是 $1$

然后考虑我们正在处理深度为 $i$ 的一坨点，深度为 $1\to i - 1$ 已经被我们处理完，现在处理到 $x$ 点。

考虑将已经算出来的点做一遍重剖

考虑从 $1$ 出发的一条重链链底 $y$ ，我们询问 $dis(x, y)$ ，然后利用这种题常用的一个等式 dis(x,y) = dep\_x + dep\_y - 2 \* dep\_

我们可以算出 $x,y$ 的 $lca$ 的 $dep$ ，而一条重链上 $dep$ 两两不同，所以我们可以唯一确定 $lca$

这又是棵二叉树，所以若 $lca$ 在 $1$ 的重儿子所在子树内，则可以确定 $x$ 在 $1$ 重儿子这棵子树，否则就在另外一棵子树中，我们递归地来做一个事情就好，由于重剖的性质，总询问次数是 $n + n\log n$ 的。

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
inline int read(){
	int w = 1, a = 0;
	char ch=getchar();
	for(;ch < '0' || ch > '9';ch=getchar()) if(ch == '-') w=-1;
	for(;ch>='0'&&ch<='9';ch=getchar()) a=(a<<3)+(a<<1)+(ch^48);
	return a * w;
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
#define MckennaGrace fflush(stdin), fflush(stdout);
const int N = 3030;
int dep[N], n, fa[N], tot;

int Dis (int x, int y) {
	printf ("? %d %d", x, y); MckennaGrace
	return read();
}

vi cur[N];
int ch[N][2];
inline void add (int u, int v) { if (!ch[u][0]) ch[u][0] = v; else ch[u][1] = v; fa[v] = u;}
int siz[N], bot[N];
void dfs (int u) {
	siz[u] = 1, bot[u] = u;
	if (ch[u][0]) {
		dfs(ch[u][0]); siz[u] += siz[ch[u][0]];
	}
	if (ch[u][1]) {
		dfs(ch[u][1]); siz[u] += siz[ch[u][1]];
		if (siz[ch[u][1]] > siz[ch[u][0]]) swap(ch[u][0], ch[u][1]);
	}
	if (ch[u][0]) bot[u] = bot[ch[u][0]]; 
}


inline void solve (int u) {
	int v = 1, D;
	while (dep[v] != dep[u] - 1) {
		D = Dis(bot[v], u); 
		D = (dep[u] + dep[bot[v]] - D) / 2;
		while (dep[v] < D) v = ch[v][0];
		if (dep[v] == dep[u] - 1) break;
		v = ch[v][1];
	}
	add(v, u);
}

int main() {
	n = read();
	int mx = 0;
	For (i, 2, n) dep[i] = Dis(1, i), cur[dep[i]].pb(i), ckmax(mx, dep[i]);
	fa[1] = 1;
	for (auto v : cur[1]) add(1, v);
	For (i, 2, mx) {
		dfs(1);
		for (auto u : cur[i]) solve (u); 
	}
	printf ("! ");
	For (i, 2, n) printf ("%d ", fa[i]); 
	MckennaGrace
}
```
