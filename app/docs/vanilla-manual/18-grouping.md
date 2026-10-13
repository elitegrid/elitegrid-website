# Row Grouping & Aggregation

Grouping collapses rows that share a value into expandable sections — all invoices for a customer, all employees in a department — and puts a summary on each section heading.

Two features that ship together, because grouping without totals is half a feature:

- **Grouping** builds the sections.
- **Aggregation** computes the number on each heading — a sum, an average, your own function.

> **Requires `GroupModule`.** Grouping adds a pipeline stage and a store namespace, so it is a real module in the original sense. Without it, `grouping` is ignored entirely and no section headings render. See [Modules](/docs/vanilla/modules).

---

## The smallest grouped grid

```ts
import { createGrid, GroupModule, mount } from '@elitegrid/vanilla'

const grid = createGrid<Invoice>({
  modules: [GroupModule],
  columns,
  data: invoices,
  grouping: {
    model: ['customer'],
  },
})

mount(grid, document.getElementById('grid')!)
```

`model` is the list of columns to group by, **outermost first**. Two entries means two levels:

```ts
grouping: {
  model: ['region', 'customer'], // every customer nested inside its region
}
```

You can pass the `ColumnDef` object instead of the field name. Both are type-checked and both follow a rename:

```ts
const regionColumn = { field: 'region', header: 'Region' }

grouping: { model: [regionColumn, 'customer'] }
```

An entry that matches no column warns by name in development rather than silently grouping by nothing.

---

## The column you group by disappears

This is the first surprise, and it is deliberate. Grouping by Customer **hides the Customer column**, because the value is already in the section heading — showing it again puts the same string on every row of the section.

If you want it back:

```ts
grouping: {
  model: ['customer'],
  keepGroupedColumns: true,
}
```

> **Why this is the default:** a grouped column left visible shows every row its own group's value twice — the group label above it, the same value again in the cell. Hiding it is the behaviour nearly everyone wants, so it is the default, with one flag to opt out.

---

## Aggregation — the number on the heading

A column shows nothing on a group row unless you tell it what to compute. Set `value.aggregate` on the column:

```ts
const columns: ColumnDef<Invoice>[] = [
  { field: 'customer', header: 'Customer' },
  {
    field: 'amount',
    header: 'Amount',
    value: { aggregate: 'sum' },
  },
  {
    field: 'daysLate',
    header: 'Days Late',
    value: { aggregate: 'avg' },
  },
]
```

Seven built-in names: `'sum'`, `'avg'`, `'min'`, `'max'`, `'count'`, `'first'`, `'last'`.

> **A column with no `aggregate` renders blank on a group row — never the first child's value.** That is a safety decision. Showing the first row's amount on a heading is how a reader comes to believe a group of 12 invoices is worth $2,400.

### Your own aggregate

Pass a function instead. It receives the extracted values **and** the typed rows, because most real aggregates need a sibling field:

```ts
{
  field: 'amount',
  header: 'Amount',
  value: {
    // a weighted average needs the weight column
    aggregate: (values, rows) => {
      const totalWeight = rows.reduce((s, r) => s + r.weight, 0)
      if (totalWeight === 0) return 0
      return rows.reduce((s, r) => s + r.amount * r.weight, 0) / totalWeight
    },
  },
}
```

```ts
// "how many in this group are overdue"
value: { aggregate: (values, rows) => rows.filter((r) => r.overdue).length }
```

A typo in a built-in name is a **compile error**, not a blank cell — the names are a union resolved by a switch, not a string looked up in a registry at runtime.

> **There is no aggregate formatter, on purpose.** `display.formatter` receives a `TData` row, and a group row is not one. If you want control over how an aggregate is displayed, return a string from a custom aggregate — that is the supported path.
>
> **Aggregates are computed from the leaves at every level**, never folded up from the level below. Folding is wrong for any non-associative function: an `avg` over unequal group sizes, or any custom `median`, comes out wrong.

### A grand total over everything

```ts
grouping: {
  model: ['region'],
  grandTotal: 'bottom', // or 'top'
}
```

The grand total is a pinned row, so it stays visible while you scroll, and it re-totals whenever a filter changes. It works with an empty `model` too — a totals row on an ungrouped grid:

