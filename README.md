# Rohit Patil — Portfolio

Personal site. Dark technical / instrument-panel direction: near-black canvas, hairline
borders, monospace labels, one cyan accent.

**Live:** not deployed yet — see *Deploying* below.

## Stack

- **HTML5** — semantic, one `<h1>`, landmark elements
- **Hand-written CSS** — no framework. A token block at the top of `css/style.css` is the
  single source of truth; re-theme the whole site by editing it
- **Vanilla JavaScript** — no dependencies, no build step
- **Bricolage Grotesque + Inter + JetBrains Mono** via Google Fonts

There is deliberately no build step. The core page is one HTML + one CSS + one JS request
(~77 KB uncompressed) and deploys by copying the folder.

> A previous version loaded Tailwind from `cdn.tailwindcss.com`. That ships the JIT compiler
> (~400 KB of JS) to every visitor and causes a flash of unstyled content — on the one page
> whose job is demonstrating craft. It has been replaced with real CSS.

## Theme

There is no fixed default — the site follows the visitor's OS setting, and the toggle
persists an override in `localStorage`.

> The check is `prefers-color-scheme: dark`, not `light`. Testing for `light` sent anyone
> whose system expresses *no* preference to dark, which is the opposite of the browser
> default.

## Design notes

- **Contrast** — every foreground token is measured against its background and passes WCAG
  AA for body text in both themes. Measured ratios are in the comments next to each token.
- **Focus** — a single `:focus-visible` treatment covers the page. The earlier build had no
  focus styles at all, which left keyboard users with an invisible default ring on a
  near-black background.
- **Motion** — scroll reveal with a capped stagger, 180 ms hover transitions, a cursor
  spotlight on project panels. `prefers-reduced-motion` is honoured in CSS *and* in the head
  script, which simply never arms the reveal. Reveal targets are visible by default, so a JS
  failure costs the animation, never the content.
- **Icons** — inline SVG throughout. No emoji used as iconography.
- **Touch targets** — buttons and inputs are `min-height: 2.75rem` (44 px).
- **Responsive** — verified at 375 / 768 / 1024 / 1440 px.

## Typography

- **Bricolage Grotesque** — display. A variable face with a real optical-size axis, so
  headings use letterforms drawn for their size rather than one master scaled up.
- **Inter** — body. **JetBrains Mono** — labels, metrics, code.

## Hero background

A CSS grid lattice with an accent glow that **follows the cursor**. Zero bytes, no WebGL,
and the same treatment in both themes and on mobile.

The glow is its own element moved with `transform`, not a gradient whose `at` position is
animated — repainting a viewport-wide gradient every frame is expensive, translating a
composited layer is close to free. `js/script.js` writes `--gx`/`--gy` and eases toward the
pointer at 0.14 per frame, so the light trails slightly instead of snapping. Tracking is
limited to fine pointers, skipped under `prefers-reduced-motion`, and suspended by an
IntersectionObserver once the hero scrolls away. With no JS the glow sits top-right, which
is also where it stays on touch.

> This replaced a Three.js fresnel orb. A glow needs something to glow against — on a
> near-white page the identical form read as a grey disc smudged into the corner, so it had
> to be switched off in light mode, which left light with **no background at all**. Two
> layout traps were hit building the replacement, both worth knowing:
>
> 1. `.hero > *:not(.hero-gl)` set `position: relative` on the new background div, which
>    collapses an `inset: 0` element to **zero height** — it silently never paints. Any
>    decorative layer added to the hero must be excluded from that rule by name.
> 2. Living inside `.shell`, the layer was clipped at the content column and left a hard
>    vertical seam. It now sits in a full-width `.hero-wrap`, with `.shell` nested inside.

## Motion layer

`js/motion.js` — **Lenis** smooth scroll, **GSAP + ScrollTrigger** for word-mask heading
reveals, stat counters, magnetic primary buttons, and a trailing cursor ring.

- The word splitter walks text nodes and recurses into elements, so inline spans like
  `.hero-role` keep their class and the heading keeps its meaning. The text stays real text.
- **Nothing is hidden up front.** Reveals use `fromTo` with `immediateRender: false` and the
  counters only zero themselves inside `onEnter`, so a ScrollTrigger that never fires costs
  an animation rather than the content. An earlier version used `gsap.from({opacity: 0})` on
  the project cards and `gsap.set` on the headings — which blanked the entire Selected Work
  section and reduced the stat row to `00 / 000 / 00.0K / 00`.
- `syncTouch: false` — Lenis never hijacks touch. Native momentum on a phone beats anything
  we can fake, and fighting it is the classic premium-site mistake.
