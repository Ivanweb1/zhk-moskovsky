// Проверка: блоки на странице как в Tilda (шапка + страница + подвал + CSS «как у Tilda») выглядят так же,
// как каждый блок отдельно. Запуск: node build.mjs && PWDIR=$(npm root -g) node tools/check-compose.mjs
import { createRequire } from 'module';
const require = createRequire(process.env.PWDIR + '/');
const pw = require('playwright'); const fs = require('fs');
const d = 'dist/tilda/';
const H = fs.readFileSync(d + '0-shapka.html', 'utf8'), F = fs.readFileSync(d + '9-podval.html', 'utf8');
const pages = fs.readdirSync(d).filter(f => /^[0-9]+-/.test(f) && !/shapka|podval/.test(f));
// похоже на CSS Tilda: правила по тегам и #allrecords для служебных вещей
const TILDA = `<style>a{color:#ff8562}h1,h2,h3,h4,h5,h6{margin:.67em 0;font-weight:700}p{margin:1em 0}ul{padding-left:40px}button{background:#eee;padding:4px}img{border:3px solid red}.t-records{-webkit-font-smoothing:antialiased}</style>`;
const PROPS = ['margin-top','margin-bottom','margin-left','padding-top','padding-bottom','padding-left','display','color','background-color','font-size','line-height','font-weight','border-top-width','list-style-type','text-decoration-line','width','height','position','top'];
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
async function styles(html, w) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.route('**/*', r => r.abort());
  await p.setContent(html, { waitUntil: 'domcontentloaded' });
  await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  const res = await p.evaluate((PROPS) => {
    const out = {};
    document.querySelectorAll('[data-k]').forEach(root => {
      out[root.dataset.k] = [...root.querySelectorAll('*')].filter(el => !el.closest('script,style')).map(el => {
        const cs = getComputedStyle(el); return [el.tagName.toLowerCase() + '.' + [...el.classList].join('.'), PROPS.map(k => cs.getPropertyValue(k)).join('|')];
      });
    });
    return out;
  }, PROPS);
  await p.close(); return res;
}
const wrap = (k, html) => `<div class="t-rec" data-k="${k}">${html}</div>`;
let total = 0;
for (const f of pages) {
  const B = fs.readFileSync(d + f, 'utf8');
  for (const w of [1920, 1440, 1024, 375]) {
    const alone = { ...(await styles(wrap('h', H), w)), ...(await styles(wrap('b', B), w)), ...(await styles(wrap('f', F), w)) };
    const full = await styles(`<html><head>${TILDA}</head><body><div class="t-records">${wrap('h', H)}${wrap('b', B)}${wrap('f', F)}</div></body></html>`, w);
    const diffs = new Set();
    for (const k of ['h', 'b', 'f']) alone[k].forEach((s, i) => { const t = full[k][i]; if (t && s[1] !== t[1]) { const a = s[1].split('|'), c = t[1].split('|'); PROPS.forEach((p, j) => { if (a[j] !== c[j]) diffs.add(k + ' ' + s[0].slice(0, 55) + ' ' + p + ': ' + a[j] + ' -> ' + c[j]); }); } });
    total += diffs.size;
    if (diffs.size) { console.log('==', f, w, diffs.size); [...diffs].slice(0, 12).forEach(x => console.log('  ', x)); }
  }
}
console.log('done, diffs:', total);
await b.close();
