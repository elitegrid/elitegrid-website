# 06 · Row Selection

Selection lets users pick one or many rows — for bulk actions, exporting just the selected rows, etc. Selection is **off by default**; you turn it on with the `selection` group.

> **What "selection" means here:** the grid keeps a private list of *which row IDs are currently ticked*. It does not change your data — selecting a row just adds its ID to that list and highlights the row. You then read the list (via an event or the API) to do something with those rows: delete them, export them, show a "3 selected" toolbar, and so on.

---

## The three selection modes

The `mode` option decides how many rows can be ticked at once:

| Mode | Behaviour | Typical use |
| --- | --- | --- |
| `'none'` | Selection is off (the default). | Read-only tables. |
| `'single'` | At most **one** row selected; picking another clears the first — like radio buttons. | "Choose one record to view." |
| `'multiple'` | Any number of rows; checkboxes and a "select all" header. | Bulk delete/export. |

---

## Turning selection on

```tsx
const grid = createGrid<User>({
  columns,
  data,
  selection: {
    mode: 'multiple',   // 'none' | 'single' | 'multiple'
  },
})
```

Setting `mode` to anything other than `'none'` automatically shows a checkbox column.

---

## Selection options

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `mode` | `'none' \| 'single' \| 'multiple'` | `'none'` | How many rows can be selected |
| `selectAllScope` | `'page' \| 'all'` | `'page'` | Does the header checkbox select the page or everything? |
| `showCheckboxes` | `boolean` | `true` (when mode ≠ none) | Show the checkbox column |
| `selectOnRowClick` | `boolean` | `true` | Clicking anywhere in a row selects it |
| `checkboxOnly` | `boolean` | `false` | Only the checkbox selects (clicking the row does nothing) |

### Single selection (radio-style)

```ts
selection: { mode: 'single' }
```

### Multiple selection with a "select all" that covers everything

The checkbox in the **header** is "select all". `selectAllScope` decides what "all" means when pagination or virtualization is in play:

- `'page'` (default) — ticks only the rows currently visible on this page. Safer: the user can clearly see everything they just selected.
- `'all'` — ticks every row that passes the current filter, even ones on other pages or scrolled out of view.

```ts
selection: {
  mode: 'multiple',
  selectAllScope: 'all',   // header checkbox selects ALL rows, not just this page
}
```

### Checkbox-only selection

Useful when clicking a row should do something else (like open a detail panel) and only the checkbox should toggle selection:

```ts
selection: {
  mode: 'multiple',
  checkboxOnly: true,
  selectOnRowClick: false,
}
```

---

## Reacting to selection changes

`onSelectionChange` receives the **array of selected row objects** (not just IDs), so you can act on the data directly:

```ts
events: {
  onSelectionChange: (selectedRows) => {
    console.log(`${selectedRows.length} rows selected`)
    console.log('Names:', selectedRows.map((r) => r.name))
  },
}
```

---

## Controlling selection from code (the API)

```ts
api.selectRow('42')        // select by row ID
api.deselectRow('42')
api.toggleRow('42')        // flip its state
api.selectAll()
api.deselectAll()

api.isRowSelected('42')    // → boolean
api.getSelectedRows()      // → TData[] (the row objects)
api.getSelectedIds()       // → Set<string> (just the IDs)
```

> **`getSelectedRows()` vs `getSelectedIds()` — which do I want?**
>
> - Use **`getSelectedRows()`** when you need the *data* — names to display, fields to send to a server.
> - Use **`getSelectedIds()`** when you only need *identity* — e.g. to pass to `api.deleteRows([...])`. It returns a **`Set`**, a JavaScript collection of unique values. A `Set` has no array methods like `.map`, so spread it into an array first when you need those: `[...api.getSelectedIds()]`.

