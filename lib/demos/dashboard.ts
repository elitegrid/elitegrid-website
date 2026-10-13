import type { Demo } from './shell'

// SaaS dashboard — the composition showcase.
//
// Every other tile is a grid filling a frame. Real screens are not that: the
// grid shares the page with KPI tiles and a chart, and its rows come from a
// server that takes its time. This one is here to answer "will it fit into
// my app", which is a different question from "what can it do".
//
//   options.dataSource         rows fetched per page, with real latency
//   InfiniteScrollModule       rows accumulate as you scroll, no pager
//   a surrounding layout       KPI row + chart above a grid that still
//                              virtualizes inside its own box
//
// The "server" is a local function behind a setTimeout. A marketing page
// cannot depend on someone else's API being up, and a simulated 350ms is the
// honest part of the demo — it is the latency that makes the loading state
// visible at all.

const CSS = `
  .dash { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .dash-head { flex-shrink: 0; padding: 14px 16px 0; }

  .kpis {
    display: grid; gap: 10px; margin-bottom: 12px;
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 760px) { .kpis { grid-template-columns: repeat(2, 1fr); } }
  .kpi {
    border: 1px solid var(--eg-border); border-radius: 10px;
    padding: 10px 12px; background: var(--eg-surface);
  }
  .kpi-k {
    font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--eg-muted-text);
  }
  .kpi-v {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.125rem; font-weight: 600; color: var(--eg-text);
    font-variant-numeric: tabular-nums; line-height: 1.4;
  }
  .kpi-d { font-size: 0.6875rem; font-weight: 600; }
  .kpi-up { color: #16a34a; } .kpi-down { color: #dc2626; }
  [data-theme='dark'] .kpi-up { color: #4ade80; }
  [data-theme='dark'] .kpi-down { color: #f87171; }

  .spark-row {
    display: flex; align-items: flex-end; gap: 3px;
    height: 54px; margin-bottom: 12px;
  }
  .spark-col {
    flex: 1; border-radius: 2px 2px 0 0;
    background: var(--eg-primary); opacity: 0.55;
  }

  .dash-grid {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    border-top: 1px solid var(--eg-border);
  }

  .plan {
    font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.03em;
    padding: 2px 8px; border-radius: 4px;
  }
  .plan-free       { color: #64748b; background: rgba(100,116,139,0.12); }
  .plan-pro        { color: #1d4ed8; background: rgba(29,78,216,0.12); }
  .plan-business   { color: #7c3aed; background: rgba(124,58,237,0.12); }
  .plan-enterprise { color: #b45309; background: rgba(180,83,9,0.12); }
  [data-theme='dark'] .plan-free       { color: #94a3b8; background: rgba(148,163,184,0.14); }
  [data-theme='dark'] .plan-pro        { color: #60a5fa; background: rgba(96,165,250,0.14); }
  [data-theme='dark'] .plan-business   { color: #a78bfa; background: rgba(167,139,250,0.14); }
  [data-theme='dark'] .plan-enterprise { color: #fbbf24; background: rgba(251,191,36,0.14); }

  .health { display: flex; align-items: center; gap: 7px; }
  .health-bar {
    width: 54px; height: 5px; border-radius: 999px;
    background: rgba(120,120,140,0.18); overflow: hidden;
  }
  .health-fill { height: 100%; border-radius: 999px; }
  .health-num {
    font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
    color: var(--eg-cell-text); font-variant-numeric: tabular-nums;
  }
`

