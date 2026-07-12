# 11 · Events

Events are callbacks the grid calls when something happens — a row is clicked, a sort changes, an edit is saved. They all live in one `events` group so they never clutter the rest of your config.

> **What is a "callback" / "event handler"?** A callback is a function *you* write and hand to the grid, which the grid then calls *back* at the right moment. You don't call `onRowClick` yourself — you define what should happen, and the grid runs it whenever a row is clicked. "Event handler" is another name for the same thing: the function that *handles* a given event.

> **Reading the "Signature" column.** The tables below show each event's *signature* — the arguments it receives, written as an arrow function type. For example `(row, event) => void` means "your function is called with two arguments, `row` and `event`, and isn't expected to return anything" (`void` = no return value). You can name the parameters whatever you like and ignore any you don't need.

```ts
const grid = createGrid<User>({
  columns,
  data,
  events: {
    onRowClick: (row) => console.log('clicked', row),
    onSortChange: (model) => console.log('sorted', model),
  },
})
```

---

## The full event list

### Lifecycle

| Event | Signature | Fires when |
| --- | --- | --- |
| `onReady` | `(api) => void` | The grid has finished its first mount. **This is one of the two ways to get the [Grid API](/docs/vanilla/grid-api)** — the other is calling `buildGridAPI(grid)` yourself, any time. |

### Row interactions

| Event | Signature | Fires when |
| --- | --- | --- |
| `onRowClick` | `(row, event) => void` | A row is clicked |
| `onRowDoubleClick` | `(row, event) => void` | A row is double-clicked |

### Editing

| Event | Signature | Fires when |
| --- | --- | --- |
| `onEditStart` | `(rowId, field) => void` | An editor opens |
| `onEditCommit` | `(rowId, field, value) => void` | An edit is saved |
| `onEditCancel` | `(rowId, field) => void` | An edit is cancelled |

### Feature state changes

| Event | Signature | Fires when |
| --- | --- | --- |
| `onSortChange` | `(model) => void` | Sort changes |
| `onFilterChange` | `(model) => void` | Filters change |
| `onSelectionChange` | `(rows) => void` | Selection changes (receives row objects) |
| `onPageChange` | `(page, pageSize) => void` | Page or page size changes |

### Column state changes

| Event | Signature | Fires when |
| --- | --- | --- |
| `onColumnResize` | `(columnId, width) => void` | A column is resized by dragging |
| `onColumnReorder` | `(columnIds) => void` | Columns are reordered |
| `onColumnVisibilityChange` | `(columnId, visible) => void` | A column is shown/hidden |

### Data mutations

| Event | Signature | Fires when |
| --- | --- | --- |
| `onRowAdd` | `(row) => void` | A row is added via `api.addRow()` |
| `onRowUpdate` | `(id, changes) => void` | A row is updated via `api.updateRow()` |
| `onRowDelete` | `(id) => void` | A row is deleted via `api.deleteRow()`/`deleteRows()` |

### Scroll

| Event | Signature | Fires when |
| --- | --- | --- |
| `onScrollChange` | `(scrollTop, scrollLeft) => void` | The grid is scrolled (fires often — debounce if needed) |

---

## A worked example

```ts
import { createGrid, mount } from '@elitegrid/vanilla'

const grid = createGrid<User>({
  columns,
  data,
  selection: { mode: 'multiple' },
  editing: { enabled: true },
  events: {
    onReady: () => {
      console.log('Grid ready! API available.')
    },
    onRowClick: (row) => {
      console.log('Opened user', row.name)
    },
    onEditCommit: (rowId, field, value) => {
      // Persist the change to your backend
      fetch(`/api/users/${rowId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value }),
      })
    },
    onSelectionChange: (rows) => {
      console.log(`${rows.length} selected`)
    },
  },
})

