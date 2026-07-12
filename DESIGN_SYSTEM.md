# EliteGrid — Design System & Theme Reference

> This document describes the visual language of the **EliteGrid website** (marketing landing + documentation portal). It is a spec, not code. Everything here is extracted from the approved design mocks in `design docs/` (`EliteGrid Landing.dc.html`, `EliteGrid Docs.dc.html`, `EliteGrid Logo Exploration.dc.html`). Where the current implementation differs, **the mocks win**.

The aesthetic in one line: **warm paper-white (light-first, with a full dark theme) developer site, a deep-violet accent with gradient tints, editorial Bricolage Grotesque display type over DM Sans body, and always-dark JetBrains Mono code blocks.**

> ⚠️ This replaces the previous dark-only / electric-lime (`#e8ff47`) system. Do not use lime anywhere in the new design.

---

## 1. Tech Stack (unchanged)

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS **v4** (CSS-first config — no `tailwind.config.js`; theme tokens live in `app/globals.css` under `@theme inline`)
- **Fonts:** `next/font/google` — Bricolage Grotesque (headings), DM Sans (body), JetBrains Mono (code)
- **No component library.** Everything hand-rolled with Tailwind utilities. Do not introduce shadcn/MUI/etc.
- **Theming:** the mocks are built on **CSS custom properties** with a `.dark` class toggle. Implement all colors as CSS variables so the light/dark switch is a single class on the root.

---

## 2. Color Palette

The site is **light-first** with a complete dark theme. Two surfaces are *always dark* regardless of theme: **code blocks** and the **waitlist / final-CTA section**.

### Core tokens — Light theme (default)
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f5f4ef` | Page background (warm off-white, not pure white) |
| `--bg-raised` | `#ffffff` | Raised surfaces, docs sidebar |
| `--bg-code` | `#131316` | Code blocks (always dark) |
| `--text-1` | `#18181b` | Headings, primary text |
| `--text-2` | `#525252` (docs uses `#52525b`) | Body copy, descriptions |
| `--text-3` | `#a3a3a3` (docs uses `#a1a1aa`) | Muted labels, captions, footer links |
| `--border` | `rgba(0,0,0,0.08–0.09)` | Default borders, separators |
| `--border-str` | `rgba(0,0,0,0.12–0.13)` | Stronger borders (ghost buttons, dividers) |
| `--card-bg` | `rgba(0,0,0,0.025)` | Card fill |
| `--card-border` | `rgba(0,0,0,0.07)` | Card borders |
| `--nav-blur-bg` | `rgba(245,244,239,0.88–0.9)` | Blurred nav background |

### Core tokens — Dark theme (`.dark`)
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#09090e` | Page background (near-black with a blue-violet cast) |
| `--bg-raised` | `#0e0e17` | Raised surfaces, docs sidebar `#0c0c14` |
| `--bg-code` | `#0c0c14`–`#0e0e17` | Code blocks |
| `--text-1` | `#edf0fa` | Headings, primary text |
| `--text-2` | `#7a8399` | Body copy |
| `--text-3` | `#374151` | Muted labels |
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border-str` | `rgba(255,255,255,0.11)` | Stronger borders |
| `--card-bg` | `rgba(255,255,255,0.025)` | Card fill |
| `--card-border` | `rgba(255,255,255,0.065)` | Card borders |
| `--nav-blur-bg` | `rgba(9,9,14,0.88–0.9)` | Blurred nav background |

### Accent — "Violet" (the brand color)
| Token | Hex | Usage |
|---|---|---|
| `--acc` | `#5b21b6` | Base accent — primary button fill (light theme), logo gradient start |
| `--acc-h` | `#4c1d95` | Primary button hover (light theme) |
| `--t1` | `#7c3aed` | Tint 1 — accent text, links, active nav items, icons, stat highlights; primary button fill in **dark** theme (hover `#6d28d9`) |
| `--t2` | `#a855f7` | Tint 2 — gradient end, logo gradient end, active pm-tab text |
| `--g1 → --g2 → --g3` | `#7c3aed → #a855f7 → #c084fc` | Text gradient (`130deg`) for the highlighted hero words |
| `--acc-rgb` | `91,33,182` | Used for all alpha tints: `rgba(var(--acc-rgb), …)` |

