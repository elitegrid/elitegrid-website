# 05 · Pagination

Pagination splits your data into pages with a control bar at the bottom of the grid. It is **off by default** — the grid virtualizes (smoothly scrolls) all rows instead. Turn pagination on when you prefer page-by-page navigation.

> **Pagination vs. virtualization:** EliteGrid can render a million rows smoothly *without* pagination thanks to virtualization (see [Chapter 14](/docs/vanilla/performance)). Pagination is a UX choice, not a performance requirement.

> **Jargon check — "page" and "page size":** A *page* is one screenful of rows. *Page size* is how many rows are on each page. With 240 rows and a page size of 25, you get 10 pages (the last one holds only 15). "Pagination" is just the act of splitting the rows up this way and giving the user buttons to move between the chunks — the same idea as page numbers at the bottom of search results.

---

## When should I use pagination?

Because virtualization already makes huge datasets fast, pagination is about *how users prefer to navigate*, not speed. Reach for it when:

- Users expect "page 3 of 10"-style navigation (reports, admin tables).
- You want a predictable, fixed grid height instead of a long scroll.
- Your data comes from a server one page at a time (see [Chapter 14](/docs/vanilla/performance#server-side-data-with-datasource)).

Leave it **off** (the default) when an endless, smooth scroll feels more natural — like a feed or a large lookup list.

---

## Turning pagination on

```ts
const grid = createGrid<User>({
  columns,
  data,
  pagination: {
    enabled: true,
    pageSize: 25,
  },
})
```

---

## Pagination options

These go in the `pagination` group:

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | Turn pagination on |
| `pageSize` | `number` | `25` | Rows per page |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Choices in the size dropdown |
| `showPageSizeSelector` | `boolean` | `true` | Show the "rows per page" dropdown |
| `showRowCount` | `boolean` | `true` | Show "1–25 of 100" text |
| `showPageNumbers` | `boolean` | `true` | Show numbered page buttons |

```ts
pagination: {
  enabled: true,
  pageSize: 50,
  pageSizeOptions: [50, 100, 200],
  showPageSizeSelector: true,
  showRowCount: true,
  showPageNumbers: true,
}
```

---

## Controlling pages from code (the API)

```ts
api.setPage(3)          // jump to page 3 (1-based)
api.setPageSize(100)    // change rows per page
api.nextPage()
api.previousPage()
api.firstPage()
api.lastPage()

// Read the full pagination state
const state = api.getPaginationState()
// {
//   currentPage: 3,
//   pageSize: 25,
//   totalRows: 240,
//   totalPages: 10,
//   startRow: 51,
//   endRow: 75,
//   hasNextPage: true,
//   hasPreviousPage: true,
// }
```

> **Reading the state object.** Each field answers a question you'd otherwise have to compute yourself:
>
> - `currentPage` / `totalPages` — "page 3 of 10".
> - `pageSize` — rows shown per page right now.
> - `totalRows` — how many rows exist *after filtering* (not the raw data length).
> - `startRow` / `endRow` — the 1-based range on screen ("showing 51–75").
> - `hasNextPage` / `hasPreviousPage` — booleans handy for disabling your own Next/Prev buttons at the ends.
>
> **Note** pages are **1-based**: the first page is `1`, not `0`.

---

## Reacting to page changes

`onPageChange` fires both when the page changes **and** when the page size changes:

```ts
events: {
  onPageChange: (page, pageSize) => {
    console.log(`Now on page ${page}, showing ${pageSize} per page`)
  },
}
```

---

## A minimal example

```ts
const grid = createGrid<User>({
  columns: [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
  ],
  data: thousandsOfUsers,
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [20, 50, 100],
  },
  events: {
    onPageChange: (page) => console.log('page', page),
  },
})
```

---

## Pagination and filtering together

When the user changes a **filter**, the current page can easily no longer make sense — page 5 might not exist anymore once the filter removes most of the rows. EliteGrid handles this for you: **applying a filter automatically returns to page 1.** `onFilterChange` fires first, and — only if the page actually changed (i.e. you weren't already on page 1) — `onPageChange` follows right after:

```ts
events: {
  onFilterChange: () => console.log('1: filters changed'),
  onPageChange: (page) => console.log('2: now on page', page), // only if page moved
}
```

**Sorting does not do this.** Changing the sort re-orders the current page in place and leaves you on the same page number — there's no reason to jump back to page 1 just because the rows on your current page are now in a different order.

If you're driving your own "page X of Y" UI outside the grid, subscribing to the pagination store (shown below) is always current — no need to read it inside a specific event handler.

---

## Building your own pager UI

The built-in pager covers most needs, but if you want fully custom controls (e.g. to match an existing design system), hide the default one and drive pagination entirely from the API:

```ts
pagination: {
  enabled: true,
  pageSize: 25,
  showPageNumbers: false,
  showRowCount: false,
  showPageSizeSelector: false,
}
```

Every `GridInstance` exposes its internal **event bus** and **data store** through `grid.kernel`. Instead of a framework hook, subscribe directly to the `paginated` namespace — it's a plain function that calls you back whenever that slice of state changes, and returns an `unsubscribe` function:

```ts
const prevBtn = document.querySelector<HTMLButtonElement>('#prev-page')!
const nextBtn = document.querySelector<HTMLButtonElement>('#next-page')!
const label = document.querySelector<HTMLSpanElement>('#page-label')!

function render(state: { currentPage: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }) {
  label.textContent = `Page ${state.currentPage} of ${state.totalPages}`
  prevBtn.disabled = !state.hasPreviousPage
  nextBtn.disabled = !state.hasNextPage
}

// Paint the initial state, then keep it in sync automatically
render(grid.kernel.store.read('paginated'))
const unsubscribe = grid.kernel.store.subscribe('paginated', render)

prevBtn.addEventListener('click', () => grid.plugins.pagination.previousPage())
nextBtn.addEventListener('click', () => grid.plugins.pagination.nextPage())

// When you tear the pager down, stop listening:
// unsubscribe()
```

> `store.read(namespace)` gives you a one-off snapshot (handy for the very first paint); `store.subscribe(namespace, callback)` calls your function again every time that namespace changes, and hands back an `unsubscribe` function — remember to call it when you remove the pager from the page, or use the `dispose` function from `mount()` with `{ destroyOnDispose: true }` to tear everything down together (see [Chapter 12](/docs/vanilla/grid-api#cleaning-up)). The buttons above call straight through to the pagination plugin; `api.nextPage()` / `api.previousPage()` from `buildGridAPI(grid)` work identically.

---

## Common pagination mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Page 3 of 3" but the page looks empty | You jumped to a page with `api.setPage()` *before* data/filters settled | Read `totalPages` from `api.getPaginationState()` after the change, or clamp your target page to it |
| Custom pager shows a stale page number | Reading `getPaginationState()` once instead of subscribing | Use `grid.kernel.store.subscribe('paginated', render)` (shown above) so your UI updates on its own, instead of a one-off snapshot |
| Page resets unexpectedly while typing in a filter | Expected — see "Pagination and filtering together" above | Nothing to fix; this is intentional so users don't land on a now-invalid page |
| `pageSize` change doesn't seem to do anything | `pagination.enabled` is `false` | Pagination options only take effect once `enabled: true` |
| Custom pager keeps working after the grid was removed from the page | Forgot to call the `unsubscribe` function from `store.subscribe()` | Store it and call it alongside `mount()`'s `dispose()` function |

---

Next: [06 · Row Selection](/docs/vanilla/selection)
