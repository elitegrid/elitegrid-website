# 01 · Getting Started

This chapter gets a working grid on screen and explains the moving parts.

---

## What is a "data grid", and why use one?

A **data grid** (sometimes called a *data table*) is a component that shows a list of records — rows — in a table with columns, and adds interactive behaviour on top: clicking a header to **sort**, typing in a box to **filter**, flipping between **pages**, ticking **checkboxes** to select rows, double‑clicking a cell to **edit** it, and so on.

You *could* build all of that yourself with a plain HTML `<table>`, but you would quickly run into hard problems:

- **Performance** — a `<table>` with 50,000 `<tr>` elements freezes the browser.
- **Keyboard & screen‑reader support** — getting arrow‑key navigation and ARIA roles correct is a large amount of fiddly work.
- **State** — remembering which rows are selected, which cell is being edited, and what the current sort/filter is, then keeping the UI in sync.

EliteGrid solves all of these for you. You describe *what* your data looks like (columns + rows), and it handles the *how* (rendering, sorting, virtualization, accessibility).

> **Jargon check — "virtualization":** Instead of creating a DOM element for every row, EliteGrid only renders the handful of rows currently visible in the viewport (plus a small buffer), and recycles them as you scroll. That is why it can show a million rows without slowing down. You will see this word again in [Chapter 14](/docs/react/performance).

---

## Step 1 — Install

EliteGrid ships as two packages. The React adapter pulls in the core engine for you, so you only install one thing:

```bash
npm install @elitegrid/react
# or
pnpm add @elitegrid/react
# or
yarn add @elitegrid/react
```

> **Note:** In this monorepo the package is already linked via the workspace, so you don't need to install anything — just import from `@elitegrid/react`.

---

## Step 2 — Import the stylesheet (once)

Somewhere near the root of your app (e.g. `main.tsx`), import the CSS **one time**. Without it the grid will render but look unstyled.

```ts
// main.tsx
import '@elitegrid/react/styles.css'
```

---

## Step 3 — Describe your data with a TypeScript type

EliteGrid is "TypeScript first". Tell it the shape of one row and it will type-check your column fields for you (typos in `field` become errors).

```ts
interface Product {
  id: number
  name: string
  price: number
  inStock: boolean
}

const products: Product[] = [
  { id: 1, name: 'Keyboard', price: 49.99, inStock: true },
  { id: 2, name: 'Mouse', price: 19.99, inStock: false },
  { id: 3, name: 'Monitor', price: 199.0, inStock: true },
]
```

> **Jargon check — "interface" and "type":** A TypeScript `interface` is just a description of the *shape* of an object: which properties it has and what type each one is. It produces **no** runtime code — it exists only to let the compiler catch mistakes while you type. `Product[]` means "an array of objects that each match the `Product` shape".

---

## Step 4 — Create the grid engine

Call `createGrid()` **outside** your component. Pass it two things to start: `columns` (how to display each field) and `data` (your rows).

```tsx
import { createGrid } from '@elitegrid/react'

const grid = createGrid<Product>({
  columns: [
    { field: 'name', header: 'Product' },
    { field: 'price', header: 'Price' },
    { field: 'inStock', header: 'In Stock' },
  ],
  data: products,
})
```

- `field` must match a key on your data type (`'name'`, `'price'`…).
- `header` is the text shown in the column header.

> **Why `<Product>`?** The `<Product>` part is a **generic type argument** — it tells `createGrid` "the rows I'm giving you look like `Product`". With that information the editor can autocomplete `field` values and reject typos like `'naem'`. If you omit it the grid still works, but you lose that safety net.

> **What does "the engine" mean?** Think of EliteGrid as having two halves: a **brain** and a **face**. `createGrid()` returns the brain (also called the *engine* or *kernel*) — a plain JavaScript object that holds your data and knows how to sort, filter, paginate, and track selection. It has no appearance on its own. The `<Grid>` component you render next is the face — it reads from the brain and draws the table. Keeping them separate is what lets you control the grid from code (see the Grid API in [Chapter 12](/docs/react/grid-api)).

---

## Step 5 — Render the `<Grid>`

Drop the `<Grid>` component anywhere in your JSX and pass it the engine. **Give its parent a height** — the grid fills the space it's given.

```tsx
import { Grid } from '@elitegrid/react'

export default function App() {
  return (
    <div style={{ height: 500, border: '1px solid #e5e7eb' }}>
      <Grid grid={grid} />
    </div>
  )
}
```

---

## The complete first example

```tsx
import { createGrid, Grid } from '@elitegrid/react'
import '@elitegrid/react/styles.css'

interface Product {
  id: number
  name: string
  price: number
  inStock: boolean
}

const products: Product[] = [
  { id: 1, name: 'Keyboard', price: 49.99, inStock: true },
  { id: 2, name: 'Mouse', price: 19.99, inStock: false },
  { id: 3, name: 'Monitor', price: 199.0, inStock: true },
]

const grid = createGrid<Product>({
  columns: [
    { field: 'name', header: 'Product' },
    { field: 'price', header: 'Price' },
    { field: 'inStock', header: 'In Stock' },
  ],
  data: products,
})

export default function App() {
  return (
    <div style={{ height: 500 }}>
      <Grid grid={grid} />
    </div>
  )
}
```

[[LIVE_DEMO:react:0]]

Run it and you already have: click-to-sort headers, a filter funnel on each column, resizable columns, and keyboard arrow-key navigation. 🎉

---

## Why must `createGrid()` live outside the component?

This trips up almost every newcomer, so it is worth understanding *why*.

React re-runs your component function **every time it re-renders** — which can be many times per second. If `createGrid()` is called inside the component, a brand new engine is built on every render, throwing away the previous one along with everything it remembered (the current page, which rows were selected, the cell you were editing). The symptom is a grid that "resets" or flickers constantly.

By declaring `const grid = createGrid(...)` at module scope (outside any component), the engine is created exactly **once** when the file is first imported, and the same instance is reused for the life of the page.

```tsx
// ✅ Module scope — built once
const grid = createGrid<Product>({ columns, data })

export default function App() {
  return <Grid grid={grid} />   // re-renders reuse the same engine
}
```

> If you genuinely need to build the grid *inside* a component (for example the data only exists after a fetch), wrap it so it is created once — React's `useMemo`, or EliteGrid's own helper covered later. The rule is simply: **create the engine once, not on every render.**

---

## What is `rowId`? (important)

The grid needs a **unique ID** for every row so it can track selection, edits, and re-renders. By default it looks for a field literally called `id`.

If your unique field is named something else, tell the grid:

```tsx
const grid = createGrid<Product>({
  columns: [...],
  data: products,
  rowId: 'sku',          // a different field name
})
```

You can also pass a function if the ID is computed:

```tsx
const grid = createGrid<Product>({
  columns: [...],
  data: products,
  rowId: (row) => `${row.category}-${row.name}`,
})
```

> **Rule of thumb:** If your data has an `id` field, you can skip this. If not, always set `rowId` — otherwise selection and editing won't behave correctly.

---

## Common mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Grid is invisible / 0 height | Parent has no height | Wrap in a `div` with a height |
| Grid looks unstyled | CSS not imported | `import '@elitegrid/react/styles.css'` |
| Grid resets on every keystroke / re-render | `createGrid()` called inside the component | Move it outside the component |
| Selection/edit acts on the wrong row | Missing/duplicate row IDs | Set `rowId` to a unique field |

---

Next: [02 · Columns](/docs/react/columns)
