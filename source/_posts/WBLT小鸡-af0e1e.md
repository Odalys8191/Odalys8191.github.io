---
title: WBLT小鸡
date: '2022-02-10T16:53:49+08:00'
updated: '2023-06-14T21:13:06+08:00'
permalink: Notes/WBLT小鸡/cm34e3w5y004h5vtn3epx5shb/
categories:
  - Notes
tags:
  - 平衡树
mathjax: true
comments: false
excerpt: ' '
---

<a id="wblt小鸡"></a>

# WBLT 小鸡

<a id="tips"></a>

### Tips:

-   信息存在叶子上，即 `Leafty` 性质，每个点维护一个权值 $v$ ，一个信息大小 $siz$ ，叶子 $siz = 1,val=v$ ，其他点 $siz$ 直接合并，val=val\_
    -   这样，点数是 $2n$ 的，中序遍历是单调递增的，利用 $val$ 可实现查值查 rk。
-   利用单旋和双旋来维护重量平衡
    -   重量平衡大概是搞一个常数 $\alpha$ ，若左右子树有一个比另一个 $\alpha$ 还大就不平衡，经论文分析，这样复杂度正确！
-   写一个内存池来回收删除节点
-   由于复杂度不是均摊的，容易可持久化

* * *

<a id="code"></a>

### Code:

```cpp
namespace WBLT {
    int ch[N][2], siz[N], val[N];
    int pool[N], tot, poolc;
    int Id () { return poolc ? pool[poolc--] : ++tot; }
	int Recycle (int x) { pool[++poolc] = x; }
    int Pushup (int x) {
        siz[x] = siz[ch[x][0]] + siz[ch[x][1]];
        val[x] = siz[ch[x][1]];
    }
    int New (int &x, int v) {
        x = Id(); ch[x][0] = ch[x][1] = 0, siz[x] = 1, val[x] = v;
    }
    int Merge (int x, int y) {
        int k = Id();
        ch[k][0] = x, ch[k][1] = y;
        Pushup(k); return k;
    }
    void Rotate (int x, int op) {
        int temp = ch[x][op ^ 1];
        ch[x][op ^ 1] = ch[x][op];
        ch[x][op] = ch[ch[op ^ 1]][op];
        ch[ch[x][op ^ 1]][op] = ch[ch[x][op ^ 1]][op ^ 1];
        ch[ch[x][op ^ 1]][op ^ 1] = temp;
    	Pushup(ch[x][op ^ 1]);
    }
    const double alpha = 2.;
    void Maintain (int x) {
        if (siz[ch[x][0]] > siz[ch[x][1]] * alpha) Rotate (x, 0);
		else 
			if (siz[ch[x][1]] > siz[ch[x][0]] * alpha) Rotate (x, 1);
		if (siz[ch[x][0]] > siz[ch[x][1]] * alpha) Rotate (ch[x][0], 1), Rotate(x, 0);
		else
			if (siz[ch[x][1]] > siz[ch[x][0]] * alpha) Rotate (ch[x][1], 0), Rotate (x, 1); 
    }
    void Insert (int &x, int v) {
        if (!x) return New(x, v), void();
        if (siz[x] == 1) return (x = v > val[x] ? Merge(val[x], v) : Merge(v, val[x])), void();
        else Insert(ch[x][v > val[ch[x][0]]], v);
        Pushup(x), Maintain(x);
    }
    void Delete (int &x, int v) {
		if ( siz[x] == 1 ) return (Recycle(x), x = 0), void();
		int to = v > val[ch[x][0]];
		if ( siz[ch[x][to]] == 1 ) Recycle(x), Recycle(ch[x][to]), x = ch[x][to ^ 1];
		else Delete (ch[x][to], v), Pushup(x), Maintain(x); 
	}
	int Rank (int x, int v) {
		if (siz[x] == 1) return 1;
		if (v > val[ch[x][0]]) return siz[ch[x][0]] + Rank(ch[x][1], v);
		return Rank(ch[x][0], v); 
	}
	int Find (int x, int v) {
		if (siz[x] == v) return val[x];
		if (v > siz[ch[x][0]]) return Find(ch[x][1], v - siz[ch[x][0]]);
		return Find(ch[x][0], v); 
	}
}
```