Common alpha tints of `--acc-rgb`: `.03/.04/.06` hover & callout fills · `.1/.12/.15` badge & icon-tile fills · `.18/.2/.25` accent borders · `.3` hover borders · `.35` button glow shadow · `.45/.55` input focus borders.

> The accent is used **sparingly**: badges/eyebrow labels, the gradient hero words, primary buttons, links, active states, and icon tiles. Body text never uses accent.

**Alternate accent palettes** (the mocks are parameterized; violet is default): emerald `#065f46/#059669/#10b981`, cobalt `#1e3a8a/#2563eb/#3b82f6`, rose `#9f1239/#e11d48/#f43f5e`. Build against the variables so swapping palettes stays possible.

### Status / semantic colors
| Meaning | Color | Where |
|---|---|---|
| Success / Shipped | `#16a34a` (green-600) | Roadmap "Shipped" cards, a11y checkmarks, copy-button "Copied" state (`#22c55e`) |
| In progress / Warning | `#d97706` (amber-600) | "v0.1 · Active Development" badge, "Building Now" roadmap cards, warn callouts |
| Info | `#0ea5e9` (sky-500) | Info callouts, a11y stat |
| Mac-window dots | `#ff5f57` / `#ffbd2e` / `#28c840` | Decorative code-block titlebar only |

### Syntax highlighting (on the always-dark code background)
Base text `#e2e8f0`. Tokens: keyword `#c084fc` · component `#818cf8` · function `#93c5fd` · property `#7dd3fc` · string `#86efac` · number `#fb923c` · comment `#4a5568` italic · operator/punctuation `#64748b`.

---

## 3. Typography

### Font families (three-font system)
- **Headings / display:** **Bricolage Grotesque** (`--hfont`) — weights 600/700/800. Every `h1–h3`, stat number, card title, and the logo wordmark.
- **Body:** **DM Sans** — weights 400/500/600. All paragraphs, nav links, buttons, UI text.
- **Mono:** **JetBrains Mono** — weights 400/500. Code, inline code chips, version numbers, feature-row numbers, keyboard hints (`⌘K`).

(The landing mock also carries Plus Jakarta Sans and Playfair Display as alternative heading options; **Bricolage is the chosen default**.)

### The typographic rhythm
1. **Bricolage Grotesque, 700–800, tight negative tracking (−0.02em to −0.04em)** → all headings. The bigger the heading, the tighter the tracking.
2. **DM Sans, 400–500, `line-height` 1.6–1.75** → all body and UI copy.
3. **JetBrains Mono, small** → anything code-ish or "system": chips, versions, numbering, shortcuts.
4. **Uppercase micro-labels** (`11px, 700, letter-spacing 0.07–0.09em, uppercase`) → section eyebrows (`badge-label` in accent), sidebar group titles and TOC titles (in `--text-3`). These are **DM Sans**, not mono.

### Type scale (as used)
| Role | Spec |
|---|---|
| Hero H1 | Bricolage `clamp(52px, 7vw, 88px)` 800, `line-height 1.0`, `letter-spacing -0.04em`; highlighted words use the `--g1→--g3` gradient text |
| Section H2 (landing) | Bricolage `clamp(28px, 4vw, 52px)` 800, `-0.03em`, `line-height 1.05`, often two lines |
| Final CTA H2 | Bricolage `clamp(36px, 6vw, 68px)` 800, `-0.04em` |
| Docs page H1 | Bricolage `38px` 800, `-0.03em`, `line-height 1.1` |
| Docs H2 / H3 | Bricolage `22px` 700 `-0.02em` / `16px` 700 |
| Feature/card H3 | Bricolage `17–19px` 700, `-0.01em` |
| Lead paragraph | DM Sans `16–18px`, `--text-2`, `line-height 1.7` (docs lead: `17px` with bottom border) |
| Body paragraph | DM Sans `14–15px`, `--text-2`, `line-height 1.65–1.75` |
| Small/muted | DM Sans `12–13px`, `--text-3` |
| Eyebrow label | DM Sans `11px` 700 uppercase `0.09em`, accent color |
| Stat number | Bricolage `34px` 800, `-0.03em`, `line-height 1` |
| Inline code chip | JetBrains Mono `11.5–12px`, accent on `rgba(acc, 0.1)` bg, `2px 6px`, radius 4px |
| Code | JetBrains Mono `12–13px`, `line-height 1.75–1.8` |

