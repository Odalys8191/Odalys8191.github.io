---
title: CF916E-Jamie and Tree
date: '2021-11-14T19:58:46+08:00'
updated: '2021-11-14T20:07:15+08:00'
permalink: Solutions/CF916E-Jamie-and-Tree/cm34e3w5l003n5vtnb9b0fbf7/
categories:
  - Solutions
tags:
  - 分类讨论
  - 线段树
  - 每天一道DS题
  - dfn妙用
mathjax: true
comments: false
excerpt: ' '
---

有个换根的操作十分麻烦，于是考虑并不真正地换根。

考虑以 $1$ 为根建树，如果你目前被换成的根为 $rt$ ，那对于点对 $(u,v)$ 的 $lca$ 是什么。

手玩一下不难发现是 $lca(u, rt), lca(u, v), lca(v, rt)$ 中深度较为深的那个。

那么现在我们要处理的问题就变成了维护 $lca$ 的子树和。

维护子树和，是 $dfn$ 的一个经典运用，考虑这题，发现大力讨论就可以做了。

```cpp
#include <bits/stdc++.h>
using namespace std;
template <typename T> inline void read(T &a){
    T w = 1; a = 0;
    char ch = getchar();
    for(; ch < '0' || ch > '9'; ch = getchar()) if(ch == '-') w = -1;
    for(; ch >= '0' && ch <= '9'; ch = getchar()) a = (a * 10) + (ch - '0');
    a *= w;
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
#define si set<int> 
#define ins insert
#define era erase
#define Debug(x) cout << #x << " = " << x << endl
#define For(i,l,r) for (int i = l; i <= r; ++i) 
#define foR(i,l,r) for (int i = l; i >= r; --i)
#define int long long
const int N = 1e5 + 10;
int n, m;
int val[N];
vi to[N];
int dep[N], dp[N][32];
int dfn[N], dfntot, rnk[N];
int low[N];
void dfs (int u, int fa) {
	rnk[dfn[u] = ++dfntot] = u;
	dep[u] = dep[fa] + 1;
	dp[u][0] = fa; 
	for (int i = 1; (1 << i) <= dep[u]; ++i)
		dp[u][i] = dp[dp[u][i - 1]][i - 1]; 
	for (auto v : to[u]) {
		if (v == fa) continue;
		dfs(v, u); 
	}
	low[u] = dfntot;
}
int LCA (int x, int y) {
	if (dep[x] < dep[y]) swap(x, y);
	foR (i, 20, 0) if (dep[x] - (1 << i) >= dep[y]) x = dp[x][i];
	if (x == y) return x;
	foR (i, 20, 0) if (dp[x][i] != dp[y][i]) x = dp[x][i], y = dp[y][i];
	return dp[x][0]; 
}
int LCA_son (int x, int y) {
	if (dep[x] < dep[y]) swap(x, y);
	foR (i, 20, 0) if (dep[x] - (1 << i) > dep[y]) x = dp[x][i];
	if (dp[x][0] == y) return x;
	foR (i, 20, 0) if (dp[x][i] != dp[y][i]) x = dp[x][i], y = dp[y][i];
	return x; 
}
 
#define ls x << 1
#define rs x << 1 | 1
 
int tag[N << 2], sum[N << 2];
inline void pushup (int x) { sum[x] = sum[ls] + sum[rs]; }
inline void push (int x, int l, int r, int v) {
	tag[x] += v, sum[x] += (r - l + 1) * v;
}
inline void pushdown (int x, int l, int r) {
	if (tag[x]) {
		int mid = l + r >> 1;
		push(ls, l, mid, tag[x]), push(rs, mid + 1, r, tag[x]);
		tag[x] = 0;
	}
}
void build (int x, int l, int r) {
	if (l == r) return (sum[x] = val[rnk[l]]), void();
	int mid = l + r >> 1;
	build (ls, l, mid), build (rs, mid + 1, r);
	pushup(x);
}
 
void update (int x, int l, int r, int ll, int rr, int v) {
	if (ll <= l && r <= rr) return push(x, l, r, v), void();
	int mid = l + r >> 1;
	pushdown(x, l, r);
	if (ll <= mid) update (ls, l, mid, ll, rr, v);
	if (rr > mid) update(rs, mid + 1, r, ll, rr, v);
	pushup(x); 
}
 
int query (int x, int l, int r, int ll, int rr) {
	if (ll <= l && r <= rr) return sum[x];
	int ans = 0, mid = l + r >> 1;
	pushdown(x, l, r);
	if (ll <= mid) ans += query (ls, l, mid, ll, rr);
	if (rr > mid) ans += query (rs, mid + 1, r, ll, rr);
	return ans;
}
int rt, Mck;
signed main() {
	read(n), read(m);
	For (i, 1, n) read(val[i]);
	For (i, 2, n) {
		int u, v; read(u), read(v);
		to[u].pb(v), to[v].pb(u); 
	}
	dfs(1, 0); 
	build (1, 1, n);
	rt = 1;
	For (i, 1, m) {
		int op; read(op);
		if (op == 1) read(rt);	
		if (op == 2) {
			int u, v, det; read(u), read(v); read(det); 
			int lca = LCA(u, v);
			int tmp = LCA(u, rt);
			(dep[tmp] > dep[lca]) ? lca = tmp : Mck = 1;  
			tmp = LCA(v, rt);
			(dep[tmp] > dep[lca]) ? lca = tmp : Mck = 1;
			int llccaa = LCA(lca, rt);
			if (llccaa != lca && llccaa != rt) {
				update(1, 1, n, dfn[lca], low[lca], det); 
				continue;
			}
			if (lca == rt) push(1, 1, n, det);
			else if (llccaa == rt) {
				update (1, 1, n, dfn[lca], low[lca], det); 
			}
			else {
				Mck = LCA_son(lca, rt);
				push(1, 1, n, det);
				update(1, 1, n, dfn[Mck], low[Mck], -det); 
			}
		}
		if (op == 3) {
			int u; read(u);
			if (u == rt) { 
				printf ("%lld\n", query(1, 1, n, 1, n)); 
				continue; } 
			int lca = LCA(u, rt); 
			if (lca != u && lca != rt) {
				printf ("%lld\n", query(1, 1, n, dfn[u], low[u]));		
				continue;
			}
			if (u == rt) printf ("%lld\n", query (1, 1, n, 1, n));
			else if ( lca == rt )
				printf ("%lld\n", query(1, 1, n, dfn[u], low[u]));
			else {
				Mck = LCA_son(u, rt);
				printf ("%lld\n", query (1, 1, n, 1, n) - query (1, 1, n, dfn[Mck], low[Mck]));
			}
		}
	}
	return 0;
}
```
