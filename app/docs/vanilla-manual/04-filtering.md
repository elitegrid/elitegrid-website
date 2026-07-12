# 04 · Filtering

Filtering is **on by default**. Each column header shows a small funnel icon; clicking it opens a popover where the user picks an operator (like *contains*, *greater than*, *between*) and types a value. This chapter explains how to configure filter types and behaviour.

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

## Common filtering mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Typing feels laggy on a large dataset | `debounceMs` too low, or a heavy `customFilter` running on every keystroke | Raise `debounceMs`, or move filtering to the server with a `dataSource` (see [Chapter 14](/docs/vanilla/performance#server-side-data-with-datasource)) |
| Filter box shows a value but nothing is filtered | You called `setColumnFilter` with a `type` that doesn't match the column's `filter.type` | Make sure the model's `type` matches the column config exactly |
| "Between" filter never matches | `value`/`valueTo` swapped, or `from > to` | The grid validates `from ≤ to` in its own UI — if you're setting the model from code, validate it yourself too |
| Filtering a formatted column doesn't match what's on screen | Filters run against the **raw value**, not the `display.formatter` output | Filter against the underlying value/getter, or add a `customFilter` that mirrors the display logic |

---

Next: [05 · Pagination](/docs/vanilla/pagination)
