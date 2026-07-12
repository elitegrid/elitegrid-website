# 15 · Full Working Example

This chapter ties every feature together into one realistic, copy-pasteable component: an **Employee** grid with sorting, filtering, pagination, multiple selection, inline editing with validation, value formatting, CSV export, a custom toolbar driven by the Grid API, and event logging.

The same code lives as a runnable file in [`examples/EmployeeGrid.tsx`](/docs/react/getting-started).

```tsx
import { useEffect, useState } from 'react'
import { createGrid, Grid } from '@elitegrid/react'
import type { GridAPI } from '@elitegrid/react'
import '@elitegrid/react/styles.css'

// ── 1. The data shape ────────────────────────────────────────────────
interface Employee {
  id: number
  name: string
  department: string
  salary: number
  active: boolean
  joinDate: string // ISO 'YYYY-MM-DD'
}

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance']

const employees: Employee[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: DEPARTMENTS[i % DEPARTMENTS.length]!,
  salary: 50_000 + (i % 50) * 1_000,
  active: i % 3 !== 0,
  joinDate: new Date(2015, i % 12, (i % 28) + 1).toISOString().split('T')[0]!,
}))

// ── 2. Create the grid ONCE, outside the component ───────────────────
const grid = createGrid<Employee>({
  // unique ID field — `id` is the default, shown here for clarity
  rowId: 'id',

  columns: [
    {
      field: 'name',
      header: 'Name',
      size: { flex: 2, minWidth: 140 },
      display: { pinned: 'left' },
      filter: { type: 'text' },
      edit: {
        enabled: true,
        type: 'text',
        validator: (value) =>
          !value || String(value).trim() === '' ? 'Name is required' : null,
      },
    },
    {
      field: 'department',
      header: 'Department',
      size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' },
      edit: { enabled: true, type: 'dropdown', options: DEPARTMENTS },
    },
    {
      field: 'salary',
      header: 'Salary',
      size: { flex: 1, minWidth: 100 },
      filter: { type: 'number' },
      display: {
        formatter: (v) => `$${Number(v).toLocaleString()}`,
        exportFormatter: (v) => String(v),
        cellClass: (v) => (Number(v) > 90_000 ? 'salary-high' : ''),
      },
      // only active employees' salaries are editable
      edit: {
        enabled: (row) => row.active,
        type: 'number',
        min: 0,
        max: 1_000_000,
        parser: (raw) => Number(raw),
      },
    },
    {
      field: 'active',
      header: 'Active',
      size: { flex: 1, minWidth: 90 },
      filter: { type: 'boolean' },
      display: { formatter: (v) => (v ? '✓ Active' : '✗ Inactive') },
      edit: { enabled: true, type: 'boolean' },
    },
    {
      field: 'joinDate',
      header: 'Join Date',
      size: { flex: 1, minWidth: 120 },
      display: {
        formatter: (v) =>
          v ? new Date(v as string).toLocaleDateString() : '—',
      },
      edit: {
        enabled: true,
        type: 'date',
        minDate: new Date('2010-01-01'),
        maxDate: new Date(),
      },
    },
  ],

  data: employees,

  sorting: { enabled: true, multiSort: true },
  filtering: { enabled: true },
  pagination: { enabled: true, pageSize: 25, pageSizeOptions: [25, 50, 100] },
  selection: { mode: 'multiple', selectAllScope: 'page' },
  editing: { enabled: true, trigger: 'doubleClick', moveOnTab: true },
  appearance: { rowHeight: 44, headerHeight: 48, rowStriping: true },
  accessibility: { gridLabel: 'Employee data grid', announceFocus: false },
  export: { filename: 'employees', scope: 'filtered' },
})

// ── 3. The component ─────────────────────────────────────────────────
export default function EmployeeGrid() {
  const [api, setApi] = useState<GridAPI<Employee> | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)

  // Register events that need React state via updateEvents (avoids stale closures)
  useEffect(() => {
    grid.updateEvents({
      onReady: (a) => setApi(a),
      onSelectionChange: (rows) => setSelectedCount(rows.length),
      onEditCommit: (rowId, field, value) => {
        console.log(`Saved row ${rowId}: ${field} = ${value}`)
        // 👉 persist to your backend here
      },
    })
  }, [])

  const exportSelected = () =>
    api?.exportCSV({ filename: 'selected', scope: 'selected' })

  const deleteSelected = () => {
    if (!api) return
    api.deleteRows([...api.getSelectedIds()])
    api.deselectAll()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
      {/* Custom toolbar driven by the Grid API */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <strong>{selectedCount} selected</strong>
        <button disabled={!api} onClick={() => api?.selectAll()}>Select all</button>
        <button disabled={!api} onClick={() => api?.deselectAll()}>Clear</button>
        <button disabled={!selectedCount} onClick={exportSelected}>Export selected</button>
        <button disabled={!selectedCount} onClick={deleteSelected}>Delete selected</button>
        <button disabled={!api} onClick={() => api?.exportCSV()}>Export all (filtered)</button>
        <button disabled={!api} onClick={() => api?.clearFilters()}>Clear filters</button>
      </div>

      {/* The grid — note the fixed-height wrapper */}
      <div style={{ height: 520, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <Grid grid={grid} />
      </div>
    </div>
  )
}
```

