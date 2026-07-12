# Vue Manual

> A friendly, step-by-step guide to using **`@elitegrid/vue`**. Written so a junior developer can read it top-to-bottom and ship a working data grid — no prior experience with the library required.

EliteGrid is a fast, fully-typed data table for Vue. You describe your columns and data once, drop in a `<Grid>`, and you get sorting, filtering, pagination, row selection, inline editing, CSV export, keyboard navigation, and screen-reader support — all out of the box.

---

## How to read this manual

Each chapter is self-contained and builds on the previous one. If you are brand new, read in order. If you just need one feature, jump straight to its chapter.

| # | Chapter | What you'll learn |
| --- | --- | --- |
| 01 | [Getting Started](./01-getting-started.md) | Install, render your first grid, the 3 core concepts |
| 02 | [Columns](./02-columns.md) | Defining columns, width, pinning, visibility |
| 03 | [Sorting](./03-sorting.md) | Single & multi-column sort, custom comparators |
| 04 | [Filtering](./04-filtering.md) | Text/number/date/boolean filters, custom filters |
| 05 | [Pagination](./05-pagination.md) | Page size, page controls |
| 06 | [Row Selection](./06-selection.md) | Single/multiple selection, checkboxes |
| 07 | [Inline Editing](./07-editing.md) | Editable cells, validation, editor types |
| 08 | [Formatting Cell Values](./08-formatting-values.md) | Formatters, getters/setters, computed columns |
| 09 | [Appearance & Theming](./09-appearance.md) | Theme, density, row height, empty/loading states |
| 10 | [Exporting to CSV](./10-export.md) | Download data as a CSV file |
| 11 | [Events](./11-events.md) | Reacting to clicks, edits, sorts, selection… |
| 12 | [The Grid API](./12-grid-api.md) | Controlling the grid from your own code |
| 13 | [Accessibility](./13-accessibility.md) | Screen-reader announcements, ARIA labels |
| 14 | [Performance & Large Data](./14-performance.md) | Virtualization, 1M rows, server-side data |
| 15 | [Full Working Example](./15-full-example.md) | Everything combined in one file |
| 16 | [Glossary](./16-glossary.md) | Plain-English definitions of every term used in this manual |

> **New to data grids or to Vue?** Keep the [Glossary](/docs/vue/glossary) open in a second tab. Every bolded term in the chapters (virtualization, comparator, debounce, ARIA, composable…) is defined there in one place.

There is also an [`examples/`](/docs/vue/getting-started) folder with a complete, copy-pasteable `.vue` file you can drop straight into a Vite + Vue project.

---

## The 30-second version

```vue
<script setup lang="ts">
import { createGrid, Grid } from '@elitegrid/vue'
import '@elitegrid/vue/styles.css'

// 1. Define your data shape
interface User {
  id: number
  name: string
  email: string
  age: number
}

const users: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', age: 36 },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com', age: 41 },
]

// 2. Create the grid — safe to do right here, `<script setup>` only runs once
const grid = createGrid<User>({
  columns: [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'age', header: 'Age' },
  ],
  data: users,
})
</script>

<!-- 3. Render it -->
<template>
  <div style="height: 400px">
    <Grid :grid="grid" />
  </div>
</template>
```

That's a fully sortable, filterable, virtualized grid. Read on to learn what each piece does and how to turn on the rest of the features.

---

## Three concepts you must remember

These three ideas explain almost everything in this library.

### 1. `createGrid()` builds the engine

`createGrid()` creates the "engine" that holds your data and runs all the logic. It is **not** a Vue component — it's a plain function that returns a plain object. Unlike some frameworks, a Vue component's `<script setup>` block runs **once** per component instance (not on every re-render), so calling `createGrid()` directly at the top of `<script setup>` is perfectly safe.

```vue
<script setup lang="ts">
// ✅ Fine — `<script setup>` runs once when the component is created
const grid = createGrid<User>({ columns, data })
</script>

<template>
  <Grid :grid="grid" />
</template>
```

If this grid lives inside a component that gets mounted and unmounted repeatedly (a route, a modal, a tab), reach for `useCreateGrid()` instead — the same thing, but it also destroys the engine automatically when the component unmounts:

```vue
<script setup lang="ts">
import { useCreateGrid, Grid } from '@elitegrid/vue'

const grid = useCreateGrid<User>({ columns, data }) // torn down on unmount, for free
</script>
```

### 2. `<Grid :grid="grid" />` is the only component you render

You pass the engine into a single `<Grid>` component. It draws the header, rows, scrollbars, pagination bar — everything. **It needs a parent with a height** (it fills its container), so wrap it in a `div` with a fixed height.

### 3. The **Grid API** is how you control the grid from code

When you need to do something programmatically — select a row, change the page, export CSV — you use the **Grid API**. You get it from the `onReady` event:

```vue
<script setup lang="ts">
const grid = createGrid<User>({
  columns,
  data,
  events: {
    onReady: (api) => {
      // `api` has 50+ methods: api.selectRow(), api.exportCSV(), api.setPage()...
    },
  },
})
</script>
```

See [Chapter 12](/docs/vue/grid-api) for the full list.

---

## Requirements

- Vue **3.3 or newer** (for `<script setup>` and the full Composition API)
- You must import the stylesheet once in your app:

  ```ts
  import '@elitegrid/vue/styles.css'
  ```

---

Ready? Start with [Chapter 01 — Getting Started](/docs/vue/getting-started).