const SCRIPT = `
    const h = React.createElement

    const COMPANIES = ['Northwind','Acme','Globex','Initech','Umbrella','Soylent','Hooli',
                       'Vehement','Massive Dynamic','Stark','Wayne','Cyberdyne','Tyrell',
                       'Aperture','Black Mesa','Wonka','Gringotts','Duff','Prestige','Monarch']
    const SUFFIX = ['Industries','Labs','Group','Systems','Partners','Holdings','Collective','Works']
    const PLANS = ['Free','Pro','Business','Enterprise']
    const OWNERS = ['R. Whitfield','A. Haddad','M. Santos','K. Oyelaran','J. Lindqvist','P. Nakamura']
    const TOTAL = 4800

    let seed = 606
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

    // The whole "database", built once and then served a page at a time —
    // the store the fake endpoint reads from.
    const db = new Array(TOTAL)
    for (let i = 0; i < TOTAL; i++) {
      const plan = PLANS[Math.floor(rnd() * PLANS.length)]
      const seats = plan === 'Enterprise' ? 60 + Math.floor(rnd() * 900)
                  : plan === 'Business'   ? 18 + Math.floor(rnd() * 90)
                  : plan === 'Pro'        ? 3 + Math.floor(rnd() * 24)
                  : 1 + Math.floor(rnd() * 4)
      const perSeat = plan === 'Enterprise' ? 42 : plan === 'Business' ? 28 : plan === 'Pro' ? 14 : 0
      db[i] = {
        id: 'A' + String(10000 + i),
        account: COMPANIES[i % COMPANIES.length] + ' ' + SUFFIX[(i * 3) % SUFFIX.length],
        plan,
        seats,
        mrr: seats * perSeat,
        health: Math.round(28 + rnd() * 72),
        owner: OWNERS[(i * 5) % OWNERS.length],
        signup: (2022 + Math.floor(rnd() * 5)) + '-' +
                String(1 + Math.floor(rnd() * 12)).padStart(2, '0') + '-' +
                String(1 + Math.floor(rnd() * 28)).padStart(2, '0'),
        lastSeen: Math.floor(rnd() * 60) + 'd ago',
      }
    }

    const usd = (v) => '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })
    const num = (v) => Number(v).toLocaleString('en-US')

    // ── The "server" ──────────────────────────────────────────────
    // getRows receives page, pageSize, sortModel, filterModel and search —
    // everything a real endpoint needs. This one honours the sort because it
    // has to: under infinite scroll the grid orders the rows it has LOADED,
    // so a server that ignored sortModel would hand back page 2 from an
    // unsorted set and the list would be right inside each page and wrong
    // across them. The grid still orders what it renders — there is no
    // pass-through mode that defers ordering to the server.
    const dataSource = {
      getRows({ page, pageSize, sortModel, search }) {
        return new Promise((resolve) => {
          setTimeout(() => {
            let rows = db
            if (search) {
              const q = search.toLowerCase()
              rows = rows.filter((r) =>
                r.account.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q))
            }
            if (sortModel && sortModel.length) {
              const { columnId, direction } = sortModel[0]
              const dir = direction === 'desc' ? -1 : 1
              rows = rows.slice().sort((a, b) => {
                const x = a[columnId], y = b[columnId]
                if (x === y) return 0
                return (x > y ? 1 : -1) * dir
              })
            }
            const start = (page - 1) * pageSize
            resolve({
              rows: rows.slice(start, start + pageSize),
              totalCount: rows.length,
            })
          }, 350)
        })
      },
    }

    // ── Renderers ─────────────────────────────────────────────────
    const planCell = (v) =>
      h('span', { className: 'plan plan-' + String(v).toLowerCase() }, String(v).toUpperCase())

    const healthCell = (v) => {
      const n = Number(v)
      const colour = n >= 70 ? '#16a34a' : n >= 45 ? '#d97706' : '#dc2626'
      return h('div', { className: 'health' },
        h('div', { className: 'health-bar' },
          h('div', { className: 'health-fill',
                     style: { width: n + '%', background: colour } }),
        ),
        h('span', { className: 'health-num' }, n),
      )
    }

    // ── The surrounding dashboard ─────────────────────────────────
    const totalMrr = db.reduce((s, r) => s + r.mrr, 0)
    const totalSeats = db.reduce((s, r) => s + r.seats, 0)
    const atRisk = db.filter((r) => r.health < 45).length

    const KPIS = [
      ['Monthly recurring', usd(totalMrr), '+4.8%', true],
      ['Accounts', num(TOTAL), '+112', true],
      ['Seats licensed', num(totalSeats), '+2.1%', true],
      ['At-risk accounts', num(atRisk), '-6', false],
    ]

    // A deterministic 28-week shape — decoration, but decoration that must
    // not look random.
    const BARS = Array.from({ length: 28 }, (_, i) =>
      38 + Math.round(42 * (0.5 + 0.5 * Math.sin(i / 3.1)) * (0.7 + (i / 28) * 0.5)))

    function Head() {
      return h('div', { className: 'dash-head' },
        h('div', { className: 'kpis' },
          KPIS.map(([k, v, d, up]) =>
            h('div', { className: 'kpi', key: k },
              h('div', { className: 'kpi-k' }, k),
              h('div', { className: 'kpi-v' }, v),
              h('div', { className: 'kpi-d ' + (up ? 'kpi-up' : 'kpi-down') },
                (up ? '▲ ' : '▼ ') + d + ' vs last month'),
            ),
          ),
        ),
        h('div', { className: 'spark-row' },
          BARS.map((b, i) =>
            h('div', { className: 'spark-col', key: i, style: { height: b + '%' } })),
        ),
      )
    }

    const columns = [
      { field: 'account', header: 'Account',
        size: { flex: 1, minWidth: 210 },
        display: { pinned: 'left' },
        filter: { type: 'text' } },
      { field: 'plan', header: 'Plan',
        size: { width: 128 },
        display: { cellRenderer: planCell } },
      { field: 'seats', header: 'Seats',
        size: { width: 100 },
        display: { formatter: num, cellClass: 'num' } },
      { field: 'mrr', header: 'MRR',
        size: { width: 116 },
        display: { formatter: usd, cellClass: 'num' } },
      { field: 'health', header: 'Health',
        size: { width: 130 },
        display: { cellRenderer: healthCell, exportFormatter: (v) => String(v) } },
      { field: 'owner', header: 'Owner', size: { width: 150 } },
      { field: 'signup', header: 'Signed up', size: { width: 126 } },
      { field: 'lastSeen', header: 'Last seen',
        size: { width: 118 },
        display: { cellClass: 'num' } },
    ]

    let api = null

    const grid = createGrid({
      // InfiniteScrollModule on top of AllModules — it is not inside it,
      // because it replaces the row model and no grid should get that by
      // accident.
      modules: [AllModules, InfiniteScrollModule],
      columns,
      dataSource,
      rowId: 'id',
      infiniteScroll: { threshold: 15, pageSize: 60 },
      sorting: { enabled: true, multiSort: false },
      filtering: { enabled: true, searchBar: true, searchPlaceholder: 'Search accounts…' },
      appearance: { rowHeight: 42, headerHeight: 36, rowStriping: true },
      export: { filename: 'elitegrid-accounts', scope: 'all' },
      events: {
        onReady: (a) => { api = a; ready({ rowCount: TOTAL }) },
      },
    })

    createRoot(mountEl).render(
      h('div', { className: 'dash' },
        h(Head),
        h('div', { className: 'dash-grid' }, h(Grid, { grid })),
      ),
    )

    onMessage('EXPORT_CSV', () =>
      api && api.exportCSV({ filename: 'elitegrid-accounts', scope: 'all' }))
`

export const dashboard: Demo = {
  slug: 'saas-dashboard',
  css: CSS,
  script: SCRIPT,
}
