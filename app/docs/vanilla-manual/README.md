# Vanilla JS Manual

> A friendly, step-by-step guide to using **`@elitegrid/vanilla`** with no framework at all. Written so a junior developer can read it top-to-bottom and ship a working data grid in a plain HTML page or any bundler-based project — no prior experience with the library required.

EliteGrid is a fast, fully-typed data table that works anywhere JavaScript runs. You describe your columns and data once, `mount()` the grid into a container element, and you get sorting, filtering, pagination, row selection, inline editing, CSV export, keyboard navigation, and screen-reader support — all out of the box, with zero framework dependency.

> **Already using React or Vue?** Skip this manual and read the [React Manual](/docs/react) or [Vue Manual](/docs/vue) instead — `@elitegrid/react` and `@elitegrid/vue` wrap the same underlying engine as `@elitegrid/vanilla`, just with a `<Grid>` component and framework-native hooks/composables instead of `mount()`. This manual is for everyone else: plain HTML pages, Svelte, Angular, jQuery-era codebases, or anywhere you'd rather talk to the DOM directly.

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

> **New to data grids or to vanilla JS/DOM APIs?** Keep the [Glossary](/docs/vanilla/glossary) open in a second tab. Every bolded term in the chapters (virtualization, comparator, debounce, ARIA, event bus…) is defined there in one place.

There is also an [`examples/`](/docs/vanilla/getting-started) folder with a complete, copy-pasteable `.html` file you can open directly in a browser.

---

## The 30-second version

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/@elitegrid/vanilla/dist/styles.css" />
  </head>
  <body>
    <div id="grid-container" style="height: 400px"></div>

    <script type="module">
      import { createGrid, mount } from '@elitegrid/vanilla'

      // 1. Define your data
      const users = [
        { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', age: 36 },
        { id: 2, name: 'Alan Turing', email: 'alan@example.com', age: 41 },
      ]

      // 2. Create the grid — a plain object, no framework involved
      const grid = createGrid({
        columns: [
          { field: 'name', header: 'Name' },
          { field: 'email', header: 'Email' },
          { field: 'age', header: 'Age' },
        ],
        data: users,
      })

      // 3. Mount it into a container element
      mount(grid, document.getElementById('grid-container'))
    </script>
  </body>
</html>
```

That's a fully sortable, filterable, virtualized grid. Read on to learn what each piece does and how to turn on the rest of the features.

---

## Three concepts you must remember

These three ideas explain almost everything in this library.

### 1. `createGrid()` builds the engine

`createGrid()` creates the "engine" that holds your data and runs all the logic — sorting, filtering, pagination, selection, editing. It is a **plain function that returns a plain object**. It doesn't touch the DOM and has no idea what a component or a re-render is, because in vanilla JS there is no framework re-running your code — you just call it once, wherever your script starts.

```ts
import { createGrid } from '@elitegrid/vanilla'

const grid = createGrid({ columns, data })
```

> **Why is this simpler than the React/Vue version?** In React and Vue, `createGrid()` has to be called carefully (outside a component, or via a special hook) to avoid rebuilding the engine on every re-render. Vanilla JS has no re-render cycle at all — your `<script>` runs top to bottom, once. So the rule is trivially satisfied: call `createGrid()` once, and hang on to the `grid` variable for as long as you need it.

### 2. `mount(grid, container)` draws it into the DOM

`mount()` is the vanilla equivalent of React's `<Grid grid={grid} />` or Vue's `<Grid :grid="grid" />` — it's the one function that actually draws the header, rows, scrollbars, and pagination bar. **The container needs a height** (the grid fills whatever space it's given), and `mount()` needs the container to already exist in the DOM.

```ts
import { mount } from '@elitegrid/vanilla'

const container = document.getElementById('grid-container')
const dispose = mount(grid, container)
```

`mount()` returns a **dispose function**. Call it when you remove the grid from the page (e.g. navigating away in a hand-rolled SPA, or closing a modal) to clean up its DOM and event listeners. See [Chapter 12](/docs/vanilla/grid-api#cleaning-up) for exactly what it tears down.

### 3. The **Grid API** is how you control the grid from code

When you need to do something programmatically — select a row, change the page, export CSV — you use the **Grid API**. Because vanilla JS has no `onReady`-style component lifecycle to lean on, you have two ways to get it:

```ts
// Option A — build it directly, any time after createGrid()
import { buildGridAPI } from '@elitegrid/vanilla'
const api = buildGridAPI(grid)

// Option B — receive it once the grid has finished its first render
const grid = createGrid({
  columns,
  data,
  events: {
    onReady: (api) => {
      // `api` has 50+ methods: api.selectRow(), api.exportCSV(), api.setPage()...
    },
  },
})
```

See [Chapter 12](/docs/vanilla/grid-api) for the full list, and for when to reach for each option.

---

## Requirements

- Any environment that can run modern JavaScript and touch the DOM — a plain `<script type="module">` tag, Vite, webpack, esbuild, or any other bundler. No framework required.
- You must import the stylesheet once in your page:

  ```ts
  import '@elitegrid/vanilla/styles.css'
  ```

  or, without a bundler, link it directly:

  ```html
  <link rel="stylesheet" href="/node_modules/@elitegrid/vanilla/dist/styles.css" />
  ```

---

Ready? Start with [Chapter 01 — Getting Started](/docs/vanilla/getting-started).
