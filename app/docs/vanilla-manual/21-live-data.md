# Live & Streaming Data

Three features for a grid whose data arrives while the user is looking at it:

- **Transactions** — many row changes in one repaint.
- **Infinite scroll** — fetch the next page as the user nears the bottom.
- **Cell flash** — briefly highlight what just changed.

---

## Transactions

Calling `addRow()` 500 times runs the whole pipeline 500 times. A transaction is many mutations in **one** pipeline pass and one repaint:

```ts
const result = api.applyTransaction({
  add: [newOrder],
  update: [{ id: 7, price: 19.99 }],
  remove: ['order-3', 'order-4'],
})
```

Needs no module and no configuration.

| Field | Takes |
| --- | --- |
| `add` | Rows to insert |
| `addIndex` | Where to insert — an index **after** removals are applied. Omit to append |
| `update` | `Partial<TData>` changes, **merged** onto the existing row |
| `remove` | Row **ids** — an array or a `Set` |

### `update` merges, it does not replace

A delta feed sends `{ id, price }` and the row's other fields survive:

```ts
// row was { id: 7, name: 'Widget', price: 10, stock: 4 }
api.applyTransaction({ update: [{ id: 7, price: 12 }] })
// row is now { id: 7, name: 'Widget', price: 12, stock: 4 }
```

Each entry must carry enough for the configured `rowId` to resolve it — the id field for `rowId: 'field'`, or every field the function reads for `rowId: (row) => …`. Entries that cannot be resolved are **skipped and reported**, not guessed at.

> A partial update is a patch, not a replacement — you send the fields that changed, not the whole row.

### `remove` takes ids

```ts
api.applyTransaction({ remove: api.getSelectedIds() })
```

That is the single most likely call anyone writes, so a `Set` is accepted as well as an array. A bare string is deliberately **not** accepted — `remove: 'row-1'` would otherwise iterate into deleting rows `'r'`, `'o'`, `'w'`…

### The result tells you what happened

```ts
const result = api.applyTransaction({ update: feed })

if (result.skipped.length > 0) {
  console.warn('feed ids have drifted', result.skipped)
}
```

| Field | Meaning |
| --- | --- |
| `added` | Rows actually inserted, in insertion order |
| `updated` | Rows **after** the merge — not the partials you passed |
| `removed` | Rows as they were immediately before deletion |
| `skipped` | Ops that were dropped, and why. Empty on a clean transaction |
| `applied` | `true` when at least one row changed |

`applied` is **not** the same as `skipped.length === 0` — a transaction can add two rows and skip a third.

A skip carries `{ op, id?, reason, index }`, where `reason` is one of:

| `reason` | Cause |
| --- | --- |
| `'duplicate-id'` | `add`: a row with this id is already in the grid |
| `'unknown-id'` | `update` / `remove`: no row with this id |
| `'unresolvable-id'` | `update`: the configured `rowId` could not derive an id from the partial |
| `'invalid-entry'` | `remove`: not a string. `add` / `update`: not an object |

> An update for an unknown id is reported rather than dropped — a feed whose ids have drifted should not go unnoticed for a week.

### A busy feed

If messages arrive faster than you want to repaint, coalesce them:

```ts
const grid = createGrid<Tick>({
  modules: [],
  columns,
  data,
  transactions: { waitMs: 50 }, // default
})

socket.on('tick', (t) => {
  api.applyTransactionAsync({ update: [t] })
})
```

`applyTransactionAsync` returns a promise resolving to the same `TransactionResult`, and **never rejects**.

The timer is **one per window, not per call**: message 500 does not reset the clock message 1 started, so a busy feed still flushes every `waitMs` instead of being starved indefinitely.

```ts
api.flushTransactions() // apply everything queued, now
```

You only need `flushTransactions()` when your own code must see the rows — before a screenshot, a print, or a route change. A synchronous `applyTransaction()` flushes the queue first on its own.

> Before mount and during server-side rendering there is no timer, so an async transaction applies immediately and resolves with the same result. Nothing is lost but the coalescing.

### The event

```ts
events: {
  onTransaction: (result) => console.log(result.added.length, 'added'),
}
```

Fires **once** per applied `applyTransaction()`, after the pipeline settles — so `api.getDisplayedRows()` inside it is fresh. A transaction that changed nothing does not fire it.

`onRowAdd` / `onRowUpdate` / `onRowDelete` still fire per row for the same transaction, deliberately: suppressing them would mean a developer who wired `onRowDelete` sees nothing when a transaction deletes.

---

## Infinite scroll

"Load 100 rows, then fetch the next 100 as the user nears the bottom" — no pagination bar.

```ts
import { createGrid, InfiniteScrollModule, mount } from '@elitegrid/vanilla'

const dataSource = {
  async getRows({ page, pageSize, sortModel, filterModel, search }) {
    const res = await fetch(`/api/orders?page=${page}&size=${pageSize}`)
    const { rows, total } = await res.json()
    return { rows, totalCount: total }
  },
}

const grid = createGrid<Order>({
  modules: [InfiniteScrollModule],
  columns,
  dataSource,
  infiniteScroll: {
    threshold: 20, // default — rows of lead time before the next fetch
    pageSize: 100, // defaults to pagination.pageSize, then to 100
  },
})
```

