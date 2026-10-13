# Row Features

Five things you can do to a row that are not sorting, filtering or editing it:

| Feature | What it does | Module |
| --- | --- | --- |
| [Pinned rows](#pinned-top-and-bottom-rows) | Freeze rows above or below the scrolling body | none |
| [Row numbers](#row-numbers) | An ordinal strip down the left edge | none |
| [Auto-height](#rows-that-size-themselves) | Rows that grow to fit their content | none |
| [Detail rows](#expandable-detail-rows) | A row expands to reveal a panel | none |
| [Drag to reorder](#drag-to-reorder) | Drag a row somewhere else in the list | none |

**None of them needs a module.** They ride on `ViewportPlugin`, which is mandatory, so they all work on a grid built with `modules: []`.

---

## Pinned top and bottom rows

Rows frozen above or below the scrolling body:

```tsx
const grid = createGrid<Employee>({
  modules: [],
  columns,
  data: employees,
  pinnedRows: {
    top: [{ id: 'hdr', name: 'Engineering', salary: 0 }],
    bottom: [summaryRow],
  },
})
```

They are the same `TData` shape as a body row, which means every column option you already wrote — `display.formatter`, `display.cellRenderer`, `display.tooltip` — works on them unchanged.

> **A pinned row is presentation, not data.** It is not in the row model, so it is never filtered, sorted, paginated, selected, focused, edited, exported or copied, and `api.getData()` does not include it. That is one rule covering every question you might have about how pinned rows interact with anything else: they don't.

Change them at runtime:

```tsx
api.setPinnedRows('bottom', [newSummary])
api.setPinnedRows('top', []) // clear
```

> **For a totals row, do not build one here.** Set `grouping.grandTotal` and let `value.aggregate` compute it — that row is pinned too, and it re-totals on every filter. See [Row Grouping](/docs/react/grouping#a-grand-total-over-everything).

---

## Row numbers

An automatic ordinal strip down the left edge, left of the selection checkbox:

```tsx
const grid = createGrid<Row>({ modules: [], columns, data, rowNumbers: true })
```

`true` means "every default". There is no `rowNumbers.enabled` — the option's presence *is* the enable.

```tsx
rowNumbers: {
  count: 'result', // default
  start: 1,        // default; 0 gives 0-based numbering
  width: 56,       // default — five digits at the default font
  header: '#',     // default comes from the locale
}
```

### Which ordinal

This is the part worth choosing deliberately:

| `count` | Meaning |
| --- | --- |
| `'result'` *(default)* | Position in the filtered + sorted result, running **continuously across pages** — page 3 of 20 starts at 41 |
| `'page'` | Restarts at 1 on every page |
| `'source'` | Position in the original `data` array — immune to filter, search, sort and pagination |

> Naming these three is the feature: without them, every developer who cares about the difference ends up writing the same function.

### Custom text

```tsx
rowNumbers: {
  format: ({ row, index }) => `${row.department}-${index}`,
}
```

`params.row` is your own `TData`, not an `any` you have to cast.

> **It is not a column.** The strip is never in `columns.definitions`, so it is never sorted, filtered, resized, pinned, reordered, hidden, focused, exported, or saved into a [grid state](/docs/react/localization-and-state) view. If you need any of those, you want a real column with a `valueGetter`, not this.
>

---

## Rows that size themselves

Every row is `appearance.rowHeight` (default 40) until something asks for more. Set `display.wrap` on a column and that column's text wraps, the row grows to fit, and `rowHeight` becomes the **minimum** rather than the fixed height:

```tsx
const columns: ColumnDef<Ticket>[] = [
  { field: 'title', header: 'Title' },
  { field: 'description', header: 'Description', display: { wrap: true } },
]
```

### Capping it

```tsx
appearance: {
  rowHeight: 40,
  maxRowHeight: 160,
}
```

Uncapped is the default on purpose: a cap silently clips content, which is worse than one tall row. Instead, development mode warns once the first time a row exceeds 10× `rowHeight` and points you here.

### Per-row control

```tsx
appearance: {
  getRowHeight: (params) => {
    if (params.kind === 'group') return 32
    return params.row.pinned ? 72 : undefined // undefined = let the grid decide
  },
}
```

`params` is a discriminated union — `{ kind: 'row', row }` or `{ kind: 'group', group }` — so the group-row case is a branch the compiler makes you handle.

Called for every row of the display list, so keep it synchronous and cheap.

### From code

```tsx
api.setRowHeight('row-42', 120)
api.setRowHeight('row-42', null) // back to automatic
api.resetRowHeights()
```

One call — there is no separate refresh to remember afterwards.

---

## Expandable detail rows

A row expands to reveal a panel underneath it. **Supplying `renderer` is what turns the feature on** — there is no `rowDetail.enabled`:

```tsx
const grid = createGrid<Order>({
  modules: [],
  columns,
  data: orders,
  rowDetail: {
    renderer: ({ row }) => (
      <div className="p-4">
        <h4>{row.customer}</h4>
        <LineItems items={row.items} />
      </div>
    ),
  },
})
```

`params.row` is your own `TData`, and the return type is React's `ReactNode` — neither of them is `any`.

```tsx
rowDetail: {
  renderer: ({ row }) => <OrderDetail order={row} />,

  // Which rows can expand. Default: all of them.
  isExpandable: (row) => row.items.length > 0,

  // Rows open on first render, by row id.
  defaultExpanded: ['order-1'],

  // At most one row open at a time. Opening a second closes the first.
  single: true,

  // Where the chevron goes. Default 'first-column'.
  toggle: 'first-column',

  // Assumed panel height until it has been measured. Default 200.
  estimatedHeight: 240,
}
```

### `estimatedHeight` is an estimate, not a setting

The grid needs *some* number to lay out with before your panel exists — it is your component, so there is no string to measure. Once the panel paints, the auto-height pass measures it and corrects the row. Setting this near the real height means the grid never visibly corrects; leaving it means one small correction the first time a row opens.

> One number, and it self-corrects — there is no second "measure instead" switch to find.

### Driving it from code

```tsx
api.expandRow('order-1')
api.collapseRow('order-1')
api.toggleRowExpanded('order-1')
api.isRowExpanded('order-1')
api.getExpandedRows()
api.expandAllRows()
api.collapseAllRows()
```

> **It is `toggleRowExpanded`, not `toggleRow`.** `toggleRow` is taken — it toggles row *selection*. Two different things called "toggling a row" is exactly the ambiguity the longer name buys out.

All of these are synchronous and take the same row id string as `setRowHeight` and `flashCells`. The three **opening** calls warn in development if the feature is off or the row is not expandable; the two **closing** calls stay silent, because asking to close something already closed got the outcome it asked for.

`expandAllRows()` warns past about 1,000 rows rather than refusing — on a filtered set of 20 it is reasonable, on 100k it almost certainly is not, and the call cannot tell them apart.

### Your own chevron

```tsx
rowDetail: {
  renderer: ({ row }) => <OrderDetail order={row} />,
  toggle: 'none',
}

// then, in a column:
{
  field: 'customer',
  header: 'Customer',
  display: {
    cellRenderer: ({ row }) => (
      <button onClick={() => api.toggleRowExpanded(String(row.id))}>
        {row.customer}
      </button>
    ),
  },
}
```

`toggle: 'none'` is the escape hatch, not the default — configuring it and then never calling `toggleRowExpanded()` warns in development.

---

## Drag to reorder

```tsx
const grid = createGrid<Task>({ modules: [], columns, data, rowDrag: true })
```

That is the whole configuration for the common case.

```tsx
rowDrag: {
  // Where the grip lives. Default 'first-column'.
  //   'first-column'       inside the first visible column's cells
  //   'row'                the whole row is draggable
  //   { column: 'name' }   a specific column
  handle: 'first-column',

  isDraggable: (row) => !row.locked,
  canDrop: ({ row, target }) => target.status === row.status,
  whenSorted: 'disable', // or 'clear-sort'
  dragPreview: ({ row }) => <Pill>{row.title}</Pill>, // null for none
}
```

### It works filtered, sorted and paged

Worth stating plainly, because the competing implementation does not: a drop is resolved against the **neighbour you dropped on**, not against a display index. So dragging works on a filtered list and across pages.

### When a sort is active

The one case with no good answer, so it is a choice you make:

- `'disable'` *(default)* — the handle renders disabled, with a localized tooltip saying why.
- `'clear-sort'` — freezes the visible order into the data and drops the sort. This is the only reading under which the gesture does what it looked like it did.

A development warning names this option the first time it bites.

### The drag preview

What follows the pointer. The default is a pill showing the row's first visible cell — on touch, the row under the finger is the row you cannot see. Return `null` for no preview.

### From code

```tsx
api.moveRow('task-3', 0)                     // to the top
api.moveRows(['task-3', 'task-9'], 5)
```

### Reacting to a reorder

```tsx
events: {
  onRowOrderChanged: ({ source }) => {
    // `source` says whether this was a drag or an api.moveRow() call
    persistOrder(api.getData())
  },
}
```

---

## Gotchas

- **Pinned rows are invisible to everything else** — no filter, sort, selection, export or `getData()`. If you need a row to participate, it belongs in `data`.
- **`rowNumbers` is a strip, not a column.** Nothing that works on columns works on it.
- **`maxRowHeight` is uncapped by default**, and a cap clips. Prefer the warning.
- **`getRowHeight` must handle the `'group'` branch** — the compiler will tell you.
- **`rowDetail.renderer` is the enable.** No `renderer`, no feature, and every expansion API call is a no-op.
- **`toggleRowExpanded` ≠ `toggleRow`.** The short name is selection.
- **A drag under an active sort does nothing by default.** Set `whenSorted: 'clear-sort'` if the gesture should win.

---

Next: [09 · Appearance & Theming](/docs/react/appearance)
