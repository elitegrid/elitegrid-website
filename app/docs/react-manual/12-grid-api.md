# 12 · The Grid API

The **Grid API** is your remote control for the grid. It has 50+ methods to read and change data, columns, sorting, filters, selection, editing, pagination, scrolling, and export — all from your own code.

> **"API" = Application Programming Interface.** In plain terms it's the agreed set of commands one piece of code offers to another. The Grid API is just an object full of methods (`api.setPage(2)`, `api.exportCSV()`, …). You don't reach inside the grid's internals; you call these published methods and the grid does the work.

> **Two ways to interact with the grid, and when to use each:**
>
> - **The API (this chapter)** — for *doing things on demand*: a button that exports CSV, code that jumps to page 2, a "select all" action. You *call* it.
> - **Reactive state hooks (end of this chapter)** — for *displaying live grid state* in your own UI: "3 of 100 selected". They *push* updates to you.
>
> Reach for the API when an action happens; reach for the hooks when you need to mirror grid state on screen.

---

## How to get the API

You receive it in the `onReady` event. The common pattern is to stash it in a ref or state so the rest of your component can use it:

```tsx
import { useState } from 'react'
import { createGrid, Grid } from '@elitegrid/react'
import type { GridAPI } from '@elitegrid/react'

const grid = createGrid<User>({
  columns,
  data,
  events: {
    onReady: (api) => {
      // called once when the grid is ready
    },
  },
})

function App() {
  const [api, setApi] = useState<GridAPI<User> | null>(null)

  // Re-register onReady so we can capture the api into React state
  useEffect(() => {
    grid.updateEvents({ onReady: (a) => setApi(a) })
  }, [])

  return (
    <div>
      <button disabled={!api} onClick={() => api?.exportCSV()}>
        Export CSV
      </button>
      <div style={{ height: 500 }}>
        <Grid grid={grid} />
      </div>
    </div>
  )
}
```

> You can also just call API methods directly from `onReady` if you don't need them in your JSX.

---

## The complete API reference

### Data

```ts
api.setData(rows)              // replace all rows
api.getData()                  // → TData[] (the raw, unfiltered rows)
api.getDisplayedRows()         // → TData[] (current page, after filter+sort)
api.refreshData()              // re-run the pipeline / re-fetch from dataSource
api.addRow(row, index?)        // add a row (optionally at an index)
api.updateRow(id, changes)     // patch a row by ID
api.deleteRow(id)              // delete one row
api.deleteRows(ids)            // delete many rows in a single pass (fast)
```

> **`getData()` vs `getDisplayedRows()` — the "pipeline".** Internally the grid runs your rows through a **pipeline**: *raw data → filter → sort → paginate → what's on screen*. `getData()` returns the rows from the **start** of that pipeline (everything, untouched). `getDisplayedRows()` returns the rows at the **end** — already filtered, sorted, and limited to the current page, in the exact order shown. Use `getData()` for "all my records"; use `getDisplayedRows()` for "what the user is actually looking at right now".

> **`updateRow(id, changes)` — what "patch" means.** You pass only the fields that changed, e.g. `api.updateRow('42', { salary: 90000 })`, and the grid merges them into the existing row. You don't have to send the whole row back.

### Columns

```ts
api.setColumnVisible(id, visible)
api.setColumnWidth(id, width)
api.setColumnPinned(id, 'left' | 'right' | null)
api.moveColumn(id, toIndex)
api.getAllColumns()            // → ColumnDef[] (everything you passed in)
api.getVisibleColumns()        // → ColumnDef[] (currently visible)
api.getColumnState()           // → ColumnState[] (widths, order, pinning, visibility)
api.applyColumnState(state)    // restore a saved layout
```

### Sort

```ts
api.setSortModel([{ columnId: 'name', direction: 'asc' }])
api.getSortModel()
api.clearSort()
```

### Filter

```ts
api.setFilterModel(model)
api.getFilterModel()
api.setColumnFilter(columnId, filter)
api.clearColumnFilter(columnId)
api.clearFilters()
```

### Selection

```ts
api.selectRow(id)
api.deselectRow(id)
api.toggleRow(id)
api.selectAll()
api.deselectAll()
api.isRowSelected(id)          // → boolean
api.getSelectedRows()          // → TData[]
api.getSelectedIds()           // → Set<string>
```

### Editing

```ts
api.startEditing(rowId, columnId)
api.stopEditing(save?)         // true = save, false = discard
api.isEditing()                // → boolean
api.getEditingCell()           // → { rowId, columnId, rowIndex, columnIndex } | null
```

### Pagination

```ts
api.setPage(page)
api.setPageSize(size)
api.nextPage()
api.previousPage()
api.firstPage()
api.lastPage()
api.getPaginationState()       // → PaginationState
```

### Scrolling

```ts
api.scrollToRow(rowId)
api.scrollToColumn(columnId)
api.scrollToCell(rowId, columnId)
```

### Export

```ts
api.exportCSV(options?)         // see Chapter 10
```

### Lifecycle

```ts
api.destroy()                   // tear down the engine (rarely needed by hand)
```

---

## Reactive state hooks (advanced)

> **What does "reactive" mean here?** A reactive value automatically re-renders your component when it changes — you read it once and React keeps it up to date, rather than you polling for changes. The API's `get…` methods give you a *snapshot* (correct only at the instant you call them); these hooks give you a value that *stays* correct.

Most apps only need `createGrid` + `<Grid>` + the API. But if you want to **read** grid state reactively inside your own components (e.g. show "3 of 100 rows selected" in your own toolbar), the adapter exports a few hooks:

```tsx
import {
  useViewportState,
  useColumnsState,
  usePaginationState,
  useSortedState,
  useRawState,
} from '@elitegrid/react'

function RowCount({ grid }: { grid: GridInstance<User> }) {
  const pagination = usePaginationState(grid)
  return <span>{pagination.totalRows} rows</span>
}
```

These re-render your component whenever that slice of grid state changes.

---

## Cleaning up

If you created the grid **outside** a component (the documented pattern), it lives for the lifetime of the module — usually fine for a single grid page. If you create grids dynamically (e.g. one per route), destroy them when done:

```ts
useEffect(() => {
  return () => grid.kernel.destroy()
}, [])
```

---

Next: [13 · Accessibility](/docs/react/accessibility)
