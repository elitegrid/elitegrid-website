# 15 · Full Working Example

This chapter ties every feature together into one realistic, copy-pasteable page: an **Employee** grid with sorting, filtering, pagination, multiple selection, inline editing with validation, value formatting, CSV export, a custom toolbar driven by the Grid API, and event logging.

The same code lives as a runnable file in [`examples/employee-grid.html`](/docs/vanilla/getting-started).

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/node_modules/@elitegrid/vanilla/dist/styles.css" />
    <style>
      body { font-family: system-ui, sans-serif; }
      .toolbar { display: flex; gap: 8px; align-items: center; padding: 24px 24px 12px; }
      .grid-wrap { height: 520px; margin: 0 24px 24px; border: 1px solid #e5e7eb; border-radius: 8px; }
      .salary-high { color: #16a34a; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <strong id="selection-count">0 selected</strong>
      <button id="select-all">Select all</button>
      <button id="clear-selection">Clear</button>
      <button id="export-selected" disabled>Export selected</button>
      <button id="delete-selected" disabled>Delete selected</button>
      <button id="export-all">Export all (filtered)</button>
      <button id="clear-filters">Clear filters</button>
    </div>
    <div id="grid-container" class="grid-wrap"></div>

    <script type="module">
      import { createGrid, mount, buildGridAPI } from '@elitegrid/vanilla'

      // ── 1. The data shape ────────────────────────────────────────────────
      // interface Employee {
      //   id: number
      //   name: string
      //   department: string
      //   salary: number
      //   active: boolean
      //   joinDate: string // ISO 'YYYY-MM-DD'
      // }

      const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance']

      const employees = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        name: `Employee ${i + 1}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        salary: 50_000 + (i % 50) * 1_000,
        active: i % 3 !== 0,
        joinDate: new Date(2015, i % 12, (i % 28) + 1).toISOString().split('T')[0],
      }))

      // ── 2. Create the grid ─────────────────────────────────────────────
      const grid = createGrid({
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
              formatter: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
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

        events: {
          onEditCommit: (rowId, field, value) => {
            console.log(`Saved row ${rowId}: ${field} = ${value}`)
            // 👉 persist to your backend here
          },
        },
      })

      // ── 3. Build the API immediately — no need to wait for onReady ──────
      const api = buildGridAPI(grid)

      // ── 4. Wire up the custom toolbar ────────────────────────────────────
      const selectionCountEl = document.getElementById('selection-count')
      const exportSelectedBtn = document.getElementById('export-selected')
      const deleteSelectedBtn = document.getElementById('delete-selected')

      function renderSelection(state) {
        selectionCountEl.textContent = `${state.count} selected`
        exportSelectedBtn.disabled = state.count === 0
        deleteSelectedBtn.disabled = state.count === 0
      }

      renderSelection(grid.kernel.store.read('selection'))
      grid.kernel.store.subscribe('selection', renderSelection)

      document.getElementById('select-all').addEventListener('click', () => api.selectAll())
      document.getElementById('clear-selection').addEventListener('click', () => api.deselectAll())
      document.getElementById('export-selected').addEventListener('click', () =>
        api.exportCSV({ filename: 'selected', scope: 'selected' })
      )
      document.getElementById('delete-selected').addEventListener('click', () => {
        api.deleteRows([...api.getSelectedIds()])
        api.deselectAll()
      })
      document.getElementById('export-all').addEventListener('click', () => api.exportCSV())
      document.getElementById('clear-filters').addEventListener('click', () => api.clearFilters())

      // ── 5. Mount the grid ────────────────────────────────────────────────
      mount(grid, document.getElementById('grid-container'))
    </script>
  </body>
</html>
```

---

## Reading the example top to bottom

If the file looks like a lot at once, here is the same code explained in plain English. It is organised into the **five numbered sections** from the comments.

**① The data shape** We first describe what one row looks like — an `id`, a `name`, a `salary`, and so on (shown as a comment above since this file is plain JavaScript; in a `.ts` file this would be a real `interface Employee` passed as `createGrid<Employee>`, which makes `field: 'name'` autocomplete and reject typos). The `Array.from({ length: 200 }, …)` line just fabricates 200 fake employees so there's something to scroll; in a real app this is the data you fetched from your server. (See [Chapter 01](/docs/vanilla/getting-started).)

**② Create the grid** This is the big `createGrid({ … })` call. Because vanilla JS has no re-render cycle, there's no hoisting concern to think about — see [Chapter 01](/docs/vanilla/getting-started#where-should-creategrid-and-mount-live). Inside it, each column turns on the features from earlier chapters:

- `name` is pinned left, text-filterable, and editable with a "required" validator ([Ch 07](/docs/vanilla/editing)).
- `salary` is number-filtered, formatted as currency for display but exported as a plain number, colour-coded with `cellClass`, and editable **only for active employees** via the function form of `edit.enabled` ([Ch 08](/docs/vanilla/formatting-values), [Ch 07](/docs/vanilla/editing)).
- `active` uses a boolean filter and a single-click boolean editor.
- `joinDate` is formatted for humans and edited with a bounded date picker.

Below the columns, the grid-level groups (`sorting`, `filtering`, `pagination`, `selection`, `editing`, `appearance`, `accessibility`, `export`) switch on each feature. Every one of these has its own chapter if you want the details.

**③ Build the API** `buildGridAPI(grid)` gets us a fully working `api` object immediately — no need to wait for `onReady` since we're wiring up plain DOM buttons that already exist ([Chapter 12](/docs/vanilla/grid-api)).

**④ Wire up the custom toolbar** The selected-row count is read **live** by subscribing to the `'selection'` namespace on `grid.kernel.store` — one small function replaces what would otherwise be its own hand-rolled bit of state tracking ([Chapter 12](/docs/vanilla/grid-api#the-data-store-advanced)). Every button in the toolbar just calls an API method (`api.selectAll()`, `api.exportCSV(...)`, `api.deleteRows(...)`) — the pattern is the same everywhere: *look up the element once, add a click listener, call the API inside it.*

**⑤ Mount the grid** `mount()` draws the grid into the fixed-height `<div class="grid-wrap">` (the grid fills its parent, so the parent must have a height).

That's the whole pattern: *configure once, control via the API, mirror state via the store.* Everything else is just which options you turn on.

---

## What this example demonstrates

| Feature | Where |
| --- | --- |
| Typed columns | `createGrid<Employee>` + `field` autocomplete (TypeScript projects) |
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
| Live selection count | `grid.kernel.store.subscribe('selection', ...)` |
| Accessibility | `accessibility.gridLabel` |

---

That's the whole vanilla JS core. Go back to the [manual index](/docs/vanilla) to revisit any chapter, or open the [Glossary](/docs/vanilla/glossary) for definitions of any term used in this manual.

---

Next: [16 · Glossary](/docs/vanilla/glossary)
