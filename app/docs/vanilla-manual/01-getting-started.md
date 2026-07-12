# 01 · Getting Started

This chapter gets a working grid on screen and explains the moving parts.

---

## What is a "data grid", and why use one?

A **data grid** (sometimes called a *data table*) is a component that shows a list of records — rows — in a table with columns, and adds interactive behaviour on top: clicking a header to **sort**, typing in a box to **filter**, flipping between **pages**, ticking **checkboxes** to select rows, double‑clicking a cell to **edit** it, and so on.

You *could* build all of that yourself with a plain HTML `<table>`, but you would quickly run into hard problems:

- **Performance** — a `<table>` with 50,000 `<tr>` elements freezes the browser.
- **Keyboard & screen‑reader support** — getting arrow‑key navigation and ARIA roles correct is a large amount of fiddly work.
- **State** — remembering which rows are selected, which cell is being edited, and what the current sort/filter is, then keeping the UI in sync.

EliteGrid solves all of these for you. You describe *what* your data looks like (columns + rows), and it handles the *how* (rendering, sorting, virtualization, accessibility) — without asking you to adopt React, Vue, or any other framework.

> **Jargon check — "virtualization":** Instead of creating a DOM element for every row, EliteGrid only renders the handful of rows currently visible in the viewport (plus a small buffer), and recycles them as you scroll. That is why it can show a million rows without slowing down. You will see this word again in [Chapter 14](/docs/vanilla/performance).

---

## Step 1 — Install

EliteGrid's framework-agnostic core ships as a single package:

```bash
npm install @elitegrid/core
# or
pnpm add @elitegrid/core
# or
yarn add @elitegrid/core
```

> **Note:** In this monorepo the package is already linked via the workspace, so you don't need to install anything — just import from `@elitegrid/core`.

> **No bundler?** `@elitegrid/core` also ships a browser-ready build you can drop straight into a `<script type="module">` tag — no build step required. See the CDN example at the end of [Chapter 15](/docs/vanilla/full-example).

---

## Step 2 — Import the stylesheet (once)

Somewhere near the top of your page, import the CSS **one time**. Without it the grid will render but look unstyled.

```ts
// main.ts
import '@elitegrid/core/styles.css'
```

Without a bundler, link it instead:

```html
<link rel="stylesheet" href="/node_modules/@elitegrid/core/dist/styles.css" />
```

---

## Step 3 — Give the grid somewhere to live

Unlike the React/Vue adapters, there's no `<Grid>` tag to drop into markup — you point EliteGrid at a plain DOM element. **Give it a height**; the grid fills whatever space its container has.

```html
<div id="grid-container" style="height: 500px; border: 1px solid #e5e7eb"></div>
```

---

## Step 4 — Describe your data

EliteGrid is "TypeScript first" — if you're writing TypeScript, tell it the shape of one row and it will type-check your column fields for you (typos in `field` become errors). If you're writing plain JavaScript, skip the `interface` and everything below still works exactly the same.

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

## Step 5 — Create the grid engine

Call `createGrid()`. Pass it two things to start: `columns` (how to display each field) and `data` (your rows).

```ts
import { createGrid } from '@elitegrid/core'

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

> **Why `<Product>`?** The `<Product>` part is a **generic type argument** — it tells `createGrid` "the rows I'm giving you look like `Product`". With that information the editor can autocomplete `field` values and reject typos like `'naem'`. If you omit it the grid still works, but you lose that safety net. Plain JavaScript users can ignore this entirely.

> **What does "the engine" mean?** Think of EliteGrid as having two halves: a **brain** and a **face**. `createGrid()` returns the brain (also called the *engine* or *kernel*) — a plain JavaScript object that holds your data and knows how to sort, filter, paginate, and track selection. It has no appearance on its own. `mount()`, which you'll call next, is the face — it reads from the brain and draws the table. Keeping them separate is what lets you control the grid from code (see the Grid API in [Chapter 12](/docs/vanilla/grid-api)).

---

## Step 6 — Mount it into the DOM

`mount()` takes the engine and a container element, and draws the grid inside it.

```ts
import { mount } from '@elitegrid/core'

const container = document.getElementById('grid-container')
mount(grid, container)
```

`mount()` throws if the container is `null` — so if you're running this before the DOM has finished loading, wrap it in a `DOMContentLoaded` listener (or place the `<script type="module">` tag after the container in your HTML, which defers execution the same way).

---

## The complete first example

```ts
import { createGrid, mount } from '@elitegrid/core'
import '@elitegrid/core/styles.css'

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

const container = document.getElementById('grid-container')
mount(grid, container)
```

```html
<div id="grid-container" style="height: 500px"></div>
```

Run it and you already have: click-to-sort headers, a filter funnel on each column, resizable columns, and keyboard arrow-key navigation. 🎉

---

## Where should `createGrid()` and `mount()` live?

This is the question React/Vue developers spend a whole section worrying about ("don't call it inside the component!"). In vanilla JS the answer is refreshingly simple: **there is no re-render cycle**, so there's no way to accidentally rebuild the engine on every frame. Your script runs once, top to bottom.

The one thing worth being deliberate about is *scope*: declare `grid` (and the `dispose` function `mount()` returns — see below) somewhere you can still reach later, if you plan to call the Grid API or clean up:

```ts
// ✅ Module-level — reachable from anywhere else in this file
const grid = createGrid<Product>({ columns, data })
const dispose = mount(grid, document.getElementById('grid-container'))

// Later, elsewhere in the same module:
window.addEventListener('beforeunload', () => dispose())
```

If you're building a page that swaps grids in and out of the same container (a tab switcher, a modal that re-opens), see [Cleaning up](/docs/vanilla/grid-api#cleaning-up) in Chapter 12 — that's the vanilla equivalent of the "don't leak the old engine" problem framework apps solve with `useCreateGrid`/`onBeforeUnmount`.

---

## What is `rowId`? (important)

The grid needs a **unique ID** for every row so it can track selection, edits, and re-renders. By default it looks for a field literally called `id`.

If your unique field is named something else, tell the grid:

```ts
const grid = createGrid<Product>({
  columns: [...],
  data: products,
  rowId: 'sku',          // a different field name
})
```

You can also pass a function if the ID is computed:

```ts
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
| Grid is invisible / 0 height | Parent has no height | Give the container a height, e.g. `style="height: 500px"` |
| Grid looks unstyled | CSS not imported | `import '@elitegrid/core/styles.css'` |
| `mount() requires a non-null container element` error | Script ran before the container existed in the DOM | Move the `<script type="module">` tag after the container, or wrap the call in a `DOMContentLoaded` listener |
| Selection/edit acts on the wrong row | Missing/duplicate row IDs | Set `rowId` to a unique field |
| Old grid's rows/listeners linger after swapping containers | `dispose()` from a previous `mount()` was never called | Call the dispose function `mount()` returned before mounting a new grid into the same spot — see [Chapter 12](/docs/vanilla/grid-api#cleaning-up) |

---

Next: [02 · Columns](/docs/vanilla/columns)
