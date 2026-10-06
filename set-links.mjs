// Подставить ссылки на картинки, загруженные в Tilda.
// 1. Загрузите файлы из папки tilda-upload/ в Tilda (Файлы → Загрузить) и скопируйте их ссылки.
// 2. Вставьте ссылки в файл links.txt — по одной на строку, в любом порядке.
// 3. node set-links.mjs && node build.mjs
// Файл находится по имени: ссылка .../zm-img-buy-1.jpg → картинка img/buy-1.jpg.
import fs from 'node:fs';
const map = JSON.parse(fs.readFileSync('assets-map.json', 'utf8'));
const links = fs.readFileSync('links.txt', 'utf8').split(/\s+/).filter((l) => /^https?:\/\//.test(l));
const byName = Object.fromEntries(Object.keys(map).map((p) => ['zm-' + p.replace(/\//g, '-').toLowerCase(), p]));
let ok = 0;
for (const url of links) {
  const name = decodeURIComponent(url.split('?')[0].split('/').pop()).toLowerCase();
  const key = byName[name];
  if (key) { map[key] = url; ok++; } else console.log('Не узнал файл:', url);
}
fs.writeFileSync('assets-map.json', JSON.stringify(map, null, 1) + '\n');
const left = Object.entries(map).filter(([p, v]) => !v && !p.startsWith('fonts/')).map(([p]) => p);
console.log(`Подставлено ссылок: ${ok}. Без ссылки (берутся с GitHub Pages): ${left.length ? left.join(', ') : 'нет'}`);
