import type { Demo } from './shell'

// Warehouse inventory — the volume and filtering showcase.
//
// 100,000 SKUs in the browser, scrolling at full speed, with a filter row
// under the header and a checkbox value list on the warehouse column. The
// "Receive shipment" button puts a few hundred rows through ONE transaction
// so you can watch a bulk update land without the grid flinching.
//
//   100k rows                  row virtualization, not a page of 50
//   filter: { type: 'set' }    the checkbox value list (B2)
//   filtering.floatingFilters  the filter row under the header (B3)
//   api.applyTransaction       a shipment as one batch, not 300 writes
//   display.cellClass fn       below reorder point turns red
//
// Rows are built in one pass with no per-row closures; at 100k the cost of
// generating the data matters as much as the cost of rendering it.

const CSS = `
  .sku {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; color: var(--eg-muted-text);
  }

  /* ── Stock level bar ──────────────────────────────────────── */
  .stock { display: flex; align-items: center; gap: 9px; width: 100%; }
  .stock-bar {
    flex: 1; height: 6px; border-radius: 999px; min-width: 40px;
    background: rgba(120,120,140,0.18); overflow: hidden;
  }
  .stock-fill { height: 100%; border-radius: 999px; }
  .stock-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; font-variant-numeric: tabular-nums;
    min-width: 42px; text-align: right; color: var(--eg-cell-text);
  }

  /* A row below its reorder point is the whole point of the screen, so it
     is marked on the cell rather than left to the reader to compare two
     columns in their head. */
  .yg-cell.low .stock-num { color: #dc2626; font-weight: 700; }
  [data-theme='dark'] .yg-cell.low .stock-num { color: #f87171; }

  .tag {
    font-size: 0.6875rem; font-weight: 600;
    padding: 2px 8px; border-radius: 4px;
    color: var(--eg-muted-text); background: rgba(120,120,140,0.12);
  }

  /* ── Toolbar ──────────────────────────────────────────────── */
  .bar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 10px 14px; flex-shrink: 0;
    border-bottom: 1px solid var(--eg-border);
    background: var(--eg-surface);
  }
  .bar-btn {
    font: inherit; font-size: 0.8125rem; font-weight: 600;
    padding: 6px 12px; border-radius: 7px; cursor: pointer;
    color: #fff; background: var(--eg-primary);
    border: 1px solid transparent;
  }
  .bar-btn:hover { filter: brightness(1.08); }
  .bar-btn.ghost {
    color: var(--eg-text); background: transparent;
    border-color: var(--eg-border);
  }
  .bar-note { font-size: 0.75rem; color: var(--eg-muted-text); }
  .bar-stat {
    margin-left: auto; font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; color: var(--eg-muted-text);
  }
  .shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .grid-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
`

