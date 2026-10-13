# 02 · Columns

Columns are the heart of the grid. Each column is one object in the `columns` array. EliteGrid uses a **grouped config** style: related settings live together in named groups (`size`, `display`, `sort`, `filter`, `edit`, `value`) so your autocomplete stays clean.

```ts
{
  field: 'price',     // required — the data key
  header: 'Price',    // required — the header text

  size:    { /* width settings */ },
  display: { /* look & formatting */ },
  sort:    { /* sort behaviour */ },
  filter:  { /* filter behaviour */ },
  edit:    { /* editing behaviour */ },
  value:   { /* custom data access */ },
}
```

This chapter covers `field`, `header`, `size`, and `display`. The other groups have their own chapters (sorting, filtering, editing, formatting).

> **Why "grouped config"?** A column can have *dozens* of settings. If they were all flat (`width`, `minWidth`, `pinned`, `sortable`, `filterType`, …) the autocomplete list your editor pops up would be a wall of unrelated options. By nesting them under `size`, `display`, `sort`, etc., typing `size: {` only shows you width-related options. It is purely an organisational convenience — it does not change what the grid can do.
>
> **"Autocomplete"** (also called IntelliSense) is the dropdown of suggestions your code editor shows as you type. It is powered by the TypeScript types, which is another reason passing `<Product>` to `createGrid` is worthwhile.

---

## `field` and `header` (required)

- **`field`** — the property name on your row. Type-checked against your data type. This is also the column's unique ID.
- **`header`** — the label shown at the top of the column.

```ts
{ field: 'firstName', header: 'First Name' }
```

> **`field` is doing two jobs.** First, it tells the grid *which value to read* from each row (`row.firstName`). Second, it becomes that column's **unique ID** — the string you pass to API calls like `api.setColumnWidth('firstName', 300)` or `api.moveColumn('firstName', 0)`. Because of this, every column needs a distinct `field`. (If you ever need two columns reading the same field — say a "computed" column — see [Chapter 08](/docs/react/formatting-values), which uses `value.getter` to read a field without colliding on the ID.)

---

## Column width — the `size` group

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `width` | `number` | `150` | Fixed width in pixels |
| `minWidth` | `number` | `50` | Smallest the user can drag it |
| `maxWidth` | `number` | — | Largest the user can drag it |
| `flex` | `number` | — | Flexible width weight (see below) |
| `resizable` | `boolean` | `true` | Can the user drag to resize? |

### Fixed width

```ts
{ field: 'id', header: 'ID', size: { width: 80 } }
```

### Fixed (`width`) vs. flexible (`flex`) — which to use?

- Use **`width`** when a column should always be the same number of pixels regardless of screen size — an ID, an icon, a short status badge.
- Use **`flex`** when a column should grow and shrink to fill whatever space is left after the fixed columns are placed — names, emails, descriptions.

You can freely mix the two: give the narrow columns a `width` and let the wide ones share the rest with `flex`.

### Flexible width with `flex`

`flex` makes columns share leftover space proportionally, like CSS flexbox. A column with `flex: 2` gets twice the space of a column with `flex: 1`.

```ts
columns: [
  { field: 'name',  header: 'Name',  size: { flex: 2, minWidth: 120 } },
  { field: 'email', header: 'Email', size: { flex: 3, minWidth: 160 } },
  { field: 'role',  header: 'Role',  size: { flex: 1 } },
]
```

**Worked example.** Suppose the grid is 600px wide and none of the three columns above has a fixed `width`. The flex weights are `2 + 3 + 1 = 6` total parts, so each "part" is `600 / 6 = 100px`. The columns therefore become 200px, 300px, and 100px. If you later add a fixed `width: 120` column, that 120px is subtracted first and the remaining 480px is split by the same 2:3:1 ratio.

> **Tip:** Always pair `flex` with a `minWidth` so columns never collapse to nothing on small screens. Without it, a `flex: 1` column on a very narrow grid can shrink until its text is unreadable.

### Lock a column from resizing

```ts
{ field: 'id', header: 'ID', size: { width: 60, resizable: false } }
```

---

