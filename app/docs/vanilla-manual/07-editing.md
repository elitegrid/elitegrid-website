# 07 · Inline Editing

Inline editing lets users change cell values directly in the grid. You enable it **both** at the grid level (`editing` group) **and** per column (`edit` group on each column you want editable).

> **"Inline" means in place.** Instead of opening a separate form or modal to change a value, the cell itself turns into an input box where it sits. The user types, presses Enter, and the cell goes back to showing text — no page change.

> **The two switches.** Editing needs *both* a grid-level master switch (`editing.enabled`) **and** a per-column opt-in (`edit.enabled` on each column). This is deliberate: you almost never want *every* column editable (an ID or a computed total shouldn't be), so the grid makes you say which ones are.

### The edit lifecycle (start → commit → cancel)

Every edit moves through the same three stages. Knowing their names makes the events and API later in the chapter obvious:

1. **Start** — the editor opens on a cell (double-click, or your API call).
2. **Commit** — the user accepts the change (Enter or Tab). The new value is validated and, if valid, saved into the grid's copy of the data.
3. **Cancel** — the user backs out (Escape) and the old value is kept.

---

## Step 1 — Enable editing on the grid

```ts
const grid = createGrid<Employee>({
  columns,
  data,
  editing: {
    enabled: true,
    trigger: 'doubleClick',  // or 'click'
  },
})
```

### Grid-level editing options

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `false` | Master switch for editing |
| `trigger` | `'click' \| 'doubleClick'` | `'doubleClick'` | How a user opens the editor |
| `confirmOnEnter` | `boolean` | `true` | **Enter** saves the cell |
| `cancelOnEscape` | `boolean` | `true` | **Escape** discards the change |
| `moveOnTab` | `boolean` | `true` | **Tab** saves and moves to the next editable cell |

---

## Step 2 — Mark columns editable with the `edit` group

A cell is only editable if its column has `edit.enabled`. The editor `type` decides what UI appears.

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean \| (row) => boolean` | `false` | Allow editing (can be per-row) |
| `type` | `'text' \| 'number' \| 'dropdown' \| 'date' \| 'boolean'` | `'text'` | Editor UI |
| `options` | `string[]` | — | Choices for `dropdown` type |
| `min` / `max` | `number` | — | Bounds for `number` type |
| `minDate` / `maxDate` | `Date` | — | Bounds for `date` type |
| `parser` | `(raw: string) => unknown` | — | Convert the typed string into your data type |
| `validator` | `(value, row) => string \| null \| Promise<...>` | — | Return an error message, or `null` if valid |

> **Why a `parser`?** Every `<input>` element hands you back a **string**, even for a number field — typing `42` gives you the text `"42"`, not the number `42`. A `parser` is a small function that converts that raw string into the shape your data actually uses, so `row.salary` stays a real number you can do math on. Without it you can end up with `"42"` (string) where you expected `42` (number), which breaks sorting and arithmetic.

### Text editor

```ts
{ field: 'name', header: 'Name', edit: { enabled: true, type: 'text' } }
```

### Number editor with bounds and a parser

The `parser` turns the typed string into a real number before it's stored:

```ts
{
  field: 'salary',
  header: 'Salary',
  edit: {
    enabled: true,
    type: 'number',
    min: 0,
    max: 1_000_000,
    parser: (raw) => Number(raw),
  },
}
```

> Number editors get **built-in validation** automatically: non-numbers and values outside `min`/`max` are rejected with a clear message before your own validator runs.

### Dropdown editor

```ts
{
  field: 'department',
  header: 'Department',
  edit: {
    enabled: true,
    type: 'dropdown',
    options: ['Engineering', 'Design', 'Marketing', 'HR'],
  },
}
```

### Date editor

Date editors use **local time** (so a date never shifts by a day across timezones) and respect `minDate`/`maxDate`:

```ts
{
  field: 'joinDate',
  header: 'Join Date',
  edit: {
    enabled: true,
    type: 'date',
    minDate: new Date('2010-01-01'),
    maxDate: new Date(),
  },
}
```

### Boolean editor

A boolean editor toggles the value on a single click — no extra UI:

```ts
{ field: 'active', header: 'Active', edit: { enabled: true, type: 'boolean' } }
```

---

## Per-row editable cells

`edit.enabled` can be a **function** that receives the row and returns `true`/`false`. This lets you allow editing only on some rows — e.g. you can't edit the salary of an inactive employee:

```ts
{
  field: 'salary',
  header: 'Salary',
  edit: {
    enabled: (row) => row.active,   // only active employees are editable
    type: 'number',
  },
}
```

---

## Validation

**Validation** is checking that what the user typed is acceptable *before* it is saved. A `validator` is your function for that check. The convention is simple but easy to get backwards, so read it carefully:

- Return a **string** → that string is the **error message**, and the value is **rejected**.
- Return **`null`** → the value is **accepted**.

(Think "return the problem, or `null` if there's no problem.")

Validators can also be **async** — they may return a `Promise`. "Async" means the answer might not be ready immediately; for example you might call your server to check whether an email is already taken. The grid waits for the promise to resolve before deciding. While it waits, the editor stays open.

```ts
{
  field: 'name',
  header: 'Name',
  edit: {
    enabled: true,
    type: 'text',
    validator: (value) => {
      if (!value || String(value).trim() === '') return 'Name is required'
      if (String(value).length > 50) return 'Name is too long'
      return null  // valid
    },
  },
}
```

Cross-field validation is possible because the validator also receives the full `row`:

```ts
validator: (value, row) => {
  if (row.active && !value) return 'Active employees must have a value'
  return null
}
```

When validation fails, a red tooltip appears under the editor and the value is not saved.

---

## Reacting to edits

Three events fire across the edit lifecycle:

```ts
events: {
  onEditStart: (rowId, field) => {
    console.log(`Editing ${field} on row ${rowId}`)
  },
  onEditCommit: (rowId, field, value) => {
    console.log(`Saved ${field} = ${value} on row ${rowId}`)
    // 👉 This is where you'd persist the change to your server
  },
  onEditCancel: (rowId, field) => {
    console.log(`Cancelled editing ${field} on row ${rowId}`)
  },
}
```

> **Important:** Editing updates the grid's in-memory copy of the data so the UI stays in sync. To persist changes to a database, do it in `onEditCommit`.

---

## Controlling the editor from code (the API)

```ts
api.startEditing('42', 'salary')  // open the editor on row 42's salary cell
api.stopEditing(true)             // close and SAVE
api.stopEditing(false)            // close and DISCARD
api.isEditing()                   // → boolean
api.getEditingCell()              // → { rowId, columnId, rowIndex, columnIndex } | null
```

---

## Keyboard shortcuts while editing

| Key | Action (when enabled) |
| --- | --- |
| **Enter** | Save the cell (`confirmOnEnter`) |
| **Escape** | Cancel the edit (`cancelOnEscape`) |
| **Tab** | Save and jump to the next editable cell (`moveOnTab`) |

---

## Live example

Double-click a cell to edit it. `salary` has a `validator` that rejects negative numbers; `department` uses a `dropdown` editor instead of free text.

```ts
import { createGrid, mount } from '@elitegrid/vanilla'
import '@elitegrid/vanilla/styles.css'

interface Employee {
  id: number
  name: string
  department: string
  salary: number
}

const employees: Employee[] = [
  { id: 1, name: 'Ada Lovelace', department: 'Engineering', salary: 120000 },
  { id: 2, name: 'Alan Turing', department: 'Research', salary: 135000 },
  { id: 3, name: 'Grace Hopper', department: 'Engineering', salary: 128000 },
  { id: 4, name: 'Margaret Hamilton', department: 'Engineering', salary: 131000 },
  { id: 5, name: 'Katherine Johnson', department: 'Research', salary: 118000 },
  { id: 6, name: 'Linus Torvalds', department: 'Engineering', salary: 142000 },
  { id: 7, name: 'Tim Berners-Lee', department: 'Research', salary: 125000 },
  { id: 8, name: 'Barbara Liskov', department: 'Engineering', salary: 133000 },
  { id: 9, name: 'Dennis Ritchie', department: 'Engineering', salary: 129000 },
  { id: 10, name: 'Radia Perlman', department: 'Research', salary: 121000 },
]

const grid = createGrid<Employee>({
  columns: [
    { field: 'name', header: 'Name', size: { flex: 1.5 }, edit: { enabled: true, type: 'text' } },
    {
      field: 'department',
      header: 'Department',
      size: { flex: 1.5 },
      edit: { enabled: true, type: 'dropdown', options: ['Engineering', 'Research', 'Product', 'Design'] },
    },
    {
      field: 'salary',
      header: 'Salary',
      display: { formatter: (v) => `$${Number(v).toLocaleString()}` },
      edit: {
        enabled: true,
        type: 'number',
        validator: (value) => (Number(value) < 0 ? 'Salary cannot be negative' : null),
      },
    },
  ],
  data: employees,
  editing: { enabled: true, trigger: 'doubleClick', confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
})

const container = document.getElementById('grid-container')!
container.style.cssText = 'height:440px'
mount(grid, container)
```

[[LIVE_DEMO:vanilla:0]]

---

Next: [08 · Formatting Cell Values](/docs/vanilla/formatting-values)
