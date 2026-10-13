import type { Demo } from './shell'

// Crypto market table — the showcase hero.
//
// Chosen to lead the set because it is the only one that MOVES. A static grid
// screenshot proves nothing about a grid; 100 rows repricing twice a second
// with the changed cells flashing green and red is the whole pitch in one
// glance. Everything here is a real feature doing its real job:
//
//   display.flash: 'up-down'   price + the three % columns
//   api.applyTransaction()     the delta feed, ~20 rows per tick
//   display.cellRenderer       coin badge, % pill, sparkline
//   filtering.searchBar        the search input above the grid
//   sorting.multiSort          shift-click to stack sorts
//   display.pinned             rank and coin stay put while you scroll right
//
// Prices are SIMULATED, deliberately. A real Binance/CoinGecko feed means an
// API key or a rate limit, CORS, and a marketing page that goes blank when
// somebody else's service has an outage. A seeded random walk off realistic
// opening prices is indistinguishable at a glance, works offline, and keeps
// screenshots reproducible. Swapping in a real feed later is one function.

const CSS = `
  /* ── Layout: chart panel above, grid filling the rest ─────── */
  .shell { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .grid-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }

  .chart {
    flex-shrink: 0;
    border-bottom: 1px solid var(--eg-border);
    background: var(--eg-surface);
    padding: 12px 16px 0;
  }
  .chart-head { display: flex; align-items: center; gap: 10px; }
  .chart-id { display: flex; flex-direction: column; line-height: 1.25; }
  .chart-name { font-weight: 600; font-size: 0.875rem; color: var(--eg-text); }
  .chart-sym {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem; color: var(--eg-muted-text);
  }
  .chart-price { display: flex; align-items: center; gap: 8px; margin-left: 14px; }
  .chart-last {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.125rem; font-weight: 600; color: var(--eg-text);
    font-variant-numeric: tabular-nums;
  }
  .chart-hint {
    margin-left: auto; font-size: 0.6875rem; color: var(--eg-muted-text);
  }
  /* Fixed height + preserveAspectRatio:none — the path is drawn in a 1000-unit
     viewBox and stretched, so a resize never re-lays-out the series. */
  .chart-svg { display: block; width: 100%; height: 112px; }
  @media (max-width: 560px) { .chart-hint { display: none; } }

  /* ── Coin badge ───────────────────────────────────────────── */
  .coin {
    display: flex; align-items: center; gap: 10px;
    min-width: 0; width: 100%;
  }
  .coin-mark {
    width: 26px; height: 26px; border-radius: 50%;
    display: grid; place-items: center; flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.625rem; font-weight: 600; color: #fff;
    letter-spacing: -0.02em;
  }
  .coin-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
  .coin-sym  { font-weight: 600; font-size: 0.8125rem; letter-spacing: 0.02em; }
  .coin-name {
    font-size: 0.6875rem; color: var(--eg-muted-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ── Percent change pill ──────────────────────────────────── */
  .yg-cell.pct { justify-content: flex-end; }
  .pct-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; font-weight: 600;
    padding: 2px 7px; border-radius: 6px;
    display: inline-flex; align-items: center; gap: 3px;
    font-variant-numeric: tabular-nums;
  }
  .pct-up   { color: #16a34a; background: rgba(22,163,74,0.10); }
  .pct-down { color: #dc2626; background: rgba(220,38,38,0.10); }
  .pct-flat { color: var(--eg-muted-text); background: rgba(107,114,128,0.10); }
  [data-theme='dark'] .pct-up   { color: #4ade80; background: rgba(74,222,128,0.12); }
  [data-theme='dark'] .pct-down { color: #f87171; background: rgba(248,113,113,0.12); }

  /* ── Sparkline ────────────────────────────────────────────── */
  .yg-cell.spark { justify-content: center; }
  .spark-svg { display: block; overflow: visible; }

  /* No flash CSS here. The keyframes and the .yg-cell--flash-up/down classes
     live in the library's own styles.css, which the shell now links from
     /cdn/react.css — restating them locally was a copy that could drift from
     the adapter it imitates. Only the TOKENS are ours, and those are set on
     the root by the shell's theme table. */
`

