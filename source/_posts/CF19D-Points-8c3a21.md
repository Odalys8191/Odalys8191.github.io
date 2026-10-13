---
title: CF19D Points
date: '2021-09-28T19:08:31+08:00'
updated: '2021-09-28T19:42:26+08:00'
permalink: Solutions/CF19D-Points/cm34e3w5h00375vtn61oa33q7/
categories:
  - Solutions
tags:
  - 数据结构
  - 线段树
  - 每天一道DS题
mathjax: true
comments: false
excerpt: ' '
---

-   一些坐标上的问题可以考虑在每个坐标上取一个点，将其转换为序列问题。

> 坐标系上维护三种操作：加点，删点，询问一个点右上角最靠左，最下的一点
> 
> $$
> n\le 2\times 10^5
> $$

<a id="solutions"></a>

### Solutions:

只会大力 $KDT, CDQ$ 输光了

其实考虑询问以最靠左为第一关键字，那么我们从 $(x_0, y_0)$ 找到一个最小的 $x$ 若这一列存在成立的点，那答案就在这一列找到第一个大于 $y_0$ 的就好

这启发我们每个 $x$ 列保留最上面一个点，然后问题变成了查询一段区间内值大于某个数的最靠前的位置，这是一个经典问题，线段树上二分即可。

为了方便的处理修改操作，我们建 $2e5$ 个 set 来维护一个列上的点，那求最大值删除添加点都可以 $\mathrm O(1)$ 解决

找到答案列后，在对应列的 set 上 upper\_bound 一下就好了

这样复杂度是一个 $\log$ 的

注意在每个 set 中加入一个最小值可以更为方便地处理添加删除点时 set 为空的情况，避免了繁琐的讨论。

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
const int N = 2e5 + 10;

struct Question {
	int opt, x, y;
	Question (int Opt = 0, int X = 0, int Y = 0) {
		opt = Opt, x = X, y = Y; 
	}
} s[N]; 
// 0 add
// 1 remove
// 2 find
int n;
int lshx[N], lshy[N];
int cntx, cnty;

set <int> mck[N];

inline void Init() {
	For (i, 1, n) {
		char op[8]; int x, y;
		scanf ("%s", op); read(x); read(y);
		if (op[0] == 'a') s[i] = Question (0, x, y);
		if (op[0] == 'r') s[i] = Question (1, x, y);
		if (op[0] == 'f') s[i] = Question (2, x + 1, y + 1);
		lshx[++cntx] = s[i].x, lshy[++cnty] = s[i].y;
		mck[i].insert(-1);
	}
	sort (lshx + 1, lshx + cntx + 1);
	cntx = unique(lshx + 1, lshx + cntx + 1) - lshx - 1;
	sort (lshy + 1, lshy + cnty + 1);
	cnty = unique(lshy + 1, lshy + cnty + 1) - lshy - 1;
}

int Idx (int x) { return lower_bound(lshx + 1, lshx + cntx + 1, x) - lshx; }
int Idy (int x) { return lower_bound(lshy + 1, lshy + cnty + 1, x) - lshy; }

#define ls x << 1
#define rs x << 1 | 1
int mx[N << 2];
inline void pushup (int x) { mx[x] = max(mx[ls], mx[rs]); }
void update (int x, int l, int r, int p, int v) {
	if (l == r) return mx[x] = v, void();
	int mid = l + r >> 1;
	if (p <= mid) update(ls, l, mid, p, v);
	else update(rs, mid + 1, r, p, v);
	pushup(x); 
}
int query (int x, int l, int r, int X, int Y) {
	if (l == r) return (mx[x] >= Y) ? l : -1;  
	int mid = l + r >> 1;
	if (X <= mid && mx[ls] >= Y) {
		int tmp = query(ls, l, mid, X, Y); 
		if (~tmp) return tmp;
	}
	if(mx[rs] >= Y) return query(rs, mid + 1, r, X, Y); 
	return -1;
}

void qq (int x, int l, int r) {
	if (l == r) return cout << mx[x] << " ", void();
	int mid = l + r >> 1;
	qq(ls, l, mid);
	qq(rs, mid + 1, r);
}
inline void Solve () {
	For (i, 1, n) {
		s[i].x = Idx(s[i].x), s[i].y = Idy(s[i].y); 
		if (s[i].opt == 0) {	
			int las = *(mck[s[i].x].rbegin());
			if (s[i].y > las) update(1, 1, cntx, s[i].x, s[i].y); 
			mck[s[i].x].insert(s[i].y);	
		} // add
		if (s[i].opt == 1) {
			mck[s[i].x].erase(s[i].y);
			update(1, 1, cntx, s[i].x, *mck[s[i].x].rbegin());
		} // rem
		if (s[i].opt == 2) {
			int x = -1;
			x = query(1, 1, cntx, s[i].x, s[i].y);
			if (x == -1)  puts("-1");
			else {
				auto it = mck[x].lower_bound(s[i].y);
				if (it == mck[x].end()) {puts("-1"); continue;}
				printf ("%d %d\n", lshx[x], lshy[(*it)]);		
			}
		}
	}
}

int main() {
	read(n); 
	Init();
	Solve();
}
```