- Magnetic buttons reset on `blur`, so a keyboard user tabbing away cannot leave one stuck
  off-centre.
- The cursor ring starts `is-idle` and only appears after the first pointer move — otherwise
  it parks at 0,0 and shows as a stray arc in the corner on load.

## Nothing is on the critical path

First paint is **~77 KB with zero dependencies**. Everything above is dynamic-imported:

| Layer | Loads when | Weight (gzip) |
|---|---|---|
| `motion.js` + GSAP + ScrollTrigger + Lenis | first paint settles | ~100 KB |

It is skipped entirely when `prefers-reduced-motion: reduce` is set or the browser reports
`Save-Data`.

**Every surface degrades to real content.** The hero background is CSS, so it needs no
JavaScript at all, and project 02's architecture diagram is a static SVG.

## Project visuals

Each project panel carries a looping isometric animation in `assets/video/`.

Delivered as **animated WebP inside an `<img>`** — it loops on its own, so there is no
`<video>` element and no JavaScript. A `<picture>` wrapper serves the static `.jpg` poster
to anyone with `prefers-reduced-motion: reduce`, which means the motion opt-out costs no
JS either. `width`/`height` are set in the markup so the card cannot reflow on load, and
every image is `loading="lazy"`.

The 1280x720 source GIFs are 12 MB each (47.7 MB total) and are **gitignored** — the
optimised 960x540 / 24 fps WebPs are 4.8 MB for all four, a 10x reduction. Re-encode with
Pillow if the sources change; no ffmpeg needed.

| File | Source GIF | Shipped WebP | Poster |
|---|---|---|---|
| `oasis` | 12.2 MB | 1346 KB | 27 KB |
| `docintel` | 12.0 MB | 1128 KB | 24 KB |
| `projlab` | 10.7 MB | 1197 KB | 26 KB |
| `astraops` | 12.8 MB | 1265 KB | 25 KB |

## Structure

```
portfolio/
├── index.html          # all content lives here
├── css/style.css       # tokens (§1) → components → hero background (§9b) → reduced-motion (§19)
├── js/script.js        # theme · marquee · reveal · accordion · GitHub graph · contact · lazy loaders
├── js/motion.js        # Lenis + GSAP — reveals, counters, magnetic, cursor, loaded on demand
├── assets/video/       # project animations (.webp shipped, .gif gitignored)
├── tools/              # scene generator for the fallback animations
└── README.md
```

## Running locally

```bash
cd portfolio
python -m http.server 8000
# http://localhost:8000
```

## Content

Project copy is written from what the code actually does, with metrics taken from the repos
themselves. Four projects are featured:

| # | Project | Status | Source |
|---|---|---|---|
| 01 | Oasis Globe — WhatsApp service automation | In production | [oasis-service-automation](https://github.com/rohitpatil9121/oasis-service-automation) · [technician-app](https://github.com/rohitpatil9121/technician-app) |
| 02 | Document Intelligence Pipeline — AWS Step Functions + Bedrock | Source private | — |
| 03 | Projection Lab — India-first financial projection engine | Android build ready | [projection-lab](https://github.com/rohitpatil9121/projection-lab) |
| 04 | AstraOps — AWS observability dashboard | Self-hosted | [AstraOps](https://github.com/rohitpatil9121/AstraOps) |

## Known gaps

Things that are deliberately absent rather than forgotten:

- **No résumé PDF.** `assets/resume/` is empty, so the Resume / CV button is hidden. It is
  not commented out — `js/script.js` HEAD-probes the file on load and unhides the button the
  moment a real PDF is there. Just drop in `assets/resume/Rohit_Patil_Resume.pdf`; no code
  change needed. (The old build shipped this button pointing at a file that never existed,
  so every click 404'd.)
- **No OG image.** `og:image` is unset, so link previews render without a card image. Add a
  1200×630 PNG at `assets/images/og.png` and reference it in `<head>`.
- **Document Intelligence Pipeline has no source link** because the project is not pushed to
  GitHub. Push it and add the link.
- **Projection Lab has no live demo link.** `projection-lab.onrender.com` serves the API, and
  its root returns 404 — linking it as a demo would send visitors to an error page.

## Contact form

The form has **no backend**. It validates client-side and then opens the visitor's mail
client with the subject and body pre-filled via `mailto:`.

> The previous version displayed "Thanks! I'll get back to you soon." and sent nothing —
> every message written into it was silently discarded. If you want real submissions without
> a server, wire the submit handler in `js/script.js` to Formspree or EmailJS.

## Deploying

Any static host. No build command, no output directory.

- **GitHub Pages** — Settings → Pages → deploy from `main`, root
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo and leave
  the build settings empty

© 2026 Rohit Patil
