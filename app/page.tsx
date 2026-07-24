import type { Metadata } from 'next'
import Link from 'next/link'
import GridDemo from '@/components/GridDemo'
import Nav from '@/components/landing/Nav'
import Reveal from '@/components/landing/Reveal'
import AnimatedStat from '@/components/landing/AnimatedStat'
import InstallCommand, { InstallButton } from '@/components/landing/InstallCommand'

export const metadata: Metadata = {
  title: 'EliteGrid — High-Performance TypeScript Data Grid & Table Library',
  description: 'EliteGrid is a high-performance TypeScript data grid and table library. Features a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
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
    'ag grid alternative',
    'tanstack table alternative',
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
    description: 'EliteGrid is a high-performance TypeScript data grid and table library. Features a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
    url: 'https://elitegrid.dev',
    siteName: 'EliteGrid',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EliteGrid — High-Performance TypeScript Data Grid & Table Library',
    description: 'EliteGrid is a high-performance TypeScript data grid and table library. Features a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility.',
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
        <span className={icV}>{'sorting={{ multi: true }}'}</span> not{' '}
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
    desc: 'Microkernel core where every feature is an independent plugin communicating through a shared event bus. Clean separation, zero coupling, no circular dependencies.',
  },
  {
    num: '04',
    title: 'React & Vue Ready',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    desc: (
      <>
        First-class adapters with ergonomic hooks — <span className={icV}>useGrid()</span>,{' '}
        <span className={icV}>useSelectionState()</span>, <span className={icV}>usePaginationState()</span>.
        Framework-agnostic core ready for every ecosystem.
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
    desc: 'Written so a junior developer can integrate from docs alone — no AI assist, no Stack Overflow, no tribal knowledge. Documentation as a first-class feature.',
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

const userFeatures = [
  { icon: '↕️', title: 'Sort', desc: 'Single & multi-column. Three-state cycle. Custom comparators.' },
  { icon: '🔍', title: 'Filter', desc: 'Text, number, date, boolean — per column.' },
  { icon: '📄', title: 'Pagination', desc: 'Client-side & server-side. Configurable page size.' },
  { icon: '✏️', title: 'Inline Editing', desc: 'Async validation. Optimistic updates with rollback.' },
  { icon: '☑️', title: 'Row Selection', desc: 'Shift+click range. Ctrl+click toggle. Persists on sort.' },
  { icon: '📤', title: 'CSV Export', desc: 'Export all, filtered, or selected rows.' },
  { icon: '🎨', title: 'Theming', desc: 'Light/dark/auto. Compact, normal, comfortable density.' },
  { icon: '↔️', title: 'Column Controls', desc: 'Resize, reorder, pin, hide. Persistent column state.' },
  { icon: '⌨️', title: 'Keyboard Nav', desc: 'Full ARIA Grid Pattern. Arrow, Home, End, PageUp/Down.' },
]

const roadmap = [
  {
    status: 'shipped', dot: 'bg-[#16a34a]', label: 'Shipped', labelColor: 'text-[#16a34a]',
    bg: 'bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.16)]',
    title: 'Core Engine',
    desc: 'Microkernel architecture with 13 plugins. DataSource, RowModel, ColumnModel, Filter, Sort, Pagination, Viewport, Selection, Edit & more. 1,000 passing tests.',
  },
  {
    status: 'shipped', dot: 'bg-[#16a34a]', label: 'Shipped', labelColor: 'text-[#16a34a]',
    bg: 'bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.16)]',
    title: 'Grouped Config API',
    desc: 'Namespaced configuration with full TypeScript inference. Config mistakes caught at authoring time, not at runtime.',
  },
  {
    status: 'shipped', dot: 'bg-[#16a34a]', label: 'Shipped', labelColor: 'text-[#16a34a]',
    bg: 'bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.16)]',
    title: 'React, Vue & JS Adapters',
    desc: (
      <>
        First-class React &amp; Vue adapters with hooks. Vanilla JS adapter for framework-free usage. Live on npm — <span className={icV}>@elitegrid/react</span>, <span className={icV}>@elitegrid/vue</span>, <span className={icV}>@elitegrid/vanilla</span>.
      </>
    ),
  },
  {
    status: 'shipped', dot: 'bg-[#16a34a]', label: 'Shipped', labelColor: 'text-[#16a34a]',
    bg: 'bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.16)]',
    title: 'Documentation',
    desc: 'Full React, Vue & vanilla JS manuals — 16 chapters each, written so a junior developer can integrate without AI. Interactive StackBlitz sandboxes coming next.',
  },
  {
    status: 'shipped', dot: 'bg-[#16a34a]', label: 'Shipped', labelColor: 'text-[#16a34a]',
    bg: 'bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.16)]',
    title: 'Public Launch',
    desc: 'ProductHunt launch and public announcement — done. All three adapters are live on npm and installable today.',
  },
  {
    status: 'next', dot: 'bg-[#7c3aed]', label: 'Up Next', labelColor: 'text-[#7c3aed]',
    bg: 'bg-[rgba(91,33,182,0.04)] border border-[rgba(91,33,182,0.18)]',
    title: 'Custom Cell Rendering',
    desc: 'A real cell-renderer API — full component control per cell, not just formatter strings. Unlocks avatars, badges, and rich content without CSS workarounds.',
  },
  {
    status: 'next', dot: 'bg-[#7c3aed]', label: 'Up Next', labelColor: 'text-[#7c3aed]',
    bg: 'bg-[rgba(91,33,182,0.04)] border border-[rgba(91,33,182,0.18)]',
    title: 'Angular & Svelte Adapters',
    desc: 'Two more first-class adapters on the same core engine — same grouped config API, zero dependencies, full accessibility. No architecture changes required.',
  },
  {
    status: 'planned', dot: 'bg-[#a3a3a3] dark:bg-[#374151]', label: 'Planned', labelColor: 'text-[#a3a3a3] dark:text-[#374151]',
    bg: cardBase,
    title: 'Row Grouping & Excel',
    desc: 'Group rows by any column with aggregations. Import/export XLSX with formatting and column widths.',
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
      <section className="relative min-h-screen overflow-hidden flex items-center">
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

        <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-[100px] pb-20 w-full">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-[72px] items-center">
            {/* Left col */}
            <div>
              <div className="mb-7">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#d97706] bg-[rgba(217,119,6,0.09)] border border-[rgba(217,119,6,0.2)] px-3 py-[5px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] motion-safe:animate-[landing-pulse-dot_2s_infinite]" />
                  v0.1 · Live on npm
                </span>
              </div>

              <h1 className="font-heading font-extrabold text-[clamp(52px,7vw,88px)] leading-[1.0] tracking-[-0.04em] mb-6">
                The TypeScript<br />data grid &amp; table library<br />
                <span className="landing-g-text">developers<br />deserve.</span>
              </h1>

              <p className="text-[clamp(15px,1.7vw,18px)] text-[#525252] dark:text-[#7a8399] max-w-[480px] leading-[1.7] mb-9">
                A high-performance TypeScript data grid library with a grouped config API, full WCAG 2.1 AA compliance, React &amp; Vue adapters, and zero dependencies.
              </p>

              <div className="flex gap-3 flex-wrap">
                <InstallButton className={`${btnPrimary} text-[15px] px-[26px] py-[13px]`} />
                <Link href="/playground" className={`${btnGhost} text-[15px] px-[26px] py-[13px]`}>
                  Try Playground
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2h8v8M2 10l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Link>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 border border-black/[0.09] dark:border-white/[0.07] rounded-xl overflow-hidden mt-12">
                <div className="p-5 px-[22px] border-r border-b lg:border-b-0 border-black/[0.09] dark:border-white/[0.07]">
                  <AnimatedStat target={1000} className="font-heading font-extrabold text-[34px] leading-none tracking-[-0.03em]" />
                  <div className="text-[11.5px] text-[#a3a3a3] dark:text-[#374151] mt-[5px] font-medium">passing tests</div>
                </div>
                <div className="p-5 px-[22px] border-b lg:border-b-0 lg:border-r border-black/[0.09] dark:border-white/[0.07]">
                  <AnimatedStat target={13} className="font-heading font-extrabold text-[34px] leading-none tracking-[-0.03em]" />
                  <div className="text-[11.5px] text-[#a3a3a3] dark:text-[#374151] mt-[5px] font-medium">core plugins</div>
                </div>
                <div className="p-5 px-[22px] border-r border-black/[0.09] dark:border-white/[0.07]">
                  <div className="font-heading font-extrabold text-[34px] leading-none tracking-[-0.03em] text-[#7c3aed]">0</div>
                  <div className="text-[11.5px] text-[#a3a3a3] dark:text-[#374151] mt-[5px] font-medium">dependencies</div>
                </div>
                <div className="p-5 px-[22px]">
                  <div className="font-heading font-extrabold text-[34px] leading-none tracking-[-0.03em]">100%</div>
                  <div className="text-[11.5px] text-[#a3a3a3] dark:text-[#374151] mt-[5px] font-medium">TypeScript</div>
                </div>
              </div>
            </div>

            {/* Right col: code block (always dark) */}
            <div className="hidden lg:block">
              <div className="bg-[#131316] border border-white/[0.07] rounded-2xl overflow-hidden shadow-[0_28px_64px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_28px_64px_rgba(0,0,0,0.55),0_0_0_1px_rgba(124,58,237,0.06)]">
                <div className="px-[20px] py-3 bg-white/[0.03] border-b border-white/[0.07] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-[13px] h-[13px] rounded-full bg-[#ff5f57]" />
                    <span className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e]" />
                    <span className="w-[13px] h-[13px] rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-code text-[11px] text-[#374151] ml-1.5">App.tsx</span>
                  <span className="ml-auto text-[10px] font-bold tracking-[0.06em] uppercase text-[#7c3aed] bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.25)] px-2 py-0.5 rounded">
                    TSX
                  </span>
                </div>
                <pre className="p-6 font-code text-[12px] leading-[1.8] overflow-x-auto text-[#e2e8f0]">
                  <code>
                    <span className="text-[#c084fc]">import</span>{' '}
                    <span className="text-[#64748b]">{'{ '}</span>
                    <span className="text-[#818cf8]">EliteGrid</span>
                    <span className="text-[#64748b]">{' }'}</span>{' '}
                    <span className="text-[#c084fc]">from</span>{' '}
                    <span className="text-[#86efac]">&apos;@elitegrid/react&apos;</span>
                    {'\n\n'}
                    <span className="text-[#c084fc]">export default function</span>{' '}
                    <span className="text-[#93c5fd]">App</span>
                    <span className="text-[#64748b]">() {'{'}</span>
                    {'\n  '}
                    <span className="text-[#c084fc]">return</span> <span className="text-[#64748b]">(</span>
                    {'\n    '}
                    <span className="text-[#64748b]">&lt;</span>
                    <span className="text-[#818cf8]">EliteGrid</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">data</span>
                    <span className="text-[#64748b]">{'={'}</span>rows<span className="text-[#64748b]">{'}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">columns</span>
                    <span className="text-[#64748b]">{'={'}</span>columns<span className="text-[#64748b]">{'}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">sorting</span>
                    <span className="text-[#64748b]">{'={{ '}</span>multi<span className="text-[#64748b]">: </span>
                    <span className="text-[#c084fc]">true</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">filtering</span>
                    <span className="text-[#64748b]">{'={{ '}</span>debounce<span className="text-[#64748b]">: </span>
                    <span className="text-[#fb923c]">300</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">pagination</span>
                    <span className="text-[#64748b]">{'={{ '}</span>pageSize<span className="text-[#64748b]">: </span>
                    <span className="text-[#fb923c]">25</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">selection</span>
                    <span className="text-[#64748b]">{'={{ '}</span>mode<span className="text-[#64748b]">: </span>
                    <span className="text-[#86efac]">&apos;multi&apos;</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">editing</span>
                    <span className="text-[#64748b]">{'={{ '}</span>trigger<span className="text-[#64748b]">: </span>
                    <span className="text-[#86efac]">&apos;doubleClick&apos;</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">appearance</span>
                    <span className="text-[#64748b]">{'={{ '}</span>theme<span className="text-[#64748b]">: </span>
                    <span className="text-[#86efac]">&apos;dark&apos;</span>
                    <span className="text-[#64748b]">, </span>density<span className="text-[#64748b]">: </span>
                    <span className="text-[#86efac]">&apos;compact&apos;</span> <span className="text-[#64748b]">{'}}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">export</span>
                    <span className="text-[#64748b]">{'={{ '}</span>csv<span className="text-[#64748b]">: {'{ '}</span>
                    filename<span className="text-[#64748b]">: </span>
                    <span className="text-[#86efac]">&apos;data-export&apos;</span>
                    <span className="text-[#64748b]">{' } }}'}</span>
                    {'\n      '}
                    <span className="text-[#7dd3fc]">events</span>
                    <span className="text-[#64748b]">{'={{'}</span>
                    {'\n        '}
                    <span className="text-[#7dd3fc]">onReady</span>
                    <span className="text-[#64748b]">: (</span>api<span className="text-[#64748b]">) =&gt; </span>
                    <span className="text-[#93c5fd]">setApi</span>
                    <span className="text-[#64748b]">(</span>api<span className="text-[#64748b]">),</span>
                    {'\n        '}
                    <span className="text-[#7dd3fc]">onEditCommit</span>
                    <span className="text-[#64748b]">: (</span>id<span className="text-[#64748b]">, </span>field
                    <span className="text-[#64748b]">, </span>val<span className="text-[#64748b]">) =&gt; </span>
                    <span className="text-[#93c5fd]">save</span>
                    <span className="text-[#64748b]">(</span>id<span className="text-[#64748b]">, </span>field
                    <span className="text-[#64748b]">, </span>val<span className="text-[#64748b]">)</span>
                    {'\n      '}
                    <span className="text-[#64748b]">{'}}'}</span>
                    {'\n    '}
                    <span className="text-[#64748b]">{'/>'}</span>
                    {'\n  '}
                    <span className="text-[#64748b]">)</span>
                    {'\n'}
                    <span className="text-[#64748b]">{'}'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30 motion-safe:animate-[landing-bob_2.5s_ease-in-out_infinite]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M3 9.5l6 5.5 6-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      <div className={sep} />

      {/* ══════ LIVE DEMO ══════ */}
      <section id="demo" className="py-[100px] px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <span className={badgeLabel}>Live Demo</span>
              <h2 className="font-heading font-extrabold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] leading-[1.05]">
                See it in action.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[380px] leading-[1.7]">
              Click headers to sort. Type to filter. Click rows to select. This is exactly what your users will experience.
            </p>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <GridDemo />
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
                30+ features,<br />zero setup.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[320px] leading-[1.7]">
              Every feature ships in the box. No plugins to hunt for.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 gap-3">
            {userFeatures.map(f => (
              <div key={f.title} className={`${cardBase} ${cardHover} rounded-[11px] px-5 py-[18px]`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[16px]">{f.icon}</span>
                  <span className="font-heading font-bold text-[15px]">{f.title}</span>
                </div>
                <p className="text-[13px] text-[#a3a3a3] dark:text-[#374151] leading-[1.6]">{f.desc}</p>
              </div>
            ))}
          </div>
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
                Where we are.<br />Where we&apos;re going.
              </h2>
            </div>
            <p className="text-[16px] text-[#525252] dark:text-[#7a8399] max-w-[300px] leading-[1.7]">
              No hype. Actively evolving, here is the honest state of the project.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-3">
          {roadmap.map((r, i) => (
            <Reveal key={r.title} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="h-full">
              <div className={`${r.bg} rounded-[14px] p-[26px] h-full`}>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot} ${r.status === 'building' ? 'motion-safe:animate-[landing-pulse-dot_1.8s_infinite]' : ''}`} />
                  <span className={`text-[11px] font-bold tracking-[0.09em] uppercase ${r.labelColor}`}>{r.label}</span>
                </div>
                <h3 className="font-heading font-bold text-[17px] mb-2">{r.title}</h3>
                <p className="text-[14px] text-[#525252] dark:text-[#7a8399] leading-[1.65]">{r.desc}</p>
              </div>
            </Reveal>
          ))}
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

      {/* ══════ DOCS TEASER ══════ */}
      <section className="py-20 px-6 max-w-[1100px] mx-auto">
        <Reveal>
          <div className="bg-gradient-to-br from-[rgba(91,33,182,0.06)] to-[rgba(91,33,182,0.02)] border border-[rgba(91,33,182,0.14)] rounded-[20px] p-8 md:p-14 flex items-center justify-between gap-10 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[rgba(91,33,182,0.12)] border border-[rgba(91,33,182,0.22)] rounded-[9px] flex items-center justify-center text-[#7c3aed]">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 6h6M5 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-heading text-[13px] font-bold text-[#7c3aed] tracking-[0.05em] uppercase">
                  Documentation
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-[clamp(22px,3vw,36px)] tracking-[-0.025em] mb-3 leading-[1.1]">
                Docs so clear, you won&apos;t<br />need AI to integrate it.
              </h2>
              <p className="text-[#525252] dark:text-[#7a8399] text-[15px] leading-[1.7] max-w-[440px]">
                Comprehensive guides, interactive examples, complete API reference. Written for the developer who ships on day one.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link href="/docs" className={`${btnPrimary} text-[14px] px-[22px] py-[13px] text-center justify-center`}>
                Browse the Docs →
              </Link>
              <Link href="/playground" className={`${btnGhost} text-[14px] px-[22px] py-[13px] text-center justify-center`}>
                Try the Playground first
              </Link>
            </div>
          </div>
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
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
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