## The `display` group

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `pinned` | `'left' \| 'right' \| null` | `null` | Freeze the column to a side |
| `visible` | `boolean` | `true` | Show or hide the column |
| `cellClass` | `string \| (value, row) => string` | — | CSS class for body cells |
| `headerClass` | `string` | — | CSS class for the header cell |
| `formatter` | `(value, row) => string` | — | Format the displayed text (see [Ch. 08](/docs/react/formatting-values)) |
| `exportFormatter` | `(value, row) => string` | — | Separate format for CSV export |

### Pinning (frozen columns)

**Pinning** (also called *freezing*) keeps a column stuck to the left or right edge while the rest of the table scrolls sideways underneath it. It is the same idea as "freeze panes" in a spreadsheet. This is most useful when you have many columns: pin an ID or name column to the left so the user always knows which row they are looking at, and pin an "actions" column to the right so buttons stay reachable.

```ts
{ field: 'name', header: 'Name', display: { pinned: 'left' } }
{ field: 'actions', header: '', display: { pinned: 'right' } }
```

> Pin sparingly. Every pinned column is one fewer column's worth of space for the scrolling area in the middle.

### Hiding a column

Hidden columns still exist (and still export to CSV if you want) but aren't drawn. This is different from simply leaving the column out of the array: a hidden column can be **toggled back on at runtime** with the API (`api.setColumnVisible`), which is how you build a "show/hide columns" menu.

```ts
{ field: 'internalNotes', header: 'Notes', display: { visible: false } }
```

### Conditional cell styling with `cellClass`

A **CSS class** is a name you attach to an element so a matching rule in your stylesheet (e.g. `.cell-danger { … }`) styles it. `cellClass` lets you attach one to body cells.

`cellClass` can be a plain string (applied to every cell in the column), or a **function** that runs once per cell and returns a class name based on that cell's value — perfect for colour-coding. The function receives the cell `value` and the whole `row`, so you can branch on either.

```ts
{
  field: 'status',
  header: 'Status',
  display: {
    cellClass: (value) =>
      value === 'overdue' ? 'cell-danger' : 'cell-normal',
  },
}
```

```ts
/* your app's CSS — EliteGrid does not define these names; you do */
.cell-danger { color: #dc2626; font-weight: 600; }
```

---

### Custom cell content with `cellRenderer`

`formatter` returns a **string**. When you need a real node — a badge, a link, an avatar, a progress bar — use `cellRenderer`:

```tsx
{
  field: 'status',
  header: 'Status',
  display: {
    cellRenderer: (value, row) => (
      <Badge tone={value === 'overdue' ? 'danger' : 'neutral'}>
        {String(value)} {row.escalated && '⚠'}
      </Badge>
    ),
  },
}
```

It takes over rendering entirely, replacing the auto-generated text span.

> **`formatter` still governs CSV export.** Export never runs through `cellRenderer` — a node is not a cell value. Keep `formatter` (or `exportFormatter`) on a column that has both, or its CSV column will hold raw values.
>
> **You own the rendered node's accessibility.** The grid cannot inspect what you returned, so a tooltip or an `aria-label` is yours to add.

### Custom header content with `headerRenderer`

```tsx
{
  field: 'amount',
  header: 'Amount',
  display: {
    headerRenderer: (column) => (
      <span>
        {column.header} <InfoIcon title="Net of tax" />
      </span>
    ),
  },
}
```

The header cell keeps `aria-label` pinned to the plain `header` string, so a screen reader still gets the real name even when your node carries no text of its own.

---

## Tooltips

```tsx
{ field: 'notes', header: 'Notes' }                          // truncated text only
{ field: 'notes', header: 'Notes', display: { tooltip: true } }  // always
{ field: 'notes', header: 'Notes', display: { tooltip: false } } // never
```

| `display.tooltip` | Behaviour |
| --- | --- |
| unset | The display value, shown **only when the text is truncated** |
| `false` | Never |
| `true` | The display value, always — even when it already fits |
| a function | Your own content, always |

The default text is the **displayed** text — `display.formatter` if set, otherwise the raw value — so a column shown as `$1,234` tooltips as `$1,234` with nothing written.

