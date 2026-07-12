# 09 · Appearance & Theming

The `appearance` group controls how the grid looks: theme, row height, density, striping, and the empty/loading/error states.

> **A few visual terms used below:**
>
> - **Theme** — a coordinated set of colours. `'light'` is dark text on white; `'dark'` is light text on a dark background.
> - **Density** — how tightly packed the rows are vertically. `'compact'` fits more rows on screen; `'comfortable'` adds breathing room.
> - **Striping** (a.k.a. "zebra striping") — giving every other row a slightly different background so the eye can follow a row across wide tables.
> - **Overlay** — a panel drawn *on top of* the grid area to communicate a whole-grid state: "no data", "loading…", or "something failed".

```ts
const grid = createGrid<User>({
  columns,
  data,
  appearance: {
    theme: 'light',
    density: 'normal',
    rowHeight: 44,
    rowStriping: true,
  },
})
```

---

## Appearance options

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme (`auto` follows the OS) |
| `density` | `'compact' \| 'normal' \| 'comfortable'` | `'normal'` | Vertical spacing preset |
| `rowHeight` | `number` | `40` | Body row height in pixels |
| `headerHeight` | `number` | `44` | Header row height in pixels |
| `rowStriping` | `boolean` | `true` | Alternating row background |
| `showColumnBorders` | `boolean` | `false` | Vertical lines between columns |
| `showHoverHighlight` | `boolean` | `true` | Highlight the row under the cursor |
| `className` | `string` | — | Extra CSS class on the grid container |
| `style` | `Partial<CSSStyleDeclaration>` | — | Inline styles on the grid container |

### Dark mode

```ts
appearance: { theme: 'dark' }
// or follow the operating system:
appearance: { theme: 'auto' }
```

### Compact rows for dense data

```ts
appearance: { density: 'compact', rowHeight: 32 }
```

### Add your own wrapper class / styles

```ts
appearance: {
  className: 'my-grid',
  style: { borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
}
```

---

## Empty states

There are **two different "empty" situations**, and the grid shows a different message for each so users aren't confused:

1. **No data at all** — you genuinely have zero rows (a brand-new account, say).
2. **No *matching* data** — you have rows, but the current filter hides all of them. The fix here is "clear your filters", not "add data".

When the grid has **no data**, it shows an empty-state overlay. Customize the text and icon — icons are typed as `VanillaNode` (a plain `HTMLElement`, or just a `string`):

```ts
const icon = document.createElement('span')
icon.style.fontSize = '48px'
icon.textContent = '📋'

appearance: {
  emptyState: {
    title: 'No employees yet',
    description: 'Add your first employee to get started.',
    icon,
  },
}
```

When a **filter** matches nothing, a separate state is shown:

```ts
appearance: {
  filteredEmptyState: {
    title: 'No matching results',
    description: 'Try adjusting or clearing your filters.',
  },
}
```

For full control, pass your own **renderer** — a plain function that receives the overlay's container element and paints into it directly (no component, no virtual DOM):

```ts
appearance: {
  emptyStateComponent: (container) => {
    container.innerHTML = '<div class="empty">Nothing to see here 🤷</div>'
  },
}
```

`emptyStateComponent`, if provided, overrides the simple `emptyState`/`filteredEmptyState` props above.

---

## Loading state

When data is loading (typically with a server-side `dataSource`), the grid shows a loading overlay:

```ts
appearance: {
  loadingState: { message: 'Loading employees…' },
}
```

Or a custom renderer, same shape as the empty-state one:

```ts
appearance: {
  loadingComponent: (container) => {
    container.innerHTML = '<div class="spinner">⏳ Loading…</div>'
  },
}
```

> The grid is smart about loading: with static `data` it won't flash a loading shimmer on the first render.

---

## Error state

`errorComponent` is a renderer that additionally receives the thrown `Error` as its second argument:

```ts
appearance: {
  errorComponent: (container, error) => {
    container.innerHTML = `<div class="error">Failed to load: ${error.message}</div>`
  },
}
```

---

## Theming with CSS variables

A **CSS custom property** (often called a "CSS variable") is a named value you can define once and reuse throughout your styles — they always start with two dashes, like `--eg-accent`. EliteGrid builds its entire look out of these, all prefixed with `--eg-`. Because the grid *reads* these variables rather than hard-coding colours, you can re-skin it to match your brand simply by giving them new values in your own CSS — no need to fight the library's stylesheet.

