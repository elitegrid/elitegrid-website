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
  /**
   * 'full' — every column, flat. The standalone demo.
   * 'hero' — five columns, grouped by department with a grand total, and
   *   renderers on three of them. The hero column is ~440px wide, so seven
   *   flat text columns there showed Name, Department, Role and a scrollbar.
   */
  variant?: 'full' | 'hero'
}

export function buildDemoSrcDoc(origin: string, opts: GridDemoOptions = {}): string {
  const { pageSize = 25, pageSizeOptions = [10, 25, 50, 100], variant = 'full' } = opts
  // The hero's job is to prove scale, so it gets 100k rows rather than 500.
  // They cost ~8 MB and a few hundred ms to generate, which is why only the
  // hero asks for them — the standalone demo stays at 500 so the page that
  // embeds several of them is not generating a million rows.
  const rowCount = opts.rowCount ?? (variant === 'hero' ? 100000 : 500)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
  <!-- The library's real stylesheet, shipped beside the bundles by
       \`pnpm build:cdn\`. Required, not optional: the column menu, context menu,
       filter popovers and cell editors are styled only here, and without it
       they render as unstyled text dropped into the document flow. Hand-rolling
       the rules below was survivable while the CDN bundle contained none of
       those surfaces; it stopped being survivable the moment it contained all
       of them. -->
  <link rel="stylesheet" href="${origin}/cdn/react.css" />
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

    .cell-person { display: flex; align-items: center; gap: 9px; min-width: 0; }
    .cell-person .avatar {
      width: 26px; height: 26px; border-radius: 999px; flex: none; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; font-weight: 600;
    }
    .cell-person .person-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
    .cell-person .person-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cell-person .person-mail { font-size: 0.6875rem; color: var(--eg-muted-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .cell-score { display: flex; align-items: center; gap: 8px; width: 100%; }
    .cell-score .score-track { flex: 1; height: 5px; border-radius: 999px; background: var(--eg-skeleton-base); overflow: hidden; }
    .cell-score .score-fill { display: block; height: 5px; border-radius: 999px; }
    .cell-score .score-num { font-family: 'JetBrains Mono', monospace; font-size: 0.6875rem; color: var(--eg-muted-text); }

    .cell-spark { width: 100%; height: 26px; display: block; }

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
    import { createGrid, Grid, AllModules } from '@elitegrid/react'

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
          email:      (FN[i % FN.length] + '.' + LN[Math.floor(i / FN.length) % LN.length]).toLowerCase() + '@elitegrid.dev',
          score:      38 + (i * 29) % 60,
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
        // 'en-US' explicitly — a bare toLocaleString() follows the VISITOR's
        // locale, so a US salary rendered as "$1,20,000" for anyone browsing
        // from an en-IN machine. Demo data is US data; the formatting has to
        // say so rather than follow whoever is looking.
        display: { formatter: v => '$' + Number(v).toLocaleString('en-US'), cellClass: 'cell-salary' },
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

    // ── Hero columns ──────────────────────────────────────────────
    // Fewer columns, three of them rendered rather than formatted. This is
    // the shape the landing page shows: what the grid can draw, not just
    // what it can lay out.
    const HUES = [265, 199, 38, 160, 330, 243, 174]
    const h = React.createElement

    function avatarCell(value, row) {
      const initials = String(value).split(' ').map(w => w[0]).join('')
      const hue = HUES[(row.id - 1) % HUES.length]
      return h('div', { className: 'cell-person' },
        h('span', { className: 'avatar', style: { background: 'hsl(' + hue + ' 62% 48%)' } }, initials),
        h('span', { className: 'person-text' },
          h('span', { className: 'person-name' }, value),
          h('span', { className: 'person-mail' }, row.email),
        ),
      )
    }

    function scoreCell(value) {
      const n = Number(value)
      const colour = n >= 70 ? '#16a34a' : n >= 55 ? '#d97706' : '#dc2626'
      return h('div', { className: 'cell-score' },
        h('span', { className: 'score-track' },
          h('span', { className: 'score-fill', style: { width: n + '%', background: colour } }),
        ),
        h('span', { className: 'score-num' }, n),
      )
    }

    // The sparkline's twelve points are derived from the row id rather than
    // stored on the row. The walk is seeded, so the same row always draws the
    // same line — which was the reason it used to be generated up front — and
    // 100k rows x 12 numbers is 1.2M numbers not held in memory.
    function trendPoints(id) {
      const i = id - 1
      return Array.from({ length: 12 }, (_, k) => 30 + ((i * 17 + k * 23) % 55))
    }

    function trendCell(_value, row) {
      const pts = trendPoints(row.id)
      if (!pts) return null
      const rising = pts[pts.length - 1] >= pts[0]
      const d = pts.map((p, k) => (k * (92 / (pts.length - 1))).toFixed(1) + ',' + (26 - (p / 100) * 22).toFixed(1)).join(' ')
      return h('svg', { className: 'cell-spark', viewBox: '0 0 92 26', preserveAspectRatio: 'none', role: 'img', 'aria-label': rising ? 'trending up' : 'trending down' },
        h('polyline', { points: d, fill: 'none', stroke: rising ? '#16a34a' : '#dc2626', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    // The hero is a full-width stack now, not a 538px right column, so these
    // widths are set for ~1190px: the old minWidths summed to 552 and the
    // panel was 538, which is what clipped Trend and put a scrollbar in the
    // hero. Any column added here has to keep that sum under the container.
    const HERO_COLUMNS = [
      {
        field: 'name', header: 'Employee',
        size:   { flex: 1.9, minWidth: 220 },
        filter: { type: 'text' },
        display: { cellRenderer: avatarCell },
        edit:   { enabled: true, type: 'text' },
      },
      {
        // Defined but never drawn: keepGroupedColumns is false by default, so
        // the grid hides it the moment it becomes the group. Dropping the
        // definition instead left the group row with a count and no name.
        field: 'department', header: 'Department',
        size:   { flex: 1, minWidth: 110 },
        filter: { type: 'text' },
      },
      {
        field: 'role', header: 'Role',
        size:   { flex: 1.2, minWidth: 130 },
        filter: { type: 'text' },
        edit:   { enabled: true, type: 'text' },
      },
      {
        field: 'location', header: 'Location',
        size:   { flex: 1, minWidth: 120 },
        filter: { type: 'text' },
        edit:   { enabled: true, type: 'dropdown', options: ['San Francisco','New York','Austin','Seattle','Chicago','London','Berlin','Toronto','Bangalore','Remote'] },
      },
      {
        field: 'salary', header: 'Salary',
        size:    { flex: 1.1, minWidth: 125 },
        filter:  { type: 'number' },
        display: { formatter: v => '$' + Number(v).toLocaleString('en-US'), cellClass: 'cell-salary' },
        value:   {
          aggregate: values => '$' + values.reduce((a, b) => a + Number(b), 0).toLocaleString('en-US'),
        },
        edit:    { enabled: true, type: 'number', min: 0, max: 500000, parser: raw => Number(raw) },
      },
      {
        field: 'score', header: 'Score',
        size:    { flex: 1, minWidth: 120 },
        filter:  { type: 'number' },
        display: { cellRenderer: scoreCell },
        value:   {
          aggregate: values => Math.round(values.reduce((a, b) => a + Number(b), 0) / values.length),
        },
      },
      {
        field: 'trend', header: 'Trend',
        size:    { flex: 0.85, minWidth: 95 },
        display: { cellRenderer: trendCell },
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

      const HERO = ${JSON.stringify(variant === 'hero')}

      // What the strip under the grid reports. It covers createGrid plus
      // React's first commit, read back after the browser has painted —
      // timing createGrid alone would flatter the number by leaving the
      // render out. Row generation sits outside it, the same way the
      // benchmark harness measures mount rather than data setup.
      // No self-timing here any more. The strip under the grid carries
      // labels rather than measurements, so nothing needs a stopwatch.

      grid = createGrid({
        columns: HERO ? HERO_COLUMNS : COLUMNS,
        modules: [AllModules],
        data,
        sorting:    { enabled: true, multiSort: true },
        // Grouping is the hero's job: one glance should show a group row, its
        // aggregates and a grand total, which a flat table cannot.
        grouping:   HERO
          ? {
              model: ['department'],
              expandedByDefault: 1,
              grandTotal: 'bottom',
              panel: false,
              // 220 is the default and was half the old hero panel. The stacked
              // hero is ~1190px wide, so the group column can hold the real
              // header rather than an abbreviation.
              groupColumn: { header: 'Department', width: 170, minWidth: 150 },
            }
          : undefined,
        filtering:  { enabled: true },
        // No pagination in the hero. Its bar took two lines and a third of the
        // card's height, and its row count included group rows — "of 508"
        // beside a "Total (500)" row reads as a bug. Scrolling 500 virtualized
        // rows is also the better demo of what the grid actually does.
        pagination: HERO
          ? { enabled: false }
          : { enabled: true, pageSize: ${pageSize}, pageSizeOptions: ${JSON.stringify(pageSizeOptions)} },
        selection:  HERO
          ? { mode: 'none' }
          : { mode: 'multiple', showCheckboxes: true, selectOnRowClick: false },
        editing:    { enabled: true, trigger: 'doubleClick', confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
        export:     { filename: 'elitegrid-demo', scope: 'filtered' },
        appearance: { rowStriping: true, showHoverHighlight: true, density, rowHeight: sizes.rowHeight, headerHeight: sizes.headerHeight },
        events: {
          onReady: api => {
            gridApi = api
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

      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.parent.postMessage({ type: 'GRID_READY', totalCount: data.length }, '*')
      }))
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
