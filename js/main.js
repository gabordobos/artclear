// Mobile menu toggle + smooth scroll to the chosen section.
// Desktop relies on `scroll-behavior: smooth` in the CSS; on mobile the menu
// panel collapses first, so the scroll target is measured after it closes.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(!header.classList.contains('is-open'));
  });

  nav.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || !header.classList.contains('is-open')) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    header.classList.add('no-anim');
    setOpen(false);
    void header.offsetHeight;
    header.classList.remove('no-anim');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
  });

  // EN/DE switch. English is captured from the markup, German comes from
  // js/i18n.js. The choice is kept in localStorage and can be forced with ?lang=de.
  var dict = { de: window.I18N_DE || {} };
  var textEls = document.querySelectorAll('[data-i18n]');
  var attrEls = document.querySelectorAll('[data-i18n-attr]');
  var en = {};

  textEls.forEach(function (el) { en[el.dataset.i18n] = el.tagName === 'TITLE' ? el.textContent : el.innerHTML; });
  attrEls.forEach(function (el) {
    el.dataset.i18nAttr.split(',').forEach(function (pair) {
      var p = pair.split(':');
      en[p[1]] = el.getAttribute(p[0]);
    });
  });
  dict.en = en;

  function setLang(lang) {
    if (!dict[lang]) lang = 'en';
    var t = dict[lang];
    document.documentElement.lang = lang;
    textEls.forEach(function (el) {
      var v = t[el.dataset.i18n];
      if (v == null) return;
      if (el.tagName === 'TITLE') el.textContent = v; else el.innerHTML = v;
    });
    attrEls.forEach(function (el) {
      el.dataset.i18nAttr.split(',').forEach(function (pair) {
        var p = pair.split(':');
        if (t[p[1]] != null) el.setAttribute(p[0], t[p[1]]);
      });
    });
    document.querySelectorAll('.lang__btn').forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  document.querySelectorAll('.lang').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang__btn');
      if (btn) setLang(btn.dataset.lang);
    });
  });

  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var param = new URLSearchParams(location.search).get('lang');
  setLang(param || saved || 'en');
})();

// Creations gallery: native scroll-snap track, arrows page by the visible
// count, counter and progress bar follow the scroll position. Tiles open a lightbox.
(function () {
  var root = document.querySelector('[data-gallery]');
  if (!root) return;
  var track = root.querySelector('[data-gallery-track]');
  var items = track.children;
  var prev = root.querySelector('[data-gallery-prev]');
  var next = root.querySelector('[data-gallery-next]');
  var current = root.querySelector('[data-gallery-current]');
  var bar = root.querySelector('[data-gallery-bar]');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  root.querySelector('[data-gallery-total]').textContent = pad(items.length);

  function step() { return items[1].offsetLeft - items[0].offsetLeft; }
  function perView() { return Math.max(1, Math.round(track.clientWidth / step())); }

  function update() {
    var max = track.scrollWidth - track.clientWidth;
    var first = Math.round(track.scrollLeft / step());
    current.textContent = pad(Math.min(first + 1, items.length));
    var share = Math.min(1, track.clientWidth / track.scrollWidth);
    bar.style.width = share * 100 + '%';
    bar.style.marginLeft = (max > 0 ? track.scrollLeft / max : 0) * (1 - share) * 100 + '%';
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }

  prev.addEventListener('click', function () { track.scrollBy({ left: -step() * perView() }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step() * perView() }); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  var box = document.querySelector('[data-lightbox]');
  if (!box || !box.showModal) return;
  var big = box.querySelector('[data-lightbox-img]');
  var buttons = Array.prototype.slice.call(track.querySelectorAll('.gallery__open'));
  var index = 0;

  function show(i) {
    index = (i + buttons.length) % buttons.length;
    var thumb = buttons[index].querySelector('img');
    big.src = buttons[index].dataset.full;
    big.alt = thumb.alt;
  }

  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () { show(i); box.showModal(); });
  });
  box.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(index - 1); });
  box.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(index + 1); });
  box.querySelector('[data-lightbox-close]').addEventListener('click', function () { box.close(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  box.addEventListener('close', function () { buttons[index].focus(); });
})();