Add this CSS to your app for the conditional `salary-high` styling:

```ts
.salary-high { color: #16a34a; font-weight: 600; }
```

---

## Reading the example top to bottom

If the file looks like a lot at once, here is the same code explained in plain English. It is organised into the **three numbered sections** from the comments.

**① The data shape (`interface Employee`)** We first describe what one row looks like — an `id`, a `name`, a `salary`, and so on. Passing this type to `createGrid<Employee>` is what makes `field: 'name'` autocomplete and rejects typos. The `Array.from({ length: 200 }, …)` line just fabricates 200 fake employees so there's something to scroll; in a real app this is the data you fetched from your server. (See [Chapter 01](/docs/react/getting-started).)

**② Create the grid once, outside the component** This is the big `createGrid({ … })` call. Notice it sits at module scope, *above* the component — the single most important rule (see [Chapter 01](/docs/react/getting-started#why-must-creategrid-live-outside-the-component)). Inside it, each column turns on the features from earlier chapters:

- `name` is pinned left, text-filterable, and editable with a "required" validator ([Ch 07](/docs/react/editing)).
- `salary` is number-filtered, formatted as currency for display but exported as a plain number, colour-coded with `cellClass`, and editable **only for active employees** via the function form of `edit.enabled` ([Ch 08](/docs/react/formatting-values), [Ch 07](/docs/react/editing)).
- `active` uses a boolean filter and a single-click boolean editor.
- `joinDate` is formatted for humans and edited with a bounded date picker.

Below the columns, the grid-level groups (`sorting`, `filtering`, `pagination`, `selection`, `editing`, `appearance`, `accessibility`, `export`) switch on each feature. Every one of these has its own chapter if you want the details.

**③ The component** The React component is deliberately thin. It does three things:

1. Keeps the **Grid API** and a `selectedCount` in React state.
2. Uses `grid.updateEvents(...)` inside a `useEffect` so the event handlers always see fresh React state — the stale-closure fix from [Chapter 11](/docs/react/events#stale-closures-use-updateevents-for-handlers-that-read-react-state).
3. Renders a **custom toolbar** whose buttons simply call API methods (`api.selectAll()`, `api.exportCSV(...)`, `api.deleteRows(...)`), followed by the `<Grid>` itself inside a **fixed-height wrapper** (the grid fills its parent, so the parent must have a height).

That's the whole pattern: *configure once, control via the API, mirror state via events.* Everything else is just which options you turn on.

---

## What this example demonstrates

| Feature | Where |
| --- | --- |
| Typed columns | `createGrid<Employee>` + `field` autocomplete |
| Pinned column | `name` → `display.pinned: 'left'` |
| Flexible widths | `size.flex` + `minWidth` |
| Sorting (multi) | `sorting.multiSort` |
| Filtering (per type) | `filter.type` on each column |
| Pagination | `pagination` group |
| Multiple selection | `selection.mode` |
| Inline editing | `editing` + per-column `edit` |
| Per-row editable | `salary.edit.enabled` is a function |
| Validation | `name.edit.validator` |
| Value formatting | `salary`/`active`/`joinDate` formatters |
| Conditional styling | `salary.display.cellClass` |
| CSV export (scopes) | `api.exportCSV(...)` |
| Custom toolbar via API | `api.selectAll`, `deleteRows`, `clearFilters` |
| Events without stale state | `grid.updateEvents(...)` in `useEffect` |
| Accessibility | `accessibility.gridLabel` |

---

That's the whole React adapter. Go back to the [manual index](/docs/react) to revisit any chapter, or open the [Glossary](/docs/react/glossary) for definitions of any term used in this manual.

---

Next: [16 · Glossary](/docs/react/glossary)
