# 14 · Performance & Large Data

EliteGrid is designed to stay fast with very large datasets. This chapter explains how, and how to feed data from a server.

---

## Virtualization — how it renders a million rows

The grid only renders the rows that are actually visible in the scroll viewport (plus a small buffer above and below). Scrolling swaps which rows are drawn. This means the DOM stays tiny no matter how many rows you have, so 100, 100,000, or 1,000,000 rows all scroll smoothly.

You don't have to enable anything — virtualization is always on.

> **The terms behind this:**
>
> - **DOM** ("Document Object Model") is the browser's live, in-memory tree of the HTML elements currently on the page. Every visible element costs memory and time to lay out and paint. A table with a million `<div>` rows would mean a million DOM nodes — far too many, and the page would freeze.
> - **Viewport** is the visible window onto the data — the scrollable area you can actually see. Typically only a few dozen rows fit at once.
> - **Buffer** is a handful of extra rows rendered just *above and below* the viewport so that when you scroll, the next rows are already there instead of appearing as a blank flash.
>
> So instead of a million DOM nodes, the grid keeps roughly *(visible rows + buffer)* nodes — a few dozen — and reuses them as you scroll. That constant, tiny node count is what keeps it fast.

### Tuning the scroll buffer

The `scroll.bufferSize` controls how many extra rows are rendered just outside the viewport. Higher = less chance of a blank flash on fast scrolling, but slightly more DOM.

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `bufferSize` | `number` | `10` | Extra rows rendered above & below the viewport |

```tsx
const grid = createGrid<Row>({
  columns,
  data: millionRows,
  scroll: { bufferSize: 30 }, // smoother fast-scroll for heavy datasets
})
```

> The default of `10` is good for most apps. Raise it (e.g. 20–40) if you see blank rows flash during very fast scrolling. Lower it if your cells are heavy to render.

---

## Pagination vs. virtualization

You do **not** need pagination for performance — virtualization already handles huge datasets. Use pagination only if page-by-page navigation is the UX you want. See [Chapter 05](/docs/react/pagination).

---

## Server-side data with `dataSource`

So far we've assumed all your rows are already in the browser (the `data` array). That works wonderfully up to tens of thousands of rows. But some datasets are simply too big to download in one go — millions of records, or data that changes constantly on the server.

For those cases, provide a `dataSource` instead of `data`. This flips the model: instead of you handing the grid everything, the grid asks **you** for one page at a time, and you fetch just that page from your server. Because the server only sends the rows currently needed, the browser stays light. Sorting, filtering, and paging then happen on the server (it has all the data), and the grid tells your `getRows` function the current sort/filter/page so your query can honour them.

> **`async` and `Promise` (used below).** Fetching from a server takes time, so `getRows` is marked `async` and returns a `Promise` — a placeholder for "a value that will arrive later". The `await` keyword pauses inside the function until the network response comes back. The grid shows its loading overlay (see [Chapter 09](/docs/react/appearance#loading-state)) while it waits.

A data source is any object with a `getRows` method:

```tsx
import type { IDataSource, DataSourceParams, DataSourceResult } from '@elitegrid/core'

const serverData: IDataSource<User> = {
  async getRows(params: DataSourceParams): Promise<DataSourceResult<User>> {
    const { page, pageSize, sortModel, filterModel } = params

    const res = await fetch('/api/users?' + new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: JSON.stringify(sortModel),
      filter: JSON.stringify(filterModel),
    }))
    const json = await res.json()

    return {
      rows: json.rows,          // this page's rows
      totalCount: json.total,   // total rows across all pages
    }
  },
}

const grid = createGrid<User>({
  columns,
  dataSource: serverData,   // ← use dataSource instead of data
  pagination: { enabled: true, pageSize: 50 },
})
```

`DataSourceParams` (what the grid sends you):

| Field | Type | Meaning |
| --- | --- | --- |
| `page` | `number` | Which page to fetch |
| `pageSize` | `number` | Rows per page |
| `sortModel` | `SortModel[]` | Current sort columns/directions |
| `filterModel` | `FilterModel` | Current filters |

`DataSourceResult` (what you return):

| Field | Type | Meaning |
| --- | --- | --- |
| `rows` | `TData[]` | The rows for the requested page |
| `totalCount` | `number` | Total rows (so the grid can show page counts) |

To re-fetch (e.g. after an external change), call `api.refreshData()`.

---

## Performance tips checklist

- ✅ Create the grid **once** outside your component (the #1 mistake — see [Ch. 01](/docs/react/getting-started)).
- ✅ Keep `formatter` functions cheap — they run for every visible cell on every scroll frame. Avoid heavy work or object allocation inside them.
- ✅ Set a unique `rowId` so the grid can track rows efficiently.
- ✅ For server data, use a `dataSource` so the server does the heavy filtering/sorting.
- ✅ Debounce `onScrollChange` if you do work in it — it fires very frequently.
- ✅ Selecting one row only re-renders that row, not the whole grid — so selection stays cheap even with huge datasets.

---

## Measuring instead of guessing

Before optimizing anything, confirm there's actually a problem and find where it is:

- **Browser DevTools → Performance tab.** Record a session while scrolling and interacting with the grid. Smooth scrolling shows up as a steady ~60 frames per second; janky scrolling shows long yellow ("scripting") bars between frames.
- **React DevTools → Profiler.** Record an interaction (a sort, a filter keystroke) and check which components re-rendered. If components far outside the grid re-render on every keystroke, look for state that's broader than it needs to be.
- **Suspect `formatter`/`cellClass`/`customFilter` first.** These run per-cell, per-row respectively, on every relevant render — they're the most common source of a slowdown that looks like "the grid is slow" but is actually "my function is slow." Comment one out temporarily to confirm before rewriting anything.

---

## Common performance mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Typing in a filter box feels laggy | `debounceMs` too low, or a heavy `customFilter`/`formatter` | Raise `debounceMs` (see [Chapter 04](/docs/react/filtering)); keep formatters and custom filters cheap |
| Grid "freezes" briefly on first load with huge `data` | Loading the *entire* dataset into the browser at once | Switch to a `dataSource` so only one page is fetched at a time |
| Scrolling shows blank flashes | `scroll.bufferSize` too low for how fast users scroll | Raise `bufferSize` (see above) |
| App feels slow even when the grid is idle | Grid was re-created on every render (`createGrid` inside the component) | Move `createGrid()` to module scope — this is the single most common cause of *all* grid performance complaints |
| Selecting one row re-renders the whole page | Usually a symptom of the grid being rebuilt every render (see above), not a real selection issue | Same fix — once the engine is stable across renders, selection updates stay isolated to the affected row |

---

Next: [15 · Full Working Example](/docs/react/full-example)
