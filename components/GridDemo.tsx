'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'
type Density = 'compact' | 'normal' | 'comfortable'

const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100vh;font-family:system-ui;color:#6b7280;font-size:0.875rem;background:#fff;}
</style></head><body><span>Loading…</span></body></html>`

function buildDemoSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff; transition: background 0.25s; }

    :root {
      --eg-primary: #6366f1; --eg-primary-text: #fff; --eg-primary-light: #eef2ff;
      --eg-error: #ef4444; --eg-error-bg: #fef2f2; --eg-error-text: #fff;
      --eg-header-bg: #fafafa; --eg-header-text: #374151; --eg-header-border: 1px solid #e5e7eb;
      --eg-row-bg: #ffffff; --eg-row-striped-bg: #fafafa; --eg-row-border: 1px solid #f3f4f6;
      --eg-hover-bg: #f5f3ff; --eg-row-hover-bg: #f5f3ff;
      --eg-row-selected-bg: #eef2ff; --eg-row-selected-border: 1px solid #c7d2fe;
      --eg-row-selected-outline: transparent;
      --eg-cell-text: #111827; --eg-cell-border: 1px solid #e5e7eb;
      --eg-text: #111827; --eg-muted-text: #6b7280;
      --eg-border: #e5e7eb; --eg-border-hover: #d1d5db;
      --eg-sort-icon-color: #9ca3af; --eg-sort-active-color: #6366f1;
      --eg-skeleton-base: #f3f4f6; --eg-skeleton-highlight: #e5e7eb;
      --eg-empty-icon-bg: #f3f4f6; --eg-overlay-bg: rgba(255,255,255,0.95);
      --eg-btn-bg: #f3f4f6; --eg-btn-text: #374151;
    }

    .cell-active   { color: #16a34a !important; font-weight: 500; }
    .cell-inactive { color: #9ca3af !important; }
    [data-theme='dark'] .cell-active   { color: #4ade80 !important; }
    [data-theme='dark'] .cell-inactive { color: #64748b !important; }

    .yg-header-cell {
      font-size: 0.8125rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.01em;
    }
    .yg-row  { font-size: 0.875rem !important; }
    .yg-cell {
      font-size: 0.875rem !important;
      font-family: 'Inter', system-ui, sans-serif !important;
    }
    .yg-cell:focus { outline: 2px solid #a5b4fc !important; outline-offset: -2px; }
    input[type="checkbox"] {
      accent-color: var(--eg-primary);
      width: 15px !important; height: 15px !important; cursor: pointer;
    }
    .yg-body::-webkit-scrollbar { width: 6px; height: 6px; }
    .yg-body::-webkit-scrollbar-track { background: transparent; }
    .yg-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
    .yg-body::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
    [data-theme='dark'] .yg-body::-webkit-scrollbar-thumb { background: #374151; }
    [data-theme='dark'] .yg-body::-webkit-scrollbar-thumb:hover { background: #4b5563; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "react":             "https://esm.sh/react@18.3.1",
      "react-dom":         "https://esm.sh/react-dom@18.3.1",
      "react-dom/client":  "https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "@elitegrid/core":   "${origin}/cdn/core.js",
      "@elitegrid/react":  "${origin}/cdn/react.js"
    }
  }
  <\/script>
</head>
<body>
  <div id="root" style="height:100%;"></div>
  <script type="module">
    import React from 'react'
    import { createRoot } from 'react-dom/client'
    import { createGrid, Grid } from '@elitegrid/react'

    // ── Data generation ───────────────────────────────────────────
    const DEPTS = ['Engineering','Design','Product','Marketing','Sales','HR','Finance','Support']
    const ROLES = {
      Engineering: ['Software Engineer','Senior Engineer','Staff Engineer','Tech Lead','Eng Manager'],
      Design:      ['UI Designer','UX Designer','Senior Designer','Design Lead'],
      Product:     ['Product Manager','Senior PM','VP of Product'],
      Marketing:   ['Marketing Manager','Content Strategist','Growth Analyst'],
      Sales:       ['Account Executive','Sales Manager','BDR','VP of Sales'],
      HR:          ['HR Specialist','Recruiter','HR Manager'],
      Finance:     ['Financial Analyst','Accountant','Controller'],
      Support:     ['Support Specialist','Customer Success Manager'],
    }
    const LOCS = ['San Francisco','New York','Austin','Seattle','Chicago','London','Berlin','Toronto','Bangalore','Remote']
    const FN = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Barbara','David','Susan','Richard','Jessica','Joseph','Sarah','Thomas','Karen','Charles','Lisa']
    const LN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin']
    const BASE = { Engineering:120000, Product:130000, Design:100000, Finance:95000, Marketing:85000, Sales:90000, HR:80000, Support:75000 }

    function gen(n) {
      return Array.from({ length: n }, (_, i) => {
        const dept = DEPTS[i % DEPTS.length]
        const rl   = ROLES[dept]
        return {
          id:         i + 1,
          name:       FN[i % FN.length] + ' ' + LN[Math.floor(i / FN.length) % LN.length],
          department: dept,
          role:       rl[Math.floor(i / DEPTS.length) % rl.length],
          salary:     BASE[dept] + (i * 137) % 40000,
          location:   LOCS[i % LOCS.length],
          status:     i % 7 !== 0,
          joinDate:   (2019 + (i % 6)) + '-' +
                      String(1 + (i * 7)  % 12).padStart(2, '0') + '-' +
                      String(1 + (i * 13) % 28).padStart(2, '0'),
        }
      })
    }

    // ── Theme helpers ─────────────────────────────────────────────
    const VARS = {
      light: {
        '--eg-primary':              '#6366f1',
        '--eg-primary-light':        '#eef2ff',
        '--eg-header-bg':            '#fafafa',
        '--eg-header-text':          '#374151',
        '--eg-header-border':        '1px solid #e5e7eb',
        '--eg-row-bg':               '#ffffff',
        '--eg-row-striped-bg':       '#fafafa',
        '--eg-row-border':           '1px solid #f3f4f6',
        '--eg-hover-bg':             '#f5f3ff',
        '--eg-row-hover-bg':         '#f5f3ff',
        '--eg-row-selected-bg':      '#eef2ff',
        '--eg-row-selected-border':  '1px solid #c7d2fe',
        '--eg-cell-text':            '#111827',
        '--eg-cell-border':          '1px solid #e5e7eb',
        '--eg-text':                 '#111827',
        '--eg-muted-text':           '#6b7280',
        '--eg-border':               '#e5e7eb',
        '--eg-border-hover':         '#d1d5db',
        '--eg-sort-icon-color':      '#9ca3af',
        '--eg-sort-active-color':    '#6366f1',
        '--eg-skeleton-base':        '#f3f4f6',
        '--eg-skeleton-highlight':   '#e5e7eb',
        '--eg-empty-icon-bg':        '#f3f4f6',
        '--eg-overlay-bg':           'rgba(255,255,255,0.95)',
        '--eg-btn-bg':               '#f3f4f6',
        '--eg-btn-text':             '#374151',
      },
      dark: {
        '--eg-primary':              '#818cf8',
        '--eg-primary-light':        '#312e81',
        '--eg-header-bg':            '#1a1a2a',
        '--eg-header-text':          '#94a3b8',
        '--eg-header-border':        '1px solid #2d2d4d',
        '--eg-row-bg':               '#0f0f1a',
        '--eg-row-striped-bg':       '#13131f',
        '--eg-row-border':           '1px solid #1a1a2a',
        '--eg-hover-bg':             '#1a1a30',
        '--eg-row-hover-bg':         '#1a1a30',
        '--eg-row-selected-bg':      '#1e1b4b',
        '--eg-row-selected-border':  '1px solid #4338ca',
        '--eg-cell-text':            '#e2e8f0',
        '--eg-cell-border':          '1px solid #2d2d4d',
        '--eg-text':                 '#e2e8f0',
        '--eg-muted-text':           '#94a3b8',
        '--eg-border':               '#2d2d4d',
        '--eg-border-hover':         '#3d3d5d',
        '--eg-sort-icon-color':      '#64748b',
        '--eg-sort-active-color':    '#818cf8',
        '--eg-skeleton-base':        '#1a1a2a',
        '--eg-skeleton-highlight':   '#2d2d4d',
        '--eg-empty-icon-bg':        '#1a1a2a',
        '--eg-overlay-bg':           'rgba(15,15,26,0.95)',
        '--eg-btn-bg':               '#2d2d4d',
        '--eg-btn-text':             '#e2e8f0',
      },
    }

    function applyTheme(theme) {
      const vars = VARS[theme] || VARS.light
      const r = document.documentElement.style
      for (const [k, v] of Object.entries(vars)) r.setProperty(k, v)
      document.body.style.background = theme === 'dark' ? '#0f0f1a' : '#ffffff'
      document.documentElement.setAttribute('data-theme', theme)
    }

    // ── Grid instance ─────────────────────────────────────────────
    let gridApi = null
    const data = gen(500)

    const grid = createGrid({
      columns: [
        {
          field: 'name', header: 'Name',
          size:   { flex: 2, minWidth: 140 },
          filter: { type: 'text' },
          edit:   { enabled: true, type: 'text', validator: v => (!v || !String(v).trim()) ? 'Name is required' : null },
        },
        {
          field: 'department', header: 'Department',
          size:   { flex: 1.5, minWidth: 130 },
          filter: { type: 'text' },
          edit:   { enabled: true, type: 'dropdown', options: ['Engineering','Design','Product','Marketing','Sales','HR','Finance','Support'] },
        },
        {
          field: 'role', header: 'Role',
          size:   { flex: 1.5, minWidth: 120 },
          filter: { type: 'text' },
          edit:   { enabled: true, type: 'text' },
        },
        {
          field: 'salary', header: 'Salary',
          size:    { flex: 1, minWidth: 110 },
          filter:  { type: 'number' },
          display: { formatter: v => '$' + Number(v).toLocaleString() },
          edit:    { enabled: true, type: 'number', min: 0, max: 500000, parser: raw => Number(raw) },
        },
        {
          field: 'location', header: 'Location',
          size:   { flex: 1.5, minWidth: 120 },
          filter: { type: 'text' },
          edit:   { enabled: true, type: 'dropdown', options: ['San Francisco','New York','Austin','Seattle','Chicago','London','Berlin','Toronto','Bangalore','Remote'] },
        },
        {
          field: 'status', header: 'Status',
          size:    { width: 90 },
          filter:  { type: 'boolean' },
          display: { formatter: v => v ? 'Active' : 'Inactive', cellClass: v => v ? 'cell-active' : 'cell-inactive' },
          edit:    { enabled: true, type: 'boolean' },
        },
        {
          field: 'joinDate', header: 'Joined',
          size:   { flex: 1, minWidth: 100 },
          filter: { type: 'date' },
          edit:   { enabled: true, type: 'date' },
        },
      ],
      data,
      sorting:    { enabled: true, multiSort: true },
      filtering:  { enabled: true },
      pagination: { enabled: true, pageSize: 25, pageSizeOptions: [10, 25, 50, 100] },
      selection:  { mode: 'multiple', showCheckboxes: true, selectOnRowClick: false },
      editing:    { enabled: true, trigger: 'doubleClick', confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
      export:     { filename: 'elitegrid-demo', scope: 'filtered' },
      appearance: { rowStriping: true, showHoverHighlight: true },
      events: {
        onReady: api => {
          gridApi = api
          window.parent.postMessage({ type: 'GRID_READY', totalCount: data.length }, '*')
        },
        onSelectionChange: rows => {
          window.parent.postMessage({ type: 'SELECTION_CHANGED', count: rows.length }, '*')
        },
        onFilterChange: () => {
          requestAnimationFrame(() => {
            if (!gridApi) return
            const s = gridApi.getPaginationState()
            window.parent.postMessage({ type: 'FILTER_CHANGED', filteredCount: s.totalRows }, '*')
          })
        },
      },
    })

    // ── Message listener ──────────────────────────────────────────
    window.addEventListener('message', ev => {
      if (!ev.data) return
      const { type, theme, density } = ev.data
      if (type === 'SET_THEME') {
        applyTheme(theme)
      }
      if (type === 'SET_DENSITY') {
        const g = document.querySelector('.yg-grid')
        if (g) {
          g.classList.remove('yg-density-compact', 'yg-density-normal', 'yg-density-comfortable')
          g.classList.add('yg-density-' + density)
        }
      }
      if (type === 'EXPORT_CSV' && gridApi) {
        gridApi.exportCSV({ filename: 'elitegrid-demo', scope: 'filtered' })
      }
    })

    // ── Mount ─────────────────────────────────────────────────────
    const root = createRoot(document.getElementById('root'))
    root.render(React.createElement(Grid, { grid, style: { height: '100%' } }))
  <\/script>
</body>
</html>`
}

