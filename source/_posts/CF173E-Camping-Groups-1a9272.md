---
title: CF173E Camping Groups
date: '2021-09-23T16:06:14+08:00'
updated: '2021-09-28T19:46:08+08:00'
permalink: Solutions/CF173E-Camping-Groups/cm34e3w5f00315vtn7wdwfc15/
categories:
  - Solutions
tags:
  - 数据结构
  - 双指针
  - 树状数组
  - 线段树
mathjax: true
comments: false
excerpt: ' '
---

-   数据结构题先想离线做法

> $n$ 个人，每个人有地位 $r_i$ 和年龄 $a_i$ 。定义一个小组组长为小组中地位不严格最高，年龄与其他成员差距不超过 $k$ 。$m$ 组询问 $(x,y)$ 表示询问第 $x$ 个人与第 $y$ 个人分到同一组的情况下，这个小组最多能分到多少人。
> 
> $$
> n\le 10^5, k, r\le 10^9
> $$

查 FourteenObsidian 表得到的 DS 好题

一开始一直考虑在直接做，然后胡了个树套树，然后不会写感觉空间也会炸，然后自闭了…

遇到这种**不强制在线**的题第一时间还是要想离线怎么做，然后这题如果离线下来就很好做了。

首先考虑钦定一个人为组长的话，这个小组最大是多少，这个问题可以考虑把人按年龄从小到大排序，然后对于第 $i$ 个人搞个 $l,r$ 双指针维护 $a_x \in [a_i-k, a_i+k]$ 的所有人 $x$ ，这个区间内的人是年龄合法的，于是只要在指针移动时把每个人放到 / 拿出**地位**权值树状数组里，指针移动完毕后查树状数组里地位小于等于第 $i$ 人的人数就可以算出以每个人为组长的组大小了。

然后考虑一个 $(x,y)$ 的询问，哪些人可以成为这个询问的组长呢，显然是地位大于等于 $\max \{ r_x, r_y \}$ 的人，于是我们把一个询问按 $\max \{ r_x, r_y \}$ 从大到小排序，每次搞个指针移动下维护一个可以成为询问组长的人的集合 $S$。

这个集合内的所有人是地位合法的，考虑年龄合法的人是什么样的。不妨设 $a_x \le a_y$ ，则可以作为组长的人年龄应该在 $[a_y - k, a_x + k]$ 这个区间内，这是一个连续区间，我们很自然的考虑到可以把 $S$ 的每个人放到年龄权值线段树上，每个贡献为其作为组长的组大小，然后查一下区间最大值即可解决。

代码细节是由于年龄和地位都是 $\le 10^9$ 的，所以需要离散化，而如果你不将询问权值线段树时形成的 $[a_y-k,a_x+k]$ 区间也放到离散化数组里，你可能需要在右端点讨论一下～

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
struct Node {
	int r, a, dw, id;
} s[N]; 
bool cmp1 (Node x, Node y) { return x.dw < y.dw; }
bool cmp2 (Node x, Node y) { return x.r > y.r; }

struct Ques {
	int x, y, id;
	bool operator < (const Ques &c) const {
		return max(s[x].r, s[y].r) > max(s[c.x].r, s[c.y].r); 
	}
} q[N];
int n, k, m;

int lsh1[N], cnt1;
int lsh2[N], cnt2; 

int Status[N], Age[N];

int Ida (int x) { return lower_bound (lsh1 + 1, lsh1 + cnt1 + 1, x) - lsh1; }
int Idr (int x) { return lower_bound (lsh2 + 1, lsh2 + cnt2 + 1, x) - lsh2; }
inline void Init () {
	For (i, 1, n) read(s[i].r), s[i].id = i, lsh2[++cnt2] = s[i].r;
	For (i, 1, n) read(s[i].a), lsh1[++cnt1] = s[i].a;
	sort (lsh1 + 1, lsh1 + cnt1 + 1);
	cnt1 = unique(lsh1 + 1, lsh1 + cnt1 + 1) - lsh1 - 1;
	sort (lsh2 + 1, lsh2 + cnt2 + 1);
	cnt2 = unique(lsh2 + 1, lsh2 + cnt2 + 1) - lsh2 - 1;
	For (i, 1, n) s[i].dw = Ida(s[i].a), s[i].r = Idr(s[i].r), Status[i] = s[i].r, Age[i] = s[i].a; 	
	read(m);
	For (i, 1, m) 
		read(q[i].x), read(q[i].y), q[i].id = i;
	sort (q + 1, q + m + 1); 
} // in & lsh


struct BIT {
	int sum[N];
	inline void upd (int x, int v) { for (int i = x; i <= cnt2; i += (i & (-i))) sum[i] += v; }
	inline int que (int x) { int Ans = 0; for (int i = x; i; i -= (i & (-i))) Ans += sum[i]; return Ans; }
} tr; 

int val[N];

inline void Captain() {
	static int L, R;
	L = 0, R = 0;
	sort (s + 1, s + n + 1, cmp1);
	For (i, 1, n) {
		while (R < n && s[R + 1].a - s[i].a <= k) R++, tr.upd (s[R].r, 1);
		while (L < R && s[i].a - s[L + 1].a > k) L++, tr.upd (s[L].r, -1);
		val[s[i].id] = tr.que(s[i].r); 
	}
	sort (s + 1, s + n + 1, cmp2);
} // Get Every i to be Captain 's Ans 

int mx[N << 2];
#define ls x << 1
#define rs x << 1 | 1
inline void pushup (int x) { mx[x] = max(mx[ls], mx[rs]); }

void update (int x, int l, int r, int p, int v) {
	if (l == r) return ckmax(mx[x], v), void();
	int mid = l + r >> 1;
	if (p <= mid) update (ls, l, mid, p, v);
	else update(rs, mid + 1, r, p, v);
	pushup(x); 
}

int query (int x, int l, int r, int ll, int rr) {
	if (ll > rr) return -1;
	if (ll <= l && r <= rr) return mx[x];
	int mid = l + r >> 1, Ans = -1;
	if (ll <= mid) ckmax(Ans, query(ls, l, mid, ll, rr));
	if (rr > mid) ckmax(Ans, query(rs, mid + 1, r, ll, rr));
	return Ans;
}
#undef ls
#undef rs

int Ans[N]; 

inline void Solve () {
	int L = 0;
	For (i, 1, m) {
		int tmp = max(Status[q[i].x], Status[q[i].y]);
		while (L < n && s[L + 1].r >= tmp) L++, update(1, 1, cnt1, s[L].dw, val[s[L].id]);
		int ql = Age[q[i].x], qr = Age[q[i].y];
		if (ql > qr) swap(ql, qr);
		int l = qr - k, r = ql + k;
		if (l > r) { Ans[q[i].id] = -1; continue;}
		int xx = r;
		l = Ida(l), r = Ida(r); if (lsh1[r] > xx) r--; 
		Ans[q[i].id] = query (1, 1, cnt1, l, r);
		if (!Ans[q[i].id]) Ans[q[i].id] = -1;
	}
} // download all the query to solve

int main() {
	read(n); read(k);
	Init(); 
	Captain();
	Solve();
	For (i, 1, m) printf ("%d\n", Ans[i]); 
	return 0;
}
```
