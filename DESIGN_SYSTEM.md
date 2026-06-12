# EliteGrid — Design System & Theme Reference

> This document describes the visual language of the **EliteGrid marketing website** so a separate project (the documentation site) can be built to match it exactly. It is a spec, not code. Everything here is extracted directly from the live site (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and the components).

The aesthetic in one line: **dark, near-black developer tooling site with a single electric-lime accent, heavy use of monospace for "meta" labels, and tight, bold display typography.**

---

## 1. Tech Stack (so the docs match)

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS **v4** (CSS-first config — there is **no** `tailwind.config.js`; theme tokens live in `app/globals.css` under `@theme inline`)
- **Fonts:** `next/font/google` — Geist Sans + Geist Mono
- **No component library.** Everything is hand-rolled with Tailwind utility classes. Match this — do not introduce shadcn/MUI/etc.

---

## 2. Color Palette

The site is dark-only (the page hard-codes a dark background; it does not rely on the OS light/dark toggle in `globals.css`). Use these exact hex values.

### Backgrounds (layered, darkest → lightest)
| Token | Hex | Usage |
|---|---|---|
| Base / page | `#09090b` | The main page background, nav bar |
| Section A | `#0d0d0f` | Alternating section ("For Developers") |
| Section B | `#111113` | Alternating section, cards, inputs, callouts, final CTA |
| Surface (subtle) | `rgba(255,255,255,0.02)` | Default card fill (`bg-white/[0.02]`) |
| Surface (hover) | `rgba(255,255,255,0.05)` | Card hover fill (`bg-white/[0.05]`) |
| Surface (chips) | `rgba(255,255,255,0.03)` | Feature pills |

### Accent — "Electric Lime" (the brand color)
| Token | Hex | Usage |
|---|---|---|
| **Accent** | `#e8ff47` | THE brand accent — logo, highlighted words, CTA button fill, all mono labels, icons, links on hover, active timeline dots |
| Accent (hover, on button) | `#d4eb3a` | Darker lime for the filled-button hover state |
| Accent tints | `#e8ff47` at `/5 /10 /25 /30 /40 /50` opacity | Backgrounds (`bg-[#e8ff47]/10`), borders (`border-[#e8ff47]/25`), focus rings (`/10`) |

> The accent is used **sparingly but consistently**: section eyebrows, the one highlighted word in each heading, badges, icon tiles, and the primary button. Never use it for body text.

### Text (foreground)
| Token | Hex | Usage |
|---|---|---|
| Primary text | `#f4f4f5` | Headings, primary body, input text |
| Secondary text | `#a1a1aa` | Lead paragraphs, descriptions |
| Tertiary text | `#71717a` | Card body copy, muted labels |
| Quaternary / dim | `#52525b` | Mono captions, footer, stat labels, placeholders |
| Very dim | `#3f3f46` | "or" divider text |
| On-accent text | `#09090b` | Text/icons placed **on** the lime accent (e.g. button label, logo glyph) |

### Borders & dividers
| Token | Value | Usage |
|---|---|---|
| Default border | `rgba(255,255,255,0.08)` → `border-white/8` | Section separators, cards, inputs, footer, nav bottom border |
| Accent border | `border-[#e8ff47]/25` (also `/30 /40 /50`) | Highlighted cards, code block, CTA outline button, badges |

### Status / semantic colors
| Meaning | Color | Where |
|---|---|---|
| Success | `#e8ff47` (lime) | Form success messages |
| Warning / duplicate | `#facc15` (`yellow-400`) | "Already on waitlist" |
| Error | `#f87171` (`red-400`) | Form errors |
| Mac-window dots | `red-500`, `yellow-500`, `green-500` | Decorative code-block titlebar only |

---

## 3. Typography

### Font families
- **Sans (default / display):** **Geist** — loaded as `--font-geist-sans`. Used for all headings and body.
- **Mono:** **Geist Mono** — loaded as `--font-geist-mono`, applied with the `font-mono` utility.

```ts
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// <html class={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

```css
/* app/globals.css — Tailwind v4 token mapping */
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

> Note: `globals.css` `body` currently also lists `font-family: Arial, Helvetica, sans-serif` as a fallback, but the `--font-sans` token + Geist variable is the real default. For the docs, set the body to Geist Sans.

