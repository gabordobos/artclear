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
