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
| `style` | `CSSProperties` | — | Inline styles on the grid container |

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

When the grid has **no data**, it shows an empty-state overlay. Customize the text and icon (icons are `VNode`s, built with Vue's `h()`):

```ts
import { h } from 'vue'

appearance: {
  emptyState: {
    title: 'No employees yet',
    description: 'Add your first employee to get started.',
    icon: h('span', { style: { fontSize: '48px' } }, '📋'),
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

For full control, pass your own component (overrides the simple props above):

```vue
<!-- EmptyView.vue -->
<template>
  <div class="empty">Nothing to see here 🤷</div>
</template>
```

```ts
import EmptyView from './EmptyView.vue'

appearance: {
  emptyStateComponent: EmptyView,
}
```

---

## Loading state

When data is loading (typically with a server-side `dataSource`), the grid shows a loading overlay:

```ts
appearance: {
  loadingState: { message: 'Loading employees…' },
}
```

Or a custom component:

```vue
<!-- Spinner.vue -->
<template>
  <div class="spinner">⏳ Loading…</div>
</template>
```

```ts
import Spinner from './Spinner.vue'

appearance: { loadingComponent: Spinner }
```

> The grid is smart about loading: with static `data` it won't flash a loading shimmer on the first render.

---

## Error state

Provide a component to render when the data source throws. It receives the `error` as a prop:

```vue
<!-- ErrorView.vue -->
<script setup lang="ts">
defineProps<{ error: Error }>()
</script>

<template>
  <div class="error">Failed to load: {{ error.message }}</div>
</template>
```

```ts
import ErrorView from './ErrorView.vue'

appearance: { errorComponent: ErrorView }
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

`appearance.theme` is read once, when the grid is created — there's no method to flip it live afterwards. That's fine, because the grid's whole look is driven by the `--eg-*` CSS variables described above, and CSS variables *are* reactive to class/attribute changes. So instead of trying to update `appearance.theme` at runtime, point your **CSS** at whatever your app's toggle is currently set to:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ siteTheme: 'light' | 'dark' }>()
const wrapperTheme = computed(() => props.siteTheme)
</script>

<template>
  <div :data-theme="wrapperTheme" class="my-grid" style="height: 500px">
    <Grid :grid="grid" />
  </div>
</template>

<style>
.my-grid[data-theme='dark'] {
  --eg-header-bg: #1a1a2a;
  --eg-row-bg: #0f0f1a;
  --eg-cell-text: #e2e8f0;
  /* …override the rest of the --eg-* variables you care about */
}
</style>
```

Set `appearance: { theme: 'light' }` (or leave the default) in `createGrid` so the grid's own light/dark class matches your CSS overrides, and let the `data-theme` attribute — driven by whatever reactive state your toggle already uses — do the actual switching.

> `theme: 'auto'` is a good default if your app doesn't have its own toggle yet — it just follows the OS setting via `prefers-color-scheme`, with zero wiring required.

---

## Live example

The theme toggle from above, live: a button flips a `data-theme` ref, which re-cascades the `--eg-*` variables scoped to `appearance.className: 'my-grid'` — no grid re-creation. Written as `defineComponent` + `h()`, per the note in [Chapter 01](/docs/vue/getting-started#try-it-live).

```ts
import { defineComponent, h, ref } from 'vue'
import { createGrid, Grid } from '@elitegrid/vue'

interface Employee {
  id: number
  name: string
  department: string
  role: string
}

const employees: Employee[] = [
  { id: 1, name: 'Ada Lovelace', department: 'Engineering', role: 'Staff Engineer' },
  { id: 2, name: 'Alan Turing', department: 'Research', role: 'Principal Scientist' },
  { id: 3, name: 'Grace Hopper', department: 'Engineering', role: 'Eng Manager' },
  { id: 4, name: 'Margaret Hamilton', department: 'Engineering', role: 'Tech Lead' },
  { id: 5, name: 'Katherine Johnson', department: 'Research', role: 'Senior Analyst' },
  { id: 6, name: 'Linus Torvalds', department: 'Engineering', role: 'Staff Engineer' },
  { id: 7, name: 'Tim Berners-Lee', department: 'Research', role: 'Principal Scientist' },
  { id: 8, name: 'Barbara Liskov', department: 'Engineering', role: 'Eng Manager' },
  { id: 9, name: 'Dennis Ritchie', department: 'Engineering', role: 'Staff Engineer' },
  { id: 10, name: 'Radia Perlman', department: 'Research', role: 'Senior Analyst' },
]

const grid = createGrid<Employee>({
  columns: [
    { field: 'name', header: 'Name', size: { flex: 2 } },
    { field: 'department', header: 'Department', size: { flex: 1.5 } },
    { field: 'role', header: 'Role', size: { flex: 1.5 } },
  ],
  data: employees,
  appearance: { className: 'my-grid' },
})

const THEME_CSS = `
  .my-grid { --eg-header-bg: #f9fafb; --eg-row-bg: #ffffff; --eg-cell-text: #111827; --eg-border: #e5e7eb; --eg-accent: #6d28d9; }
  [data-theme='dark'] .my-grid { --eg-header-bg: #1a1a2a; --eg-row-bg: #0f0f1a; --eg-cell-text: #e2e8f0; --eg-border: #2d2d4d; --eg-accent: #a78bfa; }
`

export default defineComponent({
  setup() {
    const theme = ref<'light' | 'dark'>('light')

    return () =>
      h('div', { style: 'height:440px;display:flex;flex-direction:column;gap:8px;padding:8px;box-sizing:border-box' }, [
        h('style', {}, THEME_CSS),
        h('div', { style: 'display:flex;gap:8px;flex-shrink:0' }, [
          h('button', {
            onClick: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' },
            style: 'padding:7px 16px;border-radius:7px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;font-family:system-ui;background:#7c3aed;color:#ffffff',
          }, `Switch to ${theme.value === 'light' ? 'dark' : 'light'} theme`),
        ]),
        h('div', { 'data-theme': theme.value, style: 'flex:1;min-height:0' }, [h(Grid, { grid })]),
      ])
  },
})
```

[[LIVE_DEMO:vue:0]]

---

## Common appearance mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Custom `className`/`style` changes don't seem to apply | CSS variable overrides need to target the class you passed via `appearance.className`, not `:root` | Scope your overrides to `.my-grid { --eg-accent: ...; }`, matching the class name |
| Grid flashes light theme before switching to dark | Theme is set after first paint (e.g. inside `onMounted`) | Read the saved/OS theme synchronously before the first render, or default to `'auto'` |
| Empty state shows even though `data` has rows | You're looking at `filteredEmptyState`, not `emptyState` — a filter is hiding everything | Check `api.getFilterModel()`; this is the "no *matching* data" case, not "no data at all" |
| Custom `loadingComponent` never appears | You're using static `data`, not a `dataSource` | The loading overlay is driven by the async `dataSource` lifecycle — static data has nothing to wait for |

---

Next: [10 · Exporting to CSV](/docs/vue/export)