const FEATURES = [
  'Multi-sort',
  'Column Filters',
  'Pagination',
  'Inline Editing',
  'Row Selection',
  'CSV Export',
  'Keyboard Nav',
  'Virtual Scroll',
]

export default function GridDemo() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [theme, setTheme] = useState<Theme>('light')
  const [density, setDensity] = useState<Density>('normal')
  const [selectedCount, setSelectedCount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(500)
  const [ready, setReady] = useState(false)
  const [srcDoc, setSrcDoc] = useState(LOADING_DOC)

  useEffect(() => {
    setSrcDoc(buildDemoSrcDoc(window.location.origin))
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'GRID_READY') {
        setReady(true)
        setFilteredCount(e.data.totalCount ?? 500)
      }
      if (e.data?.type === 'SELECTION_CHANGED') setSelectedCount(e.data.count ?? 0)
      if (e.data?.type === 'FILTER_CHANGED')    setFilteredCount(e.data.filteredCount ?? 500)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const send = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  const handleTheme = (t: Theme) => {
    setTheme(t)
    send({ type: 'SET_THEME', theme: t })
  }
  const handleDensity = (d: Density) => {
    setDensity(d)
    send({ type: 'SET_DENSITY', density: d })
  }
  const handleExport = () => send({ type: 'EXPORT_CSV' })

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden shadow-2xl">

      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#111113] border-b border-white/8 flex-wrap">

        {/* Density */}
        <div className="flex bg-black/40 rounded-lg p-0.5 gap-px">
          {(['compact', 'normal', 'comfortable'] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => handleDensity(d)}
              className={[
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize',
                density === d
                  ? 'bg-[#e8ff47] text-[#0d0d0d] font-bold'
                  : 'text-[#52525b] hover:text-[#a1a1aa]',
              ].join(' ')}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme */}
          <div className="flex bg-black/40 rounded-lg p-0.5 gap-px">
            {(['light', 'dark'] as Theme[]).map(t => (
              <button
                key={t}
                onClick={() => handleTheme(t)}
                className={[
                  'px-3 py-1 rounded-md text-xs font-medium transition-all capitalize',
                  theme === t
                    ? 'bg-white/10 text-[#f4f4f5]'
                    : 'text-[#52525b] hover:text-[#a1a1aa]',
                ].join(' ')}
              >
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/25 hover:bg-[#e8ff47]/20 transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#0c0c0e] border-b border-white/[0.04] font-mono text-[11px] text-[#3f3f46]">
        <span className={ready ? 'text-[#52525b]' : ''}>
          {filteredCount.toLocaleString()} rows
        </span>
        {selectedCount > 0 && (
          <span className="text-[#e8ff47]">{selectedCount} selected</span>
        )}
        {!ready && <span>Loading…</span>}
        {ready && (
          <span className="hidden sm:inline">
            Double-click to edit · Shift+click header to multi-sort
          </span>
        )}
      </div>

      {/* ── Grid iframe ───────────────────────────────────────────── */}
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        className="w-full block"
        style={{ height: 520, border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
        title="EliteGrid live demo"
      />

      {/* ── Feature badges ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-[#0c0c0e] border-t border-white/[0.04]">
        {FEATURES.map(f => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/[0.07] text-[#3f3f46]"
          >
            <span className="w-1 h-1 rounded-full bg-[#e8ff47] flex-shrink-0" />
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}
