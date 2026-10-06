// Сборка: src/blocks/*.html → dist/tilda/*.html (код для вайб-блока Tilda) и preview/*/index.html (превью страниц)
// Запуск: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
// прямые ссылки на картинки в Tilda (assets-map.json): если ссылка задана — блок для Tilda берёт картинку оттуда,
// иначе — с GitHub Pages (config.json → assetBase). Превью всегда берёт локальные файлы.
const amapFile = path.join(root, 'assets-map.json');
const amap = fs.existsSync(amapFile) ? JSON.parse(fs.readFileSync(amapFile, 'utf8')) : {};
const assetUrl = (base, p) => (base === cfg.assetBase && amap[p]) ? amap[p] : base + p;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const baseCss = read('src/base.css');
const baseJs = read('src/base.js');
const partials = Object.fromEntries(
  fs.readdirSync(path.join(root, 'src/partials')).map((f) => [path.basename(f, '.html'), read('src/partials/' + f)])
);

// {{> faq}} — вставка фрагмента; {{img:name}} — ссылка на картинку; {{policy}} — ссылка на политику
function render(src, imgBase, depth = 0) {
  if (depth > 5) throw new Error('partials nesting too deep');
  return src
    .replace(/\{\{>\s*([\w-]+)([^}]*)\}\}/g, (_, name, args) => {
      if (!(name in partials)) throw new Error('Unknown partial: ' + name);
      let out = partials[name];
      for (const [, k, v] of args.matchAll(/(\w+)="([^"]*)"/g)) out = out.replaceAll('{{' + k + '}}', v);
      out = out.replace(/\{\{(?!policy\}|tildaForm\}|webhook\})\w+\}\}/g, ''); // незаданные аргументы
      return render(out, imgBase, depth + 1);
    })
    .replace(/\{\{img:([\w-]+)\}\}/g, (_, n) => assetUrl(imgBase, 'img/' + n + '.jpg'))
    .replace(/\{\{asset:([\w./-]+)\}\}/g, (_, p) => assetUrl(imgBase, p))
    .replace(/\{\{policy\}\}/g, cfg.policyUrl)
    .replace(/\{\{tildaForm\}\}/g, cfg.tildaFormRec)
    .replace(/\{\{webhook\}\}/g, cfg.webhook);
}

function splitBlock(src) {
  const meta = {};
  src = src.replace(/^<!--meta([\s\S]*?)-->\s*/, (_, m) => {
    for (const line of m.trim().split('\n')) {
      const i = line.indexOf(':');
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return '';
  });
  return { meta, src };
}

const blocks = fs.readdirSync(path.join(root, 'src/blocks')).filter((f) => f.endsWith('.html')).sort();
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.mkdirSync(path.join(root, 'dist/tilda'), { recursive: true });

const shellTpl = read('src/preview-shell.html');
const index = [];

function prepare(file) {
  const { meta, src } = splitBlock(read('src/blocks/' + file));
  // скрипты блока идут после общего base.js (им нужен window.ZM); JSON-данные остаются на месте
  const scripts = [];
  const markup = src.replace(/<script(?![^>]*type="application\/json")[^>]*>[\s\S]*?<\/script>\s*/g, (m) => {
    scripts.push(m.trim());
    return '';
  });
  return { meta, markup, scripts, name: path.basename(file, '.html'), file };
}
const full = (b, base) =>
  `<style>\n${render(baseCss, base)}\n</style>\n` + render(b.markup, base).trim() +
  `\n<script>\n${baseJs}\n</script>\n` + b.scripts.map((s) => render(s, base)).join('\n') + '\n';
const bare = (b, base) => render(b.markup, base).trim() + '\n' + b.scripts.map((s) => render(s, base)).join('\n');

const all = blocks.map(prepare);
const parts = Object.fromEntries(all.filter((b) => b.meta.part).map((b) => [b.meta.part, b]));

for (const b of all) {
  const tildaCode =
    `<!-- ЖК «Московский» · ${b.meta.title} · ${b.meta.url}\n` +
    `     Вставьте этот код целиком в вайб-блок Tilda. Собрано из src/blocks/${b.file} — правки вносите там и пересобирайте. -->\n` +
    full(b, cfg.assetBase);
  fs.writeFileSync(path.join(root, 'dist/tilda', b.name + '.html'), tildaCode);
  index.push({ ...b.meta, name: b.name, size: Buffer.byteLength(tildaCode) });
  if (b.meta.part) continue;

  // превью: страница лежит в preview/<url>/index.html, картинки — относительно корня репозитория
  const urlPath = b.meta.preview || b.meta.url.replace(/^\/|\/$/g, '');
  const depthUp = '../'.repeat(urlPath.split('/').length + 1);
  const base = depthUp + 'assets/';
  const page = shellTpl
    .replaceAll('{{title}}', b.meta.title)
    .replaceAll('{{root}}', depthUp + 'preview/')
    .replace('{{header}}', parts.header ? bare(parts.header, base) : '')
    .replace('{{footer}}', parts.footer ? bare(parts.footer, base) : '')
    .replace('{{content}}', full(b, base));
  const out = path.join(root, 'preview', urlPath, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
}

// пульт переноса: index.html в корне — кнопки «скопировать код», превью, чек-лист
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const kb = (n) => (n / 1024).toFixed(0) + ' КБ';
const copyBtn = (p, label) => `<button class="btn" type="button" data-copy="dist/tilda/${p.name}.html">${label}</button>`;
const partButtons = index.filter((p) => p.part).map((p) =>
  `${copyBtn(p, 'Скопировать: ' + esc(p.title))}<a class="btn btn--ghost" href="dist/tilda/${p.name}.html">Открыть файл · ${kb(p.size)}</a>`).join('');
const rows = index.filter((p) => !p.part).map((p) => {
  const prev = 'preview/' + (p.preview || p.url.replace(/^\/|\/$/g, '')) + '/';
  return `<div class="page">
      <div><div class="page__name">${esc(p.title)}</div><div class="page__meta">Адрес в Tilda: <code>${esc(p.url)}</code> · ${kb(p.size)}</div></div>
      <div class="page__btns">${copyBtn(p, 'Скопировать код')}<a class="btn btn--ghost" href="${prev}" target="_blank" rel="noopener">Превью</a></div>
      <div class="page__checks">
        <label><input type="checkbox" data-key="p-${p.name}-blocks">шапка, страница и подвал вставлены</label>
        <label><input type="checkbox" data-key="p-${p.name}-pub">опубликовано</label>
        <label><input type="checkbox" data-key="p-${p.name}-check">проверено на сайте</label>
      </div>
    </div>`;
}).join('\n    ');
const formsOk = !!(cfg.tildaFormRec || cfg.webhook);
fs.writeFileSync(path.join(root, 'index.html'), read('src/pult.html')
  .replaceAll('{{assetBase}}', cfg.assetBase)
  .replaceAll('{{policyUrl}}', esc(cfg.policyUrl))
  .replace('{{formsClass}}', formsOk ? 'ok' : 'warn')
  .replace('{{formsText}}', formsOk ? 'настроено' : 'не настроено')
  .replace('{{partButtons}}', partButtons)
  .replace('{{rows}}', rows));

for (const p of index) console.log(`${p.name.padEnd(28)} ${p.url.padEnd(34)} ${(p.size / 1024).toFixed(1)} KB`);
