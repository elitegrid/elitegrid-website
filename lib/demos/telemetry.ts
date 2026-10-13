import type { Demo } from './shell'

// Sensor telemetry — the WIDE grid, and the only one that proves column
// virtualization.
//
// 84 columns. Most grid demos are eight columns wide, which is exactly the
// shape where horizontal windowing cannot matter: eight columns fit, so
// nothing is ever skipped. (EliteGrid's own benchmark harness had this blind
// spot until the column axis landed with C1.) Here the columns are far wider
// than the viewport, so only the ones on screen exist in the DOM — scroll
// sideways and watch it stay smooth.
//
// It is also the demo that needs the column menu to be any good: with 84
// columns, hiding and pinning are navigation, not decoration.
//
//   84 columns                 column virtualization (C1)
//   column menu                hide / pin / auto-size, per column
//   display.cellClass fn       a heatmap computed per value
//   display.pinned             the identity columns never scroll away

const CSS = `
  .ts {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; color: var(--eg-muted-text);
  }
  .unit-id { font-weight: 600; font-size: 0.8125rem; }

  /* ── Heatmap ──────────────────────────────────────────────────
     Eight buckets rather than a continuous scale: a reader comparing two
     cells across a wide table is matching bands, not interpolating, and a
     fixed palette keeps every channel on the same scale. */
  .yg-cell[class*="hm-"] span {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .yg-cell[class*="hm-"] { justify-content: flex-end; }
  .hm-0 { background: rgba(37,99,235,0.16); }
  .hm-1 { background: rgba(14,165,233,0.14); }
  .hm-2 { background: rgba(20,184,166,0.13); }
  .hm-3 { background: rgba(34,197,94,0.12); }
  .hm-4 { background: rgba(163,230,53,0.14); }
  .hm-5 { background: rgba(250,204,21,0.18); }
  .hm-6 { background: rgba(249,115,22,0.20); }
  .hm-7 { background: rgba(239,68,68,0.24); }
  [data-theme='dark'] .hm-0 { background: rgba(59,130,246,0.22); }
  [data-theme='dark'] .hm-1 { background: rgba(14,165,233,0.20); }
  [data-theme='dark'] .hm-2 { background: rgba(20,184,166,0.19); }
  [data-theme='dark'] .hm-3 { background: rgba(34,197,94,0.18); }
  [data-theme='dark'] .hm-4 { background: rgba(163,230,53,0.18); }
  [data-theme='dark'] .hm-5 { background: rgba(250,204,21,0.22); }
  [data-theme='dark'] .hm-6 { background: rgba(249,115,22,0.26); }
  [data-theme='dark'] .hm-7 { background: rgba(239,68,68,0.30); }

  .state {
    font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.03em;
    padding: 2px 7px; border-radius: 4px;
  }
  .state-nominal { color: #15803d; background: rgba(21,128,61,0.11); }
  .state-watch   { color: #b45309; background: rgba(180,83,9,0.12); }
  .state-fault   { color: #be123c; background: rgba(190,18,60,0.12); }
  [data-theme='dark'] .state-nominal { color: #4ade80; background: rgba(74,222,128,0.14); }
  [data-theme='dark'] .state-watch   { color: #fbbf24; background: rgba(251,191,36,0.14); }
  [data-theme='dark'] .state-fault   { color: #fb7185; background: rgba(251,113,133,0.14); }

  .hint {
    flex-shrink: 0; padding: 9px 14px;
    border-bottom: 1px solid var(--eg-border);
    background: var(--eg-surface);
    font-size: 0.75rem; color: var(--eg-muted-text);
  }
  .hint b { color: var(--eg-text); font-weight: 600; }
  .shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .grid-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
`