### The two-typeface rhythm (important — this is the signature look)
1. **Geist Sans, bold/extrabold, tight tracking** → all real content: headings and body.
2. **Geist Mono, small, often uppercase + wide tracking** → all "system/meta" UI: eyebrows above headings, badges, stat labels, code, buttons-that-look-technical, footer, captions, form fields.

When in doubt: **prose = sans, metadata/labels/code = mono.**

### Type scale (as used)
| Role | Classes | Notes |
|---|---|---|
| Hero H1 | `text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none` | One word wrapped in `text-[#e8ff47]` |
| Section H2 | `text-4xl md:text-5xl font-extrabold tracking-tight` (final CTA goes `md:text-6xl`) | Often two lines via `<br/>` |
| Sub-section H2 | `text-3xl md:text-4xl font-extrabold tracking-tight` | Playground callout |
| Card title H3 | `font-bold text-base tracking-tight` (small cards `text-sm`) | |
| Lead paragraph | `text-lg md:text-xl text-[#a1a1aa] leading-relaxed` | |
| Body paragraph | `text-base`/`text-sm text-[#a1a1aa]` or `text-[#71717a] leading-relaxed` | |
| **Eyebrow label** | `font-mono text-xs tracking-widest uppercase text-[#e8ff47]` | Sits above every section H2 |
| Badge / pill | `font-mono text-xs ... rounded-full` | |
| Caption | `font-mono text-xs text-[#52525b]` | |
| Stat number | `text-2xl font-extrabold tracking-tight` | |
| Code | `font-mono text-xs leading-relaxed` | |

Headings are consistently **`font-extrabold` + `tracking-tight`**. Body uses **`leading-relaxed`**.

---

## 4. Spacing, Layout & Sizing

- **Content max width:** `max-w-5xl mx-auto` for standard sections; `max-w-3xl` for the centered final CTA; `max-w-2xl`/`max-w-4xl` for narrow content (code block, hero copy).
- **Horizontal padding:** `px-6` (mobile) → `px-6 md:px-10` for full-bleed bars (nav/footer).
- **Section vertical padding:** `py-24` standard; `py-14` for the compact playground callout.
- **Section separation:** every section starts with `border-t border-white/8`, and many alternate background between `#0d0d0f` / `#111113` / base.
- **Grid gaps:** cards use `gap-6` (3-col dev features) or `gap-4` (3-col user features); `grid-cols-1 md:grid-cols-3`.
- **Nav height:** `h-16`, fixed, `z-50`, with `backdrop-blur-xl` and `bg-[#09090b]/80`.

### Border radius scale
| Token | Used for |
|---|---|
| `rounded-lg` (0.5rem) | Small icon tiles, chips, logo box (`rounded-md`) |
| `rounded-xl` (0.75rem) | Cards, inputs, buttons, code block |
| `rounded-2xl` (1rem) | Large CTA tile |
| `rounded-full` / `999` | Badges, pills, floating feedback button, status dots |

---

## 5. Component Patterns (copy these for the docs)

### Eyebrow + Heading + Lead (the standard section header)
```tsx
<div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">
  Section Label
</div>
<h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
  Two-line<br />heading
</h2>
<p className="text-[#a1a1aa] text-lg max-w-xl leading-relaxed mb-16">
  Supporting lead paragraph.
</p>
```

### Card (feature card)
```tsx
<div className="p-6 rounded-xl border border-white/8 bg-white/[0.02]
     hover:bg-white/[0.05] hover:border-[#e8ff47]/25 transition-all">
  {/* icon tile */}
  <div className="w-10 h-10 rounded-lg bg-[#e8ff47]/10 border border-[#e8ff47]/25
       flex items-center justify-center mb-5 text-lg">🧩</div>
  <h3 className="font-bold text-base mb-2 tracking-tight">Title</h3>
  <p className="text-sm text-[#71717a] leading-relaxed">Description.</p>
</div>
```
The signature card hover: surface lightens (`/0.02 → /0.05`) **and** the border picks up the lime tint (`border-white/8 → border-[#e8ff47]/25`). Apply `transition-all`.

### Primary button (filled lime)
```tsx
<button className="font-bold text-sm px-7 py-3.5 rounded-xl
  bg-[#e8ff47] text-[#09090b] hover:bg-[#d4eb3a] active:scale-95
  transition-all disabled:opacity-50">
  Join Waitlist →
</button>
```

