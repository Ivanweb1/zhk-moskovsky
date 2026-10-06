/* ===== ЖК «Московский» — общий JS блоков: аккордеон, слайдеры, формы, lightbox ===== */
(function () {
  if (window.ZM) { window.ZM.init(); return; }

  var ICON = {
    prev: '<svg viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="M7 1 1 7l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="m1 1 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(2.63 1.5)" fill="currentColor" d="M18.59 5.01C18.47 3.04 16.82 1.5 14.84 1.5L13.87 1.5L13.87 0.75C13.87 0.55 13.8 0.36 13.65 0.22C13.51 0.08 13.32 0 13.12 0C12.93 0 12.73 0.08 12.59 0.22C12.45 0.36 12.37 0.55 12.37 0.75L12.37 1.5L6.37 1.5L6.37 0.75C6.37 0.55 6.3 0.36 6.15 0.22C6.01 0.08 5.82 0 5.62 0C5.43 0 5.23 0.08 5.09 0.22C4.95 0.36 4.87 0.55 4.87 0.75L4.87 1.5L3.91 1.5C1.93 1.5 0.28 3.04 0.16 5.01C-0.06 8.72 -0.05 12.48 0.18 16.19C0.29 18.07 1.8 19.58 3.68 19.7C5.57 19.82 7.47 19.87 9.37 19.87C11.27 19.87 13.18 19.82 15.06 19.7C16.95 19.58 18.46 18.07 18.57 16.19C18.8 12.48 18.81 8.72 18.59 5.01ZM17.08 16.1C17.04 16.64 16.81 17.16 16.42 17.55C16.03 17.93 15.52 18.17 14.97 18.2C11.26 18.43 7.49 18.43 3.78 18.2C3.23 18.17 2.72 17.93 2.33 17.55C1.94 17.16 1.71 16.64 1.67 16.1C1.5 13.23 1.46 10.37 1.55 7.5L17.19 7.5C17.29 10.36 17.25 13.25 17.08 16.1ZM5.62 4.5C5.82 4.5 6.01 4.42 6.15 4.28C6.3 4.14 6.37 3.95 6.37 3.75L6.37 3L12.37 3L12.37 3.75C12.37 3.95 12.45 4.14 12.59 4.28C12.73 4.42 12.93 4.5 13.12 4.5C13.32 4.5 13.51 4.42 13.65 4.28C13.8 4.14 13.87 3.95 13.87 3.75L13.87 3L14.84 3C16.03 3 17.02 3.92 17.09 5.1C17.11 5.4 17.11 5.7 17.13 6L1.62 6C1.64 5.7 1.64 5.4 1.66 5.1C1.73 3.92 2.72 3 3.91 3L4.87 3L4.87 3.75C4.87 3.95 4.95 4.14 5.09 4.28C5.23 4.42 5.43 4.5 5.62 4.5Z"/><path transform="translate(7.13 11.25)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/><path transform="translate(10.88 11.25)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/><path transform="translate(7.13 15)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/><path transform="translate(14.63 11.25)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/><path transform="translate(14.63 15)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/><path transform="translate(10.88 15)" fill="currentColor" d="M1.13 2.25C1.75 2.25 2.25 1.75 2.25 1.13C2.25 0.5 1.75 0 1.13 0C0.5 0 0 0.5 0 1.13C0 1.75 0.5 2.25 1.13 2.25Z"/></svg>'
  };

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- Аккордеон ---------- */
  function initFaq(root) {
    $all('.zm-faq__item', root).forEach(function (item) {
      if (item.__zm) return; item.__zm = 1;
      var q = item.querySelector('.zm-faq__q');
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------- Слайдер: [data-zm-slider] > .zm-slider__track + [data-zm-prev]/[data-zm-next] ---------- */
  function initSlider(el) {
    if (el.__zm) return; el.__zm = 1;
    var track = el.querySelector('.zm-slider__track');
    var prev = el.querySelector('[data-zm-prev]');
    var next = el.querySelector('[data-zm-next]');
    var count = el.querySelector('[data-zm-count]');
    if (!track) return;
    function step() {
      var first = track.children[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (count) {
        var i = Math.round(track.scrollLeft / step()) + 1;
        count.textContent = Math.min(i, track.children.length) + '/' + track.children.length;
      }
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    el.__zmUpdate = update;
    update();
  }

  /* ---------- Телефон: маска +7 (000) 000-00-00 ---------- */
  function phoneDigits(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.length > 10 && (d[0] === '7' || d[0] === '8')) d = d.slice(1);
    return d.slice(0, 10);
  }
  function phoneMask(input) {
    input.addEventListener('input', function () {
      var d = phoneDigits(input.value), out = '';
      if (d.length) out = '(' + d.slice(0, 3);
      if (d.length >= 3) out += ') ' + d.slice(3, 6);
      if (d.length >= 6) out += '-' + d.slice(6, 8);
      if (d.length >= 8) out += '-' + d.slice(8, 10);
      input.value = out;
    });
  }

  /* ---------- Формы ----------
     Куда отправлять заявку — атрибуты на <form>:
       data-tilda-form=""              — штатная форма Tilda на этой же странице (рекомендуется: Tilda сама отправит
                                          заявку в подключённые CRM / почту / Telegram). Пусто — ищем сами блок Tilda
                                          с формой, где есть поле с переменной Form; можно указать id: "rec123456789".
                                          Найденный блок прячем — посетитель видит только нашу форму;
       data-webhook="https://..."      — или свой обработчик (POST, FormData);
       data-redirect="/spasibo"        — страница «Спасибо» после отправки (необязательно).                   */
  function findTildaForm(recId) {
    if (recId) {
      var rec = document.getElementById(String(recId).replace(/^#/, ''));
      return rec && rec.querySelector('form');
    }
    var marker = document.querySelector('.t-rec form [name="Form"]');
    return marker && marker.closest('form');
  }
  function hideTildaForm(recId) {
    var form = findTildaForm(recId);
    var rec = form && form.closest('.t-rec');
    if (rec) rec.style.display = 'none';
  }
  function sendToTilda(recId, data) {
    var form = findTildaForm(recId);
    if (!form) return false;
    Object.keys(data).forEach(function (key) {
      var input = form.querySelector('[name="' + key + '"]');
      if (input) {
        input.value = data[key];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    var btn = form.querySelector('[type="submit"], .t-submit');
    if (btn) btn.click(); else if (form.requestSubmit) form.requestSubmit(); else form.submit();
    return true;
  }

  function initForm(form) {
    if (form.__zm) return; form.__zm = 1;
    form.setAttribute('novalidate', '');
    var tildaRec = form.getAttribute('data-tilda-form');
    if (tildaRec !== null) hideTildaForm(tildaRec);
    $all('input[data-zm-phone]', form).forEach(phoneMask);

    function setErr(field, on) { if (field) field.classList.toggle('is-error', !!on); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.querySelector('[name="Name"]');
      var phone = form.querySelector('[name="Phone"]');
      var agree = form.querySelector('[name="Agree"]');
      if (name) { var bad = name.value.trim().length < 2; setErr(name.closest('.zm-field'), bad); ok = ok && !bad; }
      if (phone) { var badP = phoneDigits(phone.value).length !== 10; setErr(phone.closest('.zm-field'), badP); ok = ok && !badP; }
      if (agree) { setErr(agree.closest('.zm-check'), !agree.checked); ok = ok && agree.checked; }
      if (!ok) { var first = form.querySelector('.is-error input'); if (first) first.focus(); return; }

      var data = {};
      $all('input, textarea, select', form).forEach(function (i) {
        if (!i.name || i.name === 'Agree') return;
        data[i.name] = i.name === 'Phone' ? '+7 ' + i.value : i.value;
      });
      data.Form = form.getAttribute('data-form-name') || document.title;
      data.Page = location.href;

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      function done() {
        var redirect = form.getAttribute('data-redirect');
        if (redirect) { location.href = redirect; return; }
        form.classList.add('is-sent');
        if (btn) btn.disabled = false;
      }

      var rec = form.getAttribute('data-tilda-form');
      var hook = form.getAttribute('data-webhook');
      if (rec !== null && sendToTilda(rec, data)) return done();
      if (hook) {
        var fd = new FormData();
        Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
        fetch(hook, { method: 'POST', body: fd, mode: 'no-cors' }).then(done, function () {
          if (btn) btn.disabled = false;
          alert('Не удалось отправить заявку. Пожалуйста, позвоните нам.');
        });
        return;
      }
      if (window.console) console.info('[ZM] Заявка (получатель не настроен):', data);
      done();
    });

    $all('input', form).forEach(function (i) {
      i.addEventListener('input', function () {
        setErr(i.closest('.zm-field'), false);
        if (i.name === 'Agree') setErr(i.closest('.zm-check'), false);
      });
      i.addEventListener('change', function () { if (i.name === 'Agree') setErr(i.closest('.zm-check'), false); });
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = null, lbState = { images: [], index: 0 };
  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'zm zm-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<div class="zm-lb__bar"><button class="zm-lb__back" type="button" aria-label="Закрыть">' +
      '<svg viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M14 3 6 11l8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button><div class="zm-lb__bar-title"></div></div>' +
      '<div class="zm-lb__title"></div>' +
      '<div class="zm-lb__stage"><img class="zm-lb__img" alt="">' +
      '<button class="zm-lb__nav zm-lb__nav--prev" type="button" aria-label="Назад">' + ICON.prev + '</button>' +
      '<button class="zm-lb__nav zm-lb__nav--next" type="button" aria-label="Вперёд">' + ICON.next + '</button>' +
      '<div class="zm-lb__count"></div></div>';
    document.body.appendChild(lb);
    lb.querySelector('.zm-lb__back').addEventListener('click', closeLightbox);
    lb.querySelector('.zm-lb__nav--prev').addEventListener('click', function () { showLb(lbState.index - 1); });
    lb.querySelector('.zm-lb__nav--next').addEventListener('click', function () { showLb(lbState.index + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLb(lbState.index - 1);
      if (e.key === 'ArrowRight') showLb(lbState.index + 1);
    });
    var stage = lb.querySelector('.zm-lb__stage'), x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) showLb(lbState.index + (dx < 0 ? 1 : -1));
    });
  }
  function showLb(i) {
    var n = lbState.images.length;
    lbState.index = (i + n) % n;
    lb.querySelector('.zm-lb__img').src = lbState.images[lbState.index];
    lb.querySelector('.zm-lb__count').textContent = (lbState.index + 1) + '/' + n;
    var single = n < 2;
    lb.querySelector('.zm-lb__nav--prev').style.display = single ? 'none' : '';
    lb.querySelector('.zm-lb__nav--next').style.display = single ? 'none' : '';
  }
  function openLightbox(opts) {
    if (!lb) buildLightbox();
    lbState.images = opts.images || [];
    if (!lbState.images.length) return;
    lb.querySelector('.zm-lb__bar-title').textContent = opts.barTitle || '';
    lb.querySelector('.zm-lb__title').textContent = opts.title || '';
    lb.querySelector('.zm-lb__title').style.display = opts.title ? '' : 'none';
    showLb(opts.index || 0);
    lb.classList.add('is-open');
    document.documentElement.classList.add('zm-lock');
    document.body.classList.add('zm-lock');
    lb.querySelector('.zm-lb__back').focus();
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    document.documentElement.classList.remove('zm-lock');
    document.body.classList.remove('zm-lock');
  }

  /* ---------- Карточка новости (общая разметка для списка, «Читайте также») ---------- */
  var TYPE = { news: 'Новость', promo: 'Акция', article: 'Статья' };
  function newsCard(n) {
    var tags = '<span class="zm-pill">' + esc(TYPE[n.type] || n.type) + '</span>';
    if (n.type === 'promo' && n.until) tags += '<span class="zm-pill zm-pill--blue">До ' + esc(n.until) + '</span>';
    return '<a class="zm-news-card" href="' + esc(n.url) + '">' +
      '<div class="zm-news-card__img"><img src="' + esc(n.img) + '" alt="' + esc(n.title) + '" loading="lazy">' +
      '<div class="zm-news-card__tags">' + tags + '</div></div>' +
      '<div class="zm-news-card__body"><div class="zm-news-card__date">' + ICON.cal + esc(n.date) + '</div>' +
      '<h3 class="zm-news-card__title">' + esc(n.title) + '</h3>' +
      '<p class="zm-news-card__text">' + esc(n.text) + '</p></div></a>';
  }

  /* Список новостей хранится в одном месте — в блоке страницы /novosti (<script id="zm-news-data">).
     Другие страницы подтягивают его оттуда, а при ошибке используют свой запасной список. */
  function loadNews(url, fallback) {
    var local = document.getElementById('zm-news-data');
    if (local) { try { return Promise.resolve(JSON.parse(local.textContent)); } catch (e) {} }
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (html) {
        var m = html.match(/<script[^>]+id="zm-news-data"[^>]*>([\s\S]*?)<\/script>/);
        if (!m) throw 0;
        var base = new URL(url, location.href);
        return JSON.parse(m[1]).map(function (n) {
          if (n.img) n.img = new URL(n.img, base).href; // относительные ссылки — от страницы, откуда взят список
          return n;
        });
      })
      .catch(function () { return fallback || []; });
  }

  function initSelect(sel) {
    if (sel.__zm) return; sel.__zm = 1;
    var upd = function () { sel.classList.toggle('is-empty', !sel.value); };
    sel.addEventListener('change', upd); upd();
  }

  /* ---------- Анимации как на текущей главной сайта ----------
     Заголовки и вводные тексты проявляются по буквам из размытия (там — GSAP + SplitType: opacity 0, blur 10px,
     0.6s на букву, power1.out, волна по строке 0.9s), блоки «О проекте» и «Локация» выезжают снизу на 190px за 0.7s,
     кнопка «Выбрать свободную планировку» — fadeInUp 100px за 1s. Запуск — когда элемент появляется на экране. */
  var BLUR_SEL = '.zm-h1, .zm-h2, .zm-hh__title > small, .zm-hh__title > span, .zm-hh__text, .zm-hab__intro p, .zm-loc__head p, .zm-hbuy__head > div, .zm-hfaq__head > div, .zm-top__row .zm-lead, .zm-news-top__row p, [data-zm-blur]';
  var RISE_SEL = '.zm-home .zm-hab__intro, .zm-home .zm-hab__cards, .zm-home .zm-hloc > .zm-container, [data-zm-rise]';
  var UP_SEL = '.zm-plans__btn, [data-zm-up]';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;
  function seen(el) {
    if (!io) {
      if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { threshold: 0.01 });
    }
    io.observe(el);
  }
  function splitChars(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n, chars = [];
    while ((n = walker.nextNode())) if (n.nodeValue.replace(/\s+/g, '')) nodes.push(n);
    nodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      tn.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'zm-w'; w.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(part, function (ch) {
          var c = document.createElement('span'); c.className = 'zm-c'; c.textContent = ch; w.appendChild(c); chars.push(c);
        });
        frag.appendChild(w);
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    var step = chars.length > 1 ? 0.9 / (chars.length - 1) : 0;
    chars.forEach(function (c, i) { c.style.transitionDelay = (i * step).toFixed(3) + 's'; });
  }
  function initAnim(root) {
    if (reduce) return;
    $all(BLUR_SEL, root).forEach(function (el) {
      if (el.__zmBlur || el.closest('.zm-c, [data-zm-noanim]')) return;
      // вложенные цели (заголовок внутри блока с текстом) делим только один раз
      if (el.parentElement && el.parentElement.closest('.zm-blur')) return;
      el.__zmBlur = 1;
      if (!el.hasAttribute('aria-label') && /^H[1-6]$/.test(el.tagName)) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      splitChars(el); el.classList.add('zm-blur'); seen(el);
    });
    $all(RISE_SEL, root).forEach(function (el) { if (el.__zmRise) return; el.__zmRise = 1; el.classList.add('zm-rise'); seen(el); });
    $all(UP_SEL, root).forEach(function (el) { if (el.__zmUp) return; el.__zmUp = 1; el.classList.add('zm-up'); seen(el); });
  }

  function init(scope) {
    var roots = scope ? [scope] : $all('.zm');
    roots.forEach(function (root) {
      $all('.zm-select select', root).forEach(initSelect);
      initFaq(root);
      $all('[data-zm-slider]', root).forEach(initSlider);
      $all('form[data-zm-form]', root).forEach(initForm);
      initAnim(root);
    });
  }

  window.ZM = { init: init, initSelect: initSelect, icon: ICON, esc: esc, fmt: fmt, lightbox: openLightbox, newsCard: newsCard, loadNews: loadNews, initSlider: initSlider, all: $all, anim: initAnim };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