```css
.my-grid {
  --eg-accent: #6d28d9;          /* highlight / focus color */
  --eg-border: #e5e7eb;
  --eg-header-bg: #f9fafb;
}
```

(Pair this with `appearance.className: 'my-grid'` so the variables only apply to this grid. A variable set on `.my-grid` "cascades" down to every element inside it, which is how one declaration restyles the whole table.)

---

## `density` and `rowHeight` are independent — set both

It's easy to assume `density` picks a row height for you, but the two options do genuinely different jobs and don't talk to each other:

- **`rowHeight`** is what the grid's virtualization math actually uses to lay out and measure rows (in pixels). It defaults to `40` if you don't set it.
- **`density`** only adds a CSS class (`compact`/`normal`/`comfortable`) that adjusts *visual* things like cell padding and font size. It does **not** change the pixel value the virtualizer thinks each row is.

That means switching `density` alone, without also adjusting `rowHeight`, can leave you with padding tuned for a different row height than the grid is actually rendering at — rows that look slightly cramped (compact CSS in a 40px row) or slightly loose (comfortable CSS in a 40px row). For a genuinely compact or comfortable grid, set **both**:

```ts
// Genuinely compact: tighter padding AND a shorter row
appearance: { density: 'compact', rowHeight: 32 }

// Genuinely comfortable: roomier padding AND a taller row
appearance: { density: 'comfortable', rowHeight: 52 }
```

If you only change `rowHeight` without `density`, the grid still renders correctly — you just keep the `'normal'` padding/font-size at your custom height, which is a perfectly valid look too.

---

## Following the site's own theme toggle

`appearance.theme` is read once, when the grid is created — there's no method to flip it live afterwards. That's fine, because the grid's whole look is driven by the `--eg-*` CSS variables described above, and CSS variables *are* reactive to attribute/class changes. So instead of trying to update `appearance.theme` at runtime, point your **CSS** at whatever your own toggle currently has set, and update a `data-theme` attribute on the wrapper whenever the toggle changes:

```ts
const wrapper = document.getElementById('grid-container')!
wrapper.classList.add('my-grid')

function applyTheme(theme: 'light' | 'dark') {
  wrapper.dataset.theme = theme
}

applyTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')

document.getElementById('theme-toggle')!.addEventListener('click', () => {
  const next = wrapper.dataset.theme === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  localStorage.setItem('theme', next)
})
```

```css
.my-grid[data-theme='dark'] {
  --eg-header-bg: #1a1a2a;
  --eg-row-bg: #0f0f1a;
  --eg-cell-text: #e2e8f0;
  /* …override the rest of the --eg-* variables you care about */
}
```

Set `appearance: { theme: 'light' }` (or leave the default) in `createGrid` so the grid's own light/dark class matches your CSS overrides, and let the `data-theme` attribute — driven by whatever your toggle sets — do the actual switching. There's no reactivity system to route this through in vanilla JS; setting the attribute directly, as above, is the whole mechanism.

> `theme: 'auto'` is a good default if your app doesn't have its own toggle yet — it just follows the OS setting via `prefers-color-scheme`, with zero wiring required.

---

## Common appearance mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Custom `className`/`style` changes don't seem to apply | CSS variable overrides need to target the class you passed via `appearance.className`, not `:root` | Scope your overrides to `.my-grid { --eg-accent: ...; }`, matching the class name |
| Grid flashes light theme before switching to dark | `data-theme` is set after first paint (e.g. in a `DOMContentLoaded` listener) | Read the saved/OS theme and set `data-theme` synchronously, in an inline `<script>` before the grid mounts, or default to `'auto'` |
| Empty state shows even though `data` has rows | You're looking at `filteredEmptyState`, not `emptyState` — a filter is hiding everything | Check `api.getFilterModel()`; this is the "no *matching* data" case, not "no data at all" |
| Custom `loadingComponent` never appears | You're using static `data`, not a `dataSource` | The loading overlay is driven by the async `dataSource` lifecycle — static data has nothing to wait for |
| `emptyStateComponent` renders once and never updates | The renderer paints into the container once, synchronously — it isn't a live-bound component | Re-run your own painting logic (e.g. re-call `container.innerHTML = ...`) inside an `onFilterChange`/`onReady` handler if the empty state needs to reflect changing app state |

---

Next: [10 · Exporting to CSV](/docs/vanilla/export)
