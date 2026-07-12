# 08 · Formatting Cell Values

By default a cell shows the raw value of its `field`. Often you want something nicer — `$49.99` instead of `49.99`, `Mar 5, 2024` instead of a timestamp, or a value computed from several fields. This chapter covers the `display.formatter` and `value` groups.

---

> **The key distinction in this chapter: "value" vs "display".**
>
> - The **value** is the real data stored on the row — the number `49.99`, a timestamp, a boolean.
> - The **display** is the text the user reads in the cell — `"$49.99"`, `"Mar 5, 2024"`, `"Active"`.
>
> A `formatter` changes only the *display*. The value underneath is untouched, so sorting, filtering and export still work on the real number/date. Keep this separation in mind and the rest of the chapter is straightforward.

---

## `formatter` — change how a value is displayed

`formatter` receives the cell `value` and the whole `row`, and returns the **string to display**. It only affects display — the underlying data is unchanged. The function runs for each cell as it is drawn.

> **`toLocaleString()` / `toLocaleDateString()`** (used in the examples below) are built-in JavaScript methods that format numbers and dates according to the user's locale — adding thousands separators (`50,000`) or local date styles. They are standard JS, not part of EliteGrid.

### Currency

```ts
{
  field: 'salary',
  header: 'Salary',
  display: {
    formatter: (value) => `$${Number(value).toLocaleString()}`,
  },
}
// 50000 → "$50,000"
```

### Dates

```ts
{
  field: 'joinDate',
  header: 'Joined',
  display: {
    formatter: (value) =>
      value ? new Date(value as string).toLocaleDateString() : '—',
  },
}
```

### Booleans as friendly text

```ts
{
  field: 'active',
  header: 'Status',
  display: {
    formatter: (value) => (value ? '✓ Active' : '✗ Inactive'),
  },
}
```

### Using other fields in the format

Because the formatter also gets the `row`, you can combine fields:

```ts
{
  field: 'firstName',
  header: 'Full Name',
  display: {
    formatter: (value, row) => `${row.firstName} ${row.lastName}`,
  },
}
```

---

## `exportFormatter` — a different format for CSV

Sometimes the pretty display format is bad for spreadsheets (e.g. `$50,000` breaks number columns in Excel). Provide a separate `exportFormatter` used only when exporting to CSV:

```ts
{
  field: 'salary',
  header: 'Salary',
  display: {
    formatter: (value) => `$${Number(value).toLocaleString()}`, // on screen
    exportFormatter: (value) => String(value),                  // in CSV → 50000
  },
}
```

---

## The `value` group — custom data access

So far we've assumed each column maps to a simple top-level key like `row.salary`. The `value` group is for the two cases where that isn't true:

- **Nested data** — the value lives several levels deep, e.g. `row.user.profile.name`.
- **Computed columns** — there is no stored field at all; the value is calculated from others, e.g. `price × quantity`.

A **getter** is a function that *reads* a value out of a row. A **setter** is a function that *writes* one back in. You only need a setter if the column is also editable.

| Property | Type | Meaning |
| --- | --- | --- |
| `getter` | `(row) => unknown` | Read the value (for nested or computed data) |
| `setter` | `(row, value) => TData` | Write the value back (for nested edits) |

### Reading nested data with `getter`

If your row looks like `{ user: { profile: { name: 'Ada' } } }`:

```ts
{
  field: 'name',  // still needs a unique field id
  header: 'Name',
  value: {
    getter: (row) => row.user.profile.name,
  },
}
```

### Computed columns

A column that doesn't map to a stored field at all — e.g. a full name or a total:

```ts
{
  field: 'total',
  header: 'Total',
  value: {
    getter: (row) => row.price * row.quantity,
  },
  display: {
    formatter: (value) => `$${Number(value).toFixed(2)}`,
  },
}
```

### Writing back nested data with `setter`

When an editable column reads nested data, give it a `setter` so edits land in the right place. The setter must return a **brand-new row object** with the change applied — it should not modify the existing one in place. That is what the `...` (spread) syntax below does: it copies every existing property, then overrides the one that changed. This "copy, don't mutate" rule (called **immutability**) is how the grid reliably detects that a row changed and re-renders only what's needed.

```ts
{
  field: 'name',
  header: 'Name',
  value: {
    getter: (row) => row.user.profile.name,
    setter: (row, value) => ({
      ...row,
      user: {
        ...row.user,
        profile: { ...row.user.profile, name: value as string },
      },
    }),
  },
  edit: { enabled: true, type: 'text' },
}
```

---

## Pairing `formatter` with `cellClass`

`display` also has a `cellClass` option for conditional styling (colour-coding a status, highlighting an outlier value) — covered in [Chapter 02](/docs/vue/columns#conditional-cell-styling-with-cellclass). It's independent of `formatter`, so the two are commonly used together on the same column: `formatter` decides *what text* is shown, `cellClass` decides *how it looks*.

```ts
{
  field: 'status',
  header: 'Status',
  display: {
    formatter: (value) => (value ? 'Active' : 'Inactive'),
    cellClass: (value) => (value ? 'cell-active' : 'cell-inactive'),
  },
}
```

Changing one never affects the other — restyle a column without touching its text, or reword it without touching its colours.

---

## How the pieces fit together

For one cell, the grid runs these in order:

1. **`value.getter`** (or the raw `field`) → gets the underlying value
2. **`display.formatter`** → turns it into display text
3. **`display.cellClass`** → decides which CSS class(es) the cell gets, independently of the text
4. On edit commit: **`edit.parser`** → converts the typed string back to data, then **`value.setter`** (or the field) → stores it
5. On CSV export: **`display.exportFormatter`** (falls back to `formatter`)

---

Next: [09 · Appearance & Theming](/docs/vue/appearance)
