# 15 · Full Working Example

This chapter ties every feature together into one realistic, copy-pasteable component: an **Employee** grid with sorting, filtering, pagination, multiple selection, inline editing with validation, value formatting, CSV export, a custom toolbar driven by the Grid API, and event logging.

The same code lives as a runnable file in [`examples/EmployeeGrid.vue`](/docs/vue/getting-started).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createGrid, Grid, useSelectionState } from '@elitegrid/vue'
import type { GridAPI } from '@elitegrid/vue'
import '@elitegrid/vue/styles.css'

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

// ── 2. Create the grid — directly in <script setup>, which only runs once ──
const api = ref<GridAPI<Employee> | null>(null)

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

  events: {
    onReady: (a) => {
      api.value = a
    },
    onEditCommit: (rowId, field, value) => {
      console.log(`Saved row ${rowId}: ${field} = ${value}`)
      // 👉 persist to your backend here
    },
  },
})

// ── 3. Selection count, read reactively instead of tracked by hand ────
const selection = useSelectionState(grid)

function exportSelected() {
  api.value?.exportCSV({ filename: 'selected', scope: 'selected' })
}

function deleteSelected() {
  if (!api.value) return
  api.value.deleteRows([...api.value.getSelectedIds()])
  api.value.deselectAll()
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; padding: 24px">
    <!-- Custom toolbar driven by the Grid API -->
    <div style="display: flex; gap: 8px; align-items: center">
      <strong>{{ selection.count }} selected</strong>
      <button :disabled="!api" @click="api?.selectAll()">Select all</button>
      <button :disabled="!api" @click="api?.deselectAll()">Clear</button>
      <button :disabled="!selection.count" @click="exportSelected">Export selected</button>
      <button :disabled="!selection.count" @click="deleteSelected">Delete selected</button>
      <button :disabled="!api" @click="api?.exportCSV()">Export all (filtered)</button>
      <button :disabled="!api" @click="api?.clearFilters()">Clear filters</button>
    </div>

    <!-- The grid — note the fixed-height wrapper -->
    <div style="height: 520px; border: 1px solid #e5e7eb; border-radius: 8px">
      <Grid :grid="grid" />
    </div>
  </div>
</template>
```

Add this CSS to your app for the conditional `salary-high` styling:

```css
.salary-high { color: #16a34a; font-weight: 600; }
```

---

## Reading the example top to bottom

If the file looks like a lot at once, here is the same code explained in plain English. It is organised into the **three numbered sections** from the comments.

**① The data shape (`interface Employee`)** We first describe what one row looks like — an `id`, a `name`, a `salary`, and so on. Passing this type to `createGrid<Employee>` is what makes `field: 'name'` autocomplete and rejects typos. The `Array.from({ length: 200 }, …)` line just fabricates 200 fake employees so there's something to scroll; in a real app this is the data you fetched from your server. (See [Chapter 01](/docs/vue/getting-started).)

**② Create the grid, directly in `<script setup>`** This is the big `createGrid({ … })` call. Because `<script setup>` runs once per component instance, there's no need to hoist it outside anything — see [Chapter 01](/docs/vue/getting-started#why-is-this-safe-in-script-setup-unlike-some-other-frameworks). Inside it, each column turns on the features from earlier chapters:

- `name` is pinned left, text-filterable, and editable with a "required" validator ([Ch 07](/docs/vue/editing)).
- `salary` is number-filtered, formatted as currency for display but exported as a plain number, colour-coded with `cellClass`, and editable **only for active employees** via the function form of `edit.enabled` ([Ch 08](/docs/vue/formatting-values), [Ch 07](/docs/vue/editing)).
- `active` uses a boolean filter and a single-click boolean editor.
- `joinDate` is formatted for humans and edited with a bounded date picker.

Below the columns, the grid-level groups (`sorting`, `filtering`, `pagination`, `selection`, `editing`, `appearance`, `accessibility`, `export`) switch on each feature. Every one of these has its own chapter if you want the details. The `events.onReady` handler stashes the API in a `ref` so the template can call it.

**③ The component** The `<script setup>` block does three things:

1. Keeps the **Grid API** in a `ref` (`api`), captured from `onReady`.
2. Reads the selected-row count **reactively** with `useSelectionState(grid)` instead of manually tracking it through an event handler — one line replaces what would otherwise be its own bit of local state.
3. The template renders a **custom toolbar** whose buttons simply call API methods (`api.selectAll()`, `api.exportCSV(...)`, `api.deleteRows(...)`), followed by the `<Grid>` itself inside a **fixed-height wrapper** (the grid fills its parent, so the parent must have a height).

That's the whole pattern: *configure once, control via the API, mirror state via reactive composables.* Everything else is just which options you turn on.

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
| Reactive selection count | `useSelectionState(grid)` |
| Accessibility | `accessibility.gridLabel` |

---

That's the whole Vue adapter. Go back to the [manual index](/docs/vue) to revisit any chapter, or open the [Glossary](/docs/vue/glossary) for definitions of any term used in this manual.

---

Next: [16 · Glossary](/docs/vue/glossary)