> **Remember:** these use the **row ID**, which comes from your `rowId` setting (default field `id`). See [Chapter 01](/docs/react/getting-started#what-is-rowid-important).

---

## Example — a bulk delete button

```tsx
function Toolbar({ api }: { api: GridAPI<User> }) {
  const handleDelete = () => {
    const ids = [...api.getSelectedIds()]
    api.deleteRows(ids)        // bulk delete in one pass
    api.deselectAll()
  }
  return <button onClick={handleDelete}>Delete selected</button>
}
```

You'd grab `api` from the `onReady` event and store it in state — see [Chapter 12](/docs/react/grid-api).

---

## Selection survives paging and filtering

Selection is tracked by **row ID**, independently of what's currently on screen — not by "which checkboxes are visible right now." That means:

- Selecting rows on page 1, then moving to page 2, keeps page 1's rows selected.
- Applying a filter that hides a selected row does **not** deselect it — it's just not visible while the filter is active. Clear the filter and it will still show as checked.

This is almost always what users expect ("I picked these 5 rows, don't lose them because I scrolled"), but it means a selection count in your UI should come from `api.getSelectedIds().size`, not from counting checked boxes on the current page.

If you specifically want "select all" to mean *only this page* rather than every filtered row, that's what `selectAllScope: 'page'` (the default) already does — see above.

---

## Pre-selecting rows on load

To open the grid with certain rows already selected (e.g. restoring a saved selection, or highlighting rows passed in as a prop), select them in `onReady`:

```tsx
const grid = createGrid<User>({
  columns,
  data,
  selection: { mode: 'multiple' },
  events: {
    onReady: (api) => {
      const preselectedIds = ['12', '47', '88']
      preselectedIds.forEach((id) => api.selectRow(id))
    },
  },
})
```

---

## Live example

Checkbox multi-select with a live "N selected" readout — `onSelectionChange` fires on every check/uncheck. Since `createGrid()` runs at module scope (before any component exists — see [Chapter 01](/docs/react/getting-started#3-the-grid-api-is-how-you-control-the-grid-from-code)), the handler forwards each change through a small mutable subscriber slot that the component fills in via `useEffect`.

```tsx
import { useEffect, useState } from 'react'
import { createGrid, Grid, type GridAPI } from '@elitegrid/react'
import '@elitegrid/react/styles.css'

interface Employee {
  id: number
  name: string
  department: string
  role: string
}

const employees: Employee[] = [
  { id: 1, name: 'Ada Lovelace', department: 'Engineering', role: 'Staff Engineer' },
  { id: 2, name: 'Alan Turing', department: 'Research', role: 'Principal Scientist' },
  { id: 3, name: 'Grace Hopper', department: 'Engineering', role: 'Eng Manager' },
  { id: 4, name: 'Margaret Hamilton', department: 'Engineering', role: 'Tech Lead' },
  { id: 5, name: 'Katherine Johnson', department: 'Research', role: 'Senior Analyst' },
  { id: 6, name: 'Linus Torvalds', department: 'Engineering', role: 'Staff Engineer' },
  { id: 7, name: 'Tim Berners-Lee', department: 'Research', role: 'Principal Scientist' },
  { id: 8, name: 'Barbara Liskov', department: 'Engineering', role: 'Eng Manager' },
  { id: 9, name: 'Dennis Ritchie', department: 'Engineering', role: 'Staff Engineer' },
  { id: 10, name: 'Radia Perlman', department: 'Research', role: 'Senior Analyst' },
]

let api: GridAPI<Employee> | null = null
let onSelectionChanged: ((rows: Employee[]) => void) | null = null

const grid = createGrid<Employee>({
  columns: [
    { field: 'name', header: 'Name', size: { flex: 2 } },
    { field: 'department', header: 'Department', size: { flex: 1.5 } },
    { field: 'role', header: 'Role', size: { flex: 1.5 } },
  ],
  data: employees,
  selection: { mode: 'multiple', showCheckboxes: true },
  events: {
    onReady: (a) => { api = a },
    onSelectionChange: (rows) => onSelectionChanged?.(rows),
  },
})

export default function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    onSelectionChanged = (rows) => setCount(rows.length)
    return () => { onSelectionChanged = null }
  }, [])

  return (
    <div style={{ height: 440, display: 'flex', flexDirection: 'column', gap: 8, padding: 8, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => { api?.deselectAll(); setCount(0) }}
          style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, fontFamily: 'system-ui',
            background: '#7c3aed', color: '#ffffff',
          }}
        >
          Clear selection
        </button>
        <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontFamily: 'system-ui' }}>
          {count} selected
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Grid grid={grid} />
      </div>
    </div>
  )
}
```

[[LIVE_DEMO:react:0]]

> In a real app, `grid` (and its `events.onSelectionChange`) would typically be built once at module scope for the whole page's lifetime, same as `api` — the mutable `onSelectionChanged` slot above only exists so this one component can react to an engine it doesn't own. If the grid and the component that displays its selection count are always mounted together, an equally valid alternative is skipping the slot and just calling `setCount` directly from `events.onSelectionChange` — but that requires creating the grid *inside* the component (e.g. with `useMemo`) rather than at true module scope.

---

## Common selection mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| "3 selected" badge shows the wrong count after filtering | Counting checked DOM checkboxes instead of reading the API | Use `api.getSelectedIds().size` (or `.length` on `getSelectedRows()`) as the source of truth |
| `selectRow('42')` does nothing | The ID passed doesn't match any row's `rowId` | Double-check your `rowId` setting (see [Chapter 01](/docs/react/getting-started#what-is-rowid-important)) — a mismatched type (`42` vs `'42'`) also silently fails to match |
| Clicking a row toggles selection when it shouldn't | `selectOnRowClick` defaults to `true` | Set `selectOnRowClick: false` (optionally with `checkboxOnly: true`) if rows should only select via their checkbox |
| "Select all" selected far more rows than expected | `selectAllScope: 'all'` selects every *filtered* row, not just the visible page | Use the default `'page'` scope, or make the scope explicit in your UI copy ("Select all 240 results") so it isn't a surprise |

---

Next: [07 · Inline Editing](/docs/react/editing)
