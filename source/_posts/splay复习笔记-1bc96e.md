---
title: splay复习笔记
date: '2021-07-24T11:36:35+08:00'
updated: '2021-10-12T21:03:01+08:00'
permalink: Notes/splay复习笔记/cm34e3w60004p5vtna8g305yr/
categories:
  - Notes
tags:
  - 数据结构
  - splay
mathjax: true
comments: false
excerpt: ' '
---

<a id="splay-复习笔记"></a>

# Splay 复习笔记

<a id="part-1-balanced-tree"></a>

## Part 1. Balanced Tree

​ 就是讲，一棵带权二叉树，对于每个节点 $x$ ，左子树的权值都比 $val_x$ 的要小，右子树的权值比 $val_x$ 要大。

​ 在上面可以容易的维护出区间第 $k$ 大，插入删除一个数，求出一个数的排名等操作，由于是课二叉树，每次复杂度是 $O(\texttt{树高})$ 的，所以我们需要用一些数据结构来保证树高为 $\log$ 层以保证复杂度，$splay$ 就是其中一种

<a id="part-2-splay"></a>

## Part 2. Splay

<a id="rotate"></a>

### $rotate：$

​ $splay$ 一个比较核心的操作，大致是把一个点向上旋转。设我们将 $x$ 旋上去，它的父亲为 $y$，$y$ 的父亲为 $z$，考虑我们该怎样翻转。

​ 以 $x$ 为 $y$ 的左儿子为例：

​ 为保证二叉平衡树的性质，$y$ 的权值是比 $x$ 大的，故翻转后它要成为 $x$ 的右儿子，而 $y$ 的左儿子（比 $y$ 小）将会是 $x$ 最初的右儿子（比 $x$ 大，比 $y$ 小），不难实现代码

```c++
inline void rotate (int x) {
    int y = fa[x], z = fa[y], k = get(x);
    ch[y][k] = ch[x][!k]; fa[ch[x][!k]] = y;
    fa[x] = z; if(z) ch[z][ch[z][1] == y] = x; 
	ch[x][!k] = y, fa[y] = x;
}
```

<a id="splay"></a>

### $Splay$

​ 将 $x$ 一直旋转到根

​ 还是来看 $x, y, z$，若 $x$ ，$y$ ，为他们父亲一样性质的儿子，那这三个点会有一条链，这样若先旋 $x$ ，再旋 $y$ ，这条链不会消失，故要换个方式来旋

```c++
inline void splay (int x){
    int p;
    for (p = fa[x]; p = fa[x], p; rotate(x))
        if (fa[p])  get(x) == get(p) ? rotate(p) : rotate(x);
	rt = x;
}
```

<a id="insert"></a>

### Insert

​ 插入一个点，我们肯定要找到一个位置插

```c++
void insert (int x) {
    if (!rt) {
        val[++tot] = x; cnt[tot] = 1; rt = tot; maintain(rt); return ;
    } 
    int cur = rt, p = 0;
    while (1) {
		if (val[cur] == x) {
            cnt[cur]++;
            maintain(cur); maintain(p);  splay(cur); return ;
        }
       	p = cur; cur = ch[cur][val[cur] < x];
        if (!cur) {
            val[++tot] = x; cnt[tot]++; fa[tot] = p; ch[p][val[p] < x] = tot;
            maintain(tot); maintain(p); splay(tot); return ;
        }
    }
}
```

<a id="rank"></a>

### rank

​ 也类似

```c++
inline int rk (int x) {
	int res = 0, cur = rt;
	while (1) {
		if (x < val[cur]) cur = ch[cur][0]
		else {
			res += siz[ch[cur][0]];
			if (k == val[cur]) return splay(x), res + 1;
			res += cnt[cur]; cur = ch[cur][1];
		}
	}
}
```

<a id="kth"></a>

### kth

没有感情的贴码机器

```c++
int kth (int k) {
	int cur = rt;
	while (1) {
		if (ch[cur][0] && k <= siz[ch[cur][0]]) cur = ch[cur][0];
		else {
			k -= siz[ch[cur][0]] + cnt[cur];
			if (k <= 0) return splay(cur), val[cur];
			cur = ch[cur][1];
		}
	}
}
```

<a id="prenxt"></a>

### pre/nxt

求前驱后继都差不多，无非是抓住二叉平衡树大小关系的限制，先把一个点旋到根，再找它左儿子中最右的 / 右儿子中最左的。

就不写了。

<a id="delete"></a>

### delete

删除一个权值，你首先要这个权值所在的点把旋到根，也就是 $rk$ 一遍

再分类讨论：

-   若有多个，删一个
-   若无儿子，直接清空
-   若只有一个儿子，把它设为新根
-   若二子健全，则任选它前驱后继作为新根。

```c++
void del (int x){
	rk(x);
	if (cnt[x] > 1) {
		cnt[x]--; maintain(x); return ;
	}
	if (!ls && !rs) {
		clear(rt); rt = 0; return ;
	}
	if (!ls || !rs) {
		int k = (!rs);
		int cur = rt;
		rt = ch[cur][!k];
		fa[rt] = 0;
		clear(rt); return ;
	}
	int cur = rt;
	int k = nxt();
	fa[ch[cur][0]] = k;
	ch[k][0] = ch[cur][0]; clear(cur);
	maintain(rt);
}
```

<a id="part-3-application"></a>

## Part 3. Application

​ 为啥一个维护二叉平衡树的 $\texttt{data structure}$ 能够处理序列问题呢？

​ 考虑二叉平衡树中序遍历，若你赋一个排列发现怎么旋都不会变，于是你可以用树上的点当作序列上一个位置（不是数字）。

​ 对区间操作你可以看作把区间左端点 - 1 ，旋到根，区间右端点旋成它的右儿子，这样根的 右儿子的 左子树就是你要操作的区间位置了。

​ 考虑一切好玩的东西都能丢到树上，十有八九能变成一个更好玩的东西，这就是 $\texttt{Link Cut Tree}$ 的前置部分了。
