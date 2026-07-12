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

> **`field` is doing two jobs.** First, it tells the grid *which value to read* from each row (`row.firstName`). Second, it becomes that column's **unique ID** — the string you pass to API calls like `api.setColumnWidth('firstName', 300)` or `api.moveColumn('firstName', 0)`. Because of this, every column needs a distinct `field`. (If you ever need two columns reading the same field — say a "computed" column — see [Chapter 08](/docs/vue/formatting-values), which uses `value.getter` to read a field without colliding on the ID.)

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
| `formatter` | `(value, row) => string` | — | Format the displayed text (see [Ch. 08](/docs/vue/formatting-values)) |
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

```css
/* your app's CSS — EliteGrid does not define these names; you do */
.cell-danger { color: #dc2626; font-weight: 600; }
```

---

## Changing columns at runtime

You don't pass new columns to re-configure the grid. Instead, use the [Grid API](/docs/vue/grid-api):

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

```ts
const grid = createGrid<Employee>({
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

Next: [03 · Sorting](/docs/vue/sorting)
