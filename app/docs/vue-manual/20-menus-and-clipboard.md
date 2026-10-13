# Menus & Clipboard

Three features that share a theme — getting data and commands out of the grid without writing a toolbar:

- **The column menu** — the `⋮` button in a column header.
- **The context menu** — right-click in the body.
- **Clipboard copy** — `Ctrl`/`Cmd`+`C`, and the API behind it.

> **The two menus need `MenuModule`**, which carries no behaviour of its own — it exists purely so the two menu component trees can be left out of a bundle that does not want them. It is in `AllModules`. Clipboard copy needs no module at all.
>
> Configure a menu without registering `MenuModule` and you get a development warning rather than silence.

---

## The column menu

On by default wherever `MenuModule` is registered:

```ts
import { createGrid, AllModules, Grid } from '@elitegrid/vue'

const grid = createGrid<Invoice>({
  modules: [AllModules],
  columns,
  data,
  columnMenu: {
    enabled: true,      // default
    showOnHover: false, // default — the ⋮ is always visible
    showColumnChooser: true, // default
  },
})
```

| Option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Show the `⋮` button at all |
| `showOnHover` | `false` | Reveal the button only while the header is hovered |
| `icon` | `⋮` | Replace the glyph with your own node |
| `showColumnChooser` | `true` | The inline checkbox list of every column |
| `items` | — | Rewrite the item list |

Keyboard focus and an open menu reveal the button regardless of `showOnHover`, so it is never unreachable.

> Turning `showColumnChooser` off while the menu still offers "Hide column" warns in development — a hidden column would then have no route back.

### What is in it

| Item id | What it does |
| --- | --- |
| `sortAsc` / `sortDesc` / `clearSort` | Sorting |
| `filter` | Opens this column's filter |
| `groupBy` / `ungroup` | Row grouping |
| `pinLeft` / `pinRight` / `unpin` | Column pinning |
| `autoSizeThis` / `autoSizeAll` | Column auto-size |
| `hide` | Hide this column |
| `columns` | The inline column chooser |

Each item appears only when the module behind it is registered — no `SortModule`, no sort items.

### Rewriting the items

```ts
columnMenu: {
  items: ({ column, columnId, defaultItems, api }) => [
    ...defaultItems.filter((i) => i.id !== 'hide'),
    {
      id: 'copy-column',
      label: `Copy all of ${column.header}`,
      separator: true,
      action: () => api.copyToClipboard({ columns: [columnId], scope: 'filtered' }),
    },
  ],
}
```

`defaultItems` holds **real objects with live actions**, so both of these work:

```ts
defaultItems.filter((i) => i.id !== 'hide')        // drop one
defaultItems.map((i) => i.id === 'sortAsc' ? { ...i, label: 'A→Z' } : i)  // rename one
```

An item takes:

| Field | Meaning |
| --- | --- |
| `id` | A built-in id, or any string for your own |
| `label` | The text |
| `icon` | Your own node |
| `disabled` | Greyed out, with `aria-disabled` |
| `checked` | Draws a check and makes it a radio row. `undefined` ≠ `false` — undefined means "no checked state" |
| `separator` | Draw a rule **above** this item |
| `action(params)` | What it does |

> `separator` lives on the item rather than being its own array entry, so filtering `defaultItems` can never strand a separator at the top or bottom of the menu.

### Per-column tweaks

```ts
{
  field: 'notes',
  header: 'Notes',
  menu: {
    enabled: true,
    items: ({ defaultItems }) => defaultItems.filter((i) => i.id !== 'groupBy'),
  },
}
```

The grid-level `columnMenu.items` runs **first**, and the per-column `menu.items` runs on its output — so a grid-wide addition and a per-column tweak compose instead of one silently replacing the other.

---

## The context menu

Right-click in the body:

```ts
contextMenu: {
  enabled: true,                // default — governs the BODY
  openColumnMenuOnHeader: true, // default
}
```

| Item id | Needs |
| --- | --- |
| `copy` / `copyWithHeaders` | nothing |
| `export` / `exportSelection` | `ExportModule` |
| `expandAll` / `collapseAll` | `GroupModule` or `rowDetail` |
| `autoSizeAll` | nothing |
| `moveToTop` / `moveToBottom` | `rowDrag` |

**`copy` and `autoSizeAll` are ungated**, so a grid built with `modules: []` still gets a working right-click menu.

### The browser's menu

When `enabled` is `false` the browser's own menu appears, because the grid suppresses it only when it shows its own. That one rule is the whole of the configuration.

