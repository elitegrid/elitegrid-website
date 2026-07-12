# 11 · Events

Events are callbacks the grid calls when something happens — a row is clicked, a sort changes, an edit is saved. They all live in one `events` group so they never clutter the rest of your config.

> **What is a "callback" / "event handler"?** A callback is a function *you* write and hand to the grid, which the grid then calls *back* at the right moment. You don't call `onRowClick` yourself — you define what should happen, and the grid runs it whenever a row is clicked. "Event handler" is another name for the same thing: the function that *handles* a given event.

> **Reading the "Signature" column.** The tables below show each event's *signature* — the arguments it receives, written as an arrow function type. For example `(row, event) => void` means "your function is called with two arguments, `row` and `event`, and isn't expected to return anything" (`void` = no return value). You can name the parameters whatever you like and ignore any you don't need.

```tsx
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
| `onReady` | `(api) => void` | The grid is initialized. **This is how you get the [Grid API](/docs/react/grid-api).** |

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

```tsx
const grid = createGrid<User>({
  columns,
  data,
  selection: { mode: 'multiple' },
  editing: { enabled: true },
  events: {
    onReady: (api) => {
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
```

---

## Stale closures: use `updateEvents` for handlers that read React state

> **What is a "closure", and why "stale"?** When you write a function, it "remembers" the variables that were around it when it was *created* — that remembered bundle is called a **closure**. Normally helpful; but if you create a handler once (at `createGrid` time) and a variable it remembers later changes, the handler is still holding the **old** value. We call that old, frozen value **stale**.

Because you create the grid **once outside** your component, any event handler you pass to `createGrid` captures the values that existed at creation time. If a handler needs to read **current React state**, define it that early and it will be "stale" (frozen at the initial value).

The fix is `grid.updateEvents()` — call it inside a `useEffect` to refresh the handlers whenever your state changes:

```tsx
function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    grid.updateEvents({
      onRowClick: () => {
        // Always sees the latest `count`, because we re-register on change
        console.log('current count is', count)
        setCount((c) => c + 1)
      },
    })
  }, [count])

  return <Grid grid={grid} />
}
```

> **Rule of thumb:** Handlers that only call `api.*` methods or log static things are fine in `createGrid`. Handlers that read component state should be registered (and re-registered) via `updateEvents`.

---

## Event ordering when one change triggers another

Some user actions trigger more than one event. The rule is simple: **the event matching what the user actually did fires first; any knock-on effect fires after.** The clearest example is filtering resetting the current page back to 1 — see [Chapter 05](/docs/react/pagination#pagination-and-filtering-together):

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

## Removing or replacing a handler

`grid.updateEvents()` merges into the existing handlers — it doesn't need every handler passed each time, only the ones you're changing:

```ts
// Only onRowClick changes; onSortChange (if any) is left alone
grid.updateEvents({ onRowClick: (row) => console.log('new handler', row) })
```

To remove a handler entirely rather than replace it, pass `undefined`:

```ts
grid.updateEvents({ onRowClick: undefined })
```

---

## Common event mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Handler reads an old value that never updates | Stale closure — see the section above | Move the handler into `grid.updateEvents()` inside a `useEffect` keyed on the values it reads |
| `onScrollChange` causes visible jank while scrolling | Heavy work (state updates, network calls) running on every scroll event | Debounce/throttle inside the handler, or move the work out of the hot path entirely |
| `onReady` runs more than once | `createGrid()` was accidentally called more than once (usually because it moved inside the component) | Confirm `createGrid()` is at module scope — see [Chapter 01](/docs/react/getting-started#why-must-creategrid-live-outside-the-component) |
| `onEditCommit` fires with the *previous* value, not the new one | Reading `row[field]` instead of the handler's own `value` argument | Use the `value` parameter EliteGrid gives you — it's already the new, post-edit value |

---

Next: [12 · The Grid API](/docs/react/grid-api)
