/* ===== ЖК «Московский» — общий JS блоков: аккордеон, слайдеры, формы, lightbox ===== */
(function () {
  if (window.ZM) { window.ZM.init(); return; }

  var ICON = {
    prev: '<svg viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cal: '<svg viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor"/><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3M4 8h1M6.5 8h1M9 8h1M4 10.5h1M6.5 10.5h1" stroke="currentColor"/></svg>'
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
       data-tilda-form="rec123456789"  — id блока со штатной формой Tilda на этой же странице (рекомендуется:
                                          Tilda сама отправит заявку в подключённые CRM / почту / Telegram);
       data-webhook="https://..."      — или свой обработчик (POST, FormData);
       data-redirect="/spasibo"        — страница «Спасибо» после отправки (необязательно).                   */
  function sendToTilda(recId, data) {
    var rec = document.getElementById(String(recId).replace(/^#/, ''));
    var form = rec && rec.querySelector('form');
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
      if (rec && sendToTilda(rec, data)) return done();
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
      '<svg viewBox="0 0 20 20" fill="none"><path d="M12.5 4 6.5 10l6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
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

  function init(scope) {
    var roots = scope ? [scope] : $all('.zm');
    roots.forEach(function (root) {
      initFaq(root);
      $all('[data-zm-slider]', root).forEach(initSlider);
      $all('form[data-zm-form]', root).forEach(initForm);
    });
  }

  window.ZM = { init: init, icon: ICON, esc: esc, fmt: fmt, lightbox: openLightbox, newsCard: newsCard, loadNews: loadNews, initSlider: initSlider, all: $all };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
