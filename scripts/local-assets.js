/* global hexo */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

hexo.extend.generator.register('local-vendor-assets', () => {
  const roots = [
    ['katex/dist', 'vendor/katex'],
    ['@fortawesome/fontawesome-free/css', 'vendor/fontawesome/css'],
    ['@fortawesome/fontawesome-free/webfonts', 'vendor/fontawesome/webfonts'],
    ['hexo-generator-searchdb/dist', 'vendor/search']
  ];
  const routes = [];
  for (const [source, target] of roots) {
    const root = path.join(hexo.base_dir, 'node_modules', source);
    const walk = (dir, dest) => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, item.name);
        const route = `${dest}/${item.name}`;
        if (item.isDirectory()) walk(file, route);
        else routes.push({ path: route, data: () => fs.createReadStream(file) });
      }
    };
    walk(root, target);
  }
  for (const [source, target] of [
    ['katex/LICENSE', 'vendor/katex/LICENSE'],
    ['@fortawesome/fontawesome-free/LICENSE.txt', 'vendor/fontawesome/LICENSE.txt'],
    ['hexo-generator-searchdb/LICENSE', 'vendor/search/LICENSE']
  ]) {
    routes.push({ path: target, data: () => fs.createReadStream(path.join(hexo.base_dir, 'node_modules', source)) });
  }
  return routes;
});
