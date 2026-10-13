/* global hexo */
'use strict';

// Render formulas at build time; visitors only fetch same-origin CSS/fonts.
hexo.extend.filter.register('markdown-it:renderer', md => {
  md.use(require('@renbaoshuo/markdown-it-katex'), {
    strict: false, throwOnError: false, trust: false
  });
});