```ts
grouping: { model: [], grandTotal: 'top' }
```

---

## Controlling the group key

By default a group's key is the column's **display value** — the same text search and tooltips read. So a column shown as `$1,234` groups as `$1,234`, and a formatter that maps a status code to a label groups by the label, with nothing written.

Two cases the default gets wrong, and both warn in development:

**A `cellRenderer` column** — a rendered node has no text to group on.

**A Date column** — every distinct instant becomes its own group, which is never what you want. Bucket it:

```ts
{
  field: 'issuedAt',
  header: 'Issued',
  group: {
    valueGetter: (row) => String(row.issuedAt.getFullYear()),
  },
}
```

### Ordering the sections

```ts
{
  field: 'priority',
  header: 'Priority',
  group: {
    comparator: (a, b) => RANK[a] - RANK[b], // 'high' before 'low'
  },
}
```

`group.comparator` orders the **sections**. `sort.comparator` orders the **rows inside** a section. They are independent, and the distinction matters:

- Sorting the grid by a grouped column flips the section order.
- Sorting by any other column reorders rows inside each section and leaves the section order alone.

The default section order is a numeric-aware locale compare, so `Item 2` sorts before `Item 10`.

### Blocking the menu affordance

```ts
{ field: 'notes', header: 'Notes', group: { enabled: false } }
```

That removes "Group by this column" from the column menu. Grouping it programmatically still works — this gates the affordance, not the capability.

---

## How the sections look

### One column, or the full width

```ts
grouping: {
  model: ['region'],
  displayType: 'singleColumn', // default
  groupColumn: { header: 'Region', width: 220, minWidth: 120 },
}
```

`'singleColumn'` prepends one synthetic column holding the chevron, the key and the count, indented by depth. `'fullWidth'` spans the heading across every column and leaves your data columns alone.

### What starts open

```ts
grouping: {
  model: ['region', 'customer'],
  expandedByDefault: 1, // top level only
}
```

`false` (the default) starts everything closed, `true` everything open, and a number opens to that depth.

### Counts

```ts
grouping: { model: ['region'], showCounts: false } // drop the "(12)"
```

### Sticky headings

As you scroll inside a section its heading pins under the column header, and the end of its own section pushes it out. **On by default** — a feature nobody enables is a feature nobody has, and it costs nothing on a grid with one group.

Nested headings **stack**: at depth 2 both levels stay pinned, outermost above.

```ts
grouping: { model: ['region'], stickyGroups: false } // turn it off
```

### The chip bar

A bar above the column header naming what you are grouped by, outermost first. Drag a chip to reorder a level, `×` to remove one.

```ts
grouping: {
  model: ['region'],
  panel: 'whenGrouped', // default — appears only once something is grouped
}
```

`true` keeps it always visible, `false` never. The default is `'whenGrouped'` because the bar takes no column dropped onto it — an empty one cannot teach you to group, so it should not occupy space pretending to. Creating a grouping is the column menu's "Group by this column".

---

## Collapsed sections that still say something

A collapsed section is a summary, not a dead end. `collapsedPreview` puts something behind the heading's label:

```ts
grouping: {
  model: ['region'],
  collapsedPreview: 'share',
}
```

`'share'` paints a faint proportion bar — this section's rows against the **filtered** total. It costs zero horizontal space, and the eye ranks the sections before reading a single number.

Or render anything you like:

```ts
grouping: {
  model: ['region'],
  collapsedPreview: ({ leafRows, share }) => {
    const el = document.createElement('div')
    el.className = 'yg-my-preview'
    el.style.opacity = share < 0.1 ? '0.4' : '1'
    el.textContent = leafRows.slice(0, 5).map((r) => r.owner).join(', ')
    return el
  },
}
```

`leafRows` is this section's filtered rows, and `share` is `leafRows.length` over the filtered total as a 0–1 number — handed to you so a custom preview paints the same proportion without re-deriving the denominator and getting it wrong.

Off by default.

---

## Replacing the heading cell

```ts
grouping: {
  model: ['region'],
  cellRenderer: ({ group, label, toggle }) => {
    const el = document.createElement('button')
    el.className = 'yg-my-heading'
    el.textContent = `${group.expanded ? '▾' : '▸'} ${label} — ${group.count} rows`
    el.addEventListener('click', toggle)
    return el
  },
}
```

