# React Manual

> A friendly, step-by-step guide to using **`@elitegrid/react`**. Written so a junior developer can read it top-to-bottom and ship a working data grid — no prior experience with the library required.

EliteGrid is a fast, fully-typed data table for React. You describe your columns and data once, drop in a `<Grid />`, and you get sorting, filtering, pagination, row selection, inline editing, CSV export, keyboard navigation, and screen-reader support — all out of the box.

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

> **New to data grids or to React?** Keep the [Glossary](/docs/react/glossary) open in a second tab. Every bolded term in the chapters (virtualization, comparator, debounce, ARIA, closure…) is defined there in one place.

There is also an [`examples/`](/docs/react/getting-started) folder with complete, copy-pasteable `.tsx` files you can drop straight into a Vite + React project.

---

## The 30-second version

```tsx
import { createGrid, Grid } from '@elitegrid/react'
import '@elitegrid/react/styles.css'

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

// 2. Create the grid ONCE, OUTSIDE your component
const grid = createGrid<User>({
  columns: [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'age', header: 'Age' },
  ],
  data: users,
})

// 3. Render it
export default function App() {
  return (
    <div style={{ height: 400 }}>
      <Grid grid={grid} />
    </div>
  )
}
```

That's a fully sortable, filterable, virtualized grid. Read on to learn what each piece does and how to turn on the rest of the features.

---

## Three concepts you must remember

These three ideas explain almost everything in this library.

### 1. `createGrid()` builds the engine — call it **once**

`createGrid()` creates the "engine" that holds your data and runs all the logic. It is **not** a React component, so you must call it **outside** your component (or memoize it) so it isn't rebuilt on every render.

```tsx
// ✅ Correct — created once
const grid = createGrid({ columns, data })
function App() { return <Grid grid={grid} /> }

// ❌ Wrong — rebuilt on every render, loses all state
function App() {
  const grid = createGrid({ columns, data }) // don't do this
  return <Grid grid={grid} />
}
```

### 2. `<Grid grid={grid} />` is the only component you render

You pass the engine into a single `<Grid>` component. It draws the header, rows, scrollbars, pagination bar — everything. **It needs a parent with a height** (it fills its container), so wrap it in a `div` with a fixed height.

### 3. The **Grid API** is how you control the grid from code

When you need to do something programmatically — select a row, change the page, export CSV — you use the **Grid API**. You get it from the `onReady` event:

```tsx
const grid = createGrid<User>({
  columns,
  data,
  events: {
    onReady: (api) => {
      // `api` has 50+ methods: api.selectRow(), api.exportCSV(), api.setPage()...
    },
  },
})
```

See [Chapter 12](/docs/react/grid-api) for the full list.

---

## Requirements

- React **18 or newer**
- You must import the stylesheet once in your app:

  ```ts
  import '@elitegrid/react/styles.css'
  ```

---

Ready? Start with [Chapter 01 — Getting Started](/docs/react/getting-started).
