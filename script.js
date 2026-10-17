(function () {
  var WHATSAPP = '79148286969';
  var panels = document.querySelectorAll('.tab-panel');
  var navLinks = document.querySelectorAll('.nav a');
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.menu-toggle');

  // Кнопки записи ведут в WhatsApp с готовым текстом сообщения
  document.querySelectorAll('.js-wa').forEach(function (a) {
    var msg = a.getAttribute('data-msg') || '';
    a.href = 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  function showTab(id) {
    var found = false;
    panels.forEach(function (p) {
      var active = p.getAttribute('data-panel') === id;
      p.hidden = !active;
      if (active) found = true;
    });
    if (!found) return showTab('home');
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-tab') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
  }

  function route() {
    showTab(location.hash.replace('#', '') || 'home');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  window.addEventListener('hashchange', route);
  route();
})();