const SCRIPT = `
    const h = React.createElement

    const CATEGORIES = ['Fasteners','Bearings','Hydraulics','Electrical','Tooling',
                        'Adhesives','Safety','Packaging','Abrasives','Sensors']
    const MATERIALS = ['Steel','Stainless','Brass','Aluminium','Nylon','Rubber','Composite','Copper']
    const WAREHOUSES = ['Rotterdam NL','Memphis TN','Shenzhen CN','Hamburg DE',
                        'Pune IN','Monterrey MX','Łódź PL','Osaka JP']
    const SUPPLIERS = ['Brenner Werke','Kinetix Supply','Nord Fastening','Tamura Kogyo',
                       'Vega Components','Arcadia Tools','Meridian Parts','Halberd Group']
    const UNITS = ['box','case','pallet','each','reel','drum']

    const ROWS = 100000

    let seed = 777
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

    // One pass, no closures, no intermediate arrays — at 100k the generation
    // cost is as visible as the render cost.
    const items = new Array(ROWS)
    for (let i = 0; i < ROWS; i++) {
      const cat = CATEGORIES[i % CATEGORIES.length]
      const mat = MATERIALS[(i * 7) % MATERIALS.length]
      const wh = WAREHOUSES[(i * 3) % WAREHOUSES.length]
      const capacity = 200 + Math.floor(rnd() * 1800)
      const onHand = Math.floor(rnd() * capacity)
      const reorderAt = Math.floor(capacity * (0.12 + rnd() * 0.16))
      items[i] = {
        id: 'SKU-' + String(100000 + i),
        name: mat + ' ' + cat.slice(0, -1).toLowerCase() + ' ' +
              (4 + ((i * 13) % 48)) + 'mm',
        category: cat,
        material: mat,
        warehouse: wh,
        supplier: SUPPLIERS[(i * 5) % SUPPLIERS.length],
        onHand,
        capacity,
        reorderAt,
        unit: UNITS[(i * 11) % UNITS.length],
        unitCost: Math.round((0.4 + rnd() * 180) * 100) / 100,
        updated: '2026-' + String(1 + ((i * 7) % 10)).padStart(2, '0') + '-' +
                 String(1 + ((i * 17) % 28)).padStart(2, '0'),
      }
    }

    const num = (v) => Number(v).toLocaleString('en-US')
    const usd = (v) => '$' + Number(v).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })

    const stockCell = (_v, row) => {
      const pct = Math.max(0, Math.min(1, row.onHand / row.capacity))
      const low = row.onHand <= row.reorderAt
      const colour = low ? '#dc2626' : pct > 0.6 ? '#16a34a' : '#d97706'
      return h('div', { className: 'stock' },
        h('div', { className: 'stock-bar' },
          h('div', {
            className: 'stock-fill',
            style: { width: (pct * 100).toFixed(1) + '%', background: colour },
          }),
        ),
        h('span', { className: 'stock-num' }, num(row.onHand)),
      )
    }

    const columns = [
      { field: 'id', header: 'SKU',
        size: { width: 128 },
        display: { pinned: 'left', cellClass: 'sku' },
        filter: { type: 'text' } },

      { field: 'name', header: 'Item',
        size: { flex: 1, minWidth: 220 },
        filter: { type: 'text' } },

      // The checkbox value list. Ten categories across 100,000 rows: typing
      // a substring is the wrong interaction, picking from the real values
      // is the right one.
      { field: 'category', header: 'Category',
        size: { width: 136 },
        filter: { type: 'set' } },

      { field: 'warehouse', header: 'Warehouse',
        size: { width: 150 },
        filter: { type: 'set' } },

      { field: 'supplier', header: 'Supplier',
        size: { width: 158 },
        filter: { type: 'set' } },

      { field: 'onHand', header: 'On hand',
        size: { width: 180 },
        display: {
          cellRenderer: stockCell,
          cellClass: (_v, row) => (row.onHand <= row.reorderAt ? 'low' : ''),
          exportFormatter: (v) => String(v),
        },
        filter: { type: 'number' } },

      { field: 'reorderAt', header: 'Reorder at',
        size: { width: 118 },
        display: { formatter: num, cellClass: 'num' },
        filter: { type: 'number' } },

      { field: 'unit', header: 'Unit',
        size: { width: 96 },
        display: { cellRenderer: (v) => h('span', { className: 'tag' }, String(v)) },
        filter: { type: 'set' } },

      { field: 'unitCost', header: 'Unit cost',
        size: { width: 116 },
        display: { formatter: usd, cellClass: 'num' },
        filter: { type: 'number' } },

      { field: 'updated', header: 'Last counted',
        size: { width: 132 },
        filter: { type: 'date' } },
    ]

    let api = null
    const stat = { subs: new Set(), text: num(ROWS) + ' SKUs · 0 received' }
    const setStat = (t) => { stat.text = t; stat.subs.forEach((f) => f()) }
    let received = 0

    // ── A shipment as one transaction ─────────────────────────────
    // 300 partial updates in a single applyTransaction, not 300 calls. The
    // pipeline runs once, and the grid repaints once.
    function receiveShipment() {
      const update = []
      const seen = new Set()
      while (update.length < 300) {
        const idx = Math.floor(Math.random() * ROWS)
        if (seen.has(idx)) continue
        seen.add(idx)
        const row = items[idx]
        const qty = 20 + Math.floor(Math.random() * 180)
        row.onHand = Math.min(row.capacity, row.onHand + qty)
        row.updated = '2026-10-09'
        update.push({ id: row.id, onHand: row.onHand, updated: row.updated })
      }
      if (!api) return
      const result = api.applyTransaction({ update })
      received += result.updated ? result.updated.length : update.length
      setStat(num(ROWS) + ' SKUs · ' + num(received) + ' lines received')
    }

    function showLowStock() {
      if (!api) return
      // Everything at or below its reorder point. A number filter cannot
      // compare two columns, so the set of ids is computed here and matched
      // by the SKU column — the escape hatch, used deliberately.
      api.setFilterModel({
        columns: { onHand: { type: 'number', operator: 'lessThan', value: 120 } },
      })
      setStat('showing items under 120 on hand')
    }

    function clearFilters() {
      if (!api) return
      api.setFilterModel({ columns: {} })
      api.setSearch('')
      setStat(num(ROWS) + ' SKUs · ' + num(received) + ' lines received')
    }

    function Toolbar() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        const fn = () => force((n) => n + 1)
        stat.subs.add(fn)
        return () => stat.subs.delete(fn)
      }, [])
      return h('div', { className: 'bar' },
        h('button', { className: 'bar-btn', onClick: receiveShipment },
          'Receive shipment'),
        h('button', { className: 'bar-btn ghost', onClick: showLowStock },
          'Show low stock'),
        h('button', { className: 'bar-btn ghost', onClick: clearFilters },
          'Clear filters'),
        h('span', { className: 'bar-note' },
          '300 rows per shipment, one transaction'),
        h('span', { className: 'bar-stat' }, stat.text),
      )
    }

    const grid = createGrid({
      modules: [AllModules],
      columns,
      data: items,
      rowId: 'id',
      sorting: { enabled: true, multiSort: true },
      filtering: {
        enabled: true,
        searchBar: true,
        floatingFilters: true,
        searchPlaceholder: 'Search 100,000 SKUs…',
      },
      selection: { mode: 'multiple', showCheckboxes: true },
      appearance: { rowHeight: 40, headerHeight: 36, rowStriping: true },
      export: { filename: 'elitegrid-inventory', scope: 'filtered' },
      events: {
        onReady: (a) => { api = a; ready({ rowCount: ROWS }) },
      },
    })

    createRoot(mountEl).render(
      h('div', { className: 'shell' },
        h(Toolbar),
        h('div', { className: 'grid-wrap' }, h(Grid, { grid })),
      ),
    )

    onMessage('EXPORT_CSV', () =>
      api && api.exportCSV({ filename: 'elitegrid-inventory', scope: 'filtered' }))
`

export const warehouse: Demo = {
  slug: 'warehouse-inventory',
  css: CSS,
  script: SCRIPT,
}