---

## 4. Spacing, Layout & Sizing

### Landing page
- **Content max width:** `1100px`, centered, `padding: 0 24px`.
- **Section vertical padding:** `100px` (docs teaser `80px`, waitlist `120px`).
- **Section separation:** a gradient hairline `.sep` — `linear-gradient(90deg, transparent, var(--sep) 20%, var(--sep) 80%, transparent)`, 1px tall — instead of full-width borders.
- **Nav:** fixed, `64px` tall, `padding: 0 48px`, transparent at top → gains `--nav-blur-bg` + `blur(20px)` + bottom border once scrolled (`.scrolled` at `scrollY > 20`).
- **Hero:** full-viewport, two-column `1.1fr / 0.9fr` grid with `72px` gap (code column hidden ≤1024px); faint 48px line-grid pattern behind (dark theme swaps to a 28px violet dot grid), bottom fade into `--bg`.

### Docs portal (three-pane)
- **Top nav:** fixed `60px`, blurred `--nav-bg`, contains logo + "Docs" chip, search input (`⌘K` hint), links.
- **Sidebar:** `260px`, sticky under the nav, `--sb-bg` background, right border, version chip at top; hidden ≤768px.
- **Main column:** `flex: 1`, `max-width: 740px`, `padding: 48px 40px 80px`.
- **TOC (right):** `220px`, sticky; hidden ≤1024px.
- **Sidebar items:** `13.5px`, `6px 20px` padding, 2px transparent left border; active = accent text + `rgba(acc, 0.06)` bg + accent left border + 600 weight.

### Border radius scale
| Radius | Used for |
|---|---|
| `4–5px` | Inline code chips, tiny badges, `⌘K` key hint |
| `6–8px` | Copy buttons, search input, sidebar version chip, logo mark (7–8px) |
| `9px` | **Buttons** (primary & ghost), feature icon tiles |
| `10–12px` | Cards (prereq, next-step, callouts 10px; stats grid, code blocks 12px) |
| `14–16px` | Roadmap cards (14px), hero code shell (16px) |
| `20px` | Docs-teaser large tile |
| `100px` / full | Pills, badge-pill, demo feature chips |

---

## 5. Component Patterns

### Eyebrow + Heading + Lead (standard landing section header)
Split header: eyebrow + heading on the left, lead paragraph right-aligned to the baseline (`display:flex; justify-content:space-between; align-items:flex-end`).
```html
<span class="badge-label">For Developers</span>  <!-- 11px 700 uppercase, accent -->
<h2 class="hfont" style="font-size:clamp(28px,4vw,52px);font-weight:800;letter-spacing:-0.03em;line-height:1.05;">
  Built different,<br/>by design.
</h2>
<p style="font-size:16px;color:var(--text-2);max-width:360px;line-height:1.7;">Lead copy…</p>
```

### Primary button (filled violet)
```css
.btn-p {
  background: var(--acc-btn); color: #fff;            /* #5b21b6 light / #7c3aed dark */
  font: 600 14px 'DM Sans'; padding: 11px 22px; border-radius: 9px;
  transition: background .2s, transform .15s, box-shadow .2s;
}
.btn-p:hover {
  background: var(--acc-btn-h);                       /* #4c1d95 light / #6d28d9 dark */
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(var(--acc-rgb), 0.35);  /* the violet glow */
}
```