```tsx
{
  field: 'amount',
  header: 'Amount',
  display: {
    tooltip: (value, row) =>
      row.overdue ? `${value} — overdue since ${row.dueDate}` : String(value),
  },
}
```

Because the function already receives the row, "a different tooltip for overdue invoices" is an `if` inside it.

Header tooltips take the same ladder minus the row:

```tsx
{ field: 'ltv', header: 'LTV', display: { headerTooltip: 'Lifetime value' } }
```

Two things worth knowing:

- An **explicit** tooltip (`true` or a function) always shows, ignoring `appearance.tooltip.mode` — "only when clipped" is meaningless for content that is not the cell's own text.
- A **`cellRenderer` column with no explicit tooltip gets none.** A node has no text to fall back to and nothing to measure.

---

## Auto-sizing columns to their content

```tsx
api.autoSizeColumns()                                  // every eligible column
api.autoSizeColumns({ columns: ['name', 'email'] })    // just these
api.autoSizeColumns({ includeHeader: false })          // ignore the header label
api.autoSizeColumns({ sample: 'rendered' })            // cheap, viewport only
```

Users get it too: double-click a column's resize handle to fit that column, or use "Auto-size" in the [column menu](/docs/react/menus-and-clipboard#the-column-menu).

| Option | Default | Meaning |
| --- | --- | --- |
| `columns` | every visible column whose `size.autoSize` is not `false` | Which columns |
| `includeHeader` | `true` | Include the header label and room for its affordances |
| `sample` | `'all'` | `'all'` measures every row in the current view model — filtered and searched, before pagination. `'rendered'` measures only the viewport window |

`sample: 'all'` is the default because a display string does not need its row to be on screen to be measured, so the correct answer is also the available one. `'rendered'` is the escape hatch for a row count where the one-shot pass is measurably too slow.

> `includeHeader` defaults to `true` because a column narrower than its own header is a visible defect.

### Opting a column out

```tsx
{
  field: 'description',
  header: 'Description',
  size: { width: 200, autoSize: false },
}
```

The case this exists for is a column whose content is deliberately clipped — a long description that should stay 200px wide regardless of what is in it. It can still be dragged by the user, and still sized with `api.setColumnWidth()`.

> Stated positively, so opting in is not a double negative.

---

## Wrapping text instead of clipping it

```tsx
{ field: 'description', header: 'Description', display: { wrap: true } }
```

