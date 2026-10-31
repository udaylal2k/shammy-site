document.documentElement.classList.add('js');
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* split headlines into words that rise out of a mask */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--d:' + i + '">' + w + '</span></span>';
    }).join(' ');
  });

  /* header: solid after scroll, tucks away when scrolling down */
  var bar = document.querySelector('.bar'), lastY = 0;
  var onScroll = function () {
    var y = window.scrollY;
    if (bar) {
      bar.classList.toggle('solid', y > 40);
      bar.classList.toggle('hide', y > 240 && y > lastY + 4);
      if (y < lastY - 4 || y < 240) bar.classList.remove('hide');
    }
    lastY = y;
  };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var tg = document.querySelector('.nav-toggle');
  if (tg && bar) {
    tg.addEventListener('click', function () { var o = bar.classList.toggle('open'); tg.setAttribute('aria-expanded', o); tg.textContent = o ? 'Close' : 'Browse'; document.body.style.overflow = o ? 'hidden' : ''; });
    bar.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { bar.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); tg.textContent = 'Browse'; document.body.style.overflow = ''; }); });
  }

  /* reveal on enter */
  var targets = document.querySelectorAll('.rv, .wipe, [data-split]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el, i) { if (el.classList.contains('rv')) el.style.setProperty('--i', i % 4); io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add('in'); });

  /* hero entrance once the curtain lifts */
  var hero = document.querySelector('.hero');
  if (hero) setTimeout(function () { hero.classList.add('go'); }, reduce ? 0 : 450);

  /* parallax drift on marked images */
  var par = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (par.length && !reduce) {
    var ticking = false;
    var run = function () {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        var k = parseFloat(el.dataset.parallax), c = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = '0 ' + (c * k).toFixed(1) + 'px';
      });
      ticking = false;
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* count-up numbers */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; co.unobserve(e.target);
        var n = +e.target.dataset.count, t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1600, 1), ease = 1 - Math.pow(1 - p, 4);
          e.target.textContent = Math.round(n * ease);
          if (p < 1) requestAnimationFrame(step);
        };
        e.target.textContent = '0'; requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* magnetic buttons */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* menu tabs: Women / Men */
  var tabs = document.querySelectorAll('.tabs a');
  if (tabs.length) {
    var show = function () {
      var id = (location.hash || '#women').slice(1); if (id !== 'men') id = 'women';
      document.querySelectorAll('.menu-panel').forEach(function (p) { p.hidden = p.id !== id; });
      tabs.forEach(function (t) { t.setAttribute('aria-current', t.getAttribute('href') === '#' + id); });
      document.querySelectorAll('.menu-panel:not([hidden]) .rv').forEach(function (el) { el.classList.add('in'); });
    };
    addEventListener('hashchange', show); show();
  }

  /* booking: builds a WhatsApp message from the visitor's choices */
  var form = document.getElementById('book-form');
  if (form) {
    var data = JSON.parse(document.getElementById('menu-json').textContent);
    var sel = form.querySelector('select'), btns = form.querySelectorAll('[data-for]'), link = form.querySelector('.send'), name = form.querySelector('input');
    var who = 'women';
    var fill = function () { sel.innerHTML = '<option value="">Choose a service</option>' + data[who].map(function (s) { return '<option>' + s + '</option>'; }).join(''); };
    var upd = function () {
      var m = 'Hello Shaamy Lounge, I would like to book' + (sel.value ? ' ' + sel.value : ' an appointment') + ' (' + (who === 'women' ? "women's" : "men's") + ' menu).' + (name.value ? ' Name: ' + name.value + '.' : '') + ' Please share available times.';
      link.href = 'https://wa.me/919538316195?text=' + encodeURIComponent(m);
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { who = b.dataset.for; btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); fill(); upd(); }); });
    sel.addEventListener('change', upd); name.addEventListener('input', upd); fill(); upd();
  }
})();
