'use strict';
// One-time, deterministic migration from the verified published snapshot.
// Refuses to overwrite recovered sources unless --force is explicitly passed.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cheerio = require('cheerio');
const Turndown = require('turndown');
const { gfm } = require('turndown-plugin-gfm');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const original = path.join(root, 'recovery-audit/original');
const index = JSON.parse(fs.readFileSync(path.join(root, 'recovery-audit/content.json'), 'utf8'));
const force = process.argv.includes('--force');
const imagesFile = path.join(root, 'migration/images.json');
const savedImages = new Map((fs.existsSync(imagesFile) ? JSON.parse(fs.readFileSync(imagesFile, 'utf8')) : []).filter(i => i.status === 'saved').map(i => [i.url, i.local]));
const files = fs.readdirSync(original, { recursive: true }).filter(f => f.endsWith('.html'));
const groups = new Map();
const redirects = {};
const report = { snapshot: 'f799a72cc7cbf2fa2b67543bafdc225a9b9e4d8c', posts: [], pages: [], externalImages: [] };
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

function read(file) {
  const raw = fs.readFileSync(path.join(original, file), 'utf8');
  const $ = cheerio.load(raw);
  return { file, raw, $, body: $('[itemprop="articleBody"]').first() };
}
function write(file, text) {
  const dest = path.join(root, file);
  if (fs.existsSync(dest) && !force) throw new Error(`Refusing to overwrite ${file}; use --force only before editing recovered posts.`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
}
function frontMatter(meta, body) {
  return `---\n${yaml.dump(meta, { lineWidth: -1, noRefs: true })}---\n\n${body.trim()}\n`;
}
function normalizeUrl(value, pagePath) {
  if (savedImages.has(value)) return savedImages.get(value);
  if (!value || value.startsWith('#') || /^(data:|mailto:|javascript:)/i.test(value)) return value;
  try {
    const url = new URL(value, `https://odalys8191.github.io/${pagePath}`);
    if (url.hostname.toLowerCase() === 'odalys8191.github.io') return decodeURI(url.pathname) + url.search + url.hash;
    return value.startsWith('//') ? 'https:' + value : value;
  } catch { return value; }
}
function convert(doc) {
  const { $, body, file } = doc;
  body.children('.tags').remove();
  const rawBody = body.html() || '';
  const encrypted = body.find('#hexo-blog-encrypt').length > 0;
  const equations = [], codes = [], images = [];
  if (encrypted) {
    const block = body.find('#hexo-blog-encrypt');
    return { markdown: `{% raw %}\n${$.html(block)}\n{% endraw %}`, encrypted, equations, codes, images, rawBody, cipherHash: sha(block.find('#hbeData').text()) };
  }
  const replacements = new Map();
  function token(text) {
    const key = `RECOVERYTOKEN${replacements.size}ENDTOKEN`;
    replacements.set(key, text);
    return key;
  }
  body.find('.katex-display').each((_, el) => {
    const tex = $(el).find('annotation[encoding="application/x-tex"]').first().text().trim();
    if (!tex) throw new Error(`Missing display TeX: ${file}`);
    equations.push({ tex, display: true });
    $(el).replaceWith(`<p>${token(`\n\n$$\n${tex}\n$$\n\n`)}</p>`);
  });
  body.find('.katex').each((_, el) => {
    const tex = $(el).find('annotation[encoding="application/x-tex"]').first().text().trim();
    if (!tex) throw new Error(`Missing inline TeX: ${file}`);
    equations.push({ tex, display: false });
    $(el).replaceWith(token(`$${tex}$`));
  });
  body.find('figure.highlight').each((_, el) => {
    const block = $(el), language = (block.attr('class') || '').split(/\s+/).find(c => c !== 'highlight') || '';
    const lines = block.find('td.code pre > .line').toArray().map(line => $(line).text());
    const code = lines.length ? lines.join('\n') : block.find('td.code pre').text();
    codes.push({ language, text: code });
    const fence = '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map(m => m[0].length + 1)));
    block.replaceWith(`<p>${token(`\n\n${fence}${language}\n${code}\n${fence}\n\n`)}</p>`);
  });
  body.find('img').each((_, el) => {
    const img = $(el);
    const originalSrc = img.attr('data-src') || img.attr('src');
    const src = normalizeUrl(originalSrc, file);
    if (!src) return;
    img.attr('src', src).removeAttr('data-src').removeAttr('class').removeAttr('style');
    images.push(src);
    if (/^https?:\/\//.test(originalSrc)) report.externalImages.push({ page: file, url: originalSrc });
  });
  body.find('span.exturl').each((_, el) => {
    const node = $(el), encoded = node.attr('data-url');
    if (!encoded) return;
    const a = $('<a></a>').attr('href', Buffer.from(encoded, 'base64').toString('utf8')).html(node.html());
    node.replaceWith(a);
  });
  body.find('a[href]').each((_, el) => {
    const a = $(el); a.attr('href', normalizeUrl(a.attr('href'), file));
  });
  body.find('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const h = $(el), id = h.attr('id');
    h.find('a.headerlink, a.anchor').remove();
    h.find('a').each((_, anchor) => {
      if ($(anchor).text().trim() === '#' && ($(anchor).attr('href') || '').startsWith('#')) $(anchor).remove();
    });
    if (id) h.before(`<p>${token(`<a id=${JSON.stringify(id)}></a>\n\n`)}</p>`);
  });
  body.find('script,style').remove();
  const td = new Turndown({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*' });
  const escape = td.escape;
  // Dollars that were plain text in the published HTML stay literal. Only
  // verified TeX annotations become math; malformed historical text is retained.
  td.escape = text => escape.call(td, text).replace(/\$/g, '\\$');
  td.use(gfm);
  td.keep(['iframe', 'video', 'audio', 'details', 'summary', 'sup', 'sub']);
  let markdown = td.turndown(body.html() || '');
  for (const [key, replacement] of replacements) {
    // A function replacement preserves literal $$ and $& in formulas/code.
    // Retain blockquote/list indentation for multiline recovered blocks.
    markdown = markdown.replace(new RegExp(`^([> \\t]*)${key}[ \\t]*$`, 'gm'), (_, prefix) =>
      replacement.trim().split('\n').map(line => prefix + line).join('\n'));
    markdown = markdown.replaceAll(key, () => replacement);
  }
  // Preserve literal Hexo/Nunjucks examples from historical articles.
  markdown = markdown.replace(/\{%([\s\S]*?)%\}/g, (match) => `{% raw %}${match}{% endraw %}`);
  return { markdown, encrypted, equations, codes, images, rawBody };
}

for (const file of files) {
  const doc = read(file);
  if (!doc.body.length || !doc.$('time[itemprop="dateCreated datePublished"]').length) continue;
  const key = file.split('/').slice(0, -2).join('/');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(doc);
}
const indexed = new Map(index.posts.map(p => [p.path.replace(/\/[^/]+\/$/, ''), p]));
for (const [key, versions] of [...groups].sort(([a], [b]) => a.localeCompare(b, 'zh'))) {
  const entry = indexed.get(key);
  const preferred = entry && versions.find(v => v.file === entry.path + 'index.html');
  const doc = preferred || versions.sort((a, b) => {
    const build = v => new Date((v.raw.match(/<!-- build time:(.*?) -->/) || [])[1] || 0).getTime();
    return build(b) - build(a);
  })[0];
  const { $ } = doc, result = convert(doc);
  const permalink = doc.file.replace(/index\.html$/, '');
  const title = $('#brand h1').text().trim() || entry?.title || key.split('/').at(-1);
  const tags = entry ? entry.tags.map(t => t.name) : $('a[rel="tag"]').map((_, el) => $(el).text().trim()).get();
  const categories = entry ? entry.categories.map(c => c.name) : $('.breadcrumb a[rel="index"] [itemprop="name"]').map((_, el) => $(el).text().trim()).get();
  const name = key.split('/').at(-1).replace(/[<>:"/\\|?*]/g, '-') + '-' + sha(key).slice(0, 6);
  const source = `source/_posts/${name}.md`;
  const meta = { title, date: $('time[itemprop="dateCreated datePublished"]').attr('datetime'), updated: $('time[itemprop="dateModified"]').attr('datetime'), permalink, categories, tags, mathjax: result.equations.length > 0 || result.encrypted, comments: false };
  if (result.encrypted) { meta.legacy_encrypted = true; meta.excerpt = '这篇文章已加密。'; }
  else if (result.markdown.trim()) meta.excerpt = ' '; // Index stays a compact list, without rendering whole historical posts.
  const sourceText = frontMatter(meta, result.markdown);
  write(source, sourceText);
  for (const version of versions) if (version.file !== doc.file) redirects[version.file] = '/' + permalink;
  report.posts.push({ title, source, sourceHash: sha(sourceText), original: doc.file, aliases: versions.filter(v => v.file !== doc.file).map(v => v.file), encrypted: result.encrypted, empty: !result.markdown.trim(), equationCount: result.equations.length, codeBlocks: result.codes.length, images: result.images, bodyHash: sha(result.rawBody), cipherHash: result.cipherHash, equations: result.equations, codes: result.codes });
}

// This older permalink is still linked from JOISC泛做 but predates the two
// versions present in the published snapshot.
const joiscDay1 = report.posts.find(p => p.original.startsWith('Solutions/JOISC-2017-Day1/'));
if (joiscDay1) redirects['Solutions/JOISC-2017-Day1/cku6nof98000061tn6tru763w/index.html'] = '/' + joiscDay1.original.replace(/index\.html$/, '');

for (const name of ['about', 'daily', 'friends', '神必错误', '冥人冥言']) {
  const file = name + '/index.html';
  if (!fs.existsSync(path.join(original, file))) continue;
  const doc = read(file);
  if (!doc.body.length) continue;
  const result = convert(doc), source = `source/${name}/index.md`;
  const sourceText = frontMatter({ title: name === 'about' ? '关于' : doc.$('#brand h1').text().trim(), layout: 'page', comments: false, mathjax: result.equations.length > 0, legacy_encrypted: result.encrypted }, result.markdown);
  write(source, sourceText);
  report.pages.push({ title: name, source, sourceHash: sha(sourceText), original: file, encrypted: result.encrypted, equationCount: result.equations.length, equations: result.equations, codes: result.codes, cipherHash: result.cipherHash });
}
for (const name of ['tags', 'categories']) {
  write(`source/${name}/index.md`, frontMatter({ title: name === 'tags' ? '标签' : '分类', type: name, comments: false }, ''));
}
for (const dir of ['images', 'cache']) {
  if (fs.existsSync(path.join(original, dir))) fs.cpSync(path.join(original, dir), path.join(root, 'source', dir), { recursive: true });
}
fs.mkdirSync(path.join(root, 'source/legacy'), { recursive: true });
// Keep the encryption format, removing the old console output of cached keys.
const hbe = fs.readFileSync(path.join(original, 'lib/hbe.js'), 'utf8').replace(/^.*console\.log.*\n/gm, '');
fs.writeFileSync(path.join(root, 'source/legacy/hbe.js'), hbe);
fs.copyFileSync(path.join(original, 'css/hbe.style.css'), path.join(root, 'source/legacy/hbe.style.css'));
fs.mkdirSync(path.join(root, 'migration'), { recursive: true });
fs.writeFileSync(path.join(root, 'migration/redirects.json'), JSON.stringify(redirects, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'migration/report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ posts: report.posts.length, recovered: report.posts.filter(p => !p.encrypted && !p.empty).length, encrypted: report.posts.filter(p => p.encrypted).length, empty: report.posts.filter(p => p.empty).map(p => p.title), redirects: Object.keys(redirects).length, equations: report.posts.reduce((sum, p) => sum + p.equationCount, 0), externalImages: report.externalImages.length }, null, 2));