### Ghost button (outline)
Transparent bg, `1px solid var(--border-str)`, `--text-1` text, same padding/radius; hover: `--card-bg` fill + `translateY(-1px)`.

### Card (uf-card / prereq / next-step)
```css
.card { background: var(--card-bg); border: 1px solid var(--card-border);
        border-radius: 10–11px; padding: 14–20px;
        transition: border-color .22s, background .22s; }
.card:hover { border-color: rgba(var(--acc-rgb), 0.25–0.3);
              background: rgba(var(--acc-rgb), 0.03–0.04); }
```
The signature hover: border and fill both pick up a faint violet tint.

### Feature row (numbered list, landing)
`border-top: 1px solid var(--border)` rows with: mono `01`-style number (`11px`, `--text-3`), a `38px` icon tile (`rgba(acc,0.1)` fill, `rgba(acc,0.18)` border, radius 9px, accent-stroked SVG), Bricolage title, body copy. Hover: row indents `padding-left: 10px` (cubic-bezier(.16,1,.3,1)) and the number turns accent.

### Code block (always dark, both themes)
```css
.code-shell { background: var(--bg-code); border: 1px solid rgba(255,255,255,0.07);
              border-radius: 12–16px; overflow: hidden; }
/* light theme floats it: */ box-shadow: 0 28px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10);
/* dark theme: */ box-shadow: 0 28px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(var(--acc-rgb),0.06);
```
Toolbar: `rgba(255,255,255,0.03)` bg, bottom border `rgba(255,255,255,0.06–0.07)`, mac dots (`#ff5f57/#ffbd2e/#28c840`), mono filename, and an uppercase language chip (`10px` 700, accent on `rgba(acc,0.15)` + `rgba(acc,0.25)` border, radius 4–5px). Docs blocks add a **copy button** (bordered ghost, turns `#22c55e` "✓ Copied" for 2s) and **package-manager tabs** (npm/pnpm/yarn/bun — mono `12.5px`, active tab = `--t2` text on `rgba(acc,0.12)`).

### Callouts (docs)
`border-radius: 10px; padding: 16px 18px;` flex row of emoji icon + `14px` text. Three variants, each `rgba(color,0.06)` bg + `rgba(color,0.18)` border + **3px solid left border**: tip = accent, warn = `#d97706`, info = `#0ea5e9`.

### Step markers (docs)
`28px` circular number chip — mono `12px` 700 accent, `rgba(acc,0.12)` fill, `1.5px rgba(acc,0.3)` border — beside a Bricolage `17px` step title and body.

### Badges & pills
- **Status pill** (hero): `12px` 500, amber `#d97706` on `rgba(217,119,6,0.09)` + `0.2` border, radius 100px, with a 6px pulsing dot.
- **"Soon" chip:** `10px` 700 uppercase, accent on `rgba(acc,0.1)` + `0.2` border, radius 4–5px.
- **Roadmap status labels:** `11px` 700 uppercase `0.09em` + 8px colored dot — green Shipped / amber Building Now (pulsing) / accent Up Next / `--text-3` Planned.

### Stats grid (hero)
Bordered `1fr×4` grid, radius 12px, internal 1px column borders (no gaps). Each cell: Bricolage `34px` 800 number (count-up animated) over an `11.5px` `--text-3` label. One highlighted number in accent (`stat-acc`).

### Inputs
- **Docs search:** `--card-bg` fill, `--border` border, radius 8px, `13px`, focus → `rgba(acc,0.45)` border. Placeholder `--text-3`.
- **Waitlist email** (on dark): `rgba(255,255,255,0.07)` fill, `0.12` border, radius 9px, `15px` DM Sans, focus → `rgba(acc,0.55)` border.

---

## 6. Signature Decorative Effects

