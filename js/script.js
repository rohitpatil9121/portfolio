/* ===================================================================
   Rohit Patil — Portfolio
   Theme toggle · marquee · reveal · accordion · GitHub graph · contact
   No dependencies. Every block is independent: if one fails, the rest
   still run and the page stays usable.
   =================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */

  var themeToggle = document.getElementById('theme-toggle');

  function syncToggleLabel() {
    if (!themeToggle) return;
    var isLight = root.classList.contains('light');
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }

  syncToggleLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var nowLight = !root.classList.contains('light');
      root.classList.toggle('light', nowLight);
      localStorage.setItem('theme', nowLight ? 'light' : 'dark');
      syncToggleLabel();
    });
  }

  /* ---------- Toast ---------- */

  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  /* ---------- Copy email ---------- */

  var copyBtn = document.getElementById('copy-email');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.dataset.email;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () { showToast('Email copied'); },
          function () { showToast(email); }
        );
      } else {
        showToast(email);
      }
    });
  }

  /* ---------- Résumé button ----------
     Shown only if the PDF is actually there. The old build hard-coded this
     link to a file that was never added, so every click 404'd. Ship the
     button when the file exists, not before. */

  var resumeLink = document.getElementById('resume-link');

  if (resumeLink && window.fetch && location.protocol !== 'file:') {
    fetch(resumeLink.getAttribute('href'), { method: 'HEAD' })
      .then(function (r) {
        var type = r.headers.get('content-type') || '';
        // A dev server that rewrites 404s to index.html would answer 200
        // with text/html — check the type, not just the status.
        if (r.ok && type.indexOf('html') === -1) resumeLink.hidden = false;
      })
      .catch(function () { /* stays hidden */ });
  }

  /* ---------- Stack marquee ----------
     Built in JS so the duplicate set required for a seamless -50% loop is
     generated rather than hand-maintained in the markup. The accessible
     copy of this list lives in a .visually-hidden paragraph in index.html,
     so the whole strip is aria-hidden. */

  var STACK = [
    'AWS Lambda', 'Step Functions', 'EventBridge', 'Bedrock', 'Textract',
    'DynamoDB', 'S3', 'EC2', 'CloudWatch', 'Python', 'FastAPI', 'Node.js',
    'Express', 'React', 'Vite', 'PostgreSQL', 'Supabase', 'Docker',
    'Capacitor', 'Twilio', 'GitHub Actions'
  ];

  var track = document.getElementById('marquee-track');

  if (track) {
    var markup = STACK.map(function (item) {
      return '<span class="tag">' + item + '</span>';
    }).join('');
    // Two identical halves — translating by -50% lands exactly on the seam.
    track.innerHTML = markup + markup;
  }

  /* ---------- Stagger indices ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      // Cap the ramp so a long list does not end with a multi-second delay.
      child.style.setProperty('--stagger-i', Math.min(i, 6));
    });
  });

  /* ---------- Reveal on scroll ---------- */

  var revealEls = document.querySelectorAll('.reveal');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(revealEls, function (el) { revealObserver.observe(el); });
  } else {
    // No observer support, or motion is unwelcome: show everything at once.
    root.classList.remove('js-reveal');
  }

  /* ---------- Accordion ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('.accordion-trigger'), function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.accordion-item');
      var wasOpen = item.classList.contains('open');

      Array.prototype.forEach.call(document.querySelectorAll('.accordion-item.open'), function (open) {
        open.classList.remove('open');
        open.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Project panel spotlight ----------
     Pointer position only. The previous build also applied a 3D tilt on
     every card; it read as decoration rather than feedback, so it is gone.
     The spotlight is a pure CSS radial driven by these two variables. */

  Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (panel) {
    panel.addEventListener('pointermove', function (e) {
      var r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      panel.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Hero glow follows the pointer ----------
     Fine pointers only, and never under reduced motion. Writes --gx/--gy,
     which feed a transform (not a gradient repaint), and eases toward the
     cursor so the light trails slightly rather than snapping to it. */

  var heroWrap = document.querySelector('.hero-wrap');
  var heroGlow = document.querySelector('.hero-glow');

  if (heroWrap && heroGlow && !reduceMotion &&
      window.matchMedia('(pointer: fine)').matches) {

    var tx = null, ty = null;   // target, in px relative to the hero
    var cx = null, cy = null;   // current
    var glowRaf = null;
    var heroVisible = true;

    function glowTick() {
      // First move jumps into place; after that it eases.
      if (cx === null) { cx = tx; cy = ty; }
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;

      heroGlow.style.setProperty('--gx', cx.toFixed(1) + 'px');
      heroGlow.style.setProperty('--gy', cy.toFixed(1) + 'px');

      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        glowRaf = requestAnimationFrame(glowTick);
      } else {
        glowRaf = null;
      }
    }

    function onGlowMove(e) {
      if (!heroVisible) return;
      var r = heroWrap.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (glowRaf === null) glowRaf = requestAnimationFrame(glowTick);
    }

    window.addEventListener('pointermove', onGlowMove, { passive: true });

    // Stop tracking once the hero has scrolled away — the work would be
    // invisible, and pointermove fires constantly while reading further down.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible && glowRaf !== null) {
          cancelAnimationFrame(glowRaf);
          glowRaf = null;
        }
      }, { rootMargin: '100px' }).observe(heroWrap);
    }
  }

  /* ---------- GitHub contribution graph ---------- */

  var GITHUB_USER = 'rohitpatil9121';
  var graphEl = document.getElementById('github-graph');
  var graphFooter = document.getElementById('github-graph-footer');

  var GH_COLORS = ['var(--gh-0)', 'var(--gh-1)', 'var(--gh-2)', 'var(--gh-3)', 'var(--gh-4)'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* The graph starts in April rather than running a rolling 12 months.
     Resolved to the most recent April that has already begun, so this keeps
     working next year without an edit — and never renders an empty grid. */
  var GRAPH_START = (function () {
    var now = new Date();
    var start = new Date(now.getFullYear(), 3, 1);   // 3 = April
    if (start > now) start = new Date(now.getFullYear() - 1, 3, 1);
    start.setHours(0, 0, 0, 0);
    return start;
  })();

  function buildWeeks(contributions) {
    var weeks = [];
    var week = [];

    contributions.forEach(function (day, index) {
      var dow = new Date(day.date + 'T00:00:00').getDay();

      if (index === 0) {
        for (var i = 0; i < dow; i++) week.push(null);
      }

      week.push(day);

      if (dow === 6) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
        week = [];
      }
    });

    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return weeks;
  }

  function renderGithubGraph(contributions) {
    // Larger cells than GitHub's own 11px: with only a few months on screen
    // there is room, and the grid would otherwise be stretched by the panel.
    var cell = 15, gap = 4, leftPad = 30, topPad = 22;
    var weeks = buildWeeks(contributions);
    var svgW = leftPad + weeks.length * (cell + gap);
    var svgH = topPad + 7 * (cell + gap) + 4;

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + svgW + ' ' + svgH);
    // Natural pixel size + max-width in CSS: the graph renders at its own
    // scale and shrinks on narrow screens, instead of being stretched to
    // fill the panel now that it covers fewer weeks.
    svg.setAttribute('width', svgW);
    svg.setAttribute('height', svgH);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label',
      'GitHub contribution graph from ' + MONTHS[GRAPH_START.getMonth()] + ' ' +
      GRAPH_START.getFullYear() + ' to today');

    var lastMonth = -1;
    weeks.forEach(function (wk, col) {
      var first = wk.find(Boolean);
      if (!first) return;
      var m = new Date(first.date + 'T00:00:00').getMonth();
      if (m === lastMonth) return;
      lastMonth = m;
      var text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', leftPad + col * (cell + gap));
      text.setAttribute('y', 12);
      text.setAttribute('class', 'gh-month');
      text.textContent = MONTHS[m];
      svg.appendChild(text);
    });

    DAY_LABELS.forEach(function (label, row) {
      if (!label) return;
      var text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', 0);
      text.setAttribute('y', topPad + row * (cell + gap) + cell - 1);
      text.setAttribute('class', 'gh-day');
      text.textContent = label;
      svg.appendChild(text);
    });

    weeks.forEach(function (wk, col) {
      wk.forEach(function (day, row) {
        if (!day) return;
        var rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', leftPad + col * (cell + gap));
        rect.setAttribute('y', topPad + row * (cell + gap));
        rect.setAttribute('width', cell);
        rect.setAttribute('height', cell);
        rect.setAttribute('rx', 2);
        rect.setAttribute('fill', GH_COLORS[day.level || 0] || GH_COLORS[0]);
        rect.setAttribute('class', 'gh-cell');
        var title = document.createElementNS(SVG_NS, 'title');
        title.textContent = (day.count === 1 ? '1 contribution' : day.count + ' contributions') + ' on ' + day.date;
        rect.appendChild(title);
        svg.appendChild(rect);
      });
    });

    graphEl.innerHTML = '';
    graphEl.appendChild(svg);
    if (graphFooter) graphFooter.classList.remove('hidden');
  }

  if (graphEl) {
    fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
      .then(function (r) {
        if (!r.ok) throw new Error('API responded ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var contribs = (data && data.contributions) || [];
        if (!contribs.length) throw new Error('No contribution data');

        // ?y=last returns a rolling 365 days; trim it back to April.
        contribs = contribs.filter(function (d) {
          return new Date(d.date + 'T00:00:00') >= GRAPH_START;
        });
        if (!contribs.length) throw new Error('No contributions in range');

        var range = document.getElementById('gh-range');
        if (range) {
          range.textContent = MONTHS[GRAPH_START.getMonth()] + ' ' +
                              GRAPH_START.getFullYear() + ' — today';
        }
        renderGithubGraph(contribs);
      })
      .catch(function () {
        graphEl.innerHTML =
          '<p class="small dim">Could not load the contribution graph. ' +
          '<a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener noreferrer" ' +
          'style="color: var(--accent);">View the profile on GitHub &rarr;</a></p>';
      });
  }

  /* ---------- Contact form ----------
     This form has no backend. The previous version pretended otherwise —
     it showed "Thanks! I'll get back to you soon." and sent nothing, so
     every message written into it was silently discarded. It now validates
     and then hands off to the visitor's mail client with the fields
     pre-filled, which is honest and actually delivers. */

  var CONTACT_EMAIL = 'rohitp9121@gmail.com';
  var form = document.getElementById('contact-form');

  var validators = {
    name: function (v) {
      return v.trim().length >= 2 ? '' : 'Please enter your name.';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.';
    },
    message: function (v) {
      return v.trim().length >= 10 ? '' : 'A little more detail, please — at least 10 characters.';
    }
  };

  function setError(field, msg) {
    var group = field.closest('.field');
    if (!group) return;
    group.classList.toggle('invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var slot = group.querySelector('.error-msg');
    if (slot) slot.textContent = msg || '';
  }

  if (form) {
    var fields = form.querySelectorAll('input, textarea');

    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener('blur', function () {
        if (validators[field.name]) setError(field, validators[field.name](field.value));
      });
      field.addEventListener('input', function () {
        // Clear the error as soon as the visitor starts fixing it.
        var group = field.closest('.field');
        if (group && group.classList.contains('invalid')) setError(field, '');
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var valid = true;
      var firstInvalid = null;

      Array.prototype.forEach.call(fields, function (field) {
        if (!validators[field.name]) return;
        var msg = validators[field.name](field.value);
        setError(field, msg);
        if (msg) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();

      var subject = 'Portfolio enquiry from ' + name;
      var body = message + '\n\n—\n' + name + '\n' + email;

      window.location.href =
        'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      showToast('Opening your mail client…');
    });
  }

  /* ---------- Motion layer (lazy) ----------
     Lenis + GSAP, ~150 KB. Same gates as the WebGL layer minus the WebGL
     check: skipped for reduced motion and Save-Data. Purely additive — the
     CSS scroll-reveals in script.js above already handle the page without
     it, so a failed fetch costs polish and nothing else. */

  // Respect Save-Data the same way we respect reduced motion.
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  if (!reduceMotion && !saveData && 'IntersectionObserver' in window) {
    var motionArmed = false;

    var motionObserver = new IntersectionObserver(function (entries) {
      if (motionArmed || !entries.some(function (e) { return e.isIntersecting; })) return;
      motionArmed = true;
      motionObserver.disconnect();

      import('./motion.js')
        .then(function (mod) { mod.initMotion(); })
        .catch(function () { /* polish only — nothing to undo */ });
    }, { rootMargin: '200px' });

    motionObserver.observe(document.body);
  }

});
