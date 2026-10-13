'use strict';

// Hexo adjusts front-matter dates using the host timezone. Keep explicit +08:00
// article timestamps identical on local computers and GitHub's UTC runners.
process.env.TZ = 'Asia/Shanghai';
require('hexo-cli')();
