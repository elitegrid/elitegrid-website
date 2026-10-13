'use client'

import { useRef, useState } from 'react'

/**
 * The 32 shipped features, six at a time.
 *
 * They used to render as one 32-card grid — eleven identical rows that nobody
 * reads to the end. Clustering them means a visitor lands on the part of the
 * grid they were already thinking about, and the section costs one screen
 * instead of three.
 */
type Feature = { title: string; desc: string; api: string }
type Cluster = { label: string; features: Feature[] }

const CLUSTERS: Cluster[] = [
  {
    label: 'Columns',
    features: [
      { title: 'Resize, reorder, pin, hide', desc: 'Drag a column anywhere, pin it to either edge. The layout survives a reload.', api: 'size · pinned · hidden' },
      { title: 'Auto-size to content', desc: 'Widths measured from what actually rendered, not guessed from an average.', api: 'api.autoSizeColumns()' },
      { title: 'Multi-level groups', desc: 'Header bands over related columns, nested as deep as the data needs.', api: 'columns[].children' },
      { title: 'Column virtualization', desc: '80 columns render the same cell count as 8. The window moves, the DOM does not grow.', api: 'appearance.virtualizeColumns' },
      { title: 'Column menu', desc: 'Sort, pin, hide and autosize from the header itself — no toolbar to build.', api: 'columnMenu.enabled' },
      { title: 'Cell + header renderers', desc: 'Return a real component per cell. Badges, avatars, sparklines — not a string.', api: 'display.cellRenderer' },
      { title: 'Tooltips', desc: 'Cell and header tooltips, with your own content and your own delay.', api: 'display.tooltip' },
    ],
  },
  {
    label: 'Rows',
    features: [
      { title: 'Row grouping', desc: 'Group by any column, with sum, avg, min, max and count aggregates per group.', api: 'grouping.model' },
      { title: 'Row selection', desc: 'Shift+click a range, Ctrl+click to toggle. The selection survives a sort.', api: 'selection.mode' },
      { title: 'Row auto-height', desc: 'Rows grow to fit wrapped text and still virtualize correctly.', api: 'display.wrap' },
      { title: 'Detail rows', desc: 'An expandable panel under any row, rendered by you, measured by the grid.', api: 'rowExpansion.render' },
      { title: 'Row drag', desc: 'Drag to reorder, with a keyboard path that does the same thing.', api: 'rowDrag.enabled' },
      { title: 'Row numbers', desc: 'An ordinal strip that survives sorting, filtering and pagination.', api: 'rowNumbers.enabled' },
      { title: 'Pinned rows', desc: 'Totals on top or bottom, outside the scroll area, re-totalled on every filter.', api: 'pinnedRows.bottom' },
    ],
  },
  {
    label: 'Filtering & search',
    features: [
      { title: 'Per-column filters', desc: 'Text, number, date and boolean, with the operators each type deserves.', api: 'columns[].filter' },
      { title: 'Set filter', desc: 'A searchable checkbox list of the values actually present in the column.', api: "filter: { type: 'set' }" },
      { title: 'Floating filters', desc: 'A filter row under the header — one keystroke to narrow, no menu to open.', api: 'filtering.floatingFilters' },
      { title: 'Global search', desc: 'One query across every searchable column. Debounced, with a match announcement.', api: 'filtering.searchBar' },
    ],
  },
  {
    label: 'Editing',
    features: [
      { title: 'Inline editing', desc: 'Text, number, select, date and textarea editors, with async validation.', api: 'edit.enabled' },
      { title: 'Clipboard copy', desc: 'Copy a cell, a range or the whole selection, as TSV the spreadsheet understands.', api: 'clipboard.enabled' },
    ],
  },
  {
    label: 'Data',
    features: [
      { title: 'Sorting', desc: 'Single and multi-column, three-state cycle, custom comparators per column.', api: 'sorting.multiSort' },
      { title: 'Pagination', desc: 'Page size picker, page numbers and row count — each one switchable.', api: 'pagination.pageSize' },
      { title: 'Infinite scroll', desc: 'Pages load as the viewport reaches them, from your own data source.', api: 'infiniteScroll.pageSize' },
      { title: 'Batch updates', desc: 'Add, update and remove in one transaction, with no full re-render.', api: 'api.applyTransaction()' },
      { title: 'CSV export', desc: 'Export everything, the filtered set, or just the selected rows.', api: 'api.exportCsv()' },
      { title: 'Save & restore state', desc: 'Serialize sort, filters, columns and groups. Rehydrate on the next visit.', api: 'api.getState()' },
    ],
  },
  {
    label: 'Presentation',
    features: [
      { title: 'Theming', desc: 'Light, dark and auto, three densities, and every colour as a CSS token.', api: 'appearance.theme' },
      { title: 'Change highlighting', desc: 'Cells flash when their value moves — green up, red down, on real changes only.', api: "display.flash: 'up-down'" },
      { title: 'Keyboard navigation', desc: 'The full ARIA grid pattern: arrows, Home, End, PageUp and PageDown.', api: 'built in' },
      { title: 'Localization', desc: 'Every string the grid renders is overridable. No hardcoded English.', api: 'locale' },
      { title: 'Context menu', desc: 'Right-click actions on any cell, built from your own items.', api: 'contextMenu.items' },
      { title: 'Modular imports', desc: 'Register only the features you use; the rest never reaches your bundle.', api: 'modules: [SortModule]' },
    ],
  },
]

const TOTAL = CLUSTERS.reduce((n, c) => n + c.features.length, 0)

export default function FeatureClusters() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  // Arrow keys move between tabs, which is what a tablist is expected to do
  // and what a row of plain buttons would not.
  function onKeyDown(e: React.KeyboardEvent) {
    const last = CLUSTERS.length - 1
    let next = active
    if (e.key === 'ArrowRight') next = active === last ? 0 : active + 1
    else if (e.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Feature groups"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-center gap-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-4 mb-7"
      >
        {CLUSTERS.map((cluster, i) => (
          <button
            key={cluster.label}
            ref={(el) => { tabs.current[i] = el }}
            role="tab"
            id={`feature-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`feature-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={[
              'font-heading text-[13.5px] font-bold px-4 py-[9px] rounded-full border transition-colors',
              i === active
                ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                : 'border-black/[0.12] dark:border-white/[0.12] text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa]',
            ].join(' ')}
          >
            {cluster.label}{' '}
            <span className="font-code text-[11px] font-normal opacity-70">
              {cluster.features.length}
            </span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`feature-panel-${active}`}
        aria-labelledby={`feature-tab-${active}`}
        className="grid grid-cols-1 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 gap-4"
      >
        {CLUSTERS[active].features.map((f) => (
          <article
            key={f.title}
            className="flex flex-col gap-2.5 rounded-[14px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0c0c14] px-5 py-[18px] min-h-[150px]"
          >
            <h3 className="font-heading font-bold text-[15.5px] tracking-[-0.01em]">{f.title}</h3>
            <p className="text-[13.5px] leading-[1.6] text-[#525252] dark:text-[#7a8399]">{f.desc}</p>
            <code className="mt-auto font-code text-[11.5px] text-[#7c3aed] dark:text-[#8b5cf6]">{f.api}</code>
          </article>
        ))}
      </div>

      <p className="mt-6 text-[13.5px] text-[#a3a3a3] dark:text-[#374151]">
        {TOTAL} features, every one documented with a runnable example.
      </p>
    </div>
  )
}
