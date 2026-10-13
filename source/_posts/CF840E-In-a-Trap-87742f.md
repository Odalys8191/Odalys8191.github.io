---
title: CF840E In a Trap
date: '2021-10-13T21:14:28+08:00'
updated: '2021-10-13T21:42:05+08:00'
permalink: Solutions/CF840E-In-a-Trap/cm34e3w5k003j5vtn1f3j6g76/
categories:
  - Solutions
tags:
  - 妙题
  - 分块
  - 数据结构
  - 每天一道DS题
mathjax: true
comments: false
excerpt: ' '
---

想了一天不会做。

晚上看题解两小时才看懂。。。

思维能力如何提升啊！！！！

完全想不到啊 /sad

> 一棵树，点带权，每次询问 $(u,v)$ 保证 $u$ 为 $v$ 祖先，求 $u \to v$ 中 $\max(a_i\ \texttt{xor}\ dis(i, v))$
> 
> $$
> n\le 5\times 10^4, a_i\le n
> $$

<a id="solutions"></a>

## Solutions:

异或运算感觉没有什么特殊性质，所以感觉每道题重复的 $trick$ 很多。

在这题中，由于保证了给出的 $u$ 为 $v$ 的祖先，然后值域又大概在二进制下只有 $16$ 位，于是我们考虑每个点向上 $256$ 个点分为一块，每一块中 $dep$ 的前 $8$ 位是一模一样的，然后往上跳一个块前八位会加上一个 $1$ ，于是我们朴素地想对每个块预处理出答案，散块直接暴力即可。

每个块如何预处理答案？设 $f_{x, j}$ 表示第 $x$ 号点往上 $256$ 个节点中，前面还经过了 $j$ 个块时的答案。  
因为位数不同，*异或时是相对独立的*，所以我们可以这么搞：  
前八位与后八位分开处理  
我们可以把当前每个 $a_i$ 的后八位异或上块内的每个 $dep$ （一定小于 $256$ ）放到一个前八位的桶里，先存着。

我们把每个 $a_i$ 前八位放到一个 $trie$ 里，然后对于每个 $j$ 我们在 $trie$ 上找到最大的一个前八位，再把后八位拼起来就是 $f_{x,j}$ 乐

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
const int N = 5e4 + 10;
struct edge {
	int to, nxt; 
} e[N << 1];
int head[N], cnt;
inline void add (int u, int v) {
	e[++cnt].to = v; e[cnt].nxt = head[u]; head[u] = cnt;
}
int dp[N][32], dep[N];
void dfs (int u, int fa) {
	dep[u] = dep[fa] + 1, dp[u][0] = fa;
	for (int i = 1; (1 << i) <= dep[u]; ++i) 
		dp[u][i] = dp[dp[u][i - 1]][i - 1];
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].to;
		if (v == fa) continue;
		dfs (v, u); 
	}
}
int n, q;
int a[N]; 

struct Trie {
	int ch[2048][2], tot, rt;
	inline void clear () {
		memset (ch, 0, sizeof ch); 
		tot = 1; rt = 1;
	}
	inline void ins (int x) {
		int cur = rt;
		foR (i, 7, 0) {
			int p = (x >> i) & 1;
			if (!ch[cur][p]) ch[cur][p] = ++tot;
			cur = ch[cur][p];
		}
	}
	int que (int x) {
		int Ans = 0, cur = rt;
		foR (i, 7, 0) {
			int p = (x >> i) & 1;
			if (ch[cur][!p]) Ans |= (1 << i), cur = ch[cur][!p];
			else cur = ch[cur][p];
		}
		return Ans;
	}
} tr;
const int B = 256;
int mxp[260], mx[N][260];

int main() {
	read(n); read(q);
	For (i, 1, n) read(a[i]);
	For (i, 1, n - 1) {
		int u, v; read(u); read(v); add(u, v); add(v, u); 
	}
	dfs (1, 0);
	For (i, 1, n) {
		tr.clear(); 
		memset (mxp, 0, sizeof mxp);
		for (int j = i, st = 0; j && st < B; j = dp[j][0], st++) {
			ckmax(mxp[a[j] >> 8], st ^ (a[j] & (B - 1)));
			tr.ins(a[j] >> 8);
		} 
		For (j, 0, B - 1) {
			int p = tr.que(j);
			ckmax(mx[i][j], (p << 8) | mxp[p ^ j]); 
		}
	}
	For (i, 1, q) {
		int u, v; read(u); read(v);
		int cur = v, st = 0, Ans = 0;
		while (dep[cur] - dep[u] >= B) ckmax(Ans, mx[cur][st]), st++, cur = dp[cur][8];
		while (cur ^ u) ckmax(Ans, a[cur] ^ (dep[v] - dep[cur])), cur = dp[cur][0];
		ckmax(Ans, a[u] ^ (dep[v] - dep[u]));
		printf ("%d\n", Ans);
	}
}
```