const SCRIPT = `
    const h = React.createElement

    const ROWS = 20000
    const CHANNELS = 80

    const RIGS = ['Thermal Loop A','Thermal Loop B','Vibration Rig','Vacuum Chamber',
                  'Cryo Stage','Pressure Cell','Spin Table','Acoustic Bay']
    const STATES = ['Nominal','Nominal','Nominal','Nominal','Watch','Fault']

    let seed = 31337
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

    // Channel metadata, built once. Each channel gets its own unit and its own
    // plausible range, so the heatmap is per-channel rather than one global
    // scale across quantities that share no dimension.
    const UNITS = ['°C','kPa','mm/s','mA','V','rpm','ppm','µm']
    const channels = []
    for (let c = 0; c < CHANNELS; c++) {
      const unit = UNITS[c % UNITS.length]
      const base = 10 + (c * 37) % 400
      channels.push({
        key: 'ch' + c,
        label: 'CH' + String(c + 1).padStart(2, '0'),
        unit,
        min: base,
        max: base + 40 + (c % 7) * 25,
      })
    }

    // 20,000 x 80 = 1.6M readings. Built in one typed pass; the per-row object
    // is created once with all its channel keys rather than grown field by
    // field, which keeps it on a single hidden class.
    const readings = new Array(ROWS)
    for (let i = 0; i < ROWS; i++) {
      const row = {
        id: 'R' + String(i).padStart(6, '0'),
        ts: new Date(Date.UTC(2026, 8, 1, 0, 0, 0) + i * 30000)
              .toISOString().replace('T', ' ').slice(0, 19),
        rig: RIGS[i % RIGS.length],
        state: STATES[(i * 13) % STATES.length],
        run: 'RUN-' + String(1 + Math.floor(i / 500)).padStart(3, '0'),
      }
      for (let c = 0; c < CHANNELS; c++) {
        const ch = channels[c]
        row[ch.key] = Math.round((ch.min + rnd() * (ch.max - ch.min)) * 10) / 10
      }
      readings[i] = row
    }

    const stateCell = (v) =>
      h('span', { className: 'state state-' + String(v).toLowerCase() },
        String(v).toUpperCase())

    // ── Columns ───────────────────────────────────────────────────
    // Four identity columns, then 80 channels. The identity ones are pinned
    // left, so a reader 60 columns deep still knows which run they are in.
    const columns = [
      { field: 'ts', header: 'Timestamp',
        size: { width: 168 },
        display: { pinned: 'left', cellClass: 'ts' },
        filter: { type: 'text' } },

      { field: 'id', header: 'Reading',
        size: { width: 104 },
        display: { pinned: 'left', cellClass: 'unit-id' } },

      { field: 'rig', header: 'Rig',
        size: { width: 140 },
        filter: { type: 'set' } },

      { field: 'run', header: 'Run',
        size: { width: 104 },
        filter: { type: 'set' } },

      { field: 'state', header: 'State',
        size: { width: 104 },
        display: { cellRenderer: stateCell },
        filter: { type: 'set' } },
    ]

    for (const ch of channels) {
      const span = ch.max - ch.min || 1
      columns.push({
        field: ch.key,
        header: ch.label + ' (' + ch.unit + ')',
        size: { width: 112 },
        display: {
          formatter: (v) => Number(v).toFixed(1),
          // Bucketed against THIS channel's own range — a global scale would
          // paint every millivolt column blue and every rpm column red.
          cellClass: (v) => {
            const t = (Number(v) - ch.min) / span
            const b = Math.max(0, Math.min(7, Math.floor(t * 8)))
            return 'hm-' + b
          },
          tooltip: (v) => ch.label + ': ' + Number(v).toFixed(1) + ' ' + ch.unit,
        },
        filter: { type: 'number' },
      })
    }

    let api = null

    const grid = createGrid({
      modules: [AllModules],
      columns,
      data: readings,
      rowId: 'id',
      sorting: { enabled: true, multiSort: true },
      filtering: { enabled: true, searchBar: true, searchPlaceholder: 'Search readings…' },
      appearance: { rowHeight: 34, headerHeight: 38, rowStriping: false },
      export: { filename: 'elitegrid-telemetry', scope: 'filtered' },
      events: {
        onReady: (a) => { api = a; ready({ rowCount: ROWS, columnCount: columns.length }) },
      },
    })

    createRoot(mountEl).render(
      h('div', { className: 'shell' },
        h('div', { className: 'hint' },
          h('b', null, columns.length + ' columns × ' + ROWS.toLocaleString('en-US') + ' readings'),
          ' — scroll sideways. Only the columns on screen exist in the DOM. ',
          'Use a column\\'s ⋮ menu to pin or hide one.'),
        h('div', { className: 'grid-wrap' }, h(Grid, { grid })),
      ),
    )

    onMessage('EXPORT_CSV', () =>
      api && api.exportCSV({ filename: 'elitegrid-telemetry', scope: 'filtered' }))
`

export const telemetry: Demo = {
  slug: 'sensor-telemetry',
  css: CSS,
  script: SCRIPT,
}
