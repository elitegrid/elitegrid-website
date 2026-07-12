# 12 · The Grid API

The **Grid API** is your remote control for the grid. It has 50+ methods to read and change data, columns, sorting, filters, selection, editing, pagination, scrolling, and export — all from your own code.

> **"API" = Application Programming Interface.** In plain terms it's the agreed set of commands one piece of code offers to another. The Grid API is just an object full of methods (`api.setPage(2)`, `api.exportCSV()`, …). You don't reach inside the grid's internals; you call these published methods and the grid does the work.

> **Two ways to interact with the grid, and when to use each:**
>
> - **The API (this chapter)** — for *doing things on demand*: a button that exports CSV, code that jumps to page 2, a "select all" action. You *call* it.
> - **The data store (end of this chapter)** — for *displaying live grid state* in your own UI: "3 of 100 selected". You *subscribe* to it and it calls you back.
>
> Reach for the API when an action happens; reach for the store when you need to mirror grid state on screen.

---

## How to get the API

Vanilla JS gives you two equally valid ways to get an API object for a `grid`, because there's no framework lifecycle forcing a particular order:

### Option A — build it directly

`buildGridAPI(grid)` is a plain function: pass it the `GridInstance` from `createGrid()`, get an API object back, synchronously, any time — even before you've called `mount()`.

```ts
import { createGrid, buildGridAPI, mount } from '@elitegrid/core'

const grid = createGrid<User>({ columns, data })
const api = buildGridAPI(grid)

document.getElementById('export-btn')!.addEventListener('click', () => {
  api.exportCSV()
})

mount(grid, document.getElementById('grid-container'))
```

### Option B — receive it from `onReady`

`mount()` also builds an API object internally and hands it to your `events.onReady` callback once the grid has finished its first render — useful if you'd rather wire everything up in one place:

```ts
const grid = createGrid<User>({
  columns,
  data,
  events: {
    onReady: (api) => {
      document.getElementById('export-btn')!.addEventListener('click', () => {
        api.exportCSV()
      })
    },
  },
})

mount(grid, document.getElementById('grid-container'))
```

Both options return an API object with the exact same methods — `buildGridAPI(grid)` is simply how `mount()` builds the one it hands to `onReady`. Reach for Option A when you want the API immediately (e.g. to wire up buttons before the grid has even mounted); reach for Option B when it's more convenient to do all your setup inside a single callback.

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

## The data store (advanced)

> **What does "subscribe" mean here?** A subscription is a function you register once that gets called again automatically every time the thing you subscribed to changes — you don't have to keep asking "has it changed yet?" The API's `get…` methods give you a *snapshot* (correct only at the instant you call them); the store gives you an ongoing feed.

Most apps only need `createGrid` + `mount` + the API. But if you want to **watch** grid state and keep your own UI in sync (e.g. show "3 of 100 rows selected" in your own toolbar), every `GridInstance` exposes its internal store at `grid.kernel.store`. It's organised into **namespaces** — one per concern:

```ts
grid.kernel.store.read('paginated')
// → { currentPage, pageSize, totalRows, totalPages, startRow, endRow, hasNextPage, hasPreviousPage }

const unsubscribe = grid.kernel.store.subscribe('paginated', (state) => {
  console.log(`${state.totalRows} rows`)
})

// Later, when you no longer need updates:
unsubscribe()
```

| Namespace | State about |
| --- | --- |
| `viewport` | Which rows/columns are currently rendered, scroll position |
| `columns` | Column widths, order, visibility, pinning |
| `paginated` | Current page, page size, total rows/pages |
| `sorted` | The current sort model |
| `filtered` | The current filter model and match count |
| `raw` | The unfiltered row data and loading/error state |
| `selection` | Selected IDs, count, select-all state |
| `editing` | Whether a cell is editing, its value, validation state |
| `focus` | The currently focused cell |

`store.read(namespace)` gives you a one-off snapshot — useful for painting the initial state before your first update arrives. `store.subscribe(namespace, callback)` calls your callback again every time that namespace changes and returns an `unsubscribe` function; always keep a reference to it so you can stop listening later (see [Cleaning up](#cleaning-up) below). [Chapter 05](/docs/vanilla/pagination#building-your-own-pager-ui) and [Chapter 06](/docs/vanilla/selection#selection-survives-paging-and-filtering) both walk through worked examples of this pattern.

---

## Cleaning up

An engine created with `createGrid()` lives until something explicitly tears it down — fine for a single grid that lives for the whole page. Three layers can be cleaned up independently, from lightest to heaviest:

```ts
const grid = createGrid<User>({ columns, data })
const dispose = mount(grid, container)

// 1. Unmount the DOM only, keep the engine alive (rare — you'd remount later)
dispose()

// 2. Unmount AND destroy the engine together — the common case when you're
//    done with this grid for good (removing it from a page you're navigating away from)
const disposeAndDestroy = mount(grid, container, { destroyOnDispose: true })
disposeAndDestroy()

// 3. Destroy the engine directly, if you built it with buildGridAPI() and never mounted it
grid.kernel.destroy()
```

> `mount()`'s dispose function does **not** destroy the engine by default — only its DOM and internal view listeners. Pass `{ destroyOnDispose: true }` when you call `mount()` if you want the same one dispose call to also tear down the kernel (unsubscribing every plugin from the event bus). This matters most in a page that mounts and unmounts the same grid's container repeatedly — a tab switcher, a modal that reopens — where forgetting it leaks one engine per open/close cycle.

Any `unsubscribe()` functions you got from `grid.kernel.store.subscribe(...)` or `grid.kernel.eventBus.on(...)` (see [Chapter 11](/docs/vanilla/events#going-lower-level-the-event-bus)) are independent of `mount()`'s dispose function — call those yourself too when you remove the corresponding UI.

---

Next: [13 · Accessibility](/docs/vanilla/accessibility)
