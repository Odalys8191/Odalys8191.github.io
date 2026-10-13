'use strict';
const cheerio = require('cheerio');

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const enabled = (data, options) => data.layout === 'post' && options.enable !== false && data.auto_excerpt !== false;

function prepareExcerpt(data, options = {}) {
  // The migration used a single space to hide excerpts. Remove that placeholder
  // before Hexo processes <!-- more -->, so author-written breaks still work.
  if (enabled(data, options) && typeof data.excerpt === 'string' && !data.excerpt.trim()) {
    delete data.excerpt;
  }
  return data;
}

function createExcerpt(content, length = 180) {
  const $ = cheerio.load(content, null, false);
  if ($('#hbeData').length) return '这篇文章已加密。';
  const hasContent = $.root().text().trim() || $('img, video, audio, iframe').length;
  // Keep the introduction readable; code, tables and display equations belong
  // in the full article. Inline equations remain complete KaTeX fragments.
  $('script, style, noscript, pre, figure.highlight, table, .katex-display, h1, h2, h3, h4, h5, h6, svg').remove();
  const pieces = [];
  const space = () => {
    if (pieces.length && pieces.at(-1).html !== ' ') pieces.push({html: ' ', size: 1});
  };
  const walk = node => {
    if (node.type === 'text') {
      for (const character of node.data.replace(/\s+/g, ' ')) {
        if (character === ' ') space();
        else pieces.push({html: escape(character), size: 1});
      }
      return;
    }
    if (node.type !== 'tag') return;
    if ($(node).hasClass('katex')) {
      const tex = $(node).find('annotation[encoding="application/x-tex"]').text();
      pieces.push({html: $.html(node), size: Math.max(1, Array.from(tex).length)});
      return;
    }
    const block = /^(p|div|li|ul|ol|blockquote|section|br|hr)$/.test(node.name);
    if (block) space();
    for (const child of node.children || []) walk(child);
    if (block) space();
  };
  for (const node of $.root().contents().toArray()) walk(node);
  if (pieces.at(-1)?.html === ' ') pieces.pop();
  if (!pieces.length) return hasContent ? '<p class="post-excerpt">点击阅读全文。</p>' : '';

  const limit = Number.isInteger(length) && length > 0 ? length : 180;
  const selected = [];
  let used = 0;
  for (const piece of pieces) {
    if (used + piece.size > limit) break;
    selected.push(piece.html);
    used += piece.size;
  }
  const truncated = selected.length < pieces.length;
  const html = selected.join('').trimEnd();
  return `<p class="post-excerpt">${html || '点击阅读全文。'}${truncated && html ? '…' : ''}</p>`;
}

function finishExcerpt(data, options = {}) {
  if (data.layout !== 'post') return data;
  if (data.legacy_encrypted) {
    data.excerpt = '这篇文章已加密。';
    return data;
  }
  if (!enabled(data, options) || String(data.excerpt || '').trim() || String(data.description || '').trim()) return data;
  // An explicit break can intentionally have an empty introduction.
  if (data.content.includes('<span id="more"></span>')) return data;
  data.excerpt = createExcerpt(data.content, options.length);
  return data;
}

module.exports = {prepareExcerpt, finishExcerpt, createExcerpt};
