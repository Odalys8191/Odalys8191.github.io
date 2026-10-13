'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cheerio = require('cheerio');
const MarkdownIt = require('markdown-it');
const mathPlugin = require('@renbaoshuo/markdown-it-katex');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const report = require('../migration/report.json');
const redirects = require('../migration/redirects.json');
const failures = [], warnings = [];
const result = { htmlPages: 0, publicationDates: 0, recoveredMath: 0, recoveredCodeBlocks: 0, encryptedPages: 0, redirects: 0, editedSources: [], failures, warnings };
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
function check(condition, message) { if (!condition) failures.push(message); }
function load(file) { return cheerio.load(fs.readFileSync(path.join(output, file), 'utf8')); }
function localFile(url, page) {
  try {
    const parsed = new URL(url, `https://odalys8191.github.io/${page}`);
    if (parsed.hostname !== 'odalys8191.github.io') return null;
    const relative = decodeURIComponent(parsed.pathname).replace(/^\//, '');
    const candidate = path.resolve(output, relative);
    if (!candidate.startsWith(output + path.sep) && candidate !== output) return null;
    return candidate.endsWith(path.sep) || !path.extname(candidate) ? path.join(candidate, 'index.html') : candidate;
  } catch { return null; }
}
function multiset(values) {
  const map = new Map();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return map;
}

// Compare displayed publication instants with authored dates, including on UTC CI.
for (const post of report.posts) {
  if (!fs.existsSync(path.join(output, post.original))) continue;
  const source = fs.readFileSync(path.join(root, post.source), 'utf8');
  const frontMatter = yaml.load(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  const actual = load(post.original)('time[itemprop~="datePublished"]').first().attr('datetime');
  check(actual && new Date(actual).getTime() === new Date(frontMatter.date).getTime(), `Publication timezone changed: ${post.title}`);
  result.publicationDates++;
}

for (const p of [...report.posts, ...report.pages]) {
  check(fs.existsSync(path.join(output, p.original)), `Missing original URL: ${p.original}`);
  if (!fs.existsSync(path.join(output, p.original))) continue;
  const $ = load(p.original), body = $('.post-body').first();
  if (sha(fs.readFileSync(path.join(root, p.source))) !== p.sourceHash) {
    result.editedSources.push(p.source);
    continue; // Normal future editing may intentionally change historic content.
  }
  if (p.encrypted) {
    const cipher = body.find('#hbeData').text();
    check(sha(cipher) === p.cipherHash, `Encrypted data changed: ${p.title}`);
    check(body.find('input[type=password]').length === 1, `Missing password input: ${p.title}`);
    check($('script[src="/legacy/hbe.js"]').length === 1, `Missing decryption runtime: ${p.title}`);
    result.encryptedPages++;
  } else {
    const formulas = body.find('annotation[encoding="application/x-tex"]').map((_, el) => $(el).text().trim()).get();
    const actual = multiset(formulas);
    const expected = multiset((p.equations || []).map(e => e.tex.trim()));
    check(formulas.length === p.equationCount, `Formula count changed: ${p.title} (${formulas.length}/${p.equationCount})`);
    for (const [tex, count] of expected) check(actual.get(tex) === count, `Formula changed in ${p.title}: ${tex.slice(0, 90)}`);
    result.recoveredMath += formulas.length;
    const codeBlocks = body.find('figure.highlight td.code pre').map((_, pre) => $(pre).find('.line').map((_, line) => $(line).text()).get().join('\n')).get();
    const sourceMarkdown = fs.readFileSync(path.join(root, p.source), 'utf8').replace(/^---[\s\S]*?---\s*/, '');
    const sourceCodes = new MarkdownIt().parse(sourceMarkdown, {}).filter(t => t.type === 'fence').map(t => t.content.replace(/\n$/, ''));
    // Verify exact editable code separately from whitespace used by highlighting.
    const displayed = text => text.replace(/\t/g, '  ');
    for (const code of p.codes || []) {
      check(sourceCodes.includes(code.text), `Editable code changed: ${p.title}`);
      check(codeBlocks.map(displayed).includes(displayed(code.text)), `Displayed code changed: ${p.title}`);
    }
    result.recoveredCodeBlocks += (p.codes || []).length;
  }
}

for (const [from, to] of Object.entries(redirects)) {
  check(fs.existsSync(path.join(output, from)), `Missing redirect: ${from}`);
  const target = localFile(to, from);
  check(target && fs.existsSync(target), `Broken redirect target: ${from} -> ${to}`);
  if (fs.existsSync(path.join(output, from))) check(load(from)('meta[http-equiv="refresh"]').attr('content') === `0;url=${to}`, `Incorrect redirect: ${from}`);
  result.redirects++;
}

const htmlFiles = fs.readdirSync(output, { recursive: true }).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const $ = load(file);
  result.htmlPages++;
  check($('.katex-error').length === 0, `Invalid math: ${file}`);
  check(!$('body').text().includes('RECOVERYTOKEN'), `Unexpanded migration token: ${file}`);
  for (const el of $('script[src], link[rel="stylesheet"], img[src]').toArray()) {
    const url = $(el).attr('src') || $(el).attr('href');
    const asset = localFile(url, file);
    if (asset) check(fs.existsSync(asset), `Missing asset in ${file}: ${url}`);
    else if (el.tagName !== 'img') failures.push(`External script/stylesheet in ${file}: ${url}`);
  }
  for (const el of $('.menu a[href], .site-title a[href], .post-title a[href]').toArray()) {
    const url = $(el).attr('href'), target = localFile(url, file);
    if (target) check(fs.existsSync(target), `Broken navigation in ${file}: ${url}`);
  }
}

// Check all CSS-referenced fonts/assets, including math fonts.
for (const file of fs.readdirSync(output, { recursive: true }).filter(f => f.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(output, file), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
    if (match[1].startsWith('data:') || match[1].startsWith('#')) continue;
    const asset = localFile(match[1], file);
    if (asset) check(fs.existsSync(asset), `Missing CSS asset: ${file} -> ${match[1]}`);
    else failures.push(`External CSS asset: ${file} -> ${match[1]}`);
  }
}

// Verify future writing syntax separately from the historical corpus.
const sample = fs.readFileSync(path.join(root, 'examples/new-post.md'), 'utf8').replace(/^---[\s\S]*?---\s*/, '');
const md = new MarkdownIt({ html: true }).use(mathPlugin, { throwOnError: false, strict: false, trust: false });
const example = cheerio.load(md.render(sample));
check(example('.katex-error').length === 0, 'Writing example has invalid math');
check(example('annotation').length === 6, 'Writing example did not render all six formulas');
check(example('blockquote annotation').text().trim() === 'f(x)=x^2', 'Multiline quoted formula corrupted');
check(md.render('价格是 \\$20；公式 $a_i$。').includes('>a_i</annotation>'), 'Literal dollar or inline subscript broken');
check(fs.existsSync(path.join(output, 'search.xml')), 'Local search index missing');
check(!load('index.html')('#hbeData').length, 'Encrypted data should stay off the home page');

for (const image of require('../migration/images.json')) {
  if (image.status === 'unavailable') warnings.push(`Old external image unavailable: ${image.url}`);
}
warnings.push('Encrypted content is byte-preserved; actual decryption still requires the original passwords.');
fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
process.exitCode = failures.length ? 1 : 0;
