/* ===================================================================
   Rohit Patil — Portfolio
   Vanilla JS: nav, typing, scroll progress, reveal, counters,
   skill bars, radar chart, form validation, back-to-top
   =================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar: shrink on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScrollNav = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scroll-progress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = `${Math.min(scrolled * 100, 100)}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- Mobile drawer ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const drawerClose = document.getElementById('drawer-close');

  const openDrawer = () => {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  hamburger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeDrawer));

  /* ---------- Typing animation ---------- */
  const typedEl = document.getElementById('typed');
  const roles = ['Cloud Computing Student', 'AWS Enthusiast', 'Python Developer', 'DevOps Learner'];
  let rIdx = 0, cIdx = 0, deleting = false;
  const type = () => {
    const current = roles[rIdx];
    typedEl.textContent = current.slice(0, cIdx);
    if (!deleting && cIdx < current.length) {
      cIdx++;
      setTimeout(type, 90);
    } else if (!deleting && cIdx === current.length) {
      deleting = true;
      setTimeout(type, 1600);
    } else if (deleting && cIdx > 0) {
      cIdx--;
      setTimeout(type, 45);
    } else {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
      setTimeout(type, 350);
    }
  };
  if (typedEl) type();

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-US').replace(/,/g, '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  /* ---------- Skill progress bars: build + animate ---------- */
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const pct = bar.dataset.pct;
    const track = document.createElement('div');
    track.className = 'track';
    const fill = document.createElement('div');
    fill.className = 'fill';
    track.appendChild(fill);
    bar.appendChild(track);
    bar._fill = fill;
    bar._pct = pct;
  });
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target._fill.style.width = e.target._pct + '%';
        skillObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.skill-bar').forEach(b => skillObserver.observe(b));

  /* ---------- Chart.js radar (animate on scroll) ---------- */
  const radarCanvas = document.getElementById('skillsRadar');
  let radarBuilt = false;
  const buildRadar = () => {
    if (radarBuilt || typeof Chart === 'undefined' || !radarCanvas) return;
    radarBuilt = true;
    const ctx = radarCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.18)');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['AWS', 'Python', 'Docker', 'Linux', 'Monitoring', 'Git'],
        datasets: [{
          label: 'Proficiency',
          data: [90, 90, 80, 85, 82, 88],
          backgroundColor: grad,
          borderColor: '#4F46E5',
          borderWidth: 2,
          pointBackgroundColor: '#A855F7',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        animation: { duration: 1400, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, color: '#94a3b8', backdropColor: 'transparent', font: { size: 10 } },
            grid: { color: 'rgba(15,23,42,0.08)' },
            angleLines: { color: 'rgba(15,23,42,0.08)' },
            pointLabels: { color: '#0F172A', font: { size: 12, weight: '600' } },
          },
        },
      },
    });
  };
  if (radarCanvas) {
    const radarObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { buildRadar(); radarObserver.disconnect(); } });
    }, { threshold: 0.4 });
    radarObserver.observe(radarCanvas);
  }

  /* ---------- Active section highlighting ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- Back to top ---------- */
  const backTop = document.getElementById('back-to-top');
  const toggleBackTop = () => {
    const show = window.scrollY > 500;
    backTop.classList.toggle('opacity-0', !show);
    backTop.classList.toggle('pointer-events-none', !show);
    backTop.classList.toggle('translate-y-3', !show);
  };
  toggleBackTop();
  window.addEventListener('scroll', toggleBackTop, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  const setError = (field, msg) => {
    const group = field.closest('.form-group');
    group.classList.toggle('invalid', !!msg);
    group.querySelector('.error-msg').textContent = msg || '';
  };

  const validators = {
    name: v => v.trim().length >= 2 ? '' : 'Please enter your name (2+ characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: v => v.trim().length >= 3 ? '' : 'Please add a subject (3+ characters).',
    message: v => v.trim().length >= 10 ? '' : 'Your message should be at least 10 characters.',
  };

  if (form) {
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        if (validators[field.name]) setError(field, validators[field.name](field.value));
      });
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('invalid')) {
          setError(field, validators[field.name](field.value));
        }
      });
    });

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let valid = true;
      form.querySelectorAll('input, textarea').forEach(field => {
        if (validators[field.name]) {
          const msg = validators[field.name](field.value);
          setError(field, msg);
          if (msg) valid = false;
        }
      });
      if (!valid) return;

      // Simulated submit (no backend) — show success state
      success.classList.remove('hidden');
      success.classList.add('flex');
      form.reset();
      setTimeout(() => { success.classList.add('hidden'); success.classList.remove('flex'); }, 6000);
    });
  }

  /* ---------- Lazy-load images (native + fallback) ---------- */
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.loading = 'lazy';
    img.src = img.dataset.src;
  });

});