mount(grid, document.getElementById('grid-container'))
```

---

## Reading outer state inside a handler — vanilla JS makes this a non-issue too

> **Why there's no "stale closure" trap here.** In frameworks that re-run a component function on every render, a callback defined during an old render can end up remembering old values — that's the classic "stale closure" bug. Vanilla JS has no re-render cycle: your `events` object is built **once**, and any variable it closes over is the *same* variable for the lifetime of the page. As long as you `let count = 0; count++` (mutate) rather than declare a brand-new `const count = 0` somewhere else, a handler reading `count` will always see the current value — there's nothing extra to learn or work around.

```ts
let count = 0

const grid = createGrid<User>({
  columns,
  data,
  events: {
    onRowClick: () => {
      // Always sees the latest `count` — it's the same variable, not a snapshot
      console.log('current count is', count)
      count++
    },
  },
})
```

`grid.updateEvents()` still exists and is useful — reach for it when you want to **swap or remove a handler at runtime** (for example, disabling row clicks while a modal is open), not because anything has gone stale:

```ts
// Swap in a different handler later
grid.updateEvents({ onRowClick: (row) => console.log('new handler', row) })

// Remove a handler entirely by passing undefined
grid.updateEvents({ onRowClick: undefined })
```

It merges into the existing handlers — you only need to pass the ones you're changing; any others you registered in `createGrid` are left alone.

---

## Event ordering when one change triggers another

Some user actions trigger more than one event. The rule is simple: **the event matching what the user actually did fires first; any knock-on effect fires after.** The clearest example is filtering resetting the current page back to 1 — see [Chapter 05](/docs/vanilla/pagination#pagination-and-filtering-together):

```ts
events: {
  onFilterChange: () => console.log('1: filter changed'),
  onPageChange: () => console.log('2: page reset to 1'),
}
// Typing into a filter box (while on page 3, say) logs "1" then "2", in that order.
```

`onPageChange` only fires here if the page number actually moved — filtering while already on page 1 fires just `onFilterChange`. Note that **sorting doesn't trigger this at all**: changing the sort re-orders your current page in place and does not touch pagination, so `onSortChange` fires alone.

If you're coordinating multiple pieces of UI off different events, you can rely on this ordering rather than guessing which one "really" happened first.

---

## Going lower-level: the event bus

Everything above is the ergonomic `events` object passed to `createGrid()`. Under the hood, EliteGrid runs on a small **event bus** — a publish/subscribe system exposed as `grid.kernel.eventBus`. You rarely need it directly (the `events` group and the Grid API cover almost everything), but it's there for advanced cases, like listening for the same accessibility announcements a screen reader hears (see [Chapter 13](/docs/vanilla/accessibility#listening-to-announcements-yourself)):

```ts
import { GridEvent } from '@elitegrid/vanilla'

const off = grid.kernel.eventBus.on(GridEvent.SORT_COMPLETED, (payload) => {
  console.log('sort completed', payload)
})

// Later, stop listening:
off()
```

`GridEvent` is an enum of every internal event name the engine emits — the `events` callbacks in this chapter are really just a friendlier layer on top of a subset of these.

---

## Common event mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Handler reads an old value that never updates | A `const` was **reassigned** by declaring a new binding elsewhere, rather than mutated | Keep one `let` binding and mutate it (`count++`), or read from an object/array whose contents you update in place |
| `onScrollChange` causes visible jank while scrolling | Heavy work (state updates, network calls) running on every scroll event | Debounce/throttle inside the handler, or move the work out of the hot path entirely |
| `onReady` runs more than once | `createGrid()` (and its matching `mount()`) was accidentally called more than once, e.g. inside a function that re-runs on navigation | Confirm `createGrid()` runs exactly once per page — see [Chapter 01](/docs/vanilla/getting-started) |
| `onEditCommit` fires with the *previous* value, not the new one | Reading `row[field]` instead of the handler's own `value` argument | Use the `value` parameter EliteGrid gives you — it's already the new, post-edit value |

---

Next: [12 · The Grid API](/docs/vanilla/grid-api)
