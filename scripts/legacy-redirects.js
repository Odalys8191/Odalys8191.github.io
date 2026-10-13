/* global hexo */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

hexo.extend.generator.register('legacy-redirects', () => {
  const file = path.join(hexo.base_dir, 'migration/redirects.json');
  if (!fs.existsSync(file)) return [];
  const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return Object.entries(JSON.parse(fs.readFileSync(file, 'utf8'))).map(([from, to]) => ({
    path: from,
    data: `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>文章已迁移 · Odalys</title><link rel="canonical" href="${escape(hexo.config.url + to)}"><meta http-equiv="refresh" content="0;url=${escape(to)}"><a href="${escape(to)}">前往文章</a></html>`
  }));
});
