---
title: CF176E Archaeology
date: '2021-09-27T20:21:22+08:00'
updated: '2021-09-28T19:45:10+08:00'
permalink: Solutions/CF176E-Archaeology/cm34e3w5g00355vtn0nwj4wbb/
categories:
  - Solutions
tags:
  - stl
  - 数据结构
  - 每天一道DS题
  - dfn妙用
mathjax: true
comments: false
excerpt: ' '
---

-   树上关键点的生成子图等于按 dfn 序后相邻点距离加最后一个点与第一个点距离

> 一棵树，树边带权，初始每个点都为白色，三种操作：染白，染黑，询问所有黑点的生成子图边权和。
> 
> $$
> n\le 10^5
> $$

<a id="solution"></a>

### Solution:

口胡：  
考虑加入一个点的贡献，发现是到之前生成子图中某点的距离，然后要使用很复杂的东西来维护，然后就不会做了。  
实际上可以考虑全局来看这个问题，发现把黑点的 $dfn$ 放一起排序后相邻点距离加上第一个与最后一个点的距离除以二就是黑点的生成子图距离和。  
证明个人觉得还是十分简单的，考虑顺着 $dfn$ 顺序，若为子树内节点则向下拉一条覆盖边，否则则向上拉到另一棵子树内，不难发现这样会一来一回经过生成子图上的边两次，关键在于感觉自己不太能想到这样维护生成子图。  
如果想到这样一个性质那这题就很好做了，考虑使用 $set$ 即可维护这样一个 $dfn$ 序列，修改一次是 $\log$ 的，查询是 $1$ 的。  
感觉这种妙题难以想到，还是要多总结

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
#define int long long
const int N = 1e5 + 10;
struct edge {
	int to, nxt, dis; 
} e[N << 1];
int head[N], cnt;
inline void add (int u, int v, int w) {
	e[++cnt].to = v; e[cnt].nxt = head[u]; e[cnt].dis = w; head[u] = cnt;
}
int dep[N], dis[N];
int dp[N][32], val[N][32];
int dfn[N], dfntot, rnk[N];
void Init (int u, int fa) {
	dep[u] = dep[fa] + 1;
	dp[u][0] = fa;
	dfn[u] = ++dfntot;
	rnk[dfntot] = u;
	for (int i = 1; (1 << i) <= dep[u]; ++i) 
		dp[u][i] = dp[dp[u][i - 1]][i - 1];
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].to;
		if (v == fa) continue;
		dis[v] = dis[u] + e[i].dis;
		Init(v, u); 
	}
}
int LCA (int x, int y) {
	if (dep[x] < dep[y]) swap(x, y);
	foR (i, 22, 0) 
		if (dep[x] - (1 << i) >= dep[y]) x = dp[x][i];
	if (x == y) return x;
	foR (i, 22, 0)
		if (dp[x][i] != dp[y][i]) x = dp[x][i], y = dp[y][i];
	return dp[x][0];
}

int Dis (int x, int y) {
	int lca = LCA(x, y);
	return dis[x] + dis[y] - 2 * dis[lca];
}
set <int> mck;
int Ans;
void ins (int x) {
	mck.insert (dfn[x]);
	if (mck.size() <= 1) return ;
	auto it = mck.lower_bound(dfn[x]), en = mck.end(); en--;
	if (it == mck.begin()) {
		auto fo = it; fo++;
		Ans -= Dis(rnk[*fo], rnk[*en]);
		Ans += Dis(x, rnk[*fo]);
		Ans += Dis(x, rnk[*en]);
	}
	else if (it == en) {
		auto fo = it; fo--;
		Ans -= Dis(rnk[*mck.begin()], rnk[*fo]);
		Ans += Dis(rnk[*mck.begin()],rnk[*en]);
		Ans += Dis(rnk[*fo], rnk[*en]); 
	}
	else {
		auto la = it, nx = it; la--, nx++;
		Ans -= Dis(rnk[*la], rnk[*nx]);
		Ans += Dis(rnk[*la], x);
		Ans += Dis(rnk[*nx], x);
	}	
}


void era (int x) {
	if (mck.size() <= 1) {mck.erase(dfn[x]); return ;}
	auto it = mck.lower_bound(dfn[x]), en = mck.end(); en--;
	if (it == mck.begin()) {
		auto fo = it; fo++;
		Ans += Dis(rnk[*fo], rnk[*en]);
		Ans -= Dis(x, rnk[*fo]);
		Ans -= Dis(x, rnk[*en]);
	}
	else if (it == en) {
		auto fo = it; fo--;
		Ans += Dis(rnk[*mck.begin()], rnk[*fo]);
		Ans -= Dis(rnk[*mck.begin()],rnk[*en]);
		Ans -= Dis(rnk[*fo], rnk[*en]); 
	}
	else {
		auto la = it, nx = it; la--, nx++;
		Ans += Dis(rnk[*la], rnk[*nx]);
		Ans -= Dis(rnk[*la], x);
		Ans -= Dis(rnk[*nx], x);
	}	
	mck.erase(dfn[x]); 
}


signed main() {
	int n; read(n);
	For (i, 1, n - 1) {
		int u, v, w; read(u); read(v); read(w);
		add(u, v, w), add(v, u, w);
	}
	Init(1, 0);
	puts("");
	int m; read(m);
	while (m--) {
		char opt[3]; int x;
		scanf ("%s", opt); 
		if (opt[0] == '+') {
			read(x); ins(x);
		}
		if (opt[0] == '-') {
			read(x); era(x); 
		}
		if (opt[0] == '?') 
			printf ("%lld\n", Ans / 2ll);
	}
}
```
