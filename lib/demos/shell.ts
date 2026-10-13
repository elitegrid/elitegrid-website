// The sandboxed-iframe shell every showcase demo runs inside.
//
// `lib/gridDemoSrcDoc.ts` grew this HTML frame, the --eg-* theme table and the
// postMessage listener for ONE demo (the landing page's employee grid). The
// showcase set at /demos needs the same three things six more times, and six
// copies of a 30-entry token table is six places to fix one token. So the
// frame lives here and a demo contributes only what makes it that demo: its
// own CSS, and a script body.
//
// What the script body gets in scope — no imports, no exports, no required
// shape, because the six demos differ too much to share one (a crypto ticker
// and an 80-column telemetry table have nothing structural in common):
//
//   React, createRoot                 the react runtime
//   createGrid, Grid, AllModules      the library
//   mountEl                           the <div> to render into
//   post(type, payload)               -> parent window
//   onMessage(type, handler)          <- parent window
//   ready(payload)                    post DEMO_READY once mounted
//
// Theme is NOT the demo's business: the shell owns SET_THEME, because every
// demo needs it and none of them wants to care. A demo whose own CSS is
// theme-dependent hangs it off [data-theme='dark'], which the shell sets.

export const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100vh;font-family:system-ui;color:#6b7280;font-size:0.875rem;background:#fff;}
</style></head><body><span>Loading…</span></body></html>`

/**
 * The grid's own design tokens, light and dark. Kept as data rather than CSS
 * text so the theme switch can set them one property at a time on the root —
 * swapping a whole stylesheet flashes, and these demos sit inside a page whose
 * theme toggle the visitor can hit at any moment.
 */
const THEME_VARS = {
  light: {
    '--eg-primary': '#6366f1',
    '--eg-primary-light': '#eef2ff',
    '--eg-primary-text': '#ffffff',
    '--eg-header-bg': '#fafafa',
    '--eg-header-text': '#374151',
    '--eg-header-border': '1px solid #e5e7eb',
    '--eg-header-active-bg': '#f3f4f6',
    '--eg-row-bg': '#ffffff',
    '--eg-row-striped-bg': '#fafafa',
    '--eg-row-border': '1px solid #f3f4f6',
    '--eg-hover-bg': '#f5f3ff',
    '--eg-row-hover-bg': '#f5f3ff',
    '--eg-row-selected-bg': '#eef2ff',
    '--eg-row-selected-border': '1px solid #c7d2fe',
    '--eg-row-selected-outline': 'rgba(99,102,241,0.2)',
    '--eg-cell-text': '#111827',
    '--eg-cell-border': '1px solid #e5e7eb',
    '--eg-text': '#111827',
    '--eg-muted-text': '#6b7280',
    '--eg-border': '#e5e7eb',
    '--eg-border-color': '#e5e7eb',
    '--eg-border-hover': '#d1d5db',
    '--eg-sort-icon-color': '#9ca3af',
    '--eg-sort-active-color': '#6366f1',
    '--eg-skeleton-base': '#f3f4f6',
    '--eg-skeleton-highlight': '#e5e7eb',
    '--eg-empty-icon-bg': '#f3f4f6',
    '--eg-overlay-bg': 'rgba(255,255,255,0.95)',
    '--eg-btn-bg': '#f3f4f6',
    '--eg-btn-text': '#374151',
    '--eg-surface': '#ffffff',
    '--eg-toolbar-bg': '#ffffff',
    '--eg-error': '#dc2626',
    '--eg-error-bg': '#fee2e2',
    '--eg-error-text': '#ffffff',
    // Change highlighting (A9). Only the live demos flash, but these are the
    // grid's own tokens, so they belong with the rest of the theme rather
    // than in one demo's CSS.
    '--eg-flash-bg': '#fde68a',
    '--eg-flash-up-bg': '#bbf7d0',
    '--eg-flash-down-bg': '#fecaca',
  },
  dark: {
    '--eg-primary': '#818cf8',
    '--eg-primary-light': '#312e81',
    '--eg-primary-text': '#ffffff',
    '--eg-header-bg': '#1a1a2a',
    '--eg-header-text': '#94a3b8',
    '--eg-header-border': '1px solid #2d2d4d',
    '--eg-header-active-bg': '#2a2a3e',
    '--eg-row-bg': '#0f0f1a',
    '--eg-row-striped-bg': '#13131f',
    '--eg-row-border': '1px solid #1a1a2a',
    '--eg-hover-bg': '#1a1a30',
    '--eg-row-hover-bg': '#1a1a30',
    '--eg-row-selected-bg': '#1e1b4b',
    '--eg-row-selected-border': '1px solid #4338ca',
    '--eg-row-selected-outline': 'rgba(129,140,248,0.2)',
    '--eg-cell-text': '#e2e8f0',
    '--eg-cell-border': '1px solid #2d2d4d',
    '--eg-text': '#e2e8f0',
    '--eg-muted-text': '#94a3b8',
    '--eg-border': '#2d2d4d',
    '--eg-border-color': '#2d2d4d',
    '--eg-border-hover': '#3d3d5d',
    '--eg-sort-icon-color': '#64748b',
    '--eg-sort-active-color': '#818cf8',
    '--eg-skeleton-base': '#1a1a2a',
    '--eg-skeleton-highlight': '#2d2d4d',
    '--eg-empty-icon-bg': '#1a1a2a',
    '--eg-overlay-bg': 'rgba(15,15,26,0.95)',
    '--eg-btn-bg': '#2d2d4d',
    '--eg-btn-text': '#e2e8f0',
    '--eg-surface': '#1a1a2a',
    '--eg-toolbar-bg': '#0f0f1a',
    '--eg-error': '#f87171',
    '--eg-error-bg': '#450a0a',
    '--eg-error-text': '#fecaca',
    '--eg-flash-bg': '#78350f',
    '--eg-flash-up-bg': '#14532d',
    '--eg-flash-down-bg': '#7f1d1d',
  },
} as const

/** Chrome shared by every demo: fonts, scrollbars, header casing, focus ring. */
const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    background: #ffffff;
    transition: background 0.25s;
  }
  [data-theme='dark'] body { background: #0f0f1a; }

  .yg-header-cell {
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .yg-row  { font-size: 0.875rem !important; }
  .yg-cell {
    font-size: 0.875rem !important;
    font-family: 'DM Sans', system-ui, sans-serif !important;
  }
  .yg-cell:focus { outline: 2px solid #a5b4fc !important; outline-offset: -2px; }

  /* Any column holding a number reads better monospaced and right-aligned.
     Demos opt in per column with display.cellClass: 'num'. */
  .yg-cell.num { justify-content: flex-end; }
  .yg-cell.num span { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; }

  input[type="checkbox"] {
    accent-color: var(--eg-primary);
    width: 15px !important; height: 15px !important; cursor: pointer;
  }
  select {
    appearance: none; -webkit-appearance: none;
    background-repeat: no-repeat; background-position: right 10px center;
    padding-right: 28px !important; cursor: pointer;
  }
  .yg-body::-webkit-scrollbar { width: 8px; height: 8px; }
  .yg-body::-webkit-scrollbar-track { background: transparent; }
  .yg-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
  .yg-body::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  [data-theme='dark'] .yg-body::-webkit-scrollbar-thumb { background: #374151; }
  [data-theme='dark'] .yg-body::-webkit-scrollbar-thumb:hover { background: #4b5563; }
`

