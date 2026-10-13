---
title: JOISC 2020 Day4
date: '2021-09-30T16:17:00+08:00'
updated: '2021-09-30T16:45:34+08:00'
permalink: Solutions/JOISC-2020-Day4/cm34e3w5o003z5vtn7w5w6dr0/
categories:
  - Solutions
tags:
  - 数据结构
  - tarjan
  - 树链剖分
  - dfn 的相关应用
mathjax: true
comments: false
excerpt: ' '
---

<a id="capital-city"></a>

### $Capital\ City$

> 一棵树，每个点有个颜色，可以合并两个颜色 $(x,y)$，效果为把所有颜色 $y$ 的改为 $x$ ，求最少的合并次数使得存在一个颜色联通块内部无其他颜色。
> 
> $$
> n,k\le 1\times 10^5
> $$

<a id="solutions"></a>

#### Solutions:

大概思路是，若一个颜色 $x$ 内部有其它颜色 $y$ ，那连边 $x\to y$ ，代表如果要以 $x$ 为首都必须合并 $y$

具体的，我们把一个颜色的点按 dfn 排序，然后相邻的点路径上连边可以把这个颜色块的生成子图都覆盖一遍，考虑路径连边，套路的上树链剖分，再用个线段树优化连边的小技巧。

建出图后跑 $tarjan$ 找最小的出度为 $0$ 联通块大小就好

有亿点点细节，但应该是思维难度极低的 $JOISC$

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
const int N = 1e6 + 10;
const int V = 1e6 + 10;
vi g[N], G[V], grace[N];
int n, k;
int fa[N], tp[N], son[N], siz[N]; 
int dfn[N], dfntot, rnk[N], dep[N];
int c[N];
void dfs1 (int u, int father) {
	fa[u] = father;
	siz[u] = 1; dep[u] = dep[father] + 1;
	for (auto v : g[u]) {
		if (v == fa[u]) continue;
		dfs1(v, u); siz[u] += siz[v];
		if (siz[v] > siz[son[u]]) son[u] = v;
	}
}
int Node;
void dfs2 (int u, int Top) {
	rnk[dfn[u] = ++dfntot] = u; tp[u] = Top;
	if (!son[u]) return;
	dfs2 (son[u], Top);
	for (auto v : g[u]) {
		if (v == fa[u] || v == son[u]) continue;
		dfs2 (v, v);
	}
}

struct SEG {
	int ls, rs, k, l, r; 
} tr[N << 2]; 


int build (int l, int r) {
	int x = ++Node;
	tr[x].l = l; tr[x].r = r;
	if (l == r) return G[x].pb(c[rnk[l]]), x; 
	int mid = l + r >> 1;
	tr[x].ls = build (l, mid);
	tr[x].rs = build (mid + 1, r);
	G[x].pb(tr[x].ls), G[x].pb(tr[x].rs); 
	return x;
}

void update (int x, int ll, int rr, int mck) {
	if (ll <= tr[x].l && tr[x].r <= rr) return G[mck].pb(x), void();
	int mid = tr[x].l + tr[x].r >> 1;
	if (ll <= mid) update(tr[x].ls, ll, rr, mck);
	if (rr > mid) update(tr[x].rs, ll, rr, mck);
}
int rt;

int LCA (int x, int y) {
	int fx = tp[x], fy = tp[y];
	while (fx != fy) {
		if (dep[fx] >= dep[fy]) x = fa[fx];
		else y = fa[fy];
		fx = tp[x], fy = tp[y];
	}
	return dep[x] < dep[y] ? x : y;
}

void upd (int x, int y, int Color) {
	int fx = tp[x], fy = tp[y];
	while (fx != fy) {
		if (dep[fx] >= dep[fy]) {
			update(rt, dfn[fx], dfn[x], Color), x = fa[fx];
		}
		else {
			update(rt, dfn[fy], dfn[y], Color), y = fa[fy];
		}
		fx = tp[x], fy = tp[y]; 
	}
	if (dfn[x] > dfn[y]) swap(x, y);
	update(rt, dfn[x], dfn[y], Color); 
}
int lw[V], df[V], deep;
int col[V], sta[V], top, color;
int vis[N];
void tarjan (int u) {
	lw[u] = df[u] = ++deep;
	vis[sta[++top] = u] = 1;
	for (auto v : G[u]) 
		if (!df[v]) tarjan(v), ckmin(lw[u], lw[v]); 
		else if (vis[v]) ckmin(lw[u], df[v]); 
	if (lw[u] == df[u]) {
		color++;
		while (sta[top] != u) {
			vis[sta[top]] = false;
			col[sta[top--]] = color;
		}
		vis[sta[top]] = false;
		col[sta[top--]] = color;
	}
}
int du[N], si[N];
int main() {
	read(n); read(k);
	For (i, 1, n - 1) {
		int x, y; read(x); read(y);
		g[x].pb(y), g[y].pb(x); 
	}
	For (i, 1, n) {
		read(c[i]); 
		grace[c[i]].pb(i);
	}	
	dfs1(1, 0), dfs2(1, 1);
	Node = k; rt = build(1, n);
	For (i, 1, k) {
		sort (grace[i].begin(), grace[i].end(), [&] (int x, int y) {return dfn[x] < dfn[y];} );
		
		int nx = grace[i].size() - 1; 
		For (j, 1, nx) upd(grace[i][j - 1], grace[i][j], i);
	}
	For (i, 1, Node) if (!df[i]) tarjan(i); 
	For (u, 1, k) si[col[u]]++;
	For (u, 1, Node) 
		for (auto v : G[u]) if (col[v] != col[u]) du[col[u]]++;
	int Ans = 0x3f3f3f3f;
	For (i, 1, k) if (!du[col[i]]) ckmin(Ans, si[col[i]] - 1);
	cout << Ans;
	return 0;
}
```