### Secondary button (ghost / outline lime)
```tsx
<a className="inline-flex items-center gap-2 font-mono text-sm font-semibold
  px-6 py-3 rounded-xl border border-[#e8ff47]/30 bg-[#e8ff47]/5 text-[#e8ff47]
  hover:bg-[#e8ff47]/10 hover:border-[#e8ff47]/50 transition-all">
  Try the Playground →
</a>
```

### Text input
```tsx
<input className="font-mono text-sm px-5 py-3.5 rounded-xl
  border border-white/8 bg-[#111113] text-[#f4f4f5]
  placeholder:text-[#52525b] outline-none
  focus:border-[#e8ff47]/40 focus:ring-2 focus:ring-[#e8ff47]/10
  transition-all disabled:opacity-50" />
```

### Badge / pill
```tsx
<span className="font-mono text-xs text-[#e8ff47] bg-[#e8ff47]/10
  border border-[#e8ff47]/25 px-3 py-1 rounded-full">
  v0.1 · coming soon
</span>
```
Pulsing-dot variant (status indicator) prepends:
`<span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-pulse" />`

### Code block (with fake mac titlebar)
```tsx
<div className="rounded-xl border border-[#e8ff47]/25 overflow-hidden">
  <div className="flex items-center gap-2 px-4 py-3 bg-[#e8ff47]/5 border-b border-[#e8ff47]/25">
    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
    <span className="font-mono text-xs text-[#71717a] ml-2">App.tsx</span>
  </div>
  <pre className="p-6 font-mono text-xs leading-relaxed overflow-x-auto text-[#a1a1aa]">
    {/* code */}
  </pre>
</div>
```
For the **docs site** specifically: code blocks are the centerpiece, so keep this style — lime-tinted border + titlebar, `font-mono text-xs`, body text `#a1a1aa`. Add syntax highlighting on top of this dark base.

### Floating feedback button (bottom-right, fixed)
Pill, `#111113` bg, `1px solid rgba(255,255,255,0.1)` border, `#71717a` text → hovers to lime border + lime text. `border-radius: 999`, `box-shadow: 0 4px 16px rgba(0,0,0,0.4)`.

---

## 6. Signature Decorative Effects

These give the site its character — reuse for the docs landing/hero if you want continuity:

**Faint grid background** (the "data grid" motif), masked to fade at edges:
```tsx
<div className="absolute inset-0
  bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
  bg-[size:48px_48px]
  [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black_0%,transparent_100%)]" />
```

**Lime radial glow** behind the hero:
```tsx
<div className="absolute w-[600px] h-[600px] rounded-full
  bg-[radial-gradient(circle,rgba(232,255,71,0.12)_0%,transparent_70%)]
  top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none" />
```

**Glassy fixed nav:** `bg-[#09090b]/80 backdrop-blur-xl border-b border-white/8`.

**Brand logo:** a `#e8ff47` rounded square (`w-7 h-7 rounded-md`) containing a 4-cell grid SVG drawn in `#09090b` — a mini data-grid glyph. Next to it: `EliteGrid` in `font-bold text-lg tracking-tight`.

---

## 7. Motion

- Standard transition: **`transition-all`** (Tailwind default ~150ms) on every interactive element.
- Button press: **`active:scale-95`**.
- Icon tile hover: **`group-hover:scale-110`**.
- Status/loading dots: **`animate-pulse`**.
- Accessibility commitment of the product: **respect `prefers-reduced-motion`** — keep decorative animations subtle and motion-safe in the docs too.

---

## 8. Quick-Reference Cheat Sheet

```
PAGE BG          #09090b
SECTION BGS      #0d0d0f / #111113 (alternate)
ACCENT (lime)    #e8ff47   (hover #d4eb3a, on-accent text #09090b)
TEXT             #f4f4f5 > #a1a1aa > #71717a > #52525b > #3f3f46
BORDER           white/8  (accent border #e8ff47/25)
ERROR / WARN     #f87171 / #facc15

FONT SANS        Geist          (headings: font-extrabold tracking-tight)
FONT MONO        Geist Mono     (labels: text-xs uppercase tracking-widest)

RADII            md(logo) · xl(cards/inputs/buttons) · 2xl(big tile) · full(pills)
SECTION PAD      py-24 · max-w-5xl mx-auto px-6 · border-t border-white/8
TRANSITION       transition-all · active:scale-95
```

**The vibe:** Vercel/Linear-grade dark developer site, but with one bold electric-lime accent instead of the usual blue/purple. Tight bold type, monospace metadata everywhere, faint grid lines, and a single glowing accent that earns attention because it's used so deliberately.
