---
title: 神必错误
layout: page
comments: false
mathjax: true
legacy_encrypted: false
---

-   `set` 判断相等的方式好像是判断 a 不大于 b 且 b 不大于 a ，所以如果你在新建一个 `struct` 给他加比较函数的话，不多搞几个判断又没开 `multiset` 的话有的东西读不进去
    
-   `set` 一生之敌， `set` 首先不能加入多个相同的数字，就算是 `multiset` 删除的时候会把一样的都删完，所以一般还是要写个 `struct` 然后考虑上面的问题。
    
-   异或的一些性质：
    
    -   $\forall i < j < k, i\oplus k\ge \min\{i\oplus j, j\oplus k\}$.
    -   $i\oplus j\ge |i-j|$.
    -   $\exists k< 2|i-j|, (i+k)\oplus(j+k) = |i-j|$.
-   $dp$ 转移时，一定注意转移的顺序，注意对实际转移意义造成的影响。
    
-   打表找规律时，注意表打错的情况。 ~感觉这方面没什么经验，可能数字见少了~
    
-   \[$\huge\texttt{离线！离线！离线！！！！}$\]
