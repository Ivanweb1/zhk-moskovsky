// Сборка: src/blocks/*.html → dist/tilda/*.html (код для вайб-блока Tilda) и preview/*/index.html (превью страниц)
// Запуск: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
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
    .replace(/\{\{img:([\w-]+)\}\}/g, (_, n) => imgBase + 'img/' + n + '.jpg')
    .replace(/\{\{asset:([\w./-]+)\}\}/g, (_, p) => imgBase + p)
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
  `<style>\n${baseCss}\n</style>\n` + render(b.markup, base).trim() +
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

fs.writeFileSync(
  path.join(root, 'index.html'),
  `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>ЖК «Московский» — новые страницы</title>
<style>body{font:15px/1.5 Manrope,Arial,sans-serif;background:#f2f2f7;color:#14243d;margin:0;padding:40px 16px}main{max-width:720px;margin:0 auto}
h1{font-weight:500}a{color:#1f3d6b}li{margin:8px 0}code{background:#e4e6f1;padding:1px 6px;border-radius:4px;font-size:13px}</style></head>
<body><main><h1>ЖК «Московский» — новые страницы (превью)</h1><ul>
${index.map((p) => p.part
  ? `<li>${p.title} — ${p.url} · код для Tilda: <a href="dist/tilda/${p.name}.html">dist/tilda/${p.name}.html</a></li>`
  : `<li><a href="preview/${p.preview || p.url.replace(/^\/|\/$/g, '')}/">${p.title}</a> — <code>${p.url}</code> · код для Tilda: <a href="dist/tilda/${p.name}.html">dist/tilda/${p.name}.html</a></li>`).join('\n')}
</ul></main></body></html>\n`
);

for (const p of index) console.log(`${p.name.padEnd(28)} ${p.url.padEnd(34)} ${(p.size / 1024).toFixed(1)} KB`);
