# 03 · Sorting

Sorting is **on by default**. Click a column header to sort ascending, click again for descending, click a third time to clear. This chapter shows how to configure it.

> **Jargon check — "ascending" vs "descending":** *Ascending* (`asc`) goes small → large: A→Z for text, 0→9 for numbers, oldest → newest for dates. *Descending* (`desc`) is the reverse. The little arrow in the header shows which way the column is currently sorted.

> **Does sorting change my data?** No. EliteGrid sorts a *view* of your rows for display; the original `data` array you passed in is never reordered or mutated. This is true of filtering and pagination too — they all transform a copy.

---

## Grid-level sorting options

These go in the `sorting` group of `createGrid`:

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Turn sorting on/off for the whole grid |
| `multiSort` | `boolean` | `true` | Allow sorting by more than one column |
| `multiSortKey` | `'shift' \| 'ctrl'` | `'shift'` | Key to hold for multi-sort |
| `defaultDirection` | `'asc' \| 'desc'` | `'asc'` | First click direction |
| `nullsFirst` | `boolean` | `false` | Put empty values first or last |

> **What does `nullsFirst` mean?** "Null" here is shorthand for *empty* values — `null`, `undefined`, or a missing field. When you sort a column, where should the blank rows go: bunched at the top or pushed to the bottom? `nullsFirst: true` puts them at the top; the default (`false`) sends them to the bottom so the real data is what you see first.

```tsx
const grid = createGrid<User>({
  columns,
  data,
  sorting: {
    enabled: true,
    multiSort: true,
    multiSortKey: 'shift',
    defaultDirection: 'asc',
  },
})
```

### Turn sorting off entirely

```ts
sorting: { enabled: false }
```

---

## Multi-column sorting

When `multiSort` is `true`, the user holds **Shift** (the default) and clicks additional headers to add secondary sorts. Example: sort by *Department*, then by *Salary* within each department.

The order of clicks is the sort priority. To use **Ctrl** instead of Shift:

```ts
sorting: { multiSort: true, multiSortKey: 'ctrl' }
```

To allow only one sort column at a time:

```ts
sorting: { multiSort: false }
```

---

## Per-column sort settings — the `sort` group

Each column can override the grid defaults inside its `sort` group:

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | inherits grid | Allow sorting this column |
| `defaultDirection` | `'asc' \| 'desc'` | inherits grid | First click direction |
| `comparator` | `(a, b) => number` | — | Custom sort logic |
| `nullsFirst` | `boolean` | `false` | Empty values first/last |

### Disable sorting for one column

```ts
{ field: 'avatar', header: '', sort: { enabled: false } }
```

### Custom sort with a `comparator`

A **comparator** is a small function that takes two values and decides their order. It works exactly like the callback you pass to JavaScript's built-in `Array.prototype.sort`: it receives two items, `a` and `b`, and returns a number:

| Return value | Meaning |
| --- | --- |
| **negative** (e.g. `-1`) | `a` should come **before** `b` |
| **positive** (e.g. `1`) | `a` should come **after** `b` |
| **`0`** | treat them as equal (keep their relative order) |

A handy trick: for numbers, `a - b` already gives exactly this shape — negative when `a` is smaller, positive when larger, zero when equal. That is why the examples below subtract.

You only need a comparator when the *default* ordering is wrong for your data — for example when text values have a meaningful order that is not alphabetical ("high/medium/low"), or when you want case-insensitive sorting.

Example — sort a `priority` field by a custom order (`high > medium > low`) instead of alphabetically:

```ts
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

{
  field: 'priority',
  header: 'Priority',
  sort: {
    comparator: (a, b) =>
      PRIORITY_ORDER[a as keyof typeof PRIORITY_ORDER] -
      PRIORITY_ORDER[b as keyof typeof PRIORITY_ORDER],
  },
}
```

Another example — case-insensitive string sort:

```ts
{
  field: 'name',
  header: 'Name',
  sort: {
    comparator: (a, b) =>
      String(a).toLowerCase().localeCompare(String(b).toLowerCase()),
  },
}
```

---

## Controlling sort from code (the API)

The current sort is represented by a **sort model** — an array of `{ columnId, direction }` objects. The array order is the priority: the first entry is the primary sort, the second breaks ties within the first, and so on. This is the same structure whether one or several columns are sorted.

```ts
// Apply a sort programmatically
api.setSortModel([
  { columnId: 'department', direction: 'asc' },   // primary: group by department
  { columnId: 'salary', direction: 'desc' },      // tie-breaker: highest paid first
])

// Read the current sort
const current = api.getSortModel()
// → [{ columnId: 'department', direction: 'asc' }, ...]

// Clear all sorting (returns rows to their original order)
api.clearSort()
```

> `columnId` is the column's `field` (see [Chapter 02](/docs/react/columns)).

---

## Reacting to sort changes

Pass an `onSortChange` callback in `events` to run code whenever the sort changes (e.g. to save it to the URL):

```tsx
const grid = createGrid<User>({
  columns,
  data,
  events: {
    onSortChange: (model) => {
      console.log('Sorted by:', model)
      // model = [{ columnId: 'name', direction: 'asc' }]
    },
  },
})
```

