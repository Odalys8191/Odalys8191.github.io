---
title: 路哥优化dp
date: '2021-10-15T22:01:54+08:00'
updated: '2021-10-15T22:18:24+08:00'
permalink: Notes/路哥优化dp/cm34e3w6c005p5vtnditl4ye5/
categories:
  - Notes
tags:
  - dp
  - trick
  - 树论
  - 背包
mathjax: true
comments: false
excerpt: ' '
---

膜 $\color{black}\texttt{z}\color{red}\texttt{xyhymzg}$ ！！！

多年以前的考试小技巧，今天复习一下。

大概应对一类要经过某个点组成联通块的树上背包优化。

一般是做根的一个联通块，若想要做任意点就套上一个淀粉质加一个 $\log$ 超值加倍。

大概思路是修改 $dp_u$ 的含义，本来的含义是在 $u$ 的子树内做一些事情，现在我们转换为根的一个联通块此时考虑到了 $u$ 的一些东西。

主要的思路是考虑我们 $dp$ 的过程中，是加了一些点到根的联通块中，考虑这些新加点的性质：要不是新加一个点往下走一步，要不直接跳过了这棵子树（由于这一点 $dp_u$ 的这个 $u$ 是还*未加入联通块*的，此时我们要决策）。

那么这一问题我们有两种解决方式，一种是把 $dfn$ 搞出来，此时我们的 $dp_i$ 彻底沦为维护原来的 $dp_{idfn_i}$ ，那转移就是 $dp_i\to dp_{i+1}/dp_i\to dp_{i+siz_i}$ 做个刷表背包即可，由于笔者懒得自己写，我们以 $2021-10-6$ T4 为例看，看这一做法。

```cpp
dfc = 0; dfs(u,0);
	fr(i,1,nds) memset(dp[i],-0x3f,sizeof dp[i]);
	dp[1][a[u]] = b[u];
	fr(i,2,nds) {
		int u = idfn[i];
		fr(j,0,m) {
			if(j+a[u] <= m) chkmax(dp[i][j+a[u]],dp[i-1][j] + b[u]);
			chkmax(dp[i-1+siz[u]][j],dp[i-1][j]);
		}
	}
	
```

是神仙 $\texttt{zxy}$ 的代码，外面还套了一层淀粉质。

这一做法优点是较为好理解，写起了方便不易出锅，除了有个 $dfs$ 小常数为没缺点，平时一定要写这个。

还有一传统做法是我们最初见到路哥优化时使用的，直接在树上做，每次将 $dp_u$ 整个数组传给儿子， $dfs$ 后再直接 $ckmax$ 的做法，同一题中，它是这么写的。

```cpp
void Dp (int u, int fa) {
	for (int i = head[u]; i; i = e[i].nxt) {
		int v = e[i].to;
		if (vis[v] || v == fa) continue;
		memset (dp[v], 0xcf, sizeof dp[v]);
		For (j, a[u], m - a[v]) dp[v][j + a[v]] = dp[u][j] + b[v];
		Dp (v, u);
		For (j, a[u], m) {
			ckmax(dp[u][j], dp[v][j]);
			ckmax(Ans, dp[u][j]);
		}
	}
}
```

理解的话，这里面水太深，牵扯的人和事太多了不好说，笔者中午没午休，先鸽了。
