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

> **Jargon check — "virtualization":** Instead of creating a DOM element for every row, EliteGrid only renders the handful of rows currently visible in the viewport (plus a small buffer), and recycles them as you scroll. That is why it can show a million rows without slowing down. You will see this word again in [Chapter 14](/docs/vue/performance).

---

## Step 1 — Install

EliteGrid ships as two packages. The Vue adapter pulls in the core engine for you, so you only install one thing:

```bash
npm install @elitegrid/vue
# or
pnpm add @elitegrid/vue
# or
yarn add @elitegrid/vue
```

> **Note:** In this monorepo the package is already linked via the workspace, so you don't need to install anything — just import from `@elitegrid/vue`.

---

## Step 2 — Import the stylesheet (once)

Somewhere near the root of your app (e.g. `main.ts`), import the CSS **one time**. Without it the grid will render but look unstyled.

```ts
// main.ts
import '@elitegrid/vue/styles.css'
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

Call `createGrid()` inside `<script setup>`. Pass it two things to start: `columns` (how to display each field) and `data` (your rows).

```vue
<script setup lang="ts">
import { createGrid } from '@elitegrid/vue'

const grid = createGrid<Product>({
  columns: [
    { field: 'name', header: 'Product' },
    { field: 'price', header: 'Price' },
    { field: 'inStock', header: 'In Stock' },
  ],
  data: products,
})
</script>
```

- `field` must match a key on your data type (`'name'`, `'price'`…).
- `header` is the text shown in the column header.

> **Why `<Product>`?** The `<Product>` part is a **generic type argument** — it tells `createGrid` "the rows I'm giving you look like `Product`". With that information the editor can autocomplete `field` values and reject typos like `'naem'`. If you omit it the grid still works, but you lose that safety net.

> **What does "the engine" mean?** Think of EliteGrid as having two halves: a **brain** and a **face**. `createGrid()` returns the brain (also called the *engine* or *kernel*) — a plain JavaScript object that holds your data and knows how to sort, filter, paginate, and track selection. It has no appearance on its own. The `<Grid>` component you render next is the face — it reads from the brain and draws the table. Keeping them separate is what lets you control the grid from code (see the Grid API in [Chapter 12](/docs/vue/grid-api)).

---

## Step 5 — Render the `<Grid>`

Drop the `<Grid>` component anywhere in your template and bind it to the engine with `:grid`. **Give its parent a height** — the grid fills the space it's given.

```vue
<script setup lang="ts">
import { Grid } from '@elitegrid/vue'
</script>

<template>
  <div style="height: 500px; border: 1px solid #e5e7eb">
    <Grid :grid="grid" />
  </div>
</template>
```

---

## The complete first example

```vue
<script setup lang="ts">
import { createGrid, Grid } from '@elitegrid/vue'
import '@elitegrid/vue/styles.css'

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
</script>

<template>
  <div style="height: 500px">
    <Grid :grid="grid" />
  </div>
</template>
```

Run it and you already have: click-to-sort headers, a filter funnel on each column, resizable columns, and keyboard arrow-key navigation. 🎉

---

## Why is this safe in `<script setup>`, unlike some other frameworks?

This trips up developers coming from frameworks where a component function re-runs on every render, so it's worth understanding *why* Vue is different.

A Vue `<script setup>` block runs **once** — when the component instance is created — not on every reactive update. Vue re-runs your **template** (or the render function it compiles to) when reactive state changes, but the plain `const grid = createGrid(...)` line at the top of your script only ever executes a single time for that component instance. There is no equivalent of "the engine gets rebuilt every render" to worry about here.

```vue
<script setup lang="ts">
// ✅ Runs once per component instance — no special handling needed
const grid = createGrid<Product>({ columns, data })
</script>

<template>
  <Grid :grid="grid" /> <!-- template re-renders reuse the same engine -->
</template>
```

> **When you *do* need to think about lifetime:** if the component holding the grid is itself created and destroyed repeatedly — a routed page, a modal, a tab that unmounts — the engine you built in `<script setup>` is destroyed along with the component instance, but nothing tears down its internal listeners automatically unless you ask it to. Use `useCreateGrid()` instead of `createGrid()` in that situation; it's identical, except it calls `grid.kernel.destroy()` for you in `onBeforeUnmount`:
>
> ```ts
> import { useCreateGrid } from '@elitegrid/vue'
>
> const grid = useCreateGrid<Product>({ columns, data }) // cleaned up automatically
> ```
>
> The rule of thumb: reach for `useCreateGrid()` by default inside components that come and go; use `createGrid()` at module scope only for a single grid meant to persist for the whole app's lifetime.

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
| Grid is invisible / 0 height | Parent has no height | Wrap in a `div` with a height |
| Grid looks unstyled | CSS not imported | `import '@elitegrid/vue/styles.css'` |
| Grid resets or loses state unexpectedly | `createGrid()` was called inside a `computed`/`watchEffect` that re-runs, building a new engine each time | Call `createGrid()`/`useCreateGrid()` once, directly in `<script setup>`, not inside reactive code that re-executes |
| Selection/edit acts on the wrong row | Missing/duplicate row IDs | Set `rowId` to a unique field |
| "Grid components must be used inside `<Grid>`" error | A composable like `useGridContext()` was called outside the `<Grid>` component's tree | Only use grid composables in components rendered as children of `<Grid :grid="grid">` |

---

Next: [02 · Columns](/docs/vue/columns)
