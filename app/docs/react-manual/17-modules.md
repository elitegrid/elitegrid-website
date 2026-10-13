# Modules

Every feature in this manual is one of two kinds: **mandatory** — you get it whether you ask or not — or a **module**, which only exists in your app if you name it.

This chapter is short, and it is the one to read before the others. If a feature from another chapter does nothing when you try it, you are almost certainly missing its module, and this is the page that tells you which one.

---

## The one-line version

If you want everything, and you do not want to think about it:

```tsx
import { createGrid, AllModules, Grid } from '@elitegrid/react'

const grid = createGrid<User>({
  modules: [AllModules],
  columns,
  data,
})
```

That is the whole upgrade path from `0.1.x`. `AllModules` behaves — and weighs — exactly the way the grid did before modules existed. Nothing in this chapter is work you *must* do; trimming the list is opt-in.

> **Coming from an older version?** Before modules, `createGrid({ columns, data })` gave you sorting, filtering, pagination, selection, editing and export automatically. It no longer does. Adding `modules: [AllModules]` restores that exactly. Every code sample in this manual includes a `modules` line for the same reason.

---

## Why features are opt-in

A runtime flag like `sorting: { enabled: false }` turns a feature **off**. It does not remove the sorting code from the JavaScript your users download — the code still ships, it just sits there deciding not to run.

A module is different. `SortModule` is a value you import. If you never import it, the bundler can see that nothing references the sort plugin, and it drops the whole thing. That is a thing no flag can do.

The payoff is real and measured:

| What you register | Gzipped | Saving |
| --- | ---: | ---: |
| Everything (`[AllModules]`) | 76.9 kB | — |
| Nothing (`modules: []`) | 55.5 kB | **21.4 kB less** |

Both figures are gzipped, measured by the benchmark harness rather than estimated. Trimming to `modules: []` saves you about 21 kB — worth having, and the reason the system exists, but notice that the grid is still 55.5 kB. That floor is the mandatory half, described below.

> **Jargon check — "tree-shaking":** The bundler's ability to delete code nothing references. It only works when the bundler can *prove* the code is unused, which is why modules are plain values you import rather than strings you configure. A string like `'sort'` tells the bundler nothing.

---

## What you always get

Eight modules are mandatory. `createGrid` adds them itself, you cannot remove them, and you never name them:

| Module | Why it is not optional |
| --- | --- |
| `DataSourceModule` | Holds your rows |
| `RowModelModule` | Row identity — which row is which |
| `ColumnModelModule` | Your column definitions |
| `CellValueModule` | Resolves the value for every cell drawn |
| `PipelineBridgeModule` | Connects raw → filtered → sorted → paginated |
| `ViewportModule` | Virtualization and scrolling |
| `FocusModule` | Keyboard navigation |
| `AnnouncementModule` | Screen-reader announcements |

The first six are structural: without rows, identity, columns, a viewport or cell-value resolution there is nothing to render at all.

The last two are a deliberate product decision rather than a technical limit. Focus and Announcement are as removable as Sort or Filter — but making accessibility opt-in means that in practice almost nobody opts in, and "the grid announces sort, filter and page changes to a screen reader" quietly stops being true for most installs. **Keyboard navigation and screen-reader support are not features you should have to know to enable**, so they are in the floor.

---

## The modules you can register

```tsx
import {
  createGrid,
  SortModule,
  FilterModule,
  SearchModule,
  GroupModule,
  PaginationModule,
  SelectionModule,
  EditModule,
  ExportModule,
  MenuModule,
  InfiniteScrollModule,
} from '@elitegrid/react'
```

| Module | Turns on | Chapter |
| --- | --- | --- |
| `SortModule` | Clicking a header to sort; sort arrows | [Sorting](/docs/react/sorting) |
| `FilterModule` | The funnel icon, filter popovers, floating filters | [Filtering](/docs/react/filtering) |
| `SearchModule` | Global quick-filter across all columns | [Filtering](/docs/react/filtering) |
| `GroupModule` | Row grouping, aggregation, group heading rows | — |
| `PaginationModule` | The pagination bar and page state | [Pagination](/docs/react/pagination) |
| `SelectionModule` | Checkboxes and row selection | [Row Selection](/docs/react/selection) |
| `EditModule` | Double-click-to-edit and the cell editor | [Inline Editing](/docs/react/editing) |
| `ExportModule` | `api.exportCSV()` and CSV generation | [Exporting to CSV](/docs/react/export) |
| `MenuModule` | The header `⋮` menu and the right-click context menu | — |
| `InfiniteScrollModule` | Load-as-you-scroll instead of pages | — |

`AllModules` contains the first nine. **`InfiniteScrollModule` is deliberately not in it** — see below.

### Picking a list

Register what you use. A read-only report with sortable columns and a CSV button:

```tsx
import { createGrid, SortModule, ExportModule, Grid } from '@elitegrid/react'

const grid = createGrid<Row>({
  modules: [SortModule, ExportModule],
  columns,
  data,
})
```

Order does not matter — each module sorts itself into the pipeline by its own internal priority, so you can list them however reads best.

A genuinely minimal grid is legal too. `modules: []` gives you a scrolling, virtualized, keyboard-navigable, screen-reader-friendly table with no sort, filter, paging, selection, editing or export:

