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

  /* optical kerning: Bodoni's W/F/T/V/Y/P leave a hole before a lowercase letter, so pull it in */
  var kernSel = 'h1,h2,h3,.quote p:not(.by),.marquee span,.cred li,.note p,.related a,.q-empty';
  document.querySelectorAll(kernSel).forEach(function (root) {
    if (!root.hasAttribute('aria-label')) root.setAttribute('aria-label', root.textContent.replace(/\s+/g, ' ').trim());
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = tw.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var s = node.nodeValue;
      if (!/(^|[\s(“"'‘])[WFTVYP][a-zéèö]/.test(s)) return;
      var frag = document.createDocumentFragment(), re = /(^|[\s(“"'‘])([WFTVYP])(?=[a-zéèö])/g, last = 0, m;
      while ((m = re.exec(s))) {
        var at = m.index + m[1].length;
        frag.appendChild(document.createTextNode(s.slice(last, at)));
        var k = document.createElement('span'); k.className = 'k'; k.textContent = m[2]; frag.appendChild(k);
        last = at + 1;
      }
      frag.appendChild(document.createTextNode(s.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
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
    var off = bar && !bar.classList.contains('hide') && y > 240 ? bar.offsetHeight : 0;
    document.documentElement.style.setProperty('--bar-offset', off + 'px');
    lastY = y;
  };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var tg = document.querySelector('.nav-toggle');
  if (tg && bar) {
    tg.addEventListener('click', function () { var o = bar.classList.toggle('open'); tg.setAttribute('aria-expanded', o); tg.textContent = o ? 'Close' : 'Browse'; document.body.style.overflow = o ? 'hidden' : ''; document.body.classList.toggle('nav-open', o); });
    bar.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { bar.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); tg.textContent = 'Browse'; document.body.style.overflow = ''; document.body.classList.remove('nav-open'); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('open')) tg.click(); });
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

  /* booking: search-first, then browse by type; builds a WhatsApp message from the picks */
  var form = document.getElementById('book-form');
  if (form) {
    var data = JSON.parse(document.getElementById('menu-json').textContent);
    var $ = function (id) { return document.getElementById(id); };
    var svcQ = $('svc-q'), res = $('svc-res'), groupsEl = $('groups'), browse = $('browse'), pickedEl = $('picked');
    var nm = $('nm'), note = $('note'), link = form.querySelector('.send');
    var who = 'women', when = 'As soon as possible', openG = -1, picked = [];
    var flat = function () { var o = []; data[who].forEach(function (g, gi) { g.cats.forEach(function (c) { c.s.forEach(function (s) { o.push({ s: s, c: c.c, g: g.g, gi: gi }); }); }); }); return o; };
    var key = function (it) { return who + '|' + it.g + '|' + it.c + '|' + it.s; };
    var has = function (it) { return picked.some(function (p) { return key(p) === key(it); }); };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var toggle = function (it) { if (has(it)) picked = picked.filter(function (p) { return key(p) !== key(it); }); else picked.push({ s: it.s, c: it.c, g: it.g, who: who }); draw(); };
    var msg = function () {
      var list = picked.length ? picked.map(function (p) { return p.s + ' (' + (p.who === 'women' ? "women's" : "men's") + ' ' + p.g.toLowerCase() + ')'; }).join(', ') : 'an appointment, and I would like your advice on what suits me';
      var m = 'Hello Shaamy Lounge, I would like to book ' + list + '. Preferred time: ' + when + '.' + (nm.value.trim() ? ' Name: ' + nm.value.trim() + '.' : '') + (note.value.trim() ? ' Note: ' + note.value.trim() + '.' : '') + ' Please share available slots.';
      link.href = 'https://wa.me/919538316195?text=' + encodeURIComponent(m);
    };
    var drawGroups = function () {
      groupsEl.innerHTML = data[who].map(function (g, i) { return '<button type="button" data-g="' + i + '" aria-pressed="' + (i === openG) + '">' + esc(g.g) + '</button>'; }).join('');
    };
    var drawBrowse = function () {
      if (openG < 0) { browse.hidden = true; browse.innerHTML = ''; return; }
      var g = data[who][openG];
      browse.hidden = false;
      browse.innerHTML = g.cats.map(function (c) {
        return '<p class="bc">' + esc(c.c) + '</p><div class="chipset">' + c.s.map(function (s, i) {
          var it = { s: s, c: c.c, g: g.g };
          return '<button type="button" data-c="' + esc(c.c) + '" data-i="' + i + '" aria-pressed="' + has(it) + '">' + esc(s) + '</button>';
        }).join('') + '</div>';
      }).join('');
    };
    var drawPicked = function () {
      pickedEl.innerHTML = picked.length
        ? picked.map(function (p, i) { return '<button type="button" class="tag" data-x="' + i + '" aria-label="Remove ' + esc(p.s) + '">' + esc(p.s) + '<span aria-hidden="true">×</span></button>'; }).join('')
        : '<p class="none">Nothing chosen yet. Not sure what you need? Send as is and Roopa will advise.</p>';
    };
    var draw = function () { drawGroups(); drawBrowse(); drawPicked(); msg(); };
    var results = [];
    var search = function () {
      var v = svcQ.value.trim().toLowerCase();
      if (!v) { res.hidden = true; svcQ.setAttribute('aria-expanded', 'false'); return; }
      results = flat().filter(function (it) { return (it.s + ' ' + it.c + ' ' + it.g).toLowerCase().indexOf(v) > -1; }).slice(0, 8);
      res.innerHTML = results.length
        ? results.map(function (it, i) { return '<li role="option" tabindex="-1" data-r="' + i + '"><b>' + esc(it.s) + '</b><span>' + esc(it.g) + ' · ' + esc(it.c) + '</span></li>'; }).join('')
        : '<li class="empty">No match. Send us a message and we will help.</li>';
      res.hidden = false; svcQ.setAttribute('aria-expanded', 'true');
    };
    svcQ.addEventListener('input', search);
    svcQ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (results[0] && !res.hidden) { var it = results[0]; if (!has(it)) toggle(it); svcQ.value = ''; search(); } } if (e.key === 'Escape') { svcQ.value = ''; search(); } });
    res.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-r]'); if (!li) return;
      var it = results[+li.dataset.r]; if (!has(it)) toggle(it); svcQ.value = ''; search(); svcQ.focus();
    });
    form.querySelectorAll('[data-for]').forEach(function (b) {
      b.addEventListener('click', function () {
        who = b.dataset.for; picked = picked.filter(function (p) { return p.who === who; }); openG = -1; svcQ.value = ''; search();
        form.querySelectorAll('[data-for]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        draw();
      });
    });
    form.querySelectorAll('[data-when]').forEach(function (b) {
      b.addEventListener('click', function () {
        when = b.dataset.when; form.querySelectorAll('[data-when]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); msg();
      });
    });
    groupsEl.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (!b) return; var i = +b.dataset.g; openG = openG === i ? -1 : i; drawGroups(); drawBrowse(); });
    browse.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      var g = data[who][openG], c = g.cats.filter(function (x) { return x.c === b.dataset.c; })[0];
      toggle({ s: c.s[+b.dataset.i], c: c.c, g: g.g });
    });
    pickedEl.addEventListener('click', function (e) { var b = e.target.closest('button[data-x]'); if (!b) return; picked.splice(+b.dataset.x, 1); draw(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.pick')) { res.hidden = true; svcQ.setAttribute('aria-expanded', 'false'); } });
    nm.addEventListener('input', msg); note.addEventListener('input', msg);
    draw();
  }

  /* menu: on phones categories start collapsed (first one open) */
  var cats = [].slice.call(document.querySelectorAll('details.cat'));
  var phone = matchMedia('(max-width:760px)');
  var setOpen = function () {
    cats.forEach(function (d, i) {
      if (!phone.matches) d.open = true;
      else if (!d.dataset.init) { d.open = i === 0; d.dataset.init = 1; }
    });
  };
  if (cats.length) { setOpen(); (phone.addEventListener ? phone.addEventListener('change', function () { cats.forEach(function (d) { delete d.dataset.init; }); setOpen(); }) : 0); }

  /* menu: live search across both menus */
  var q = document.getElementById('q');
  if (q) {
    var empty = document.getElementById('q-empty');
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(), any = false;
      document.querySelectorAll('.menu-panel').forEach(function (panel) {
        var panelHit = false;
        panel.querySelectorAll('details.cat').forEach(function (d) {
          var catHit = d.querySelector('h3').textContent.toLowerCase().indexOf(v) > -1, hit = false;
          d.querySelectorAll('li').forEach(function (li) {
            var m = !v || catHit || li.textContent.toLowerCase().indexOf(v) > -1;
            li.classList.toggle('off', !m); if (m) hit = true;
          });
          d.classList.toggle('off', !hit);
          if (v && hit) d.open = true;
          if (hit) panelHit = true;
        });
        panel.querySelectorAll('.menu-group').forEach(function (g) { g.style.display = !v || g.querySelector('details.cat:not(.off)') ? '' : 'none'; });
        var chips = panel.querySelector('.chips'); if (chips) chips.style.display = v ? 'none' : '';
        var note = panel.querySelector('.note'); if (note) note.style.display = v && !panelHit ? 'none' : '';
        if (!panel.hidden && panelHit) any = true;
      });
      empty.hidden = !v || any;
    });
    addEventListener('hashchange', function () { q.value = ''; q.dispatchEvent(new Event('input')); });
  }

  /* lightbox for gallery photos */
  var zooms = document.querySelectorAll('[data-zoom]');
  if (zooms.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog'); dlg.className = 'lb'; dlg.setAttribute('aria-label', 'Photo');
    dlg.innerHTML = '<button type="button" aria-label="Close photo">Close</button><img alt="">';
    document.body.appendChild(dlg);
    var im = dlg.querySelector('img');
    zooms.forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); var src = a.querySelector('img'); im.src = a.getAttribute('href'); im.alt = src ? src.alt : ''; dlg.showModal(); });
    });
    dlg.addEventListener('click', function () { dlg.close(); });
  }
})();