---

## Sorting a computed value

When a column reads its value through `value.getter` (see [Chapter 08](/docs/react/formatting-values#the-value-group--custom-data-access)) instead of a plain `field`, sorting still works the same way — the `comparator` (or the default sort) receives whatever the **getter returns**, not the raw row. That means you can sort by a value that doesn't exist anywhere in your data:

```ts
{
  field: 'fullName',            // no such key on the row — it's computed
  header: 'Name',
  value: {
    getter: (row) => `${row.firstName} ${row.lastName}`,
  },
  sort: {
    comparator: (a, b) => String(a).localeCompare(String(b)),
  },
}
```

Without a comparator here the default sort would still work (getter output is compared with `<`/`>`), but adding one lets you control things like locale-aware ordering.

---

## Persisting sort across page reloads

A sort the user picked usually shouldn't reset every time they refresh the page. Save the model in `onSortChange`, then restore it once the grid is ready:

```tsx
const SORT_KEY = 'usersGrid.sort'

const grid = createGrid<User>({
  columns,
  data,
  events: {
    onSortChange: (model) => {
      localStorage.setItem(SORT_KEY, JSON.stringify(model))
    },
    onReady: (api) => {
      const saved = localStorage.getItem(SORT_KEY)
      if (saved) api.setSortModel(JSON.parse(saved))
    },
  },
})
```

> The same pattern works for the URL instead of `localStorage` — write the model to a query param in `onSortChange`, and read it back in `onReady`. That makes a sorted view **shareable**: copying the link preserves what the other person sees.

---

## Live example

Multi-column sort (hold **Shift** and click a second header) plus the custom `priority` comparator from earlier in this chapter, so `high → medium → low` sorts correctly instead of alphabetically. The button demonstrates the Grid API's `clearSort()`.

```tsx
import { createGrid, Grid, type GridAPI } from '@elitegrid/react'
import '@elitegrid/react/styles.css'

interface Task {
  id: number
  title: string
  priority: 'high' | 'medium' | 'low'
  assignee: string
  dueInDays: number
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const tasks: Task[] = [
  { id: 1, title: 'Fix login bug', priority: 'high', assignee: 'Ada', dueInDays: 1 },
  { id: 2, title: 'Write release notes', priority: 'low', assignee: 'Alan', dueInDays: 5 },
  { id: 3, title: 'Review PR #482', priority: 'medium', assignee: 'Grace', dueInDays: 2 },
  { id: 4, title: 'Update dependencies', priority: 'low', assignee: 'Ada', dueInDays: 7 },
  { id: 5, title: 'Investigate slow query', priority: 'high', assignee: 'Grace', dueInDays: 1 },
  { id: 6, title: 'Design onboarding flow', priority: 'medium', assignee: 'Alan', dueInDays: 4 },
  { id: 7, title: 'Add dark mode toggle', priority: 'low', assignee: 'Grace', dueInDays: 10 },
  { id: 8, title: 'Patch security vulnerability', priority: 'high', assignee: 'Alan', dueInDays: 1 },
  { id: 9, title: 'Refactor auth module', priority: 'medium', assignee: 'Ada', dueInDays: 6 },
  { id: 10, title: 'Write onboarding docs', priority: 'low', assignee: 'Grace', dueInDays: 8 },
]

let api: GridAPI<Task> | null = null

const grid = createGrid<Task>({
  columns: [
    { field: 'title', header: 'Task', size: { flex: 2 } },
    {
      field: 'priority',
      header: 'Priority',
      sort: {
        comparator: (a, b) =>
          PRIORITY_ORDER[a as keyof typeof PRIORITY_ORDER] -
          PRIORITY_ORDER[b as keyof typeof PRIORITY_ORDER],
      },
    },
    { field: 'assignee', header: 'Assignee' },
    { field: 'dueInDays', header: 'Due (days)' },
  ],
  data: tasks,
  sorting: { multiSort: true },
  events: { onReady: (a) => { api = a } },
})

const Btn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: 'system-ui',
    background: '#7c3aed', color: '#ffffff',
  }}>{label}</button>
)

export default function App() {
  return (
    <div style={{ height: 440, display: 'flex', flexDirection: 'column', gap: 8, padding: 8, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Btn label="Reset sort" onClick={() => api?.clearSort()} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Grid grid={grid} />
      </div>
    </div>
  )
}
```

[[LIVE_DEMO:react:0]]

---

## Common sorting mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Numbers sort like text (`10` before `2`) | Field is stored as a `string`, not a `number` | Store it as a number, or add a `comparator: (a, b) => Number(a) - Number(b)` |
| Shift-click adds a sort instead of replacing it | That's multi-sort working as intended | Set `sorting: { multiSort: false }` if you only ever want one active sort |
| Custom `comparator` "works" but throws on some rows | Not handling `null`/`undefined` values defensively | Guard the comparator, or rely on `nullsFirst` instead of writing your own null-handling |
| Sort resets after every render | `columns` array is re-created on every render (a new comparator function each time counts as "changed") | Define `columns` outside the component or wrap it in `useMemo` |

---

Next: [04 · Filtering](/docs/react/filtering)