Two requirements:

- **`dataSource`**, not `data`.
- **`InfiniteScrollModule`**, named explicitly. It is deliberately **not** in `AllModules`, because it is mutually exclusive with `PaginationModule` — and because an upgrade that silently turned a server-paginated grid into an endlessly scrolling one would be a bug, not a gift.

`pageSize` is deliberately the same key the grid already has rather than a second "block size" concept — a developer who set `pagination.pageSize: 100` and then switched to infinite scroll should not have to discover a new name for the number they already chose.

> Two keys, and no second datasource interface. There is no cache to evict, no overflow to size and no concurrency to cap, because the loaded region is contiguous rather than sparse.

### Driving and observing it

```ts
await api.loadMore()   // fetch the next page now
api.hasMoreRows()      // false once totalCount is reached
```

```ts
events: {
  onLoadMore: ({ page, loadedCount, totalCount }) =>
    console.log(`${loadedCount} / ${totalCount}`),

  onLoadMoreError: ({ error, page }) => {
    toast(`Page ${page} failed`)
  },
}
```

### When a fetch fails

The rows already loaded **stay on screen**, and `api.loadMore()` is the retry:

```ts
events: {
  onLoadMoreError: ({ error }) => {
    showRetryBanner(() => api.loadMore())
  },
}
```

> The failure path takes the error, keeps the block retryable, and says so in the UI — a page that failed to load is not a page that is permanently blank.

### Filtering and sorting

`sortModel`, `filterModel` and `search` are all handed to `getRows` so a server-side source can honour them. A change to any of the three **discards the loaded pages and refetches from page 1**, because rows 0–299 sorted here and rows 300+ ordered by the server would not agree.

> Honouring them server-side is about which rows you get, not about who orders them. The grid still sorts the rows it holds; there is no mode that defers ordering to the data source. A source that ignores `sortModel` returns later pages from an unsorted set, which reads as correct within a page and wrong across pages.

---

## Cell flash

Briefly highlight a cell whose value changed:

```ts
const grid = createGrid<Tick>({
  modules: [],
  columns,
  data,
  appearance: {
    flash: { enabled: true, duration: 600, onEdit: false },
  },
})
```

`flash: true` is exactly `flash: { enabled: true }`.

| Option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | Off by default |
| `duration` | `600` | ms, covering rise **and** fall |
| `onEdit` | `false` | Flash the cell the user just finished editing |

**Off by default** because a grid that is not live-updating should not flash when the developer calls `updateRow()` from a form save.

`onEdit` is off because the user knows what they typed — a flash is for changes arriving from somewhere else.

> One `duration` for the whole flash, rather than separate fade and hold halves nobody has an opinion about.

### Per column

```ts
const columns: ColumnDef<Tick>[] = [
  { field: 'symbol', header: 'Symbol' },
  { field: 'price', header: 'Price', display: { flash: 'up-down' } },
  { field: 'updatedAt', header: 'Updated', display: { flash: false } },
]
```

| `display.flash` | Behaviour |
| --- | --- |
| unset | Inherit `appearance.flash.enabled` |
| `true` | Flash in the neutral highlight colour |
| `'up-down'` | Green when the value rose, red when it fell |
| `false` | Never flash this column |

`'up-down'` on a non-numeric column falls back to the neutral flash and warns once for that column.

The usual shape is `flash: true` grid-wide with `flash: false` on a "Last Updated" column, which changes on every update and says nothing by flashing.

### It cannot false-positive

The trigger is a **data** event. Filtering, sorting, searching, paging and scrolling never emit it, so none of them can flash a cell that did not change.

> The trigger is a real value change, not a re-render — so filtering or scrolling never lights a cell up, and there is no option needed to undo that.

### Flashing on demand

```ts
api.flashCells([
  { rowId: 'row-1', columnId: 'price' },
  { rowId: 'row-9' }, // the whole row
])
```

**A list of cells, not a cross product.** Asking for A1 and B2 lights up exactly those two.

> The argument is a list of individual cells, not a row set crossed with a column set — so A1 and B2 flash without lighting up A2 and B1, which is the scattered shape a live feed actually produces. Rows are named by id string here, as they are everywhere else in the API.

Cells that are not currently rendered are still registered, and flash if they scroll into view before the window expires.

---

## Gotchas

- **`update` merges; it does not replace.** Send only what changed.
- **`remove` takes ids, not rows.** A `Set` works.
- **Check `result.skipped`** on anything fed from outside your app — a drifted id is otherwise invisible.
- **`applied` ≠ `skipped.length === 0`.**
- **Infinite scroll needs `dataSource`, not `data`**, and `InfiniteScrollModule` is not in `AllModules`.
- **Infinite scroll and pagination are mutually exclusive.** Registering both warns and disables one.
- **Flash is off by default**, and a failed fetch leaves loaded rows on screen rather than blanking them.

---

Next: [11 · Events](/docs/vanilla/events)
