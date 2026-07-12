// Shared builder for the sandboxed iframe that mounts a live @elitegrid/react
// grid. Used by the landing page's GridDemo.

export const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100vh;font-family:system-ui;color:#6b7280;font-size:0.875rem;background:#fff;}
</style></head><body><span>Loading…</span></body></html>`

export interface GridDemoOptions {
  /** Number of synthetic rows to generate. */
  rowCount?: number
  pageSize?: number
  pageSizeOptions?: number[]
}

export function buildDemoSrcDoc(origin: string, opts: GridDemoOptions = {}): string {
  const { rowCount = 500, pageSize = 25, pageSizeOptions = [10, 25, 50, 100] } = opts

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; background: #ffffff; transition: background 0.25s; }

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

    .yg-cell.cell-status-active span   { background: rgba(22,163,74,0.12); color: #16a34a; border-radius: 999px; padding: 2px 10px; font-size: 0.75rem; font-weight: 600; }
    .yg-cell.cell-status-remote span   { background: rgba(37,99,235,0.12); color: #2563eb; border-radius: 999px; padding: 2px 10px; font-size: 0.75rem; font-weight: 600; }
    .yg-cell.cell-status-onleave span  { background: rgba(217,119,6,0.12); color: #d97706; border-radius: 999px; padding: 2px 10px; font-size: 0.75rem; font-weight: 600; }
    [data-theme='dark'] .yg-cell.cell-status-active span  { background: rgba(74,222,128,0.15); color: #4ade80; }
    [data-theme='dark'] .yg-cell.cell-status-remote span  { background: rgba(96,165,250,0.15); color: #60a5fa; }
    [data-theme='dark'] .yg-cell.cell-status-onleave span { background: rgba(251,191,36,0.15); color: #fbbf24; }

    .yg-cell.cell-salary { justify-content: flex-end; }
    .yg-cell.cell-salary span { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; }

    .yg-header-cell {
      font-size: 0.8125rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .yg-row  { font-size: 0.9375rem !important; }
    .yg-cell {
      font-size: 0.9375rem !important;
      font-family: 'DM Sans', system-ui, sans-serif !important;
    }
    .yg-cell:focus { outline: 2px solid #a5b4fc !important; outline-offset: -2px; }
    input[type="checkbox"] {
      accent-color: var(--eg-primary);
      width: 15px !important; height: 15px !important; cursor: pointer;
    }
    select {
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 28px !important;
      cursor: pointer;
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
  <div id="root" style="height:100%;display:flex;flex-direction:column;">
    <div id="grid-mount" style="flex:1;min-height:0;display:flex;flex-direction:column;"></div>
  </div>
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
          status:     i % 11 === 0 ? 'On Leave' : i % 4 === 0 ? 'Remote' : 'Active',
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
        '--eg-surface':              '#ffffff',
        '--eg-toolbar-bg':           '#ffffff',
        '--eg-primary-text':         '#ffffff',
        '--eg-border-color':         '#e5e7eb',
        '--eg-header-active-bg':     '#f3f4f6',
        '--eg-row-selected-outline': 'rgba(99,102,241,0.2)',
        '--eg-error':                '#dc2626',
        '--eg-error-bg':             '#fee2e2',
        '--eg-error-text':           '#ffffff',
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
        '--eg-surface':              '#1a1a2a',
        '--eg-toolbar-bg':           '#0f0f1a',
        '--eg-primary-text':         '#ffffff',
        '--eg-border-color':         '#2d2d4d',
        '--eg-header-active-bg':     '#2a2a3e',
        '--eg-row-selected-outline': 'rgba(129,140,248,0.2)',
        '--eg-error':                '#f87171',
        '--eg-error-bg':             '#450a0a',
        '--eg-error-text':           '#fecaca',
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
    let grid = null
    let root = null
    const data = gen(${rowCount})

    const COLUMNS = [
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
        display: { formatter: v => '$' + Number(v).toLocaleString(), cellClass: 'cell-salary' },
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
        size:    { width: 110 },
        filter:  { type: 'text' },
        display: {
          formatter: v => v,
          cellClass: v => 'cell-status-' + String(v).toLowerCase().replace(' ', ''),
        },
        edit: { enabled: true, type: 'dropdown', options: ['Active', 'Remote', 'On Leave'] },
      },
      {
        field: 'joinDate', header: 'Joined',
        size:   { flex: 1, minWidth: 100 },
        filter: { type: 'date' },
        edit:   { enabled: true, type: 'date' },
      },
    ]

    // Density is an appearance option baked in at createGrid() time — the
    // Grid component has no reactive setter for it, so changing density
    // means tearing down and rebuilding the grid instance + React root.
    // appearance.density only switches a CSS class (font-size/padding via
    // --eg-* vars); the actual pixel row/header height is a *separate*
    // numeric appearance.rowHeight/headerHeight (defaults to 40/44
    // regardless of density and wins via inline style + virtualization
    // math), so both must be set together to match the size table in
    // the library's own styles.css .yg-density-* rules.
    const DENSITY_SIZES = {
      compact:     { rowHeight: 32, headerHeight: 36 },
      normal:      { rowHeight: 40, headerHeight: 44 },
      comfortable: { rowHeight: 52, headerHeight: 56 },
    }

    function mountGrid(density) {
      if (root) root.unmount()
      if (grid) grid.kernel.destroy()

      const sizes = DENSITY_SIZES[density] || DENSITY_SIZES.normal

      grid = createGrid({
        columns: COLUMNS,
        data,
        sorting:    { enabled: true, multiSort: true },
        filtering:  { enabled: true },
        pagination: { enabled: true, pageSize: ${pageSize}, pageSizeOptions: ${JSON.stringify(pageSizeOptions)} },
        selection:  { mode: 'multiple', showCheckboxes: true, selectOnRowClick: false },
        editing:    { enabled: true, trigger: 'doubleClick', confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
        export:     { filename: 'elitegrid-demo', scope: 'filtered' },
        appearance: { rowStriping: true, showHoverHighlight: true, density, rowHeight: sizes.rowHeight, headerHeight: sizes.headerHeight },
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

      root = createRoot(document.getElementById('grid-mount'))
      root.render(React.createElement(Grid, { grid }))
    }

    mountGrid('normal')

    // ── Message listener ──────────────────────────────────────────
    window.addEventListener('message', ev => {
      if (!ev.data) return
      const { type, theme, density } = ev.data
      if (type === 'SET_THEME') {
        applyTheme(theme)
      }
      if (type === 'SET_DENSITY') {
        mountGrid(density)
      }
      if (type === 'EXPORT_CSV' && gridApi) {
        gridApi.exportCSV({ filename: 'elitegrid-demo', scope: 'filtered' })
      }
    })
  <\/script>
</body>
</html>`
}
