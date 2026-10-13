---
title: CF22E Scheme
date: '2021-09-29T08:39:29+08:00'
updated: '2021-09-29T19:13:03+08:00'
permalink: Solutions/CF22E-Scheme/cm34e3w5i003b5vtn85kz9fsb/
categories:
  - Solutions
tags:
  - 图论
  - tarjan
mathjax: true
comments: false
excerpt: ' '
---

> 求让一张图变成强联通图至少增加多少边并输出边， 每个点只有一个出度。
> 
> $$
> n\le 1\times 10^5
> $$

<a id="solutions"></a>

### Solutions:

这种最优化问题不妨先考虑问题的下 / 上界，再寻找有无反例使得下 / 上界不能取到

本题中，由于每个点只有一个出度这个限制，也就是 $n$ 个点 $n$ 条边，不难发现会连出一张基环内向树森林。

考虑答案的下界一定是以环为根时，每棵树的叶子点数。因为这些点的入度为 $0$ ，想让图强连通起码得使它们的入度为 $1$ ，而一条边只能贡献 $1$ 入度。

考虑有无反例能否使下界无法取到。

考虑若只有一棵树，那答案就是下界，由于每个叶子出发都能到根，于是只要把根环中一点向每个叶子连边即可。

考虑如果是一片森林，如何构造使得答案离下界尽可能近，显然是选择一个叶子被下一棵树根相连，最后一棵树的叶子被第一个树相连。

~被摆王秒切了~

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
const int N = 1e5 + 10;
struct edge {
	int to, nxt;
} e[N << 1], edges[N << 1];
int head[N], cnt;
int Head[N], cnts; 
inline void add (int u, int v) {
	e[++cnt].to = v; e[cnt].nxt = head[u]; head[u] = cnt;
}

inline void addedge (int u, int v) {
	edges[++cnts].to = v; edges[cnts].nxt = Head[u]; Head[u] = cnts;
}

int sta[N], top, dfn[N], low[N], deep;
int vis[N], color, col[N];
int node[N];
void tarjan (int u) {
	dfn[u] = low[u] = ++deep;
	vis[sta[++top] = u] = 1;
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].to;
		if (!dfn[v]) tarjan(v), ckmin(low[u], low[v]);
		else if (vis[v]) ckmin(low[u], dfn[v]); 
	}
	if (dfn[u] == low[u]) {
		color++;
		node[color] = u;
		while (sta[top] != u) {
			col[sta[top]] = color;
			vis[sta[top--]] = 0;
		}
		col[sta[top]] = color;
		vis[sta[top--]] = 0;
	}
}
int du[N], rd[N];
int g[N], tot;
vi tr[N];

void dfs (int u) {
	int fl = 0;
	for (int i = Head[u]; i; i = edges[i].nxt) {
		int v = edges[i].to;
		fl = 1;
		dfs(v);
	}
	if (!fl) tr[tot].pb(u); 
}
int rt[N];
int main() {
	int n; read(n);
	For (i, 1, n) {	int x; read(x); add(i, x);  }
	For (i, 1, n) 
		if (!dfn[i]) tarjan(i);
	For (u, 1, n) 
		for (int i = head[u]; i; i = e[i].nxt) {
			int v = e[i].to;
			if (col[v] != col[u]) 
				du[col[v]]++, rd[col[u]]++, addedge(col[v], col[u]);
		}
	int Ans = 0;
	For (i, 1, color) {
		if (!rd[i]) {
			rt[i] = 1;
			tr[++tot].pb(i);
			dfs(i); 
			if (tr[tot].size() == 2 && tr[tot][0] == tr[tot][1]) continue;
			//Ans += tr[tot].size() - 1;
		}
	}
	For (i, 1, color) {
		if (!du[i]) {
			if (tot > 1) Ans++;
			else if (!rt[i]) Ans++;
		}
	}
	printf ("%d\n", Ans);
	if (!Ans) return 0;
	/*for (int i = 1; i <= tot; ++i) {
		cout <<"tree" << i << " " << endl;
		cout << tr[i][0] << endl;
		for (int j = 1; j < tr[i].size(); ++j) cout << tr[i][j] << " ";
		
	}*/
	if (tot == 1) {
		int m = tr[1].size() - 1;
		For (i, 1, m) printf ("%d %d\n", node[tr[1][0]], node[tr[1][i]]);
		return 0;
	}
	For (id, 1, tot) {
		int m = tr[id].size() - 1;
		For (i, 2, m) printf ("%d %d\n", node[tr[id][0]], node[tr[id][i]]);
		if (id < tot) 
			printf ("%d %d\n", node[tr[id][0]], node[tr[id + 1][1]]);
	}
	printf ("%d %d\n", node[tr[tot][0]], node[tr[1][1]]);
	return 0;
}
```
