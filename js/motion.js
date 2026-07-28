/* ===================================================================
   Motion layer — Lenis + GSAP
   Loaded on demand by js/script.js, and only when the visitor has not
   asked for reduced motion. Everything here is additive polish: if this
   module never loads, the page keeps its CSS scroll-reveals and reads
   exactly the same.

   This is the only lazy module on the page — the hero background is pure
   CSS, so nothing here is required for the site to look finished.
   =================================================================== */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

var EASE = 'expo.out';

export function initMotion() {
  var cleanups = [];

  /* ---------- 1. Smooth scroll ---------- */

  var lenis = new Lenis({
    duration: 1.05,
    // Long, shallow ease-out: the scroll settles rather than glides to a
    // halt, which is what separates "smooth" from "laggy".
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    // Never hijack touch. Native momentum on a phone is better than
    // anything we can fake, and fighting it is the classic premium-site
    // mistake that makes a page feel broken on mobile.
    syncTouch: false
  });

  lenis.on('scroll', ScrollTrigger.update);
  function raf(time) { lenis.raf(time * 1000); }
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(function () { gsap.ticker.remove(raf); lenis.destroy(); });

  // In-page anchors must go through Lenis or they fight the smoothing.
  function onAnchorClick(e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -72 });
  }
  document.addEventListener('click', onAnchorClick);
  cleanups.push(function () { document.removeEventListener('click', onAnchorClick); });

  /* ---------- 2. Word-mask heading reveals ----------
     Walks text nodes only and recurses into elements, so inline spans
     like .hero-role keep their class and the heading keeps its meaning.
     The text stays real text — nothing here is aria-hidden. */

  function splitWords(el) {
    var words = [];
    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement('span');
            outer.className = 'word';
            var inner = document.createElement('span');
            inner.className = 'word-in';
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            words.push(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    return words;
  }

  var SPLIT_TARGETS = '.hero-title, .section-head .h2, .contact-panel .h2';

  document.querySelectorAll(SPLIT_TARGETS).forEach(function (el) {
    var words = splitWords(el);
    if (!words.length) return;
    el.classList.add('is-split');
    /* fromTo with immediateRender: false — the hidden state is applied only
       when the tween actually starts. A plain gsap.set/from would hide the
       heading the moment this module loads, so a ScrollTrigger that never
       fired would leave it permanently invisible. */
    gsap.fromTo(words,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.05,
        ease: EASE,
        stagger: 0.035,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
  });

  /* ---------- 3. Stat counters ----------
     Keeps the original formatting: "25.6K" counts to 25.6 and keeps the K,
     "01" counts to 1 and keeps its zero padding.

     The number is NEVER zeroed up front. An earlier version blanked every
     stat to "00" on load and relied on ScrollTrigger to fill it back in —
     so any trigger that failed to fire left the real figure destroyed, and
     the stat row read 00 / 000 / 00.0K / 00. Now the markup value stands
     until the animation actually starts, and the exact original string is
     restored on completion. */

  document.querySelectorAll('.stat-value').forEach(function (el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^([\d.]+)(.*)$/);
    if (!m) return;

    var target = parseFloat(m[1]);
    var suffix = m[2] || '';
    var decimals = (m[1].split('.')[1] || '').length;
    var pad = m[1].split('.')[0].length;
    var obj = { v: 0 };

    function render() {
      var s = obj.v.toFixed(decimals);
      var intPart = s.split('.')[0];
      while (intPart.length < pad) { intPart = '0' + intPart; s = '0' + s; }
      el.textContent = s + suffix;
    }

    gsap.to(obj, {
      v: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: render,
      // Restore the authored string rather than a re-formatted one, so
      // rounding can never change what the page claims.
      onComplete: function () { el.textContent = raw; },
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        once: true,
        onEnter: function () { obj.v = 0; render(); }
      }
    });
  });

  /* ---------- 4. Magnetic primary buttons ---------- */

  var magnets = [];
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: EASE });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: EASE });

      function move(e) {
        var r = el.getBoundingClientRect();
        // Capped at ~18% of the button so it never detaches from its label.
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      }
      function reset() { xTo(0); yTo(0); }

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', reset);
      // A keyboard user tabbing away must not leave it stuck off-centre.
      el.addEventListener('blur', reset);
      magnets.push(function () {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', reset);
        el.removeEventListener('blur', reset);
        gsap.set(el, { x: 0, y: 0 });
      });
    });
  }
  cleanups.push(function () { magnets.forEach(function (f) { f(); }); });

  /* ---------- 5. Custom cursor ----------
     Fine pointers only. The real cursor is never hidden — this rides
     alongside it, so if the script dies mid-session the visitor is not
     left without a pointer. */

  if (window.matchMedia('(pointer: fine)').matches) {
    var ring = document.createElement('div');
    // Starts idle: until the pointer moves it has no position, and a ring
    // parked at 0,0 shows as a stray arc in the top-left corner on load.
    ring.className = 'cursor-ring is-idle';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.documentElement.classList.add('has-cursor');

    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

    function onMove(e) {
      if (ring.classList.contains('is-idle')) {
        // Jump to the first known position rather than easing in from 0,0.
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        ring.classList.remove('is-idle');
      }
      rx(e.clientX);
      ry(e.clientY);
    }
    function onOver(e) {
      var hit = e.target.closest('a, button, .panel, canvas, input, textarea');
      ring.classList.toggle('is-active', !!hit);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });

    cleanups.push(function () {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      ring.remove();
      document.documentElement.classList.remove('has-cursor');
    });
  }

  /* ---------- 6. Panel entrance ----------
     Deliberately absent. This used to be a gsap.from() with opacity: 0 on
     .work-list .panel, which set every project card transparent the instant
     the module loaded and depended on a ScrollTrigger to bring it back — so
     any trigger that failed left the entire Selected Work section blank.
     The panels already carry .reveal, which the IntersectionObserver in
     js/script.js animates from CSS, and that version fails visible. */

  ScrollTrigger.refresh();

  return {
    destroy: function () {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      cleanups.forEach(function (f) { f(); });
    }
  };
}
