# 04 · Filtering

Filtering arrives with **`FilterModule`**. Register it and each column header shows a small funnel icon; clicking it opens a popover where the user picks an operator (like *contains*, *greater than*, *between*) and types a value. This chapter explains how to configure filter types and behaviour.

> **Register the module first.** Without `FilterModule` (or `AllModules`, which contains it) no funnel icon is rendered and no filter popover exists — the module is what puts the filter UI and the filter pipeline stage in your bundle. See [Chapter 02 · Modules](/docs/vanilla/modules).

> **Jargon check — three words you'll see throughout this chapter:**
>
> - **Filter** — a rule that hides rows that don't match, leaving only the ones you care about. "Show only rows where *Salary* is greater than 50,000."
> - **Operator** — the *kind* of comparison: *contains*, *equals*, *greater than*, *between*, and so on. Different data types offer different operators (you can't say a name is "greater than" another in a useful way).
> - **Popover** — the little floating panel that appears anchored to the funnel icon when you click it. It holds the operator dropdown and the value input(s).

---

## Grid-level filtering options

These go in the `filtering` group:

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Turn filtering on/off for the whole grid |
| `caseSensitive` | `boolean` | `false` | Match upper/lower case exactly |
| `debounceMs` | `number` | `300` | Wait time (ms) before applying while typing |
| `iconPosition` | `'left' \| 'right'` | `'right'` | Where the funnel icon sits |
| `showIconOnHover` | `boolean` | `false` | Only show the icon on hover |
| `filterIcon` | `HTMLElement \| string` | — | Replace the default funnel icon |
| `activeFilterIcon` | `HTMLElement \| string` | — | Icon shown when a filter is active |
| `popoverPlacement` | `'bottom' \| 'top' \| 'auto'` | `'auto'` | Where the popover opens |

```ts
const grid = createGrid<User>({
  modules: [FilterModule],
  columns,
  data,
  filtering: {
    enabled: true,
    caseSensitive: false,
    debounceMs: 300,
    popoverPlacement: 'auto',
  },
})
```

> **What is `debounceMs`?** "Debouncing" means *waiting until the user stops doing something before reacting*. While someone types "ada" into a text filter, you don't want to re-filter on `a`, then `ad`, then `ada` — that is three passes over the data for one search. With `debounceMs: 300`, the grid waits 300 milliseconds after the **last** keystroke before filtering. Lower it for snappier feedback on small datasets; raise it if filtering large data feels janky.

> **What is `caseSensitive`?** "Case" means upper- vs lower-case letters. When `false` (the default), searching "ADA" also matches "ada" and "Ada" — usually what users expect. Set it to `true` only when the distinction genuinely matters (e.g. case-sensitive codes or IDs).

> **What is `popoverPlacement`?** It controls where the filter popover opens relative to the funnel icon. `'auto'` (default) is smart: it normally opens below, but flips above when there isn't enough room at the bottom of the screen. Use `'top'` or `'bottom'` only if you want to force one side.

### Turn filtering off entirely

```ts
filtering: { enabled: false }
```

---

## Filter types — the `filter` group on a column

The **most important** filter setting is `type`, because it changes which operators the user sees and how values are compared.

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | inherits grid | Allow filtering this column |
| `type` | `'text' \| 'number' \| 'date' \| 'boolean'` | `'text'` | Which filter UI/operators to use |
| `customFilter` | `(value, row) => boolean` | — | Your own match logic |

```ts
columns: [
  { field: 'name',   header: 'Name',   filter: { type: 'text' } },
  { field: 'salary', header: 'Salary', filter: { type: 'number' } },
  { field: 'joined', header: 'Joined', filter: { type: 'date' } },
  { field: 'active', header: 'Active', filter: { type: 'boolean' } },
]
```

### Operators available per type

- **text**: contains, notContains, equals, notEquals, startsWith, endsWith, isEmpty, isNotEmpty
- **number**: equals, notEquals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, **between**, isEmpty, isNotEmpty
- **date**: equals, notEquals, before, after, **between**, isEmpty, isNotEmpty
- **boolean**: equals, isEmpty, isNotEmpty

> **`between`** shows two inputs (from / to). The grid validates that *from ≤ to* and shows an error otherwise.

### Disable filtering for one column

```ts
{ field: 'avatar', header: '', filter: { enabled: false } }
```

---

## Custom filters with `customFilter`

When the built-in operators aren't enough, write your own match function. A `customFilter` runs **once per row**. It receives the cell `value` and the whole `row`, and returns a boolean: `true` keeps the row, `false` hides it. Because it gets the whole row, you can base the decision on *other* fields too — something the built-in operators can't do.

Example — a "VIP" column that matches when salary is high **and** the user is active:

```ts
{
  field: 'salary',
  header: 'Salary',
  filter: {
    type: 'number',
    customFilter: (value, row) =>
      Number(value) > 150_000 && (row as User).active,
  },
}
```

---

## Customizing the filter icon

Filter icons are typed as `VanillaNode` (an `HTMLElement`, or a plain `string` for text/emoji) — no render function or virtual DOM needed, just build a real element:

```ts
const filterIcon = document.createElement('span')
filterIcon.textContent = '⏷'

const activeFilterIcon = document.createElement('span')
activeFilterIcon.textContent = '🔍'

filtering: {
  filterIcon,          // normal state
  activeFilterIcon,    // when a filter is applied
  showIconOnHover: true,  // keep headers clean until hover
}
```

A plain string works too, if you don't need custom markup:

```ts
filtering: { filterIcon: '⏷', activeFilterIcon: '🔍' }
```

---

## Global search

One query matched across every searchable column at once — a quick filter, also known as a global filter.

> **Requires `SearchModule`**, which is in `AllModules`. It composes with column filters as **AND**: a searched *and* filtered grid shows rows matching both.

```ts
import { createGrid, SearchModule, mount } from '@elitegrid/vanilla'

const grid = createGrid<Invoice>({
  modules: [SearchModule],
  columns,
  data,
  filtering: {
    searchBar: true,            // render the built-in input
    searchPlaceholder: 'Search invoices…',
    search: '',                 // initial query
  },
})
```

`searchBar` is `false` by default. Pass `true` for an input that already handles debounce, clearing and the match announcement — or leave it off and drive the API from your own input:

```ts
input.addEventListener('input', () => api.setSearch(input.value))
```

```ts
api.setSearch('acme')
api.getSearch() // '' when nothing is searched — never undefined, so `.length` is the check
```

`api.setSearch()` is applied **immediately, with no internal debounce**. The built-in bar debounces its own input before calling it, and a method that silently defers cannot be driven from a controlled component.

```ts
events: {
  onSearchChange: (text, matchCount) => setStatus(`${matchCount} matches`),
}
```

### Which columns are searched

```ts
{ field: 'id', header: 'ID', filter: { searchable: false } } // skip noise
```

Every column is searchable by default. Turn it off for an id, a base64 blob, anything whose matches would be noise.

Hidden columns are **not** searched by default:

```ts
filtering: { searchHiddenColumns: true } // default false
```

A row matching on a column the user cannot see looks like a bug, which is worse than hiding a column changing the result count.

### What text a column contributes

The default is the column's **displayed** text — `display.formatter` if set, otherwise the raw value — so a column shown as `$1,234` matches a search for `1,234` with nothing written.

The one case the default gets wrong is a `cellRenderer` column: a node has no text to read, so a status badge searches its underlying value (`'in_progress'`) rather than its label (`'In Progress'`). That is what `searchText` is for, and the grid warns when it spots the combination:

```ts
{
  field: 'status',
  header: 'Status',
  display: { cellRenderer: (v) => badge(STATUS_LABEL[v as string]) },
  filter: { searchText: (value) => STATUS_LABEL[value as string] },
}
```

### Custom matching

```ts
filtering: {
  searchMatcher: (row, terms) => terms.every((t) => fuzzy(row.name, t)),
}
```

`terms` arrives pre-split and pre-cased. This replaces term splitting **and** matching in one hook.

> One hook rather than a parser/matcher pair: a developer who needs fuzzy or OR semantics needs the whole decision, not half of it.

---

## Floating filters

A filter control under every filterable column's header:

```ts
filtering: {
  floatingFilters: true,      // default false
  floatingFilterButton: true, // default true — the ⌄ that opens the popover
}
```

**The popover stays.** The floating row applies **one** operator per column and hands anything more complicated to the popover it sits under.

Which operator? `filter.defaultOperator` — one key governing both surfaces:

```ts
{
  field: 'amount',
  header: 'Amount',
  filter: { type: 'number', defaultOperator: 'greaterThan' },
}
```

Defaults are `'contains'` for text and `'equals'` for number, date and boolean.

> One key rather than a separate `floatingOperator`: two knobs would disagree, and the user would watch the operator change the moment they opened the popover on a column they had already filtered from the row.

### Per-column control

```ts
{ field: 'notes', header: 'Notes', filter: { floating: false } }
{ field: 'amount', header: 'Amount', filter: { floatingPlaceholder: 'Min…' } }
```

`floating` follows `filtering.floatingFilters` unless set. A column with `filter.enabled: false` never gets a control — but it still gets an **empty band**, because a missing band would break the row's alignment with its column.

`floatingPlaceholder` is a narrow per-string option, so it beats the locale key.

Height is `appearance.floatingFilterHeight` (default 34); the header's total becomes `headerHeight + floatingFilterHeight` when the row is on.

> `floatingFilterButton` is stated positively, so hiding it is not a double negative. And floating filters are a grid-level switch, so turning them on everywhere is one line rather than one line per column.

### Your own floating control

```ts
const MyRangeFilter: FloatingFilter = ({ filter, setFilter, placeholder }) => {
  const el = document.createElement('input')
  el.placeholder = placeholder
  el.addEventListener('input', () => setFilter({ operator: 'contains', value: el.value }))

  // `destroy` is optional, and exists because the header rebuilds wholesale:
  // a band holding a live timer must clean up before its element is detached.
  return { el, destroy: () => {} }
}

{ field: 'amount', header: 'Amount', filter: { floatingFilter: MyRangeFilter } }
```

A **mounted component**, not a node factory — it holds state (a query, a debounce, an in-flight request), so it needs somewhere to keep it.

| `params` | What it is |
| --- | --- |
| `columnId` | This column |
| `filterType` | `'text' \| 'number' \| 'date' \| 'boolean' \| 'set'` |
| `filter` | The column's current entry in the filter model, or `null` |
| `placeholder` | Already resolved from the column option and the locale |
| `setFilter(filter)` | Apply. **Never debounced by the grid** |
| `clearFilter()` | Remove this column's entry |
| `openPopover()` | Hand over to the full popover |

`params.filter` is the **only** source of truth. A component holding its own applied state drifts the first time someone uses the popover, the column menu or `setFilterModel()`.

---

## The set filter — a checkbox list of values

```ts
{
  field: 'status',
  header: 'Status',
  filter: { type: 'set' },
}
```

| Option | Default | Meaning |
| --- | --- | --- |
| `values` | derived from the rows | Supply the list instead |
| `valueGetter(row)` | the display value | What one row contributes, and what the matcher compares |
| `valueComparator(a, b)` | blanks first, then locale-aware numeric compare | Order the list |
| `showSearch` | `true` | The search box above the list |
| `showCounts` | `true` | `Paid (12)` beside each value |

The default key is the column's **display** value, so a column shown as `$1,234` lists and matches `$1,234`, and a formatter mapping `2 → 'Overdue'` lists `'Overdue'`.

A `display.cellRenderer` column has no text to read, so it needs `valueGetter` — and the grid warns when a set-filtered column has a renderer and no getter:

```ts
{
  field: 'status',
  header: 'Status',
  display: { cellRenderer: (v) => badge(STATUS_LABEL[v as string]) },
  filter: { type: 'set', valueGetter: (row) => STATUS_LABEL[row.status] },
}
```

### Supplying the values

```ts
filter: { type: 'set', values: ['draft', 'sent', 'paid', 'overdue'] }
filter: { type: 'set', values: () => fetch('/api/statuses').then((r) => r.json()) }
```

An array for a known domain; a function — which may return a promise — for a server-backed one. **Required for a `dataSource` grid**, where the browser holds one page and cannot know the column's domain.

When set, the list is exactly these values in exactly this order. Counts still come from the loaded rows, so an entry nothing matches shows `(0)` rather than vanishing — a domain the user picks from should not shrink as they pick.

### Where the list comes from

```ts
filtering: {
  setFilterScope: 'unfilteredByThisColumn', // default
  setFilterListLimit: 500,                  // default
}
```

- `'unfilteredByThisColumn'` — rows surviving every **other** column's filter and the global search. Unchecking a value keeps it in the list, so the choice is reversible, while other columns still narrow what is offered and the counts answer "how many rows would this add".
- `'all'` — every loaded row, always. Cheaper, and the right answer when the list is a domain the user picks from rather than a summary of what is present.

`setFilterListLimit` caps the first **paint**, not what is reachable — the full set is always computed, or counts and "Select All" would lie.

> `type: 'set'` is one union member, so a typo is a compile error rather than a filter that silently never opens.

---

## Controlling filters from code (the API)

The active filters are described by a **filter model** — an object keyed by column `field`, where each value is `{ type, operator, value }` (plus `valueTo` for *between*). Reading or setting this object is how you save, restore, or preset filters from code.

```ts
// Set the entire filter model at once
api.setFilterModel({
  name: { type: 'text', operator: 'contains', value: 'ada' },
  salary: { type: 'number', operator: 'greaterThan', value: 50000 },
})

// Set/clear a single column's filter
api.setColumnFilter('name', {
  type: 'text',
  operator: 'startsWith',
  value: 'A',
})
api.clearColumnFilter('name')

// Read current filters
const filters = api.getFilterModel()

// Clear everything
api.clearFilters()
```

---

## Reacting to filter changes

```ts
events: {
  onFilterChange: (model) => {
    console.log('Filters changed:', model)
  },
}
```

---

## When a filter matches nothing

If a filter returns zero rows, the grid shows a "No matching results" empty state. You can customize that message — see [Chapter 09 · Appearance](/docs/vanilla/appearance#empty-states).

---

## Presetting filters on load

To open the grid already filtered — from a saved view, a URL, or a "My active users" shortcut button — set the model in `onReady` (or any time after) with `api.setFilterModel`:

```ts
const grid = createGrid<User>({
  modules: [FilterModule],
  columns,
  data,
  events: {
    onReady: (api) => {
      const params = new URLSearchParams(window.location.search)
      const dept = params.get('department')
      if (dept) {
        api.setColumnFilter('department', {
          type: 'text',
          operator: 'equals',
          value: dept,
        })
      }
    },
  },
})
```

Combine this with `onFilterChange` (writing the model back to the URL or `localStorage`) for the same "restore on reload" pattern used for sorting in [Chapter 03](/docs/vanilla/sorting#persisting-sort-across-page-reloads).

---

## Filtering a computed column

Just like sorting, filtering a `value.getter` column filters on whatever the **getter returns**, not the raw row — so you can filter on a value that isn't a real field:

```ts
{
  field: 'fullName',
  header: 'Name',
  value: {
    getter: (row) => `${row.firstName} ${row.lastName}`,
  },
  filter: { type: 'text' },   // filters against the computed full name
}
```

If the built-in `contains`/`equals` operators aren't precise enough for a computed value, reach for `customFilter` instead — it receives the getter's output as `value` and the full `row` as the second argument, so you can inspect the original fields too:

```ts
{
  field: 'fullName',
  header: 'Name',
  value: { getter: (row) => `${row.firstName} ${row.lastName}` },
  filter: {
    customFilter: (value, row) =>
      String(value).toLowerCase().startsWith((row as User).firstName.toLowerCase()),
  },
}
```

---

## Live example

A text filter, a number filter, and a date filter on three different columns — click a header's funnel icon to open its filter. All three combine with AND, so narrowing one column narrows the visible rows for the others too.

```ts
import { createGrid, FilterModule, mount } from '@elitegrid/vanilla'
import '@elitegrid/vanilla/styles.css'

interface Book {
  id: number
  title: string
  author: string
  price: number
  published: string
}

const books: Book[] = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', price: 44.99, published: '1999-10-30' },
  { id: 2, title: 'Clean Code', author: 'Robert Martin', price: 39.99, published: '2008-08-01' },
  { id: 3, title: 'Refactoring', author: 'Martin Fowler', price: 54.99, published: '1999-07-08' },
  { id: 4, title: 'Design Patterns', author: 'Gang of Four', price: 59.99, published: '1994-10-21' },
  { id: 5, title: 'The Mythical Man-Month', author: 'Fred Brooks', price: 34.99, published: '1975-01-01' },
  { id: 6, title: 'Domain-Driven Design', author: 'Eric Evans', price: 49.99, published: '2003-08-30' },
  { id: 7, title: 'Effective Java', author: 'Joshua Bloch', price: 54.99, published: '2001-05-08' },
  { id: 8, title: "You Don't Know JS", author: 'Kyle Simpson', price: 29.99, published: '2014-12-27' },
  { id: 9, title: 'Working Effectively with Legacy Code', author: 'Michael Feathers', price: 47.99, published: '2004-09-22' },
  { id: 10, title: 'Continuous Delivery', author: 'Humble & Farley', price: 52.99, published: '2010-08-06' },
]

const grid = createGrid<Book>({
  modules: [FilterModule],
  columns: [
    { field: 'title', header: 'Title', size: { flex: 2 }, filter: { type: 'text' } },
    { field: 'author', header: 'Author', size: { flex: 1.5 }, filter: { type: 'text' } },
    { field: 'price', header: 'Price', filter: { type: 'number' } },
    { field: 'published', header: 'Published', filter: { type: 'date' } },
  ],
  data: books,
  filtering: { enabled: true },
})

const container = document.getElementById('grid-container')!
container.style.cssText = 'height:440px'
mount(grid, container)
```

[[LIVE_DEMO:vanilla:0]]

---

## Common filtering mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Typing feels laggy on a large dataset | `debounceMs` too low, or a heavy `customFilter` running on every keystroke | Raise `debounceMs`, or move filtering to the server with a `dataSource` (see [Chapter 14](/docs/vanilla/performance#server-side-data-with-datasource)) |
| Filter box shows a value but nothing is filtered | You called `setColumnFilter` with a `type` that doesn't match the column's `filter.type` | Make sure the model's `type` matches the column config exactly |
| "Between" filter never matches | `value`/`valueTo` swapped, or `from > to` | The grid validates `from ≤ to` in its own UI — if you're setting the model from code, validate it yourself too |
| Filtering a formatted column doesn't match what's on screen | Filters run against the **raw value**, not the `display.formatter` output | Filter against the underlying value/getter, or add a `customFilter` that mirrors the display logic |

---

Next: [05 · Pagination](/docs/vanilla/pagination)