One flag: the text wraps **and** the row grows to fit. See [Row Features](/docs/react/row-features#rows-that-size-themselves) for capping the result.

> One flag rather than two, because wrapping text and growing the row to fit it are never useful apart.

A `cellRenderer` column can set it too; its height comes from measuring what it actually rendered.

---

## Multi-level column groups

Banded header rows above the normal header row:

```
|          | Amounts               | Dates            |
| Customer | Net   | Tax   | Gross | Issued | Due     |
```

`columns` accepts a group anywhere it accepts a column:

```tsx
const columns: ColumnDefInput<Invoice>[] = [
  { field: 'customer', header: 'Customer' },
  {
    header: 'Amounts',
    children: [
      { field: 'net', header: 'Net' },
      { field: 'tax', header: 'Tax' },
      { field: 'gross', header: 'Gross' },
    ],
  },
]
```

A group holds the **real column objects**, not string references to their fields — so renaming a column is a rename the compiler follows, rather than a column silently dropping out of its band.

Groups nest, and `children` is the discriminant — there is no tag field to remember.

| Field | Meaning |
| --- | --- |
| `header` | The band label |
| `children` | Columns and nested groups, in display order |
| `id` | Stable id for `api.setColumnGroupCollapsed()` and saved views. Defaults to a slug of `header` |
| `headerClass` | CSS class on the band cell |
| `collapsible` | Let the user fold this group. Default `false` |
| `collapsed` | Start folded. Default `false`; ignored unless `collapsible` |
| `headerRenderer` | Replace the band label with your own node |

> Set `id` explicitly when two groups share a label, or when the label is translated and a saved view must survive the translation.

### Collapsible groups

```tsx
{
  header: 'Amounts',
  collapsible: true,
  collapsed: true,
  children: [
    { field: 'gross', header: 'Gross', display: { groupShow: 'always' } },
    { field: 'net', header: 'Net', display: { groupShow: 'expanded' } },
    { field: 'tax', header: 'Tax', display: { groupShow: 'expanded' } },
  ],
}
```

`display.groupShow` decides which children survive the fold:

| `groupShow` | Visible when |
| --- | --- |
| `'always'` *(default)* | Expanded and collapsed alike |
| `'expanded'` | Only while the group is expanded |
| `'collapsed'` | Only while the group is collapsed — the summary column |

If no child survives the fold, the **first child is promoted** to `'always'` and the grid warns. A group that collapses to nothing has no UI route back.

> Two keys rather than one, because "can it fold" and "does it start folded" are independent facts. And `groupShow` names the *column's* visibility rather than the group's state, so `'collapsed'` reads as "visible while collapsed" and means exactly that.

Band height is `appearance.groupHeaderHeight` (default 36) per level. `appearance.stickyGroupLabels` (default `true`) keeps a band label on screen while its columns scroll under it.

> **`display.groupShow` is COLUMN grouping — the banded headers. `ColumnDef.group` is ROW grouping.** The two words collide and nothing else in the API does; see [Row Grouping](/docs/react/grouping).

---

## Column virtualization

Only the columns near the viewport are in the DOM, which is what keeps an 80-column grid fast. On by default.

```tsx
scroll: {
  bufferSize: 10,        // extra ROWS either side — default 10
  columnBufferSize: 1,   // extra COLUMNS either side — default 1
  virtualizeColumns: true, // default
}
```

`columnBufferSize` is deliberately far smaller than `bufferSize`: a column is much wider than a row is tall, so one per side is a comparable pixel cushion.

Turn `virtualizeColumns` off when an off-screen cell must still exist in the DOM — a test that queries every cell, a print stylesheet, or a CSS selector that spans the whole row.

> Named positively on purpose: `virtualizeColumns: true` means columns *are* virtualized, so turning it off reads as what it does. And `columnBufferSize` means a grid that flickers on fast horizontal scroll can widen the cushion instead of giving up virtualization entirely.

---

## Changing columns at runtime

You don't pass new columns to re-configure the grid. Instead, use the [Grid API](/docs/react/grid-api):

```ts
api.setColumnVisible('internalNotes', true) // show a hidden column
api.setColumnWidth('name', 300)             // resize programmatically
api.setColumnPinned('name', 'left')         // pin/unpin
api.moveColumn('email', 0)                  // reorder to first position
```

You can also save and restore the whole column layout (widths, order, pinning, visibility):

```ts
const layout = api.getColumnState()   // save (e.g. to localStorage)
api.applyColumnState(layout)          // restore later
```

> **Why this matters:** `getColumnState()` returns a plain, serializable object describing how the user has arranged their columns. "Serializable" means it can be turned into a string with `JSON.stringify` and stored anywhere — most commonly the browser's `localStorage`. On the next visit you read it back and call `applyColumnState()` so the user's preferred layout is remembered:
>
> ```ts
> // Save whenever the layout changes
> localStorage.setItem('grid-layout', JSON.stringify(api.getColumnState()))
>
> // Restore on startup
> const saved = localStorage.getItem('grid-layout')
> if (saved) api.applyColumnState(JSON.parse(saved))
> ```

---

## Full example — a well-configured column set

```tsx
const grid = createGrid<Employee>({
  modules: [AllModules],
  columns: [
    {
      field: 'id',
      header: 'ID',
      size: { width: 70, resizable: false },
      display: { pinned: 'left' },
    },
    {
      field: 'name',
      header: 'Name',
      size: { flex: 2, minWidth: 140 },
      display: { pinned: 'left' },
    },
    {
      field: 'department',
      header: 'Department',
      size: { flex: 1, minWidth: 110 },
    },
    {
      field: 'email',
      header: 'Email',
      size: { flex: 3, minWidth: 180 },
    },
    {
      field: 'internalRating',
      header: 'Rating',
      display: { visible: false }, // hidden until toggled on
    },
  ],
  data: employees,
})
```

---

Next: [03 · Sorting](/docs/react/sorting)
