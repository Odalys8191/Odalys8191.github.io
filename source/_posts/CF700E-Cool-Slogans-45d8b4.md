---
title: CF700E Cool Slogans
date: '2022-01-16T08:37:28+08:00'
updated: '2022-01-16T08:54:43+08:00'
permalink: Solutions/CF700E-Cool-Slogans/cm34e3w5j003f5vtnd3nk6cci/
categories:
  - Solutions
tags:
  - dp
  - SAM
  - 线段树合并
  - endpos性质
mathjax: true
comments: false
excerpt: ' '
---

首先可以发现满足条件的 $s_{i-1}$ 一定会是 $s_{i}$ 的后缀，考虑反证，若存在不是后缀，那一定是中间一段，把后面切掉不会使得答案更劣。

然后就考虑在 SAM 的 $\texttt{parents-tree}$ 上做一些事情，我们已经知道满足条件的 $s_{i-1}$ 一定是 $s_{i}$ 的一个祖先，但这并没有考虑到满足出现两次这样一个限制，我们来观察满足限制的 $endpos$ 之间的关系。

容易发现，设 $s_i$ 的 $endpos$ 中有一组满足题意的 $x$ ，则 $s_{i-1}$ 比 $s_{i}$ 多的 $endpos$ 一定要 \\in \\\[x-len\_{s\_i} + len\_{s\_{i-1}}, pos\_{x}-1\\\] 。

那么考虑在 \\texttt{parents\_tree} 上 $dp$ ，若满足上述条件则可以转移，上述条件的判断可以直接使用线段树合并维护出 $endpos$ 集合然后直接判断，若符合条件则 $dp_{u} =dp_{v} +1$ 。还值得关注的一点是该从哪里转移，由于每次转移都只会加一，我们可以记录 $fa_u$ 表示最浅的与 $u$ dp 值相同的位置，然后直接从 $fa_{fa_u}$ 转移。

代码上的细节：  
1\. 线段树维护 $endpos$ 集合时可以搞出一个 $topu$ 序，避免了麻烦的处理。  
2\. 线段树合并时如果 $rt_x$ 没给它设初值，要设置，避免混淆。  
3\. 线段树维护 $endpos$ 时可以不给他加东西表示，直接看存不存在这个点就能判断 $[l,r]$ 中有没有 $endpos$。

```cpp
/* ==============================
 *  Author : Odalys 
 *
 *  Blog : Odalys.xyz
 *
 *  Mail : minyuenu@gmail.com
 * =============================== */
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
const int N = 2e5 + 10;
const int M = 1e7 + 10;
struct state {
	int len, nxt[26], link, pos;
} st[N << 1];
int siz = 1, las = 1; 
int id[N];
inline void extend (int c, int i) {
	int cur = ++siz, p = las; las = cur; id[i] = siz;
	st[cur].len = st[p].len + 1; st[cur].pos = i; 
	while (p && !st[p].nxt[c]) st[p].nxt[c] = cur, p = st[p].link;
	if (p == 0) st[cur].link = 1;
	else {
		int q = st[p].nxt[c];
		if (st[p].len + 1 == st[q].len) st[cur].link = q;
		else {
			int clone = ++siz; 
			st[clone].len = st[p].len + 1, st[clone].link = st[q].link; st[clone].pos = st[q].pos;
			For (i, 0, 25) st[clone].nxt[i] = st[q].nxt[i];
			st[q].link = st[cur].link = clone;
			while (p && st[p].nxt[c] == q) st[p].nxt[c] = clone, p = st[p].link;
		}
	}
}

int rt[N << 1]; 
#define ls tr[x].l
#define rs tr[x].r
int total;
struct seg {
	int l, r, sum; 
} tr[M];
inline void pushup (int x) { tr[x].sum = tr[ls].sum + tr[rs].sum; }
int merge (int x, int y, int l, int r) {
	if (!x || !y) return x + y;
	if (l == r) return (tr[x].sum += tr[y].sum), x;
	int mid = l + r >> 1, k = ++total;
	tr[k].l = merge(ls, tr[y].l, l, mid), tr[k].r = merge(rs, tr[y].r, mid + 1, r);
	pushup(k); 
	return k;
}

void upd (int &x, int l, int r, int p) {
	if (!x) x = ++total;
	if (l == r) return (tr[x].sum++), void();
	int mid = l + r >> 1;
	if (p <= mid) upd (ls, l, mid, p);
	else upd (rs, mid + 1, r, p);
	pushup(x); 
}

int que (int x, int l, int r, int ll, int rr) {
	if (!x) return 0;
	if (ll <= l && r <= rr) return tr[x].sum;
	int ans = 0, mid = l + r >> 1;
	if (ll <= mid) ans += que(ls, l, mid, ll, rr);
	if (rr > mid) ans += que(rs, mid + 1, r, ll, rr);
	return ans;
}

int n;
char z[N];
int you[N], se[N << 1];
inline void SORT() {
	For (i, 1, siz) you[st[i].len]++;
	For (i, 1, n) you[i] += you[i - 1];
	For (i, 1, siz) se[you[st[i].len]--] = i; 
}
int dp[N << 1];
int main() {
	read(n);
	scanf ("%s", z + 1); 
	id[0] = 1;
	For (i, 1, n) extend(z[i] - 'a', i), upd(rt[id[i]], 1, n, i); 
	SORT();
	//For (i, 1, siz) cout << se[i]  << " "; 
	foR (i, siz, 2) rt[st[se[i]].link] = merge(rt[st[se[i]].link], rt[se[i]], 1, n); 
//	cout << siz << endl;
//	For (i, 1, siz) cout << rt[se[i]] << endl;
	int ans = 1;
	For (i, 2, siz) {
		int u = se[i], v = st[u].link;
		if (v == 1) dp[u] = 1, st[u].link = u; 
		else {
			if (que(rt[st[v].link], 1, n, st[u].pos - st[u].len + st[st[v].link].len, st[u].pos - 1) ) 
				dp[u] = dp[v] + 1, st[u].link = u;
			else 
				dp[u] = dp[v], st[u].link = st[v].link;
			ckmax(ans, dp[u]); 
		}
	}	
	printf ("%d\n", ans);
}
```
