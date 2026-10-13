import type { Demo } from './shell'

// Trading blotter — the grouping and aggregation showcase.
//
// Static data, deliberately. The crypto tile already carries the "it moves"
// argument, and what this one has to show is structure: a book of positions
// folded into sectors, each sector totalling its own notional and P&L, a
// grand total under the lot, header bands over the column families, and the
// fills behind any position one click away.
//
//   grouping.model + value.aggregate   sector sections with real sums
//   grouping.grandTotal: 'bottom'      a total that re-totals under a filter
//   ColumnGroupDef children            header bands holding real ColumnDefs
//   rowDetail.renderer                 the fills behind a position
//   display.pinned                     symbol stays while you scroll right

const CSS = `
  .inst { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .inst-tag {
    width: 30px; height: 22px; border-radius: 4px; flex-shrink: 0;
    display: grid; place-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.625rem; font-weight: 600; color: #fff;
  }
  .inst-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
  .inst-sym { font-weight: 600; font-size: 0.8125rem; }
  .inst-name {
    font-size: 0.6875rem; color: var(--eg-muted-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* P&L reads as a column of signed numbers, so colour carries the sign and
     the digits stay aligned. */
  .yg-cell.pnl { justify-content: flex-end; }
  .pnl-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8125rem; font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .pnl-pos { color: #16a34a; }
  .pnl-neg { color: #dc2626; }
  [data-theme='dark'] .pnl-pos { color: #4ade80; }
  [data-theme='dark'] .pnl-neg { color: #f87171; }

  .side {
    font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
    padding: 2px 6px; border-radius: 4px;
  }
  .side-long  { color: #0369a1; background: rgba(3,105,161,0.10); }
  .side-short { color: #b45309; background: rgba(180,83,9,0.10); }
  [data-theme='dark'] .side-long  { color: #7dd3fc; background: rgba(125,211,252,0.12); }
  [data-theme='dark'] .side-short { color: #fcd34d; background: rgba(252,211,77,0.12); }

  /* ── Detail panel: the fills behind a position ────────────── */
  .fills { padding: 14px 18px; background: var(--eg-row-striped-bg); }
  .fills-title {
    font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--eg-muted-text); margin-bottom: 8px;
  }
  .fills-table { width: 100%; border-collapse: collapse; }
  .fills-table th {
    text-align: left; font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--eg-muted-text); padding: 4px 10px 4px 0;
  }
  .fills-table td {
    font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
    color: var(--eg-cell-text); padding: 3px 10px 3px 0;
    border-top: 1px solid var(--eg-border);
    font-variant-numeric: tabular-nums;
  }
  .fills-table td:first-child { font-family: 'DM Sans', sans-serif; }
  .fills-num { text-align: right; }
`

