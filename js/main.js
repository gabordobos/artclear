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

  // Language buttons are visual only in the prototype.
  document.querySelectorAll('.lang').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang__btn');
      if (!btn) return;
      group.querySelectorAll('.lang__btn').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
    });
  });
})();