const SCRIPT = `
    // ── The universe ──────────────────────────────────────────────
    // Symbol, name, opening price, circulating supply (millions), hue.
    const COINS = [
      ['BTC','Bitcoin',67420,19.8,28],      ['ETH','Ethereum',3285,120.2,228],
      ['USDT','Tether',1.0,112000,168],     ['BNB','BNB',584,145.9,45],
      ['SOL','Solana',172.4,462.1,276],     ['XRP','XRP',0.524,55400,205],
      ['USDC','USD Coin',1.0,33600,210],    ['ADA','Cardano',0.448,35300,215],
      ['AVAX','Avalanche',27.9,408.2,0],    ['DOGE','Dogecoin',0.1284,144500,48],
      ['TRX','TRON',0.1176,86700,355],      ['DOT','Polkadot',6.12,1450,320],
      ['LINK','Chainlink',14.86,608.1,220], ['MATIC','Polygon',0.5218,9280,270],
      ['TON','Toncoin',5.42,3470,200],      ['ICP','Internet Computer',10.24,470,290],
      ['SHIB','Shiba Inu',0.0000176,589000,18],
      ['LTC','Litecoin',72.4,74.6,210],     ['BCH','Bitcoin Cash',378,19.7,86],
      ['UNI','Uniswap',7.82,600,330],       ['ATOM','Cosmos',7.94,390,250],
      ['XLM','Stellar',0.1082,29100,195],   ['NEAR','NEAR Protocol',4.68,1100,0],
      ['APT','Aptos',8.14,540,180],         ['FIL','Filecoin',4.32,580,190],
      ['HBAR','Hedera',0.0724,35600,260],   ['ARB','Arbitrum',0.782,2890,210],
      ['OP','Optimism',1.684,1070,0],       ['VET','VeChain',0.0268,72700,180],
      ['INJ','Injective',21.4,88.7,200],    ['SUI','Sui',1.142,2420,205],
      ['SEI','Sei',0.428,3100,350],         ['RNDR','Render',7.26,390,300],
      ['IMX','Immutable',1.542,1480,195],   ['AAVE','Aave',92.6,14.8,315],
      ['GRT','The Graph',0.1724,9480,280],  ['ALGO','Algorand',0.1382,8100,0],
      ['FTM','Fantom',0.4284,2800,205],     ['SAND','The Sandbox',0.3186,2280,200],
      ['MANA','Decentraland',0.3824,1900,20],
      ['AXS','Axie Infinity',5.84,146,215], ['THETA','Theta Network',1.482,1000,160],
      ['FLOW','Flow',0.6248,1480,145],      ['EGLD','MultiversX',31.2,27.6,215],
      ['XTZ','Tezos',0.8142,980,220],       ['CHZ','Chiliz',0.0824,8900,5],
      ['CRV','Curve DAO',0.2842,1210,340],  ['LDO','Lido DAO',1.824,890,195],
      ['SNX','Synthetix',1.924,328,250],    ['COMP','Compound',48.2,8.9,150],
      ['MKR','Maker',2412,0.92,165],        ['ENS','ENS',24.8,32,220],
      ['DYDX','dYdX',1.284,600,255],        ['GMX','GMX',28.4,9.6,210],
      ['PEPE','Pepe',0.0000084,420700,110], ['WIF','dogwifhat',2.482,999,40],
      ['BONK','Bonk',0.0000248,68900,30],   ['FLOKI','Floki',0.0001684,9650,25],
      ['JUP','Jupiter',0.9242,1350,180],    ['PYTH','Pyth Network',0.4182,1500,265],
      ['TIA','Celestia',6.42,180,285],      ['STX','Stacks',1.824,1470,25],
      ['KAS','Kaspa',0.1542,24200,170],     ['ORDI','ORDI',38.4,21,35],
      ['WLD','Worldcoin',2.142,290,0],      ['BLUR','Blur',0.2484,2340,250],
      ['ROSE','Oasis Network',0.0842,6700,195],
      ['ONE','Harmony',0.0164,13500,175],   ['ZIL','Zilliqa',0.0184,17300,185],
      ['ENJ','Enjin Coin',0.2142,1680,255], ['BAT','Basic Attention',0.1842,1490,15],
      ['ZRX','0x Protocol',0.3242,847,230], ['QNT','Quant',82.4,12.1,270],
      ['KSM','Kusama',24.2,15.9,330],       ['WAVES','Waves',1.942,118,215],
      ['DASH','Dash',28.6,11.8,205],        ['ZEC','Zcash',22.4,15.4,42],
      ['XMR','Monero',148.2,18.4,25],       ['EOS','EOS',0.6184,1100,240],
      ['IOTA','IOTA',0.1842,2800,190],      ['NEO','Neo',11.42,70.5,140],
      ['XEM','NEM',0.0284,9000,200],        ['ICX','ICON',0.1584,970,195],
      ['ONT','Ontology',0.1842,875,185],    ['QTUM','Qtum',2.482,105,200],
      ['LSK','Lisk',0.9424,143,215],        ['SC','Siacoin',0.0062,56400,145],
      ['DGB','DigiByte',0.0084,17200,205],  ['RVN','Ravencoin',0.0184,13900,35],
      ['CELO','Celo',0.6842,540,90],        ['KAVA','Kava',0.4284,1080,0],
      ['BAND','Band Protocol',1.284,140,215],
      ['OCEAN','Ocean Protocol',0.5184,620,290],
      ['FET','Fetch.ai',1.342,840,195],     ['AGIX','SingularityNET',0.5842,1250,270],
      ['NMR','Numeraire',14.82,6.1,210],    ['STORJ','Storj',0.4842,400,200],
      ['ANKR','Ankr',0.0284,10200,215],     ['SKL','SKALE',0.0484,5600,200],
      ['CTSI','Cartesi',0.1684,790,195],
    ]
    // Exactly 100 — the tile copy and the search placeholder both say so, and
    // a verification pass asserts it rather than trusting the count by eye.

    // A seeded PRNG, not Math.random: the opening snapshot has to be identical
    // on every load, or the poster image and the live grid disagree and the
    // tile looks broken.
    let seed = 1337
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

    const SPARK_POINTS = 28

    function makeRow([sym, name, price, supplyM, hue], i) {
      // Walk a 7d history BACKWARDS off the opening price so the sparkline and
      // the 7d % always agree — deriving one from the other is where these
      // tables normally start lying.
      const hist = [price]
      for (let k = 1; k < SPARK_POINTS; k++) {
        hist.unshift(hist[0] / (1 + (rnd() - 0.5) * 0.045))
      }
      const supply = supplyM * 1e6
      return {
        id: sym,
        rank: i + 1,
        symbol: sym,
        name,
        hue,
        price,
        prev: price,
        h1: (rnd() - 0.48) * 3.2,
        h24: (rnd() - 0.46) * 9.5,
        d7: ((price - hist[0]) / hist[0]) * 100,
        marketCap: price * supply,
        volume: price * supply * (0.02 + rnd() * 0.14),
        supply,
        spark: hist,
      }
    }

    const rows = COINS.map(makeRow)

    // ── Formatters ────────────────────────────────────────────────
    // A crypto table spans eight orders of magnitude — BTC at 67,000 and SHIB
    // at 0.0000176 cannot share one precision. Significant digits, not fixed
    // decimals.
    const price = (v) => {
      const n = Number(v)
      if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      if (n >= 1)    return '$' + n.toFixed(2)
      if (n >= 0.01) return '$' + n.toFixed(4)
      return '$' + n.toFixed(8).replace(/0+$/, '')
    }
    const big = (v) => {
      const n = Number(v)
      if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
      if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B'
      if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M'
      return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }
    const units = (v) => {
      const n = Number(v)
      if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
      return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }

    // ── Renderers ─────────────────────────────────────────────────
    const h = React.createElement

    const coinCell = (_v, row) =>
      h('div', { className: 'coin' },
        h('div', {
          className: 'coin-mark',
          style: { background: 'hsl(' + row.hue + ' 72% 48%)' },
        }, row.symbol.slice(0, 3)),
        h('div', { className: 'coin-text' },
          h('span', { className: 'coin-sym' }, row.symbol),
          h('span', { className: 'coin-name' }, row.name),
        ),
      )

    const pctCell = (v) => {
      const n = Number(v)
      const dir = n > 0.01 ? 'up' : n < -0.01 ? 'down' : 'flat'
      return h('span', { className: 'pct-pill pct-' + dir },
        dir === 'up' ? '▲' : dir === 'down' ? '▼' : '',
        Math.abs(n).toFixed(2) + '%',
      )
    }

    const sparkCell = (_v, row) => {
      const pts = row.spark
      let lo = Infinity, hi = -Infinity
      for (const p of pts) { if (p < lo) lo = p; if (p > hi) hi = p }
      const span = hi - lo || 1
      const W = 96, H = 26
      const d = pts
        .map((p, i) => {
          const x = (i / (pts.length - 1)) * W
          const y = H - ((p - lo) / span) * H
          return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
        })
        .join(' ')
      const rising = pts[pts.length - 1] >= pts[0]
      const stroke = rising ? '#16a34a' : '#dc2626'
      return h('svg', { className: 'spark-svg', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' },
        h('path', { d, fill: 'none', stroke, strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round' }),
      )
    }

    // ── Columns ───────────────────────────────────────────────────
    const columns = [
      { field: 'rank', header: '#',
        size: { width: 56 },
        display: { pinned: 'left', cellClass: 'num' } },

      { field: 'symbol', header: 'Coin',
        size: { width: 190 },
        display: { pinned: 'left', cellRenderer: coinCell, tooltip: (_v, r) => r.name },
        filter: { type: 'text' } },

      { field: 'price', header: 'Price',
        size: { width: 130 },
        display: { formatter: price, cellClass: 'num', flash: 'up-down' },
        filter: { type: 'number' } },

      { field: 'h1', header: '1h %',
        size: { width: 100 },
        display: { cellRenderer: pctCell, cellClass: 'pct', flash: 'up-down',
                   exportFormatter: (v) => Number(v).toFixed(2) + '%' } },

      { field: 'h24', header: '24h %',
        size: { width: 100 },
        display: { cellRenderer: pctCell, cellClass: 'pct', flash: 'up-down',
                   exportFormatter: (v) => Number(v).toFixed(2) + '%' } },

      { field: 'd7', header: '7d %',
        size: { width: 100 },
        display: { cellRenderer: pctCell, cellClass: 'pct',
                   exportFormatter: (v) => Number(v).toFixed(2) + '%' } },

      { field: 'marketCap', header: 'Market Cap',
        size: { width: 130 },
        display: { formatter: big, cellClass: 'num' },
        filter: { type: 'number' } },

      { field: 'volume', header: 'Volume 24h',
        size: { width: 130 },
        display: { formatter: big, cellClass: 'num' },
        filter: { type: 'number' } },

      { field: 'supply', header: 'Circulating',
        size: { width: 120 },
        display: { formatter: units, cellClass: 'num' } },

      { field: 'spark', header: 'Last 7d',
        size: { width: 120 },
        display: { cellRenderer: sparkCell, cellClass: 'spark' },
        // An array of 28 floats has no meaningful order, so the header must
        // not offer one.
        sort: { enabled: false } },
    ]

    // ── Live chart ────────────────────────────────────────────────
    // A panel above the grid tracking one coin. Click a row to follow it.
    //
    // It exists to show the grid COMPOSING: a real screen is never a grid
    // alone, and the thing most people need to see is the table driving the
    // rest of the page. The chart reads the same tick the grid does.
    const CHART_POINTS = 90
    const chartSubs = new Set()
    const notifyChart = () => chartSubs.forEach((f) => f())

    let selected = null
    let history = []

    function selectCoin(id) {
      if (id === selected) return
      const row = rows.find((r) => r.id === id)
      if (!row) return
      selected = id
      // Seeded from the 7d series, so the chart is never an empty box waiting
      // for its first tick — it opens with the history the sparkline already
      // showed, and live points push onto the end of that.
      history = row.spark.slice()
      notifyChart()
    }

    selectCoin('BTC')

    function MarketChart() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        const fn = () => force((n) => n + 1)
        chartSubs.add(fn)
        return () => chartSubs.delete(fn)
      }, [])

      const row = rows.find((r) => r.id === selected) || rows[0]
      const pts = history.length > 1 ? history : row.spark
      let lo = Infinity, hi = -Infinity
      for (const p of pts) { if (p < lo) lo = p; if (p > hi) hi = p }
      const span = hi - lo || Math.abs(hi) || 1
      const W = 1000, H = 112, PAD = 6

      const xy = (p, i) => [
        (i / Math.max(pts.length - 1, 1)) * W,
        PAD + (1 - (p - lo) / span) * (H - PAD * 2),
      ]
      const line = pts.map((p, i) => {
        const [x, y] = xy(p, i)
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
      }).join(' ')
      const [lastX, lastY] = xy(pts[pts.length - 1], pts.length - 1)
      const area = line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z'

      const rising = pts[pts.length - 1] >= pts[0]
      const stroke = rising ? '#16a34a' : '#dc2626'
      const changePct = ((pts[pts.length - 1] - pts[0]) / pts[0]) * 100

      return h('div', { className: 'chart' },
        h('div', { className: 'chart-head' },
          h('div', {
            className: 'coin-mark',
            style: { background: 'hsl(' + row.hue + ' 72% 48%)' },
          }, row.symbol.slice(0, 3)),
          h('div', { className: 'chart-id' },
            h('span', { className: 'chart-name' }, row.name),
            h('span', { className: 'chart-sym' }, row.symbol + ' · live'),
          ),
          h('div', { className: 'chart-price' },
            h('span', { className: 'chart-last' }, price(row.price)),
            h('span', {
              className: 'pct-pill pct-' + (changePct >= 0 ? 'up' : 'down'),
            }, (changePct >= 0 ? '▲' : '▼') + Math.abs(changePct).toFixed(2) + '%'),
          ),
          h('span', { className: 'chart-hint' }, 'Click any row to follow it'),
        ),
        h('svg', {
          className: 'chart-svg', viewBox: '0 0 ' + W + ' ' + H,
          preserveAspectRatio: 'none', 'aria-hidden': 'true',
        },
          h('defs', null,
            h('linearGradient', { id: 'cg', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0%', stopColor: stroke, stopOpacity: 0.26 }),
              h('stop', { offset: '100%', stopColor: stroke, stopOpacity: 0 }),
            ),
          ),
          h('path', { d: area, fill: 'url(#cg)' }),
          h('path', {
            d: line, fill: 'none', stroke, strokeWidth: 2,
            vectorEffect: 'non-scaling-stroke',
            strokeLinejoin: 'round', strokeLinecap: 'round',
          }),
          h('circle', { cx: lastX, cy: lastY, r: 3.5, fill: stroke,
                        vectorEffect: 'non-scaling-stroke' }),
        ),
      )
    }

    let api = null

    const grid = createGrid({
      modules: [AllModules],
      columns,
      data: rows,
      // Symbols are the natural key, and flash NEEDS a stable row identity:
      // without it every tick looks like a brand new row and nothing flashes.
      rowId: 'id',
      sorting: { enabled: true, multiSort: true },
      filtering: { enabled: true, searchBar: true, searchPlaceholder: 'Search 100 coins…' },
      appearance: {
        rowHeight: 48,
        headerHeight: 38,
        showHoverHighlight: true,
        flash: { enabled: true, duration: 700 },
      },
      export: { filename: 'elitegrid-crypto', scope: 'filtered' },
      events: {
        onRowClick: (row) => selectCoin(row.id),
        onReady: (a) => {
          api = a
          // There is no \`sorting.initial\` option — the opening sort is an
          // api.setSortModel() call, keyed by columnId.
          //
          // Sorted by RANK, not marketCap, and that choice is load-bearing.
          // Market cap is recomputed from the price on every tick, so sorting
          // by it meant the sort genuinely reordered twice a second: rows
          // visibly swapped places while you were reading them. Rank is
          // assigned once and never updated — which is also how every real
          // market table behaves, since a coin's rank does not change twice a
          // second either. Sorting by a live column is still available; it
          // just is not what the demo opens on.
          a.setSortModel([{ columnId: 'rank', direction: 'asc' }])
          ready({ rowCount: rows.length })
        },
      },
    })

    const root = createRoot(mountEl)
    root.render(
      h('div', { className: 'shell' },
        h(MarketChart),
        h('div', { className: 'grid-wrap' }, h(Grid, { grid })),
      ),
    )

    // ── The feed ──────────────────────────────────────────────────
    // One applyTransaction per tick carrying ~18 partial rows. Partial is the
    // point: \`{ id, price, h1, ... }\` MERGES, so prev/spark/name survive
    // without the feed having to resend them.
    const TICK_MS = 450
    let timer = null
    let ticks = 0

    function tick() {
      const n = 14 + Math.floor(Math.random() * 8)
      const update = []
      const seen = new Set()
      for (let k = 0; k < n; k++) {
        const row = rows[Math.floor(Math.random() * rows.length)]
        if (seen.has(row.id)) continue
        seen.add(row.id)

        // Stablecoins must not wander — a USDT row ticking to $1.04 is the
        // detail that tells a trader the data is fake.
        const vol = row.id === 'USDT' || row.id === 'USDC' ? 0.0004 : 0.0075
        const drift = (Math.random() - 0.5) * 2 * vol
        const next = Math.max(row.price * (1 + drift), 1e-9)

        row.prev = row.price
        row.price = next
        row.h1 = row.h1 + drift * 100
        row.h24 = row.h24 + drift * 60
        row.marketCap = next * row.supply
        row.volume = row.volume * (1 + (Math.random() - 0.5) * 0.02)

        // Advance the sparkline one step every ~8 ticks, so it reads as a 7d
        // series rather than a seismograph of the last 10 seconds.
        if (ticks % 8 === 0) {
          row.spark = row.spark.slice(1).concat(next)
          row.d7 = ((next - row.spark[0]) / row.spark[0]) * 100
        }

        update.push({
          id: row.id, price: row.price, h1: row.h1, h24: row.h24, d7: row.d7,
          marketCap: row.marketCap, volume: row.volume, spark: row.spark,
        })
      }
      ticks++
      if (api && update.length) api.applyTransaction({ update })

      // The chart advances every tick, whether or not the followed coin was
      // in this batch — a flat segment is honest (no trade printed) and a
      // chart that only moves when its row happens to be picked looks stalled.
      const followed = rows.find((r) => r.id === selected)
      if (followed) {
        history.push(followed.price)
        if (history.length > CHART_POINTS) history.shift()
        notifyChart()
      }
    }

    const start = () => { if (!timer) timer = setInterval(tick, TICK_MS) }
    const stop  = () => { if (timer) { clearInterval(timer); timer = null } }

    // The parent pauses the feed whenever the tab is hidden or the demo
    // scrolls out of view. An unattended setInterval repricing 100 rows is
    // exactly the idle CPU burn KeepAlive.tsx exists to prevent.
    onMessage('SET_LIVE', ({ live }) => (live ? start() : stop()))
    onMessage('EXPORT_CSV', () => api && api.exportCSV({ filename: 'elitegrid-crypto', scope: 'filtered' }))

    start()
`

export const crypto: Demo = {
  slug: 'crypto-market',
  live: true,
  css: CSS,
  script: SCRIPT,
}
