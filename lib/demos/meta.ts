// Showcase metadata — and ONLY metadata.
//
// Deliberately separate from the demo sources. A demo's script body is a
// multi-kilobyte string; the gallery needs none of them, and importing one
// registry that held both would ship every demo's source to anyone who opens
// /demos. Metadata lives here, sources are imported per route.

export type DemoStatus = 'live' | 'planned'

export interface DemoMeta {
  slug: string
  /** Shown on the tile and as the page's <h1>. */
  title: string
  /** One line on the tile. */
  tagline: string
  /** A paragraph on the demo's own page, and the page description for SEO. */
  blurb: string
  /** The domain this demo imitates — the gallery's filter rail. */
  category: 'Finance' | 'Operations' | 'People' | 'Science'
  /**
   * EliteGrid features visibly at work. Listed per demo rather than
   * per-feature-page on purpose: the point of the showcase is that a visitor
   * recognises their own app, and the feature list is how they then confirm
   * the thing they need is in there.
   */
  features: string[]
  /** Tile accent, as an HSL hue. */
  hue: number
  status: DemoStatus
}

export const DEMOS: DemoMeta[] = [
  {
    slug: 'crypto-market',
    title: 'Crypto Market',
    tagline: '100 coins repricing twice a second',
    blurb:
      'A live market table: prices arrive as a delta feed, the cells that moved flash green or red, and sparklines redraw as the series advances. Sort by any column while it ticks — the sort holds and the feed keeps flowing.',
    category: 'Finance',
    features: [
      'Cell flash (up/down)',
      'Batch transactions',
      'Custom cell renderers',
      'Global search',
      'Multi-sort',
      'Pinned columns',
      'CSV export',
    ],
    hue: 28,
    status: 'live',
  },
  {
    slug: 'trading-blotter',
    title: 'Trading Blotter',
    tagline: 'Positions grouped by sector, with running P&L',
    blurb:
      'A book of positions folded into sectors, each one totalling its own quantity, exposure and P&L, with a grand total underneath that re-totals the moment you filter. Header bands group the position, P&L and risk columns; expand any position to see the fills behind it.',
    category: 'Finance',
    features: [
      'Row grouping',
      'Aggregation',
      'Pinned rows',
      'Column groups',
      'Detail rows',
    ],
    hue: 215,
    status: 'live',
  },
  {
    slug: 'hr-directory',
    title: 'People Directory',
    tagline: 'An HRMS table you can actually edit',
    blurb:
      'The grid as the centre of an HR admin screen: edit in place with the right editor per field, group by department, expand a row for the full employee profile, export the filtered set.',
    category: 'People',
    features: [
      'Inline editing',
      'Dropdown + date editors',
      'Validation',
      'Row grouping',
      'Detail rows',
      'CSV export',
    ],
    hue: 268,
    status: 'live',
  },
  {
    slug: 'warehouse-inventory',
    title: 'Warehouse Inventory',
    tagline: '100,000 SKUs, and a shipment landing live',
    blurb:
      'Stock levels as bars, reorder points as conditional styling, a checkbox value list for the warehouse column and a filter row under the header. Receive a shipment and watch a few hundred rows update in one transaction.',
    category: 'Operations',
    features: [
      'Set filter',
      'Floating filters',
      'Batch transactions',
      'Conditional styling',
      'Row virtualization',
    ],
    hue: 158,
    status: 'live',
  },
  {
    slug: 'sensor-telemetry',
    title: 'Sensor Telemetry',
    tagline: '85 columns × 20,000 readings',
    blurb:
      'The widest grid on this site, and the one that proves column virtualization: 80 instrument channels plus five identity columns, heatmap-coloured against each channel’s own range. Scroll sideways — only the columns on screen exist in the DOM.',
    category: 'Science',
    features: [
      'Column virtualization',
      'Column menu',
      'Heatmap cells',
      'Hide + pin columns',
      'Pinned columns',
    ],
    hue: 190,
    status: 'live',
  },
  {
    slug: 'saas-dashboard',
    title: 'SaaS Dashboard',
    tagline: 'A grid that shares the page',
    blurb:
      'The grid sitting inside a real layout — KPI tiles and a chart above it — fed by a data source with 350ms of deliberate latency. Rows accumulate as you scroll instead of arriving all at once, and every request carries the current sort and search so the next page comes back in the right order.',
    category: 'Operations',
    features: [
      'Infinite scroll',
      'Async data source',
      'Global search',
      'Composable layout',
    ],
    hue: 300,
    status: 'live',
  },
]

export const LIVE_DEMOS = DEMOS.filter((d) => d.status === 'live')

export function findDemo(slug: string): DemoMeta | undefined {
  return DEMOS.find((d) => d.slug === slug)
}

export const CATEGORIES = ['Finance', 'Operations', 'People', 'Science'] as const