export interface DemoSource {
  /** Extra CSS for this demo's own cell renderers. */
  css?: string
  /** Module body. See the scope contract at the top of this file. */
  script: string
}

/** A demo module's default export: its source plus how to address and run it. */
export interface Demo extends DemoSource {
  /** Must match an entry in `meta.ts`. */
  slug: string
  /**
   * True if the script starts a timer. The frame then gates it with SET_LIVE
   * when the tab is hidden or the demo scrolls out of view.
   *
   * Declared by the demo rather than listed centrally: the demo is what knows,
   * and a central list is a second place to forget.
   */
  live?: boolean
}

export function buildDemoSrcDoc(origin: string, demo: DemoSource): string {
  // `<\/script>` rather than `</script>`: the browser's tokenizer ends the
  // surrounding <script> block at the first literal closing tag it sees, even
  // inside a string, so an unescaped one truncates the whole document.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <!-- The library's real stylesheet, shipped beside the bundles by
       \`pnpm build:cdn\`. Every floating surface the grid owns — the column and
       context menus, filter popovers, the floating filter row, the set-filter
       list, the group rail, the cell editors — is styled HERE and nowhere
       else. Without it they render as unstyled blocks in the document flow.
       It must come BEFORE the site's own CSS so BASE_CSS wins the cascade. -->
  <link rel="stylesheet" href="${origin}/cdn/react.css" />
  <style>${BASE_CSS}${demo.css ?? ''}</style>
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
  <div id="root" style="height:100%;display:flex;flex-direction:column;overflow:hidden;">
    <div id="grid-mount" style="flex:1;min-height:0;display:flex;flex-direction:column;"></div>
  </div>
  <script type="module">
    import React from 'react'
    import { createRoot } from 'react-dom/client'
    // InfiniteScrollModule is imported separately because it is deliberately
    // NOT part of AllModules: it swaps the row model for a server-driven one,
    // so a grid would get it by accident otherwise. Only the dashboard demo
    // registers it.
    import { createGrid, Grid, AllModules, InfiniteScrollModule } from '@elitegrid/react'

    const mountEl = document.getElementById('grid-mount')
    const post = (type, payload) => window.parent.postMessage({ type, ...payload }, '*')

    const handlers = new Map()
    const onMessage = (type, fn) => handlers.set(type, fn)
    window.addEventListener('message', (ev) => {
      if (!ev.data || !ev.data.type) return
      const fn = handlers.get(ev.data.type)
      if (fn) fn(ev.data)
    })

    const THEME_VARS = ${JSON.stringify(THEME_VARS)}
    onMessage('SET_THEME', ({ theme }) => {
      const vars = THEME_VARS[theme] || THEME_VARS.light
      for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v)
      document.documentElement.setAttribute('data-theme', theme)
    })

    const ready = (payload) => post('DEMO_READY', payload)

    try {
${demo.script}
    } catch (err) {
      // A demo that throws must say so out loud. Swallowing it leaves the
      // parent's spinner up forever, which reads as "the library is broken"
      // rather than "this demo has a bug".
      console.error('[demo]', err)
      post('DEMO_ERROR', { message: String((err && err.message) || err) })
    }
  <\/script>
</body>
</html>`
}
