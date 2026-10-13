/* global hexo */
'use strict';
const {prepareExcerpt, finishExcerpt} = require('../tooling/excerpts.cjs');

hexo.extend.filter.register('after_post_render', data => prepareExcerpt(data, hexo.config.auto_excerpt), 5);
hexo.extend.filter.register('after_post_render', data => finishExcerpt(data, hexo.config.auto_excerpt), 20);
