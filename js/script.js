/* ============================================================
   Rohit Patil — Editorial portfolio
   Vanilla JS: clock, scroll progress, header state,
   reveal-on-scroll, active nav, mobile menu
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Live clock (IST) ---------- */
  var clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    var now = new Date();
    // Force IST (UTC+5:30) regardless of visitor timezone
    var ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    var hh = String(ist.getHours()).padStart(2, "0");
    var mm = String(ist.getMinutes()).padStart(2, "0");
    clock.textContent = hh + ":" + mm + " IST";
  }
  tick();
  setInterval(tick, 1000 * 15);

  /* ---------- Scroll progress + header state ---------- */
  var progress = document.getElementById("scroll-progress");
  var header = document.getElementById("site-header");
  function onScroll() {
    var doc = document.documentElement;
    var scrolled = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("scrolled", scrolled > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Active nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { threshold: 0.4, rootMargin: "-40% 0px -40% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        toggle.textContent = "Menu";
      });
    });
  }
})();
