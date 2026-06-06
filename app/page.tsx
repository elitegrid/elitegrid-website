import type { Metadata } from 'next'
import WaitlistForm from '@/components/WaitlistForm'

export const metadata: Metadata = {
  title: 'EliteGrid — TypeScript Data Grid Built for Developer Experience',
  description: 'EliteGrid is a high-performance TypeScript data grid with a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and documentation so clear you won\'t need AI to integrate it.',
  keywords: [
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
    'open source data grid',
    'elitegrid',
  ],
  authors: [{ name: 'EliteGrid', url: 'https://elitegrid.dev' }],
  creator: 'EliteGrid',
  publisher: 'EliteGrid',
  alternates: {
    canonical: 'https://elitegrid.dev',
  },
  openGraph: {
    title: 'EliteGrid — TypeScript Data Grid Built for Developer Experience',
    description: 'High-performance TypeScript data grid with grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility — and docs so clear you won\'t need AI to integrate it.',
    url: 'https://elitegrid.dev',
    siteName: 'EliteGrid',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EliteGrid — TypeScript Data Grid Built for Developer Experience',
    description: 'High-performance TypeScript data grid with grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility.',
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

const devFeatures = [
  {
    icon: '🧩',
    title: 'Grouped Config API',
    desc: 'sort={{ multi: true }} not enableMultiColumnSorting. Every feature has its own namespace. Config that reads like English.',
  },
  {
    icon: '⚡',
    title: 'TypeScript Native',
    desc: 'Full type inference across config, events, and plugins. TypeScript catches configuration mistakes before runtime.',
  },
  {
    icon: '🔌',
    title: 'Plugin Architecture',
    desc: 'Microkernel core where every feature is an independent plugin communicating through a shared event bus. Clean separation, zero coupling, no circular dependencies.',
  },
  {
    icon: '⚛️',
    title: 'React & Vue Ready',
    desc: 'First-class adapters in V1 with hooks — useGrid(), useSelectionState(). Framework-agnostic core for future adapters.',
  },
  {
    icon: '📄',
    title: 'Docs You Can Trust',
    desc: 'Written so a junior developer can integrate from docs alone — no AI, no Stack Overflow, no tribal knowledge.',
  },
  {
    icon: '🚀',
    title: 'Zero Dependencies',
    desc: 'Pure TypeScript core with zero runtime dependencies. No bloat, no supply chain risk, no unexpected breaking changes.',
  },
]

const userFeatures = [
  { icon: '↕️', title: 'Sort', desc: 'Single and multi-column sort with priority order. Three-state cycle. Custom comparators. Stable sort guaranteed.' },
  { icon: '🔍', title: 'Filter', desc: 'Text, number, date, and boolean filters. Contains, equals, between, starts with, and more — per column.' },
  { icon: '📄', title: 'Pagination', desc: 'Client-side and server-side pagination. Configurable page size, page size selector, and row count display.' },
  { icon: '✏️', title: 'Inline Editing', desc: 'Cell editing with sync and async validation. Tab and Enter navigation. Optimistic updates with rollback on error.' },
  { icon: '☑️', title: 'Row Selection', desc: 'Single and multi-select with checkboxes. Shift+click range, Ctrl+click toggle. Persists across sort and filter.' },
  { icon: '📤', title: 'CSV Export', desc: 'Export all rows, filtered rows, or selected rows. Custom filename, proper escaping, separate export formatter.' },
  { icon: '🎨', title: 'Theming', desc: 'Light, dark, and auto (OS) themes. Compact, normal, comfortable density. ~50 CSS variables for full customization.' },
  { icon: '↔️', title: 'Column Controls', desc: 'Resize, reorder, pin left/right, and hide columns. Save and restore column state for user preferences.' },
  { icon: '⌨️', title: 'Keyboard Navigation', desc: 'Full ARIA Grid Pattern keyboard support. Arrow keys, Home, End, PageUp, PageDown, Ctrl+Home, Ctrl+End.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5]">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#e8ff47] rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" fill="#09090b" rx="1"/>
              <rect x="9" y="1" width="6" height="6" fill="#09090b" rx="1"/>
              <rect x="1" y="9" width="6" height="6" fill="#09090b" rx="1"/>
              <rect x="9" y="9" width="6" height="3" fill="#09090b" rx="1"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">EliteGrid</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/playground"
            className="font-mono text-xs font-semibold text-[#a1a1aa] hover:text-[#e8ff47] transition-colors flex items-center gap-1">
            Playground <span>↗</span>
          </a>
          <span className="font-mono text-xs text-[#e8ff47] bg-[#e8ff47]/10 border border-[#e8ff47]/25 px-3 py-1 rounded-full">
            v0.1 · coming soon
          </span>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black_0%,transparent_100%)]" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,255,71,0.12)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#e8ff47] bg-[#e8ff47]/10 border border-[#e8ff47]/25 px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-pulse" />
            Currently in active development
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-6 max-w-4xl">
            The TypeScript data grid<br />
            <span className="text-[#e8ff47]">developers</span> deserve
          </h1>

          <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl leading-relaxed mb-10">
            EliteGrid is a high-performance TypeScript data grid with a grouped config API, full WCAG 2.1 AA accessibility, React & Vue adapters — and documentation so clear you won't need AI to integrate it.
          </p>

          <WaitlistForm />

          <p className="font-mono text-xs text-[#52525b] mt-4">
            Get notified when EliteGrid launches publicly.
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-12 bg-white/8" />
            <span className="font-mono text-xs text-[#3f3f46]">or</span>
            <div className="h-px w-12 bg-white/8" />
          </div>

          <a href="/playground"
            className="mt-3 inline-flex items-center gap-2 font-mono text-sm font-semibold px-6 py-3 rounded-xl border border-[#e8ff47]/30 bg-[#e8ff47]/5 text-[#e8ff47] hover:bg-[#e8ff47]/10 hover:border-[#e8ff47]/50 transition-all">
            Try the Playground — no install needed →
          </a>

          {/* Stats */}
          <div className="flex gap-10 mt-16 flex-wrap justify-center">
            {[
              { value: '662', label: 'passing tests' },
              { value: '13', label: 'core plugins' },
              { value: '0', label: 'dependencies' },
              { value: '100%', label: 'TypeScript' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold tracking-tight">{s.value}</div>
                <div className="font-mono text-xs text-[#52525b] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAYGROUND CALLOUT */}
      <section className="border-t border-white/8 bg-[#111113]">
        <div className="max-w-5xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1">
            <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-3">Live Playground</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              See it in action.<br />Right now.
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed max-w-md">
              Write real EliteGrid code and watch it render instantly — virtual scroll, inline editing, CSV export and more. Switch between React and Vue. No install, no setup, no signup.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['Virtual Scroll · 10K rows', 'Real API data', 'Inline editing', 'CSV Export'].map(f => (
                <span key={f} className="font-mono text-xs px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.03] text-[#71717a]">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <a href="/playground"
            className="flex-shrink-0 group flex flex-col items-center justify-center gap-3 w-full md:w-64 h-40 rounded-2xl border border-[#e8ff47]/25 bg-[#e8ff47]/5 hover:bg-[#e8ff47]/10 hover:border-[#e8ff47]/50 transition-all cursor-pointer text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#e8ff47]/10 border border-[#e8ff47]/25 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ▶
            </div>
            <span className="font-mono text-sm font-bold text-[#e8ff47]">Open Playground →</span>
            <span className="font-mono text-xs text-[#52525b]">React & Vue · live preview</span>
          </a>
        </div>
      </section>

      {/* FOR DEVELOPERS */}
      <section className="border-t border-white/8 bg-[#0d0d0f]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">For Developers</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Built different,<br />by design
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-xl leading-relaxed mb-16">
            Most grids were built for feature lists, not developer experience. EliteGrid was built for the developer first.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {devFeatures.map(f => (
              <div key={f.title} className="p-6 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#e8ff47]/25 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#e8ff47]/10 border border-[#e8ff47]/25 flex items-center justify-center mb-5 text-lg">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE SNIPPET */}
      <section className="border-t border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">Developer Experience</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Code that reads<br />like prose
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-lg leading-relaxed mb-12">
            Grouped, namespaced, and fully typed. Config that reads like English.
          </p>

          <div className="max-w-2xl">
            <div className="rounded-xl border border-[#e8ff47]/25 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#e8ff47]/5 border-b border-[#e8ff47]/25">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="font-mono text-xs text-[#71717a] ml-2">App.tsx</span>
              </div>
              <pre className="p-6 font-mono text-xs leading-relaxed overflow-x-auto text-[#a1a1aa]">{`import { EliteGrid } from '@elitegrid/react'

export default function App() {
  return (
    <EliteGrid
      data={rows}
      columns={columns}
      sorting={{ multi: true }}
      filtering={{ debounce: 300 }}
      pagination={{ pageSize: 25 }}
      selection={{ mode: 'multi' }}
      editing={{ trigger: 'doubleClick' }}
      appearance={{ theme: 'dark', density: 'compact' }}
      export={{ csv: { filename: 'my-export' } }}
      events={{
        onReady: (api) => setApi(api),
        onEditCommit: (id, field, value) => save(id, field, value)
      }}
    />
  )
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* FOR USERS */}
      <section className="border-t border-white/8 bg-[#111113]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">For End Users</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Everything users<br />expect — and more
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-xl leading-relaxed mb-16">
            EliteGrid ships with a complete set of end-user features out of the box. No plugins to hunt for, no extra config required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userFeatures.map(f => (
              <div key={f.title} className="p-5 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#e8ff47]/25 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{f.icon}</span>
                  <h3 className="font-bold text-sm tracking-tight">{f.title}</h3>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="border-t border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">Roadmap</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            The road ahead
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-xl leading-relaxed mb-16">
            EliteGrid is actively evolving. Here's where we are and where we're going.
          </p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/8 md:left-1/2" />

            <div className="flex flex-col gap-0">

              {/* SHIPPED */}
              {[
                {
                  status: 'shipped',
                  label: 'Shipped',
                  title: 'Core Engine',
                  desc: 'Microkernel architecture with 13 plugins — DataSource, RowModel, ColumnModel, Filter, Sort, Pagination, Viewport, Selection, Edit, CellValue, Focus, Announcement, Export. 662 passing tests.',
                  align: 'left',
                },
                {
                  status: 'shipped',
                  label: 'Shipped',
                  title: 'Grouped Config API',
                  desc: 'Namespaced configuration system. sorting={{ multi: true }} not enableMultiColumnSorting. TypeScript catches config mistakes at authoring time.',
                  align: 'right',
                },
                {
                  status: 'building',
                  label: 'Building Now',
                  title: 'React, Vue & JavaScript Adapters',
                  desc: 'First-class React and Vue adapters with hooks — useGrid(), useSelectionState(), usePaginationState(). Vanilla JavaScript adapter for framework-free usage. Full WCAG 2.1 AA accessibility out of the box.',
                  align: 'left',
                },
                {
                  status: 'building',
                  label: 'Building Now',
                  title: 'Sandbox & Docs',
                  desc: 'Interactive React and Vue sandboxes on StackBlitz. Documentation written so a junior developer can integrate EliteGrid without AI assistance.',
                  align: 'right',
                },
                {
                  status: 'next',
                  label: 'Up Next',
                  title: 'Public Launch',
                  desc: 'Community version goes public on npm. ProductHunt launch. Install with npm install @elitegrid/core.',
                  align: 'left',
                },
                {
                  status: 'next',
                  label: 'Up Next',
                  title: 'Svelte & Angular Adapters',
                  desc: 'Native Svelte and Angular adapters launching shortly after V1 — bringing EliteGrid to every major framework ecosystem.',
                  align: 'right',
                },
                {
                  status: 'planned',
                  label: 'Planned',
                  title: 'Row Grouping & Aggregation',
                  desc: 'Group rows by any column. Sum, average, count, min, max aggregations. Collapsible groups with keyboard support.',
                  align: 'left',
                },
                {
                  status: 'planned',
                  label: 'Planned',
                  title: 'Excel Import & Export',
                  desc: 'Import data from XLSX files with column mapping. Export to Excel with formatting, column widths, and custom styles.',
                  align: 'right',
                },
                {
                  status: 'planned',
                  label: 'Planned',
                  title: 'Real-time Data',
                  desc: 'WebSocket data source with automatic row updates, additions, and deletions. Smooth animations for live data changes.',
                  align: 'left',
                },
                {
                  status: 'planned',
                  label: 'Planned',
                  title: 'Server-side Operations',
                  desc: 'Server-side sorting, filtering, and pagination. Delegate all data operations to your backend for massive datasets.',
                  align: 'right',
                },
                {
                  status: 'future',
                  label: 'Future',
                  title: 'Advanced Features',
                  desc: 'Pivot mode, master-detail rows, tree data, infinite scroll, charts integration, formula cells, context menu, row drag & drop.',
                  align: 'left',
                },
              ].map((item, i) => (
                <div key={i} className={`relative flex items-start gap-6 pb-10 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  {/* Dot */}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2
                    ${item.status === 'shipped' ? 'bg-[#e8ff47] border-[#e8ff47]' :
                      item.status === 'building' ? 'bg-[#09090b] border-[#e8ff47]' :
                      item.status === 'next' ? 'bg-[#09090b] border-[#a1a1aa]' :
                      item.status === 'planned' ? 'bg-[#09090b] border-white/20' :
                      'bg-[#09090b] border-white/10'}`}>
                    {item.status === 'shipped' && <span className="text-[#09090b] text-xs font-bold">✓</span>}
                    {item.status === 'building' && <span className="w-2 h-2 rounded-full bg-[#e8ff47] animate-pulse" />}
                  </div>

                  {/* Content */}
                  <div className={`md:w-[calc(50%-40px)] ${item.align === 'right' ? 'md:text-right' : ''} pl-2 md:pl-0`}>
                    <span className={`font-mono text-xs font-bold mb-2 inline-block
                      ${item.status === 'shipped' ? 'text-[#e8ff47]' :
                        item.status === 'building' ? 'text-[#e8ff47]' :
                        item.status === 'next' ? 'text-[#a1a1aa]' :
                        'text-[#52525b]'}`}>
                      {item.label}
                    </span>
                    <h3 className="font-bold text-base mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-sm text-[#71717a] leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Spacer for opposite side on desktop */}
                  <div className="hidden md:block md:w-[calc(50%-40px)]" />
                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* ACCESSIBILITY */}
      <section className="border-t border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-4">Accessibility</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Accessible<br />by default
              </h2>
              <p className="text-[#a1a1aa] text-lg leading-relaxed mb-8">
                Full WCAG 2.1 AA compliance ships as part of the default experience — zero configuration required. Every user deserves a great grid, not just sighted mouse users.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Full ARIA Grid Pattern implementation',
                  'Screen reader announcements for all state changes',
                  'Complete keyboard navigation support',
                  'Roving tabindex focus management',
                  'prefers-reduced-motion respected',
                  'Windows High Contrast mode supported',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                    <span className="text-[#e8ff47] font-bold text-xs">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'WCAG', value: '2.1 AA' },
                { label: 'ARIA Role', value: 'grid' },
                { label: 'Keyboard', value: '100%' },
                { label: 'Screen Readers', value: '✓' },
              ].map(s => (
                <div key={s.label} className="p-6 rounded-xl border border-white/8 bg-white/[0.02] text-center">
                  <div className="text-2xl font-extrabold text-[#e8ff47] mb-1">{s.value}</div>
                  <div className="font-mono text-xs text-[#52525b]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/8 bg-[#111113]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-6">Early Access</div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Be first.<br />Build better.
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-6">
            Join the waitlist and be first to know when EliteGrid launches publicly on npm.
          </p>
          <a href="/playground"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold px-6 py-3 rounded-xl border border-[#e8ff47]/30 bg-[#e8ff47]/5 text-[#e8ff47] hover:bg-[#e8ff47]/10 transition-all mb-8">
            Try the Playground first →
          </a>
          <WaitlistForm />
          <p className="font-mono text-xs text-[#52525b] mt-4">
            No spam. One email at launch.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 px-6 md:px-10 py-8 flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-[#52525b]">© 2026 EliteGrid. Built with ♥ in India.</span>
        <div className="flex gap-6">
          {[
            { label: 'GitHub', href: 'https://github.com/elitegrid' },
            { label: 'Twitter', href: 'https://x.com/elitegridhq' },
            { label: 'npm', href: 'https://npmjs.com/package/@elitegrid/core' },
            { label: 'Contact', href: 'mailto:hello@elitegrid.dev' },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-[#52525b] hover:text-[#e8ff47] transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      </footer>

    </main>
  )
}