| `params` | What it is |
| --- | --- |
| `label` | e.g. `"Acme Corp (12)"` — already honours `showCounts` and the locale |
| `toggle()` | Expand or collapse this section |
| `group.path` | Ordered keys from the root: `['EMEA', 'Acme Corp']` |
| `group.key` | This level's key — the last element of `path` |
| `group.level` | `0` for a top-level section; `-1` for the grand total |
| `group.count` | Descendant row count, **after filtering** |
| `group.aggregates` | Aggregate values by column id |
| `group.expanded` | Current state |
| `group.leaves` | Every descendant row |

---

## Selection

A group's checkbox selects everything under it, and the heading shows a tri-state box (checked / unchecked / partial) that follows its children:

```ts
const grid = createGrid<Invoice>({
  modules: [GroupModule, SelectionModule],
  columns,
  data: invoices,
  selection: { mode: 'multiple' },
  grouping: { model: ['customer'], selectsChildren: true }, // default
})
```

With `selectsChildren: false` the checkbox is **hidden**, not disabled. A group row is not in the row model, so it cannot be selected as a thing in its own right — with its children off the table the box would be inert, and an inert checkbox is worse than none. The slot stays reserved so no cell shifts out from under its header.

---

## Pagination

```ts
grouping: {
  model: ['customer'],
  paginateBy: 'rows', // default
}
```

- `'rows'` pages what the user actually sees, so the scrollbar and the row count stay honest. A section may straddle a page boundary.
- `'groups'` pages whole top-level sections — "25 customers per page".

---

## Filtering a grouped grid

Nothing to configure, but worth knowing: the grouping stage runs **after** filter and search. Sections are built only from rows that survived them, which means an empty section cannot exist, counts always mean surviving rows, and there is no stale parent left behind.

---

## Export

By default a CSV contains your **rows**, not your section headings — a spreadsheet user re-groups with a pivot table, and a file with summary rows interleaved is not a dataset.

```ts
grouping: { model: ['region'], exportGroups: true } // include the headings
```

Two things that are handled for you, and are worth knowing because the obvious expectation is wrong:

- **The columns you grouped by are always in the file**, even though grouping hides them on screen. Hiding is a display decision, and a CSV has no headings to carry the value instead — a grid grouped by Department used to export a file with no Department column, carrying its grouping in row order alone.
- **An export does not depend on which sections are expanded.** Rows come out in display *order* but not display *membership*, so collapsing everything does not produce a file of headings and no rows.

---

## Driving it from code

```ts
api.setGroupModel(['region', 'customer']) // group, outermost first
api.setGroupModel([])                     // ungroup
api.getGroupModel()                       // [] when nothing is grouped

api.setGroupExpanded(['EMEA', 'Acme Corp'], true)
api.expandAllGroups()
api.collapseAllGroups()
```

A path is a plain string array, so it survives JSON and a page reload — which is what lets [grid state](/docs/vanilla/localization-and-state) restore which sections were open.

### Events

```ts
const grid = createGrid<Invoice>({
  modules: [GroupModule],
  columns,
  data: invoices,
  grouping: { model: ['region'] },
  events: {
    onGroupModelChange: (model) => console.log('grouped by', model),
    onGroupExpand: (path, expanded) => console.log(path, expanded),
  },
})
```

---

## Gotchas

- **A group row is not one of your rows.** It is a tagged object in the same flat list. If you write a custom renderer that walks rows, narrow with `isGroupRow(row)` before assuming you have a `TData`. Your own rows are untouched and still passed by reference.
- **A column with no `value.aggregate` is blank on a heading.** That is intentional; see above.
- **Date and `cellRenderer` columns need `group.valueGetter`.** Both warn in development.
- **`keepGroupedColumns` is false by default** — the column you grouped by vanishes until you ask for it back.
- **`exportGroups` is false by default** — headings are not in your CSV unless you ask.
- **`GroupModule` must come from `@elitegrid/vanilla`**, not `@elitegrid/core`. Core's copy groups correctly and renders no headings at all. It warns if you get this wrong.

---

Next: [Row Features](/docs/vanilla/row-features) covers pinned rows, row numbers, drag-to-reorder and expandable detail rows.