- **Hero grid pattern (light):** 1px line grid from `var(--border)`, `48px × 48px`, ~0.6 opacity. **Dark theme swaps to a violet dot grid:** `radial-gradient(rgba(acc,0.13) 1px, transparent 1px)`, `28px`.
- **Hero glow (dark only):** `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(acc,0.15), transparent 65%)`.
- **Gradient text** on the hero's key words: `linear-gradient(130deg, #7c3aed, #a855f7, #c084fc)` + `background-clip: text`.
- **Always-dark waitlist section:** `#09090e` bg with violet dot grid + bottom-anchored violet glow, regardless of theme.
- **Glassy nav:** transparent until scrolled, then `--nav-blur-bg` + `backdrop-filter: blur(20px)` + border.
- **Brand logo:** `30px` rounded square (radius 8px), `linear-gradient(135deg, var(--acc-btn), var(--t2))` fill, `box-shadow: 0 0 14px rgba(acc,0.3)`, containing the white 4-cell grid glyph (two cells at 50% opacity, diagonal). Wordmark: Bricolage 700 `17px`, `-0.02em`. (See `EliteGrid Logo Exploration.dc.html` for the candidate replacement marks — Option A "Pinnacle" is recommended.)

---

## 7. Motion

- **Scroll reveal:** `.reveal` — from `opacity:0; translateY(20px)` to visible over `0.7s cubic-bezier(.16,1,.3,1)`, staggered `.08s/.16s/.24s/.32s` delays, triggered by IntersectionObserver (`threshold 0.08`).
- **Button hover:** `translateY(-1px)` + glow shadow (no scale).
- **Feature-row hover:** indent via `padding-left` with the same springy cubic-bezier.
- **Pulse dot:** `pulse-dot` keyframes — scale 1→1.5, opacity 1→0.5, 1.8–2s infinite (status badges).
- **Scroll cue:** `bob` — translateY 0→7px, 2.5s ease-in-out infinite.
- **Stat count-up** on reveal.
- **Theme transition:** `background 0.3–0.4s, color 0.3–0.4s` on the root.
- Standard micro-transitions: `0.2s` on color/border/background.
- **Respect `prefers-reduced-motion`** — disable reveal/bob/pulse for reduced-motion users.

---

## 8. Quick-Reference Cheat Sheet

```
LIGHT BG         #f5f4ef   (raised #ffffff)
DARK BG          #09090e   (raised #0e0e17)
CODE BG          #131316 / #0c0c14   (ALWAYS dark)
ACCENT (violet)  #5b21b6 base · #4c1d95 hover · #7c3aed t1 · #a855f7 t2
GRADIENT         130deg  #7c3aed → #a855f7 → #c084fc
TEXT  (light)    #18181b > #525252 > #a3a3a3
TEXT  (dark)     #edf0fa > #7a8399 > #374151
BORDER           rgba(0,0,0,.08-.09) light · rgba(255,255,255,.07) dark
STATUS           #16a34a shipped · #d97706 building · #0ea5e9 info

HEADINGS         Bricolage Grotesque 700/800, tracking -0.02 → -0.04em
BODY             DM Sans 400/500, line-height 1.6-1.75
MONO             JetBrains Mono (code, chips, numbering, ⌘K)

RADII            4-5 chips · 9 buttons · 10-12 cards · 14-16 shells · 100 pills
LAYOUT           landing max-w 1100px, sections py-100px, .sep hairlines
DOCS LAYOUT      nav 60px · sidebar 260px · main ≤740px · TOC 220px
MOTION           reveal translateY(20px) 0.7s cubic-bezier(.16,1,.3,1)
                 buttons hover translateY(-1px) + violet glow
```

**The vibe:** an editorial, Stripe/Vercel-docs-grade site that defaults to a warm paper-white canvas with a confident deep-violet accent — Bricolage Grotesque gives it personality, DM Sans keeps it calm, and the always-dark JetBrains Mono code blocks anchor it firmly in developer-tool territory. Dark theme is a first-class twin, not an afterthought.
