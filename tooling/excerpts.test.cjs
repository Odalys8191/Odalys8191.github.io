'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const katex = require('katex');
const coreExcerpt = require('hexo/dist/plugins/filter/after_post_render/excerpt');
const {prepareExcerpt, finishExcerpt, createExcerpt} = require('./excerpts.cjs');

function render(data, options = {}) {
  prepareExcerpt(data, options);
  coreExcerpt(data);
  finishExcerpt(data, options);
  return data;
}

test('blank migration placeholders become excerpts without changing the article', () => {
  const content = '<h2>标题</h2><p>第一段正文。</p><p>第二段正文。</p>';
  const data = render({layout: 'post', excerpt: ' ', content}, {length: 8});
  assert.equal(cheerio.load(data.excerpt).text(), '第一段正文。 第…');
  assert.equal(data.content, content);
  assert.equal(data.more, content);
});

test('manual breaks, excerpts and descriptions take precedence', () => {
  const manual = render({layout: 'post', excerpt: ' ', content: '<p>手写摘要</p><!-- more --><p>全文</p>'});
  assert.equal(manual.excerpt, '<p>手写摘要</p>');
  assert.ok(manual.content.includes('<span id="more"></span>'));
  assert.equal(render({layout: 'post', excerpt: '自选摘要', content: '<p>全文</p>'}).excerpt, '自选摘要');
  assert.equal(render({layout: 'post', description: '自选简介', content: '<p>全文</p>'}).excerpt, '');
});

test('encrypted content stays out of excerpts, even if automatic excerpts are disabled', () => {
  const data = render({layout: 'post', legacy_encrypted: true, content: '<p>SECRET</p><div id="hbeData">CIPHER</div>'}, {enable: false});
  assert.equal(data.excerpt, '这篇文章已加密。');
  assert.equal(createExcerpt('<div id="hbeData">CIPHER</div>'), '这篇文章已加密。');
});

test('inline equations are kept whole without duplicating their hidden MathML text', () => {
  const formula = katex.renderToString('a_i^2');
  const content = `<p>公式 ${formula} 很有用。</p>`;
  const excerpt = cheerio.load(createExcerpt(content));
  assert.equal(excerpt('.katex').length, 1);
  assert.equal(excerpt('annotation').text(), 'a_i^2');
  assert.equal(cheerio.load(createExcerpt(content, 5))('.katex').length, 0);
});

test('code and block formulas are skipped; entities and Unicode remain safe', () => {
  const content = '<pre>CODE</pre><div class="katex-display">MATH</div><table><tr><td>TABLE</td></tr></table><p>&lt;img&gt; &amp; 你好😀</p>';
  const excerpt = cheerio.load(createExcerpt(content));
  assert.equal(excerpt.text(), '<img> & 你好😀');
  assert.equal(excerpt('img, pre, table, .katex-display').length, 0);
  assert.equal(cheerio.load(createExcerpt('<p>😀😀😀</p>', 2)).text(), '😀😀…');
  assert.equal(createExcerpt('   '), '');
  assert.equal(cheerio.load(createExcerpt('<img src="/photo.png">')).text(), '点击阅读全文。');
});

test('standalone pages and opt-outs do not get automatic excerpts', () => {
  assert.equal(render({layout: 'page', content: '<p>关于</p>'}).excerpt, '');
  assert.equal(render({layout: 'post', auto_excerpt: false, content: '<p>全文</p>'}).excerpt, '');
  assert.equal(render({layout: 'post', content: '<p>全文</p>'}, {enable: false}).excerpt, '');
});