const SCRIPT = `
    const h = React.createElement

    // ── The book ──────────────────────────────────────────────────
    const SECTORS = {
      Technology: [
        ['AAPL','Apple Inc.'], ['MSFT','Microsoft Corp.'], ['NVDA','NVIDIA Corp.'],
        ['AVGO','Broadcom Inc.'], ['ORCL','Oracle Corp.'], ['CRM','Salesforce Inc.'],
        ['ADBE','Adobe Inc.'], ['AMD','Advanced Micro Devices'], ['INTC','Intel Corp.'],
        ['CSCO','Cisco Systems'], ['TXN','Texas Instruments'], ['QCOM','Qualcomm Inc.'],
      ],
      Financials: [
        ['JPM','JPMorgan Chase'], ['BAC','Bank of America'], ['WFC','Wells Fargo'],
        ['GS','Goldman Sachs'], ['MS','Morgan Stanley'], ['BLK','BlackRock Inc.'],
        ['SCHW','Charles Schwab'], ['AXP','American Express'], ['C','Citigroup Inc.'],
      ],
      Healthcare: [
        ['UNH','UnitedHealth Group'], ['JNJ','Johnson & Johnson'], ['LLY','Eli Lilly & Co.'],
        ['ABBV','AbbVie Inc.'], ['MRK','Merck & Co.'], ['PFE','Pfizer Inc.'],
        ['TMO','Thermo Fisher'], ['ABT','Abbott Laboratories'],
      ],
      Energy: [
        ['XOM','Exxon Mobil'], ['CVX','Chevron Corp.'], ['COP','ConocoPhillips'],
        ['SLB','Schlumberger NV'], ['EOG','EOG Resources'], ['PSX','Phillips 66'],
      ],
      'Consumer Disc.': [
        ['AMZN','Amazon.com Inc.'], ['TSLA','Tesla Inc.'], ['HD','Home Depot'],
        ['MCD','McDonald\\'s Corp.'], ['NKE','Nike Inc.'], ['SBUX','Starbucks Corp.'],
        ['LOW','Lowe\\'s Companies'],
      ],
      Industrials: [
        ['CAT','Caterpillar Inc.'], ['BA','Boeing Co.'], ['HON','Honeywell Intl.'],
        ['UPS','United Parcel Service'], ['GE','General Electric'], ['LMT','Lockheed Martin'],
        ['DE','Deere & Co.'],
      ],
      'Consumer Staples': [
        ['PG','Procter & Gamble'], ['KO','Coca-Cola Co.'], ['PEP','PepsiCo Inc.'],
        ['COST','Costco Wholesale'], ['WMT','Walmart Inc.'], ['MDLZ','Mondelez Intl.'],
      ],
      Utilities: [
        ['NEE','NextEra Energy'], ['DUK','Duke Energy'], ['SO','Southern Co.'],
        ['AEP','American Electric'], ['D','Dominion Energy'],
      ],
    }

    const HUE = {
      Technology: 215, Financials: 160, Healthcare: 340, Energy: 25,
      'Consumer Disc.': 280, Industrials: 200, 'Consumer Staples': 120, Utilities: 45,
    }

    const TRADERS = ['K. Oyelaran','M. Santos','R. Whitfield','A. Haddad','J. Lindqvist','P. Nakamura']
    const VENUES = ['NYSE','NASDAQ','ARCA','BATS','IEX']

    // Seeded, so the opening book is identical on every load.
    let seed = 90210
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

    const positions = []
    let pid = 0
    for (const [sector, names] of Object.entries(SECTORS)) {
      for (const [symbol, name] of names) {
        const side = rnd() > 0.26 ? 'Long' : 'Short'
        const qty = (1 + Math.floor(rnd() * 40)) * 100 * (side === 'Short' ? -1 : 1)
        const avgPx = 18 + rnd() * 420
        const lastPx = avgPx * (1 + (rnd() - 0.47) * 0.16)
        const unrealized = (lastPx - avgPx) * qty
        const realized = (rnd() - 0.42) * 14000

        // The fills that built the position — the detail panel's content, and
        // the reason avgPx is what it is.
        const fillCount = 2 + Math.floor(rnd() * 4)
        const fills = []
        for (let f = 0; f < fillCount; f++) {
          fills.push({
            time: String(9 + Math.floor(rnd() * 7)).padStart(2, '0') + ':' +
                  String(Math.floor(rnd() * 60)).padStart(2, '0'),
            venue: VENUES[Math.floor(rnd() * VENUES.length)],
            qty: Math.round(qty / fillCount),
            px: avgPx * (1 + (rnd() - 0.5) * 0.02),
          })
        }

        positions.push({
          id: 'P' + (++pid),
          symbol, name, sector, side, qty,
          avgPx, lastPx,
          unrealized,
          realized,
          dayPnl: unrealized * (0.1 + rnd() * 0.5),
          exposure: Math.abs(qty) * lastPx,
          beta: 0.45 + rnd() * 1.5,
          trader: TRADERS[Math.floor(rnd() * TRADERS.length)],
          fills,
        })
      }
    }

    // ── Formatters ────────────────────────────────────────────────
    const usd0 = (v) => {
      const n = Number(v)
      const s = n < 0 ? '-' : ''
      return s + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
    }
    const usd2 = (v) => '$' + Number(v).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })
    const qtyFmt = (v) => Number(v).toLocaleString('en-US')
    const money = (v) => {
      const n = Number(v)
      if (Math.abs(n) >= 1e6) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1e6).toFixed(2) + 'M'
      if (Math.abs(n) >= 1e3) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1e3).toFixed(1) + 'K'
      return usd0(n)
    }

    // ── Renderers ─────────────────────────────────────────────────
    const instCell = (_v, row) =>
      h('div', { className: 'inst' },
        h('div', {
          className: 'inst-tag',
          style: { background: 'hsl(' + (HUE[row.sector] ?? 220) + ' 62% 46%)' },
        }, row.symbol.slice(0, 4)),
        h('div', { className: 'inst-text' },
          h('span', { className: 'inst-sym' }, row.symbol),
          h('span', { className: 'inst-name' }, row.name),
        ),
      )

    const sideCell = (v) =>
      h('span', { className: 'side side-' + String(v).toLowerCase() }, String(v).toUpperCase())

    // One renderer for every signed-money column, including the group and
    // grand-total rows: those pass the AGGREGATED number through the same
    // column config, so the totals are coloured by sign exactly like a leaf.
    const pnlCell = (v) => {
      const n = Number(v)
      if (!Number.isFinite(n)) return h('span', { className: 'pnl-val' }, '')
      return h('span', {
        className: 'pnl-val ' + (n >= 0 ? 'pnl-pos' : 'pnl-neg'),
      }, money(n))
    }

    const fillsPanel = ({ row }) =>
      h('div', { className: 'fills' },
        h('div', { className: 'fills-title' },
          row.symbol + ' — ' + row.fills.length + ' fills · ' + row.trader),
        h('table', { className: 'fills-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Venue'),
              h('th', null, 'Time'),
              h('th', { className: 'fills-num' }, 'Qty'),
              h('th', { className: 'fills-num' }, 'Price'),
              h('th', { className: 'fills-num' }, 'Value'),
            ),
          ),
          h('tbody', null,
            row.fills.map((f, i) =>
              h('tr', { key: i },
                h('td', null, f.venue),
                h('td', null, f.time),
                h('td', { className: 'fills-num' }, qtyFmt(f.qty)),
                h('td', { className: 'fills-num' }, usd2(f.px)),
                h('td', { className: 'fills-num' }, usd0(f.qty * f.px)),
              ),
            ),
          ),
        ),
      )

    // ── Columns, as header bands ──────────────────────────────────
    // A group holds the real ColumnDef objects, not field-name strings, so
    // renaming a column is a rename the compiler follows rather than a column
    // silently dropping out of its band.
    const columns = [
      { field: 'symbol', header: 'Instrument',
        size: { width: 200 },
        display: { pinned: 'left', cellRenderer: instCell, tooltip: (_v, r) => r.name },
        filter: { type: 'text' } },

      { field: 'sector', header: 'Sector', size: { width: 150 }, filter: { type: 'set' } },

      {
        header: 'Position',
        children: [
          { field: 'side', header: 'Side',
            size: { width: 86 },
            display: { cellRenderer: sideCell },
            filter: { type: 'set' } },
          { field: 'qty', header: 'Quantity',
            size: { width: 110 },
            display: { formatter: qtyFmt, cellClass: 'num' },
            value: { aggregate: 'sum' },
            filter: { type: 'number' } },
          { field: 'avgPx', header: 'Avg Price',
            size: { width: 110 },
            display: { formatter: usd2, cellClass: 'num' } },
          { field: 'lastPx', header: 'Last',
            size: { width: 110 },
            display: { formatter: usd2, cellClass: 'num' } },
        ],
      },

      {
        header: 'P&L',
        children: [
          { field: 'dayPnl', header: 'Day',
            size: { width: 118 },
            display: { cellRenderer: pnlCell, cellClass: 'pnl',
                       exportFormatter: (v) => Number(v).toFixed(2) },
            value: { aggregate: 'sum' } },
          { field: 'unrealized', header: 'Unrealized',
            size: { width: 128 },
            display: { cellRenderer: pnlCell, cellClass: 'pnl',
                       exportFormatter: (v) => Number(v).toFixed(2) },
            value: { aggregate: 'sum' } },
          { field: 'realized', header: 'Realized',
            size: { width: 118 },
            display: { cellRenderer: pnlCell, cellClass: 'pnl',
                       exportFormatter: (v) => Number(v).toFixed(2) },
            value: { aggregate: 'sum' } },
        ],
      },

      {
        header: 'Risk',
        children: [
          { field: 'exposure', header: 'Exposure',
            size: { width: 124 },
            display: { formatter: money, cellClass: 'num' },
            value: { aggregate: 'sum' } },
          { field: 'beta', header: 'Beta',
            size: { width: 92 },
            display: { formatter: (v) => Number(v).toFixed(2), cellClass: 'num' },
            // Averaged, not summed: a book's beta is not the sum of its
            // positions' betas, and a column with no aggregate would render
            // blank rather than wrong.
            value: { aggregate: 'avg' } },
        ],
      },

      { field: 'trader', header: 'Trader', size: { width: 150 }, filter: { type: 'set' } },
    ]

    let api = null

    const grid = createGrid({
      modules: [AllModules],
      columns,
      data: positions,
      rowId: 'id',
      sorting: { enabled: true, multiSort: true },
      filtering: { enabled: true, searchBar: true, searchPlaceholder: 'Search the book…' },
      grouping: {
        model: ['sector'],
        expandedByDefault: 1,
        showCounts: true,
        // A grand total over every FILTERED leaf — so it re-totals as soon as
        // anyone filters, rather than being a row someone computed once.
        grandTotal: 'bottom',
      },
      rowDetail: {
        renderer: fillsPanel,
        estimatedHeight: 150,
      },
      selection: { mode: 'multiple', showCheckboxes: true },
      appearance: { rowHeight: 44, headerHeight: 36, rowStriping: false },
      export: { filename: 'elitegrid-blotter', scope: 'filtered' },
      events: {
        onReady: (a) => {
          api = a
          ready({ rowCount: positions.length })
        },
      },
    })

    createRoot(mountEl).render(h(Grid, { grid }))

    onMessage('EXPORT_CSV', () =>
      api && api.exportCSV({ filename: 'elitegrid-blotter', scope: 'filtered' }))
`

export const trading: Demo = {
  slug: 'trading-blotter',
  css: CSS,
  script: SCRIPT,
}
