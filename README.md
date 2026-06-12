# Rohit Patil — Portfolio

A premium, recruiter-ready personal portfolio for a Cloud Computing student. Built to feel like a modern SaaS landing page crossed with a professional developer portfolio.

## Tech Stack

- **HTML5** — semantic markup
- **Tailwind CSS** (CDN) — utility-first styling + custom config
- **Vanilla JavaScript** — no frameworks
- **Font Awesome** — icons
- **Chart.js** — skills radar chart

No React. No Bootstrap. No dark mode.

## Features

- Sticky glassmorphism navbar with active-section highlighting and a mobile drawer
- Full-screen hero with typing animation, floating info card, and decorative chips
- Animated scroll progress bar and back-to-top button
- Reveal-on-scroll animations, animated counters, and animated skill progress bars
- Chart.js radar chart that animates when scrolled into view
- Featured project showcase (AstraOps) plus a project grid
- Education timeline and certification cards
- Working contact form with client-side validation, error states, and a success state
- SEO meta tags + Open Graph / Twitter cards
- Mobile-first responsive layout, accessibility-minded, respects `prefers-reduced-motion`

## Structure

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── images/
│   ├── resume/        # drop Rohit_Patil_Resume.pdf here
│   └── icons/
└── README.md
```

## Running it

Just open `index.html` in a browser — everything loads from CDNs, no build step.
For best results (and to avoid any browser file-path quirks) serve it locally:

```bash
cd portfolio
python -m http.server 8000
# then open http://localhost:8000
```

## Customizing

- **Resume:** add your PDF at `assets/resume/Rohit_Patil_Resume.pdf` (the download buttons point here).
- **Project images:** drop files in `assets/images/` and swap the gradient art blocks for `<img>` tags if desired.
- **Contact form:** validation is client-side only. To receive messages, wire the submit handler in `js/script.js` to a service like Formspree, EmailJS, or your own endpoint.
- **Colors:** edit the Tailwind config in `index.html` and the `:root` variables in `css/style.css`.

© 2026 Rohit Patil
