# Localization & State

Two features that tax every other one, so they are worth setting up early:

- **Localization** — every string the grid renders, overridable.
- **Grid state** — saved views: column layout, sort, filters, search, grouping, pagination, selection, scroll.

Neither needs a module.

---

## Localization

Every string the grid renders has a key, and you override the ones you care about:

```tsx
const grid = createGrid<Row>({
  modules: [AllModules],
  columns,
  data,
  locale: {
    filterApply: 'Anwenden',
    filterClear: 'Löschen',
    filterOpContains: 'enthält',
  },
})
```

**Partial by design.** Anything you leave out stays English, so overriding three strings for tone is as legitimate as translating all 250.

### Parameterised strings are functions

Not strings with placeholder tokens — which is what lets a translation reorder or pluralise them:

```tsx
locale: {
  paginationPage: (page) => `Seite ${page}`,
  paginationRowCount: (from, to, total) => `${from}–${to} von ${total}`,
  groupCount: (count) => `${count} ${count === 1 ? 'Eintrag' : 'Einträge'}`,
}
```

A token-based string like `'Page {page} of {total}'` cannot express a plural rule or a different word order. A function can.

### Finding the keys

Keys are grouped by the surface they belong to, so autocomplete is useful:

| Prefix | Covers |
| --- | --- |
| `filterOp*` | Filter operators — `contains`, `between`, `before`… |
| `filter*` | The filter popover's own chrome |
| `floatingFilter*` | The floating filter row |
| `setFilter*` | The set filter's summary and list |
| `pagination*` | The pagination bar |
| `group*` | Group headings, counts, the chip bar, menu items |

The full list with its English defaults is `DEFAULT_LOCALE` in the package source.

### Catching what you missed

```tsx
const grid = createGrid<Row>({
  modules: [AllModules],
  columns,
  data,
  locale: myGermanLocale,
  localeStrict: true, // dev-only
})
```

Warns once, listing every key still rendering English. Opt-in rather than on by default, because a partial override is a legitimate choice rather than a mistake.

### The grid's own label

```tsx
accessibility: {
  gridLabel: 'Rechnungen', // overrides locale.gridLabel for this grid
}
```

`accessibility.gridLabel` predates `locale` and still wins for this one string — the narrow option beats the broad one.

### Turning announcements down

```tsx
accessibility: {
  announceFocus: true,      // default
  announceSort: true,       // default
  announceFilter: true,     // default
  announceSelection: true,  // default
  announceEdit: true,       // default
  announcePage: true,       // default
  announceRowsLoaded: true, // default — "200 of 12,480 rows loaded"
}
```

All on by default. See [Accessibility](/docs/react/accessibility).

---

## Grid state

Everything the user arranged, in one serialisable object:

```tsx
const saved = api.getState()
localStorage.setItem('myGrid', JSON.stringify(saved))
```

```tsx
const report = api.setState(JSON.parse(localStorage.getItem('myGrid')!))
```

### Let the grid persist it for you

```tsx
const grid = createGrid<Row>({
  modules: [AllModules],
  columns,
  data,
  state: {
    key: 'invoices-grid', // persist here, restore on mount
    debounce: 200,        // default
  },
})
```

That is the whole setup — no serialiser, no debounce, no version check to write.

`debounce` defaults to 200ms because scroll alone fires per frame, and an undebounced write would be a synchronous serialise on the scroll path.

### What a state holds

| Slice | Contents |
| --- | --- |
| `columns` | Width, order, visibility, pinning — **and** which column groups are folded |
| `sort` | The sort model |
| `filters` | The filter model |
| `search` | The quick-filter text |
| `grouping` | `{ model, expanded }` — which columns are grouped and which sections are open |
| `pagination` | `{ page, pageSize }` |
| `selection` | `{ ids }` |
| `rowDetail` | `{ expanded }` — row ids whose detail panel is open |
| `scroll` | `{ top, left }` |

A slice is absent only when the module that owns it is not registered.

> **Group expansion survives a reload**, because a group is addressed by its key path — plain strings that JSON handles with no custom serialiser, and nothing that points at an internal row object.

### Choosing what to persist

```tsx
state: {
  key: 'invoices-grid',
  include: ['columns', 'sort', 'filters'], // not selection or scroll
}
```

Default is every slice the grid produces.

### Restoring a subset

```tsx
api.setState(saved, { only: ['columns'] }) // layout back, filters untouched
```

### A restore tells you what happened

```tsx
const report = api.setState(saved)

if (report.skipped.length > 0) {
  console.warn('partial restore', report.skipped)
}
```

| Field | Meaning |
| --- | --- |
| `applied` | Slices that were restored |
| `skipped` | `{ slice, reason, detail? }` for each one that was not |

| `reason` | Cause |
| --- | --- |
| `'absent-module'` | The module that owns the slice is not registered |
| `'not-in-state'` | The saved object has no such slice |
| `'excluded'` | You passed `only` and this slice was not in it |
| `'schema-mismatch'` | The saved state is from an incompatible version |

> It returns a report rather than `void`, which is what makes a partial restore visible — otherwise a saved view comes back "mostly" and nobody notices the filters are missing until a user does. `expect(report.skipped).toEqual([])` is a test anyone can write.

### `initial` vs `key`

```tsx
state: {
  initial: savedFromMyServer, // restore this object once
}
```

`initial` is applied **once, after the first data settle** — not at construction. With an async `dataSource` there are no rows yet when the grid is built, so a restored selection would select nothing and a restored scroll offset would exceed a zero-height canvas.

Pipeline inputs — columns, sort, filters, search, page size — still apply immediately.

`key` and `initial` are independent: `key` persists to storage and restores from it, `initial` restores an object you supply. Use `initial` when the state comes from your own server rather than the browser.

### Reacting to changes

```tsx
events: {
  onStateChange: (state) => saveToServer(state),
}
```

Already debounced by `state.debounce`, so it is safe to persist directly from here. It fires whether or not `state.key` is set.

### Functions do not serialise

A `comparator` or `customFilter` **declared on the column** is re-attached on restore, so a column with a custom sort keeps it.

One passed imperatively — to `setSortModel()` or `setColumnFilter()` — is dropped, with a development warning. If you want a custom comparator to survive a saved view, declare it on the column.

---

## Gotchas

- **`locale` is partial.** Untranslated keys stay English silently; `localeStrict: true` in development is how you find them.
- **Parameterised locale entries are functions**, not templates with tokens.
- **`accessibility.gridLabel` beats `locale.gridLabel`.**
- **`state.initial` applies after the first data settle**, not at construction — so a selection restore works with an async source.
- **Check `report.skipped`.** A half-restored view is otherwise invisible.
- **Declare comparators on the column**, not imperatively, if they must survive a restore.
- **A saved `rowDetail` is filtered against the rows that came back** — a saved view of a deleted row does not reopen a panel for it.

---

Next: [13 · Accessibility](/docs/react/accessibility)