Returning `[]` from `items` does the same thing, per target:

```ts
contextMenu: {
  items: ({ target, defaultItems }) =>
    target.kind === 'blank' ? [] : defaultItems, // browser menu outside cells
}
```

### Right-clicking a header

`openColumnMenuOnHeader` (default `true`) opens that column's `⋮` menu at the pointer instead of the context menu. It is independent of `enabled`, which governs the body — a grid can legitimately want one and not the other.

### The target

```ts
contextMenu: {
  items: ({ target, defaultItems, api }) => {
    if (target.kind === 'blank') return defaultItems
    return [
      ...defaultItems,
      {
        id: 'open',
        label: `Open ${target.row.customer}`,
        separator: true,
        action: () => router.push(`/invoices/${target.rowId}`),
      },
    ]
  },
}
```

`target.kind` is `'cell'` or `'blank'`. On a cell you get `row` (a real `TData`, by reference, never a group row), `rowId`, `columnId` and `column`.

### Per-column context items

```ts
{
  field: 'secret',
  header: 'Secret',
  menu: {
    contextItems: () => [], // browser's menu over this column
  },
}
```

Named `contextItems` rather than a second `items` because both live in one group.

### Opening it yourself

```ts
api.showContextMenu({ x: event.clientX, y: event.clientY })
```

Viewport coordinates — the same numbers a `MouseEvent` carries. That is the whole binding for a long-press on touch, a toolbar button or a custom keybinding.

This is deliberately **not** gated on `contextMenu.enabled`: a developer who turned the built-in right-click off and bound their own gesture is exactly the caller this method has. `enabled` governs the gesture the grid owns, not the feature.

---

## Clipboard copy

`Ctrl`/`Cmd`+`C` copies the selection, or the focused cell if nothing is selected. On by default — copying what you selected is baseline behaviour, not a feature you opt into.

```ts
clipboard: {
  enabled: true,          // default — governs the SHORTCUT only
  includeHeaders: false,  // default
  delimiter: '\t',        // default
}
```

The default delimiter is a **tab**, because Excel, Sheets and Numbers all parse tab-separated paste into cells. A comma produces a single column in all three.

`includeHeaders` is off because a one-cell copy with a header line above it is wrong far more often than it is right — and a single focused cell never gets one regardless of the setting.

> **`enabled: false` disables the shortcut, not the feature.** `api.copyToClipboard()` keeps working, because an API call is an explicit request rather than an affordance the grid offered.

### From code

```ts
const result = await api.copyToClipboard({
  scope: 'selected',       // 'auto' | 'focused' | 'all' | 'filtered' | 'page' | 'selected'
  includeHeaders: true,
  columns: ['name', 'amount'],
  delimiter: ',',
})

if (!result.ok) {
  toast(result.reason === 'denied' ? 'Clipboard blocked' : 'Nothing to copy')
}
```

It returns a result rather than `void`:

| Field | Meaning |
| --- | --- |
| `ok` | `false` when nothing was copied — the clipboard is left untouched, never overwritten with an empty string |
| `text` | Exactly what was written, header row included |
| `rowCount` | Rows written, **excluding** the header. A one-cell copy is 1 × 1 |
| `columnCount` | Columns written |
| `reason` | Only when `ok` is false |

| `reason` | Cause |
| --- | --- |
| `'empty'` | Nothing selected, no focused cell, or no columns resolved |
| `'unavailable'` | No clipboard host — server-side rendering, or a call before mount |
| `'denied'` | The browser blocked it: non-secure context, denied permission, or no user gesture |

> Every copy method returns a result, so a clipboard write that the browser refuses is something you can see and handle rather than a silent no-op.

---

## Gotchas

- **Both menus need `MenuModule`.** It is in `AllModules`; a hand-picked list must name it. Configuring a menu without it warns.
- **`columnMenu.items` runs before `column.menu.items`**, and the per-column one receives the output of the grid-level one.
- **`checked: undefined` is not `checked: false`.** Undefined means the item has no checked state at all and stays a plain `menuitem`.
- **A menu item's `separator` draws a rule above itself**, so filtering items never strands one.
- **`clipboard.enabled: false` still leaves `api.copyToClipboard()` working.**
- **`copyToClipboard` can fail for reasons that are not your bug** — a non-secure context or a missing user gesture. Check `result.ok`.
- **Floating menus portal to `document.body`**, so they carry the grid's theme classes with them. If you are building your own floating surface, do the same or it will render light on a dark grid.

---

Next: [Live & Streaming Data](/docs/vue/live-data).
