import type { Metadata } from 'next'
import Link from 'next/link'
import GridDemo from '@/components/GridDemo'
import Nav from '@/components/landing/Nav'
import Reveal from '@/components/landing/Reveal'
import AnimatedStat from '@/components/landing/AnimatedStat'
import InstallCommand, { InstallButton } from '@/components/landing/InstallCommand'
import { DEMOS } from '@/lib/demos/meta'
import FeatureClusters from '@/components/landing/FeatureClusters'
import { FAQ } from '@/lib/faq'

export const metadata: Metadata = {
  title: 'EliteGrid — High-Performance TypeScript Data Grid & Table Library',
  description: 'EliteGrid is a high-performance TypeScript data grid and table library. Row grouping, column virtualization, cell editors, clipboard, detail rows and i18n — with a grouped config API, React, Vue & vanilla adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
  keywords: [
    'grid library',
    'data grid library',
    'react grid library',
    'vue grid library',
    'typescript grid library',
    'typescript data grid',
    'react data grid',
    'vue data grid',
    'javascript data grid',
    'accessible data grid',
    'data table react',
    'react table typescript',
    'data grid typescript',
    'free typescript data grid',
    'elitegrid',
    'elite grid',
  ],
  authors: [{ name: 'EliteGrid', url: 'https://elitegrid.dev' }],
  creator: 'EliteGrid',
  publisher: 'EliteGrid',
  alternates: {
    canonical: 'https://elitegrid.dev',
  },
  openGraph: {
    title: 'EliteGrid — High-Performance TypeScript Data Grid & Table Library',
    description: 'EliteGrid is a high-performance TypeScript data grid and table library. Row grouping, column virtualization, cell editors, clipboard, detail rows and i18n — with a grouped config API, React, Vue & vanilla adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
    url: 'https://elitegrid.dev',
    siteName: 'EliteGrid',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EliteGrid — High-Performance TypeScript Data Grid & Table Library',
    description: 'EliteGrid is a high-performance TypeScript data grid and table library. Row grouping, column virtualization, cell editors and i18n. Grouped config API, React, Vue & vanilla adapters, full WCAG 2.1 AA accessibility.',
    site: '@elitegridhq',
    creator: '@elitegridhq',
  },
  metadataBase: new URL('https://elitegrid.dev'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// ── Shared style fragments ──────────────────────────────────────────────
const btnPrimary =
  'inline-flex items-center gap-2 bg-[#5b21b6] dark:bg-[#7c3aed] text-white font-semibold rounded-[9px] transition-all hover:bg-[#4c1d95] dark:hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(91,33,182,0.35)]'
const btnGhost =
  'inline-flex items-center gap-2 bg-transparent text-[#18181b] dark:text-[#edf0fa] font-medium rounded-[9px] border border-black/[0.13] dark:border-white/[0.11] transition-all hover:bg-black/[0.025] dark:hover:bg-white/[0.025] hover:-translate-y-px'
const badgeLabel =
  'block text-[11px] font-bold tracking-[0.09em] uppercase text-[#5b21b6] dark:text-[#7c3aed] mb-3.5'
const cardBase =
  'bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.07] dark:border-white/[0.065] transition-[border-color,background] duration-200'
const cardHover =
  'hover:border-[rgba(91,33,182,0.28)] hover:bg-[rgba(91,33,182,0.035)]'
const icV =
  'font-code text-[11.5px] text-[#7c3aed] bg-[rgba(91,33,182,0.1)] px-1.5 py-0.5 rounded'
const icD =
  'font-code text-[11.5px] text-[#a3a3a3] dark:text-[#374151] bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.09] dark:border-white/[0.07] px-1.5 py-0.5 rounded'
const sep =
  'h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.07] to-transparent'

const devFeatures = [
  {
    num: '01',
    title: 'Grouped Config API',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    desc: (
      <>
        <span className={icV}>{'sorting: { multiSort: true }'}</span> not{' '}
        <span className={icD}>enableMultiColumnSorting</span>. Every feature lives in its own
        namespace — config that reads like English, not a boolean soup.
      </>
    ),
  },
  {
    num: '02',
    title: 'TypeScript Native',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 6l7 4 7-4M9 10v6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    desc: 'Full type inference across config, events, and plugins. TypeScript catches configuration mistakes before runtime — not in a Slack thread at 11 PM.',
  },
  {
    num: '03',
    title: 'Plugin Architecture',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    desc: 'Microkernel core where every feature is an independent plugin on a shared event bus — and every optional one is a module you import. Sort, filter, grouping, editing and export cost nothing in a bundle that never registers them.',
  },
  {
    num: '04',
    title: 'React, Vue & Vanilla',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    desc: (
      <>
        Three first-class adapters with ergonomic hooks — <span className={icV}>useGrid()</span>,{' '}
        <span className={icV}>useSelectionState()</span>, <span className={icV}>usePaginationState()</span> — and one
        shared spec suite that runs against all three, so a behaviour that works in React works in Vue.
      </>
    ),
  },
  {
    num: '05',
    title: 'Docs You Can Trust',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 7h5M6.5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    desc: 'Three 22-chapter manuals, one per adapter, written so a junior developer can integrate from docs alone — no AI assist, no Stack Overflow, no tribal knowledge. Documentation as a first-class feature.',
  },
  {
    num: '06',
    title: 'Zero Dependencies',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5l1.8 5.4H17l-4.9 3.5 1.9 5.6L9 12.5l-5 3.5 1.9-5.6L1 7l6.2-.1L9 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
    desc: 'Pure TypeScript core with zero runtime dependencies. No bloat, no supply chain risk, no surprise breaking changes in a dependency you\'ve never heard of.',
  },
]


// The rail reads as npm releases, not internal milestones: 0.1.0, 0.1.1 and
// 0.2.0 are out, 0.3 is the next one. Everything in `landingIn020` shipped
// with 0.2.0 on 2026-10-12.
const releases = [
  { version: '0.1.0', state: 'on npm', summary: 'Core engine, React, Vue and vanilla adapters', kind: 'done' },
  { version: '0.1.1', state: 'on npm', summary: 'Parity fixes across the three adapters', kind: 'done' },
  { version: '0.2.0', state: 'on npm', summary: 'Modular registration plus 32 features', kind: 'done' },
  { version: '0.3', state: 'next', summary: 'Angular and Svelte adapters', kind: 'active' },
  { version: 'later', state: 'backlog', summary: 'Tree data, opt-in XLSX export', kind: 'planned' },
] as const

const railStyle = {
  done: {
    dot: 'bg-[#16a34a]',
    ring: 'ring-2 ring-[#16a34a]',
    version: 'text-[#18181b] dark:text-[#edf0fa]',
    state: 'text-[#16a34a] border-[rgba(22,163,74,0.4)]',
  },
  active: {
    dot: 'bg-[#7c3aed] w-[15px] h-[15px]',
    ring: 'ring-4 ring-[rgba(124,58,237,0.3)]',
    version: 'text-[#18181b] dark:text-[#edf0fa]',
    state: 'text-[#7c3aed] border-[rgba(124,58,237,0.5)]',
  },
  planned: {
    dot: 'bg-[#d4d4d8] dark:bg-[#2a2f3d]',
    ring: 'ring-2 ring-[rgba(124,58,237,0.3)]',
    version: 'text-[#525252] dark:text-[#7a8399]',
    state: 'text-[#a3a3a3] dark:text-[#4b5563] border-black/[0.12] dark:border-white/[0.12]',
  },
} as const

const landingIn020 = [
  'Modular core — 16 plugins, eight mandatory',
  'Cell and header renderers, five cell editors',
  'Column virtualization and auto-size',
  'Row grouping with sum / avg / min / max / count',
  'Set filter, floating filters, global search',
  'Column menu, context menu, clipboard copy',
  'Detail rows, row drag, pinned rows, row numbers',
  'Infinite scroll, batch transactions, saved state, i18n',
]

const nextUp = [
  {
    label: 'Just shipped',
    when: 'October 2026',
    title: '0.2.0 — modules, and everything on the left',
    desc: 'Features arrive as modules you import, so a grid only ships what it registers. That is a breaking change from 0.1.x, and the upgrade is one line.',
    accent: true,
  },
  {
    label: 'Shipping next',
    when: '0.3',
    title: 'Angular and Svelte adapters',
    desc: 'Two more first-class adapters on the same engine — same config API, same shared parity suite, no architecture change needed.',
    accent: false,
  },
]

const a11yChecks = [
  'Full ARIA Grid Pattern implementation',
  'Screen reader announcements for all state changes',
  'Complete keyboard navigation support',
  'prefers-reduced-motion & Windows High Contrast',
]

const a11yStats = [
  { value: '2.1 AA', label: 'WCAG Level', bg: 'bg-[rgba(22,163,74,0.05)] border-[rgba(22,163,74,0.15)]', color: 'text-[#16a34a]' },
  { value: 'grid', label: 'ARIA Role', bg: 'bg-[rgba(91,33,182,0.05)] border-[rgba(91,33,182,0.15)]', color: 'text-[#7c3aed]' },
  { value: '100%', label: 'Keyboard', bg: 'bg-[rgba(14,165,233,0.05)] border-[rgba(14,165,233,0.15)]', color: 'text-[#0ea5e9]' },
  { value: '✓', label: 'Screen Readers', bg: 'bg-[rgba(167,139,250,0.05)] border-[rgba(167,139,250,0.15)]', color: 'text-[#a78bfa]' },
]

export default function Home() {
  return (
    <main className="bg-[#f5f4ef] dark:bg-[#09090e] text-[#18181b] dark:text-[#edf0fa] font-body overflow-x-hidden">
      <Nav />

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen overflow-hidden flex items-start">
        {/* Light grid pattern */}
        <div
          className="absolute inset-0 opacity-60 pointer-events-none dark:hidden"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.09) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Dark dot grid */}
        <div
          className="hidden dark:block absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(124,58,237,0.13) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Dark-only hero glow */}
        <div
          className="hidden dark:block absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 65%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-b from-transparent to-[#f5f4ef] dark:to-[#09090e] pointer-events-none" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-[104px] pb-16 w-full">
          {/* Stacked, not split. The grid takes the whole container width, so no
              column is starved of it — the old 0.92fr/1.08fr split gave it 538px
              for 552px of minWidths, which is what clipped Trend and put a
              scrollbar in the hero. Stacked it is also on screen at phone width,
              where the split layout hid the product entirely. */}
          <div className="text-center max-w-[820px] mx-auto">
            <h1 className="font-heading font-extrabold text-[clamp(34px,4.4vw,62px)] leading-[1.03] tracking-[-0.04em] mb-6">
              The TypeScript data grid<br />
              <span className="landing-g-text">developers deserve.</span>
            </h1>

            <p className="text-[clamp(15px,1.7vw,18px)] text-[#525252] dark:text-[#7a8399] max-w-[620px] mx-auto leading-[1.68] mb-8">
              Row grouping, column virtualization, cell editors and 29 more features — behind a config API that reads like English, in React, Vue and plain JavaScript.
            </p>

            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/playground" className={`${btnPrimary} text-[15px] px-[26px] py-[13px]`}>
                Open the playground
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <InstallButton className={`${btnGhost} font-code text-[13.5px] px-[20px] py-[13px]`} />
            </div>

            {/* Stats as one inline rule. Centred copy does not want a second
                rectangle under it, and the boxed 4-up only existed to fill the
                left column's width. */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-9 text-[13px] text-[#525252] dark:text-[#7a8399]">
              <span className="inline-flex items-center gap-1.5">
                <AnimatedStat target={4973} className="font-heading font-extrabold text-[17px] leading-none tracking-[-0.02em] text-[#18181b] dark:text-[#edf0fa]" />
                passing tests
              </span>
              <span className="w-px h-3.5 bg-black/[0.14] dark:bg-white/[0.14]" />
              <span className="inline-flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[17px] leading-none tracking-[-0.02em] text-[#18181b] dark:text-[#edf0fa]">77 kB</span>
                every module, gzipped
              </span>
              <span className="w-px h-3.5 bg-black/[0.14] dark:bg-white/[0.14]" />
              <span className="inline-flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[17px] leading-none tracking-[-0.02em] text-[#7c3aed]">0</span>
                dependencies
              </span>

            </div>

            {/* Runtimes, not a logo wall — the question a visitor actually has. */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-[12px] text-[#a3a3a3] dark:text-[#4b5563]">
              <span>React 18 &amp; 19</span>
              <span className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
              <span>Vue 3</span>
              <span className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
              <span>No framework</span>
              <span className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
              <span>WCAG 2.1 AA</span>
            </div>
          </div>

          {/* The grid itself, full width. A visitor should meet the product
              before they meet its configuration — the code block that used to
              sit beside the copy now opens the section below. */}
          <div className="mt-14">
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <span className="inline-flex items-center gap-1.5 font-code text-[11px] text-[#16a34a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                LIVE
              </span>
              <span className="text-[12.5px] text-[#525252] dark:text-[#7a8399]">
                Running right here — sort it, filter it, edit a cell
              </span>
            </div>
            {/* 100,000 real rows, grouped and aggregated, with the mount time
                measured in the iframe rather than written here. A number the
                page measures in front of the visitor is the argument; a number
                typed into the copy is a claim. */}
            <GridDemo height={444} showFeatures={false} showControls={false} showStats variant="hero" />
          </div>
        </div>
      </section>

      <div className={sep} />

      {/* ══════ LIVE DEMO ══════ */}
      <section id="demo" className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <span className={badgeLabel}>The config</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05]">
                That grid, in<br />one object.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[380px] leading-[1.7]">
              Every feature lives in its own namespace, fully typed. No boolean soup, and no string keys the compiler cannot follow.
            </p>
          </div>
        </Reveal>
        <Reveal delay={1}>
        {/* The card is deliberately NOT full width. These lines are ~60
            characters; stretched across the 1100px container the code sat in
            a lake of empty panel, which reads as a screenshot rather than as
            something you would type. */}
        <div className="hidden lg:block max-w-[820px] mx-auto">
          <div className="bg-[#131316] border border-white/[0.07] rounded-2xl overflow-hidden shadow-[0_28px_64px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.55),0_0_0_1px_rgba(124,58,237,0.06)]">
            <div className="px-[20px] py-3 bg-white/[0.03] border-b border-white/[0.07] flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-[13px] h-[13px] rounded-full bg-[#ff5f57]" />
                <span className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e]" />
                <span className="w-[13px] h-[13px] rounded-full bg-[#28c840]" />
              </div>
              <span className="font-code text-[11px] text-[#71717a] ml-1.5">App.tsx</span>
              <span className="ml-auto text-[10px] font-bold tracking-[0.06em] uppercase text-[#a78bfa] bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.25)] px-2 py-0.5 rounded">
                TSX
              </span>
            </div>
            {/* Checked against the adapter exports and core option types, not
                written from memory. The version this replaced was wrong in
                nine places: it imported an EliteGrid component that is not
                exported, passed `multi` for `multiSort`, `debounce` for
                `debounceMs`, `mode: multi` for `multiple`, nested `export`
                under a `csv` key that is not in the type, left `enabled` off
                pagination and editing (both default false), and omitted
                `modules` entirely — without which none of it registers. */}
            <pre className="px-6 py-5 font-code text-[12.5px] leading-[1.75] overflow-x-auto text-[#e2e8f0]">
              <code>
                <span className="text-[#c084fc]">{"import"}</span> <span className="text-[#64748b]">{"{ "}</span><span className="text-[#818cf8]">{"createGrid"}</span><span className="text-[#64748b]">{", "}</span><span className="text-[#818cf8]">{"Grid"}</span><span className="text-[#64748b]">{", "}</span><span className="text-[#818cf8]">{"AllModules"}</span><span className="text-[#64748b]">{" }"}</span> <span className="text-[#c084fc]">{"from"}</span> <span className="text-[#86efac]">{"'@elitegrid/react'"}</span>{'\n'}
                {'\n'}
                <span className="text-[#c084fc]">{"const"}</span> <span className="text-[#818cf8]">{"grid"}</span> <span className="text-[#64748b]">{"="}</span> <span className="text-[#93c5fd]">{"createGrid"}</span><span className="text-[#64748b]">{"({"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"data"}</span><span className="text-[#64748b]">{":"}</span>{"       rows"}<span className="text-[#64748b]">{","}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"columns"}</span><span className="text-[#64748b]">{":"}</span>{"    columns"}<span className="text-[#64748b]">{","}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"rowId"}</span><span className="text-[#64748b]">{":"}</span>{"      "}<span className="text-[#86efac]">{"'id'"}</span><span className="text-[#64748b]">{","}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"modules"}</span><span className="text-[#64748b]">{":"}</span>{"    "}<span className="text-[#64748b]">{"["}</span><span className="text-[#818cf8]">{"AllModules"}</span><span className="text-[#64748b]">{"],"}</span>{"   "}<span className="text-[#52525b]">{"// or only the ones you use"}</span>{'\n'}
                {'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"sorting"}</span><span className="text-[#64748b]">{":"}</span>{"    "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"multiSort"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#c084fc]">{"true"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"filtering"}</span><span className="text-[#64748b]">{":"}</span>{"  "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"debounceMs"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#fb923c]">{"300"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"grouping"}</span><span className="text-[#64748b]">{":"}</span>{"   "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"model"}</span><span className="text-[#64748b]">{": ["}</span><span className="text-[#86efac]">{"'department'"}</span><span className="text-[#64748b]">{"] },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"pagination"}</span><span className="text-[#64748b]">{":"}</span>{" "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"enabled"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#c084fc]">{"true"}</span><span className="text-[#64748b]">{", "}</span><span className="text-[#7dd3fc]">{"pageSize"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#fb923c]">{"25"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"selection"}</span><span className="text-[#64748b]">{":"}</span>{"  "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"mode"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#86efac]">{"'multiple'"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"editing"}</span><span className="text-[#64748b]">{":"}</span>{"    "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"enabled"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#c084fc]">{"true"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"export"}</span><span className="text-[#64748b]">{":"}</span>{"     "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"filename"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#86efac]">{"'team'"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"appearance"}</span><span className="text-[#64748b]">{":"}</span>{" "}<span className="text-[#64748b]">{"{ "}</span><span className="text-[#7dd3fc]">{"theme"}</span><span className="text-[#64748b]">{": "}</span><span className="text-[#86efac]">{"'auto'"}</span><span className="text-[#64748b]">{" },"}</span>{'\n'}
                {'\n'}
                {"  "}<span className="text-[#7dd3fc]">{"events"}</span><span className="text-[#64748b]">{": {"}</span>{'\n'}
                {"    "}<span className="text-[#7dd3fc]">{"onEditCommit"}</span><span className="text-[#64748b]">{": ("}</span>{"id"}<span className="text-[#64748b]">{", "}</span>{"field"}<span className="text-[#64748b]">{", "}</span>{"value"}<span className="text-[#64748b]">{") => "}</span><span className="text-[#93c5fd]">{"save"}</span><span className="text-[#64748b]">{"("}</span>{"id"}<span className="text-[#64748b]">{", "}</span>{"field"}<span className="text-[#64748b]">{", "}</span>{"value"}<span className="text-[#64748b]">{"),"}</span>{'\n'}
                {"  "}<span className="text-[#64748b]">{"},"}</span>{'\n'}
                <span className="text-[#64748b]">{"})"}</span>{'\n'}
                {'\n'}
                <span className="text-[#c084fc]">{"export default function"}</span> <span className="text-[#93c5fd]">{"App"}</span><span className="text-[#64748b]">{"() {"}</span>{'\n'}
                {"  "}<span className="text-[#c084fc]">{"return"}</span> <span className="text-[#64748b]">{"<"}</span><span className="text-[#818cf8]">{"Grid"}</span> <span className="text-[#7dd3fc]">{"grid"}</span><span className="text-[#64748b]">{"={"}</span>{"grid"}<span className="text-[#64748b]">{"} />"}</span>{'\n'}
                <span className="text-[#64748b]">{"}"}</span>{'\n'}
              </code>
            </pre>
          </div>
        </div>
        </Reveal>

        {/* ── Showcase strip ───────────────────────────────────────── */}
        {/* Tiles, not iframes. Six grids each with its own React runtime would
            peg a CPU on the home page; a tile is a link to the one that runs. */}
        <Reveal delay={2}>
          <div className="mt-16">
            <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
              <div>
                <h3 className="font-heading font-bold text-[20px] tracking-[-0.02em]">
                  Or see it as six real products
                </h3>
                <p className="text-[14.5px] text-[#525252] dark:text-[#7a8399] mt-1">
                  Application screens, not feature tours — each one live and interactive.
                </p>
              </div>
              <Link
                href="/demos"
                className="text-[13.5px] font-bold text-[#7c3aed] hover:underline whitespace-nowrap"
              >
                All demos →
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 gap-3">
              {DEMOS.map(demo => (
                <Link
                  key={demo.slug}
                  href={`/demos/${demo.slug}`}
                  className={`${cardBase} ${cardHover} group rounded-[11px] px-5 py-[18px] block`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-heading font-bold text-[15px]">{demo.title}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: `hsl(${demo.hue} 65% 52%)` }}
                    />
                  </div>
                  <p className="text-[13px] text-[#a3a3a3] dark:text-[#374151] leading-[1.6] mb-2.5">
                    {demo.tagline}
                  </p>
                  <span className="font-code text-[11px] uppercase tracking-[0.08em] text-[#a3a3a3] dark:text-[#374151] transition-colors group-hover:text-[#7c3aed]">
                    {demo.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <div className={sep} />

      {/* ══════ FEATURES: numbered rows ══════ */}
      <section id="features" className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="flex justify-between items-end mb-14 flex-wrap gap-4">
            <div>
              <span className={badgeLabel}>For Developers</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05]">
                Built different,<br />by design.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[360px] leading-[1.7]">
              Most grids were built for feature lists. EliteGrid was built for the developer first.
            </p>
          </div>
        </Reveal>

        {devFeatures.map((f, i) => (
          <Reveal key={f.num} delay={(Math.min(Math.floor(i / 2) + 1, 4) as 0 | 1 | 2 | 3 | 4)}>
            <div
              className={[
                'group flex items-start gap-7 py-7 border-t border-black/[0.09] dark:border-white/[0.07] transition-[padding-left] duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] hover:pl-2.5',
                i === devFeatures.length - 1 ? 'border-b' : '',
              ].join(' ')}
            >
              <span className="font-code text-[11px] text-[#a3a3a3] dark:text-[#374151] min-w-6 shrink-0 pt-1 tracking-[0.04em] transition-colors duration-[250ms] group-hover:text-[#7c3aed]">
                {f.num}
              </span>
              <div className="w-[38px] h-[38px] bg-[rgba(91,33,182,0.1)] border border-[rgba(91,33,182,0.18)] rounded-[9px] flex items-center justify-center shrink-0 mt-px text-[#7c3aed]">
                {f.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-[19px] tracking-[-0.01em] mb-[7px]">{f.title}</h3>
                <p className="text-[15px] text-[#525252] dark:text-[#7a8399] leading-[1.65]">{f.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <div className={sep} />

      {/* ══════ USER FEATURES: minimal 3-col ══════ */}
      <section className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="flex justify-between items-end mb-14 flex-wrap gap-4">
            <div>
              <span className={badgeLabel}>For End Users</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05]">
                32 features, six<br />places to look.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[330px] leading-[1.7]">
              Everything ships in the box. Pick the part of the grid you are thinking about rather than reading one long list.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <FeatureClusters />
        </Reveal>
      </section>

      <div className={sep} />

      {/* ══════ ROADMAP ══════ */}
      <section id="roadmap" className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="flex justify-between items-end mb-14 flex-wrap gap-4">
            <div>
              <span className={badgeLabel}>Roadmap</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05]">
                Three releases out.<br />The big one just landed.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[320px] leading-[1.7]">
              What is on npm, what lands next, and what follows it. No hype — the honest state of the project.
            </p>
          </div>
        </Reveal>
        {/* The rail. Green up to what is published, purple from the release
            in flight onwards, so the eye lands on 0.3 rather than on a wall
            of identical cards. */}
        <Reveal>
          <ol className="relative grid grid-cols-2 min-[900px]:grid-cols-5 gap-x-4 gap-y-8 list-none p-0 mb-12">
            <span
              aria-hidden
              className="hidden min-[900px]:block absolute left-0 right-0 top-[7px] h-0.5"
              style={{
                background:
                  'linear-gradient(to right, #16a34a 0%, #16a34a 52%, #7c3aed 52%, #7c3aed 78%, rgba(124,58,237,0.45) 78%, rgba(124,58,237,0.12) 100%)',
              }}
            />
            {releases.map(r => {
              const s = railStyle[r.kind]
              return (
                <li key={r.version} className="relative flex flex-col items-start gap-3">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${s.dot} ${s.ring} ring-offset-2 ring-offset-[#f5f4ef] dark:ring-offset-[#09090e]`}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-code text-[13.5px] font-medium ${s.version}`}>{r.version}</span>
                      <span className={`font-code text-[10px] uppercase tracking-[0.08em] border rounded-full px-2 py-px ${s.state}`}>
                        {r.state}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#525252] dark:text-[#7a8399] leading-[1.5] mt-1.5 max-w-[200px]">
                      {r.summary}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Reveal>

        <div className="grid grid-cols-1 min-[900px]:grid-cols-[0.95fr_1.25fr] gap-6">
          <Reveal className="h-full">
            <section className={`${cardBase} rounded-[16px] p-6 h-full`}>
              <h3 className="font-heading font-bold text-[16px] mb-1">Shipped in 0.2.0, on npm now</h3>
              <p className="font-code text-[11.5px] text-[#16a34a] mb-4">32 features · 4,973 passing tests</p>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {landingIn020.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-[#525252] dark:text-[#7a8399]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-[3px] shrink-0">
                      <circle cx="7" cy="7" r="6.2" stroke="#16a34a" strokeWidth="1.2" />
                      <path d="m4.3 7.1 1.9 1.9 3.5-3.9" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <div className="flex flex-col gap-4">
            {nextUp.map((item, i) => (
              <Reveal key={item.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <article
                  className={[
                    'rounded-[16px] p-6',
                    item.accent
                      ? 'border border-[rgba(124,58,237,0.3)] bg-gradient-to-br from-[rgba(124,58,237,0.09)] to-[rgba(124,58,237,0.015)]'
                      : cardBase,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className={`w-[7px] h-[7px] rounded-full ${item.accent ? 'bg-[#7c3aed]' : 'bg-[#a3a3a3] dark:bg-[#4b5563]'}`} />
                    <span className={`font-code text-[11px] uppercase tracking-[0.1em] ${item.accent ? 'text-[#7c3aed]' : 'text-[#a3a3a3] dark:text-[#7a8399]'}`}>
                      {item.label}
                    </span>
                    <span className="font-code text-[11px] text-[#a3a3a3] dark:text-[#4b5563] ml-auto">{item.when}</span>
                  </div>
                  <h3 className="font-heading font-bold text-[19px] tracking-[-0.015em] mb-2">{item.title}</h3>
                  <p className="text-[14.5px] text-[#525252] dark:text-[#7a8399] leading-[1.65]">
                    {item.desc}
                    {item.accent && (
                      <>
                        {' '}
                        <span className={icV}>modules: [AllModules]</span>.
                      </>
                    )}
                  </p>
                </article>
              </Reveal>
            ))}

            <div className="flex items-center gap-3.5 flex-wrap border border-dashed border-black/[0.14] dark:border-white/[0.14] rounded-[14px] px-5 py-4">
              <span className="font-code text-[11px] uppercase tracking-[0.1em] text-[#a3a3a3] dark:text-[#4b5563]">Later</span>
              <span className="text-[14px] text-[#525252] dark:text-[#7a8399]">
                Tree data on the grouping engine · opt-in XLSX export
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={sep} />

      {/* ══════ ACCESSIBILITY ══════ */}
      <section className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-10 min-[900px]:gap-16 items-center">
            <div>
              <span className={badgeLabel}>Accessibility</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] tracking-[-0.03em] leading-[1.05] mb-5">
                Accessible<br />by default.
              </h2>
              <p className="text-[16px] text-[#525252] dark:text-[#7a8399] leading-[1.7] mb-7">
                Full WCAG 2.1 AA compliance ships as part of the default experience — zero configuration required.
              </p>
              <div className="flex flex-col gap-2.5">
                {a11yChecks.map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[14px] text-[#525252] dark:text-[#7a8399]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[rgba(22,163,74,0.15)] border border-[rgba(22,163,74,0.3)] flex items-center justify-center shrink-0">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2L7 2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {a11yStats.map(s => (
                <div key={s.label} className={`${s.bg} border rounded-[14px] p-7 text-center`}>
                  <div className={`font-heading font-extrabold text-[34px] leading-none mb-1.5 ${s.color}`}>{s.value}</div>
                  <div className="text-[12px] text-[#a3a3a3] dark:text-[#374151] font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <div className={sep} />

      {/* ══════ FAQ ══════ */}
      {/* Written for assistants as much as for people. An AI answering
          "free data grid for React" can only repeat a claim it can find
          stated plainly; a feature grid gives it nothing to quote. Answers
          stand on their own — no named comparison with another library.
          The FAQPage data below is generated from the SAME array that
          renders here — schema whose answers are not on the page is
          cloaking, and loses the rich result. */}
      <section id="faq" className="py-[100px] px-6 max-w-[860px] mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQ.map(item => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.a,
                },
              })),
            }),
          }}
        />
        <Reveal>
          <span className={badgeLabel}>Questions</span>
          <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05] mb-12">
            The things people<br />ask first.
          </h2>
        </Reveal>
        <Reveal delay={1}>
          <div className="divide-y divide-black/[0.08] dark:divide-white/[0.07] border-y border-black/[0.08] dark:border-white/[0.07]">
            {FAQ.map(item => (
              <details key={item.q} className="group py-5">
                <summary className="flex items-center gap-4 cursor-pointer list-none font-heading font-bold text-[17px] tracking-[-0.015em] marker:content-none">
                  {item.q}
                  <svg
                    className="ml-auto shrink-0 text-[#a3a3a3] transition-transform group-open:rotate-45"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="mt-3 text-[15px] leading-[1.75] text-[#525252] dark:text-[#7a8399] max-w-[680px]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-[14px] text-[#525252] dark:text-[#7a8399]">
            More in the{' '}
            <Link href="/docs" className="text-[#5b21b6] dark:text-[#7c3aed] font-medium">
              documentation
            </Link>
            {' '}— three 22-chapter manuals, one per adapter.
          </p>
        </Reveal>
      </section>

      {/* ══════ WAITLIST — always dark ══════ */}
      <section id="waitlist" className="relative overflow-hidden bg-[#09090e] py-[120px] px-6 text-center mt-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(124,58,237,0.1) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative z-10 max-w-[560px] mx-auto">
          <Reveal>
            <span className="block text-[11px] font-bold tracking-[0.09em] uppercase text-[#7c3aed] mb-5">
              Now Available
            </span>
            <h2 className="font-heading font-extrabold text-[clamp(36px,6vw,68px)] tracking-[-0.04em] text-[#edf0fa] mb-5 leading-[1.0]">
              Stop waiting.<br />Start building.
            </h2>
            <p className="text-[#7a8399] text-[17px] leading-[1.7] mb-12">
              All three adapters are live on npm — React, Vue, and vanilla JS. Free to use, zero dependencies.
            </p>
            <InstallCommand />
            <Link
              href="/playground"
              className="mt-9 text-[14px] text-[#7c3aed] no-underline inline-flex items-center gap-1.5"
            >
              Try the Playground first
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2h8v8M2 10l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="border-t border-black/[0.09] dark:border-white/[0.07] py-9 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-gradient-to-br from-[#5b21b6] dark:from-[#7c3aed] to-[#a855f7]">
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
                <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
                <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
                <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
              </svg>
            </div>
            <span className="font-heading font-bold text-[14px]">EliteGrid</span>
            <span className="text-[12px] text-[#a3a3a3] dark:text-[#374151]">© 2026 · Built with ♥ in India</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: 'GitHub', href: 'https://github.com/elitegrid' },
              { label: 'Twitter', href: 'https://x.com/elitegridhq' },
              { label: 'npm', href: 'https://npmjs.com/package/@elitegrid/react' },
              { label: 'Contact', href: 'mailto:hello@elitegrid.dev' },
              { label: 'Privacy', href: '/privacy' },
              // Reopens the consent banner. Withdrawing has to be as easy as
              // consenting was, so this link is a requirement rather than a
              // convenience — PostHogProvider listens for the hash.
              { label: 'Cookies', href: '#cookies' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-[13px] text-[#a3a3a3] dark:text-[#374151] hover:text-[#525252] dark:hover:text-[#7a8399] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