```tsx
const grid = createGrid<Row>({ modules: [], columns, data })
```

---

## When you forget one

This is the failure mode worth recognising, because the grid does not crash — **a missing module hides its affordance rather than breaking**. That is intentional: nothing renders a control that would silently do nothing.

| You forgot | What you see |
| --- | --- |
| `SortModule` | Headers render, clicking one does nothing, no sort arrow |
| `FilterModule` | No funnel icon anywhere |
| `PaginationModule` | No pagination bar; every row on one page |
| `SelectionModule` | No checkboxes, even with `selection: { mode: 'multiple' }` |
| `EditModule` | Double-clicking a cell does nothing, even with `edit` configured |
| `ExportModule` | `api.exportCSV()` is a no-op |
| `MenuModule` | No `⋮` button and no right-click menu |

So the diagnosis is always the same: *the control I expected is not there* → the module is not registered.

### Import modules from the adapter, not from core

This one is worth care, because it is the only way to get a module that is *half* working. Several modules own a piece of UI — `GroupModule` owns the group heading row, `EditModule` the cell editor, `PaginationModule` the pagination bar, `FilterModule` the filter surfaces, `MenuModule` both menus. The copy that carries the component lives in **`@elitegrid/react`**. `@elitegrid/core` exports a bare copy that registers the behaviour and renders nothing.

```tsx
// ✅ correct — carries the React components
import { GroupModule, EditModule } from '@elitegrid/react'

// ❌ wrong — groups and edits correctly, renders no group rows and no editor
import { GroupModule, EditModule } from '@elitegrid/core'
```

You do not have to remember this, because the grid tells you in development:

```
[EliteGrid] GroupModule is registered but its "groupRow" component is missing,
so its output will not render. Import GroupModule from your adapter package
(@elitegrid/react, @elitegrid/vue, @elitegrid/vanilla) rather than from
@elitegrid/core — the adapter's copy is the one that carries the component.
```

The short rule: **everything comes from `@elitegrid/react`.** You should never need to import from `@elitegrid/core` directly.

---

## Two modules with a quirk

### `InfiniteScrollModule` is not in `AllModules`

Infinite scroll and pagination are mutually exclusive — one replaces pages with endless scrolling, the other provides the pages. `AllModules` contains `PaginationModule`, so if it also contained `InfiniteScrollModule` every grid built with `AllModules` would warn about the conflict and then disable one of them.

It is also the kind of feature that must never switch on by surprise: an upgrade that silently turned a paginated server-side grid into an endlessly scrolling one would be a bug, not a gift. So you name it explicitly, and you drop pagination when you do:

```tsx
const grid = createGrid<Row>({
  modules: [SortModule, InfiniteScrollModule],
  columns,
  dataSource,
  infiniteScroll: { pageSize: 100 },
})
```

### `MenuModule` carries no behaviour

Every other module registers a plugin. `MenuModule` registers nothing — it exists purely as a bundling key for the column menu and the context menu components. Its only job is to let you leave two fairly large UI trees out of your bundle.

That means a hand-picked list must name it explicitly to keep the menus, even if you have configured them:

```tsx
const grid = createGrid<Row>({
  modules: [SortModule, MenuModule], // without MenuModule, no ⋮ and no right-click menu
  columns,
  data,
  columnMenu: { enabled: true },
})
```

If you configure a menu without registering the module, you get a warning rather than silence:

```
[EliteGrid] The column menu and context menu need MenuModule, which is not
registered, so the ⋮ button and the right-click menu will not render. Add
MenuModule to `modules` (it is already in AllModules), or set
`columnMenu: { enabled: false }` to silence this.
```

---

## Writing your own module

If you are building a package on top of EliteGrid and want to ship your own plugin, `defineModule` is the supported entry point:

```tsx
import { createGrid, defineModule, defineBundle } from '@elitegrid/react'

const AuditModule = defineModule({
  id: 'audit-log',
  key: 'audit',
  order: 90,
  create: (ctx) => new AuditPlugin(ctx.options),
})

// Several of your own modules under one name
const MyGridBundle = defineBundle({
  id: 'my-company-grid',
  dependsOn: [SortModule, FilterModule, AuditModule],
})

const grid = createGrid<Row>({ modules: [MyGridBundle], columns, data })
```

Use `withUI` if your module also owns a React component that the renderer should pick up, the same way `GroupModule` supplies its group row.

> **One caveat if you care about bundle size in your own package:** declare your bundles as *object literals* where you can. A call like `defineBundle({ … })` at the top level of a file is something a bundler cannot prove is harmless, so it keeps the call — and keeping the call keeps everything you passed to it. This matters for library authors, not for application code.

---

## Checklist

- Want the old behaviour with no thought? `modules: [AllModules]`.
- A feature does nothing? Its module is not in your list.
- A feature behaves but renders nothing? You imported it from `@elitegrid/core` instead of `@elitegrid/react`.
- Using the column or context menu with a hand-picked list? Add `MenuModule`.
- Using infinite scroll? Name `InfiniteScrollModule` and drop `PaginationModule`.
- Keyboard navigation and screen-reader support need no module and cannot be removed.

Next: [Columns](/docs/react/columns) covers what you can do with a column definition.
