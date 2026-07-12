# 16 · Glossary

A plain-English dictionary of every term used in this manual. Skim it once, then come back whenever a word in another chapter is unfamiliar. Terms are grouped: **EliteGrid concepts** first, then **general web/JavaScript terms**, then **Vue-specific terms**.

---

## EliteGrid concepts

**Adapter** The framework-specific package you install (`@elitegrid/vue`). It wraps the shared **core engine** so the grid feels native to Vue. There is a matching React adapter with the same features.

**Core engine / kernel** The framework-agnostic "brain" that actually holds your data and runs sorting, filtering, pagination, selection, and editing. `createGrid()` builds one. The adapter draws it on screen. Also called the **engine** or **kernel**.

**`createGrid(options)`** The function that builds the engine from your `columns`, `data`, and feature options. Safe to call directly in `<script setup>` — it only runs once per component instance. (See [Chapter 01](/docs/vue/getting-started).)

**`useCreateGrid(options)`** The same as `createGrid()`, but it also destroys the engine automatically when the component unmounts — the recommended default for grids inside components that come and go (routes, modals, tabs).

**`<Grid>`** The single Vue component you render, bound to the engine via `:grid="grid"`. It draws the header, rows, scrollbars, and pagination bar. It fills its parent, so the parent needs a height.

**Grid API** The "remote control" object full of methods (`api.setPage()`, `api.exportCSV()`, …) for driving the grid from your own code. You receive it from the `onReady` event. (See [Chapter 12](/docs/vue/grid-api).)

**Column definition (`ColumnDef`)** One object in the `columns` array describing a single column. Uses **grouped config**: related settings live under `size`, `display`, `sort`, `filter`, `edit`, and `value`. (See [Chapter 02](/docs/vue/columns).)

**Grouped config** EliteGrid's style of nesting a column's many settings into named groups so autocomplete stays tidy. `size: { width: 80 }` rather than a flat `width: 80`.

**`field`** The property name a column reads from each row (`row.salary`). It doubles as the column's **unique ID** in API calls. Every column needs a distinct `field`.

**`rowId`** Tells the grid which field uniquely identifies a row (defaults to `id`). Used to track selection, edits, and re-renders. Can be a field name or a function. (See [Chapter 01](/docs/vue/getting-started#what-is-rowid-important).)

**Pinning (freezing)** Sticking a column to the left or right edge so it stays put while the rest scroll sideways — like "freeze panes" in a spreadsheet.

**`flex`** A column width that grows/shrinks to share leftover space, weighted against other flex columns (`flex: 2` gets twice the share of `flex: 1`). The counterpart to a fixed pixel `width`.

**Comparator** A function `(a, b) => number` that decides the order of two values when sorting: negative if `a` comes first, positive if `b` does, `0` if equal. Used for custom sort orders. (See [Chapter 03](/docs/vue/sorting).)

**Sort model** An array of `{ columnId, direction }` describing the current sort. The array order is the priority (primary sort first, then tie-breakers).

**Operator** The *kind* of comparison a filter performs: *contains*, *equals*, *greater than*, *between*, etc. Different data types offer different operators.

**Filter model** An object keyed by column `field` describing the active filters, each `{ type, operator, value }`. (See [Chapter 04](/docs/vue/filtering).)

**Popover** The small floating panel anchored to the funnel icon that holds a column's filter controls.

**Debounce** Waiting until the user stops typing before reacting, so the grid filters once instead of on every keystroke. Controlled by `filtering.debounceMs`.

**Page / page size** A *page* is one screenful of rows; *page size* is how many rows per page. Pagination splits the data into pages with navigation controls. (See [Chapter 05](/docs/vue/pagination).)

**Selection** The grid's private list of which row IDs are currently ticked. Reading it lets you act on chosen rows (delete, export, etc.). Modes: `none`, `single`, `multiple`. (See [Chapter 06](/docs/vue/selection).)

**Inline editing** Changing a cell's value in place — the cell becomes an input — rather than in a separate form. Has a **start → commit → cancel** lifecycle. (See [Chapter 07](/docs/vue/editing).)

**Parser** An editor function that converts the raw string from an `<input>` into your data's real type (e.g. `"42"` → `42`). Without it, number fields can end up as strings.

**Validator** An editor function that checks a typed value before saving. Return an **error string** to reject, or **`null`** to accept. May be async (return a `Promise`).

**Formatter** A `display` function that turns the underlying *value* into the *display* text (`49.99` → `"$49.99"`). Affects only what's shown — sorting/filtering still use the real value.

**`exportFormatter`** A separate formatter used only for CSV export, for when the on-screen format is bad for spreadsheets (`$50,000` → `50000`).

**Getter / setter (`value` group)** A `getter` reads a value out of a row (for nested or computed columns); a `setter` writes one back (for editing nested data). (See [Chapter 08](/docs/vue/formatting-values).)

**Pipeline** The internal sequence your rows pass through: *raw → filter → sort → paginate → displayed*. `getData()` reads the start; `getDisplayedRows()` reads the end.

**Virtualization** Rendering only the rows visible in the viewport (plus a buffer) and recycling them as you scroll, so even a million rows stay fast. Always on. (See [Chapter 14](/docs/vue/performance).)

**Viewport** The visible, scrollable window onto the data — usually a few dozen rows.

**Buffer (`scroll.bufferSize`)** Extra rows rendered just outside the viewport so scrolling doesn't flash blank.

**`dataSource`** An object with a `getRows` method used instead of `data` when rows are too large to load at once. The grid asks for one page at a time; your server does the filtering/sorting. (See [Chapter 14](/docs/vue/performance#server-side-data-with-datasource).)

**Announcement** A short spoken message pushed to a screen reader when something changes ("Sorted by name, ascending"). Configurable and translatable. (See [Chapter 13](/docs/vue/accessibility).)

**Empty state / loading state / error state** Full-grid **overlays** shown when there are no rows, while data is loading, or when a data source fails. (See [Chapter 09](/docs/vue/appearance).)

---

## General web & JavaScript terms

**TypeScript `interface` / `type`** A description of an object's shape (its properties and their types). Exists only to help the compiler catch mistakes; produces no runtime code.

**Generic type argument (`<Product>`)** Extra type information you pass to a function, e.g. `createGrid<Product>(...)`, so it knows the shape of your data and can autocomplete and type-check.

**Autocomplete / IntelliSense** The dropdown of suggestions your editor shows as you type, powered by TypeScript types.

**Callback / event handler** A function you give to something else so it can call you *back* at the right moment (e.g. `onRowClick`). You define what happens; the grid decides when.

**Signature** The shape of a function's inputs and output, written as an arrow type, e.g. `(row, event) => void`. `void` means "returns nothing useful".

**Async / `Promise` / `await`** "Async" means a result arrives later, not immediately (e.g. a network request). A `Promise` is the placeholder for that future value; `await` pauses until it arrives.

**Closure** The bundle of surrounding variables a function "remembers" from when it was created.

**Immutability ("copy, don't mutate")** Producing a *new* object with changes applied (often via the `...` spread) instead of modifying the existing one. Helps the grid detect changes reliably.

**DOM (Document Object Model)** The browser's live tree of the HTML elements on the page. Each element costs memory and layout time, which is why virtualization keeps the count tiny.

**CSS class** A name attached to an element so a matching stylesheet rule styles it. `cellClass` attaches one to cells.

**CSS custom property ("CSS variable")** A reusable named value in CSS, starting with `--` (e.g. `--eg-accent`). EliteGrid themes itself with these, all prefixed `--eg-`. Override them to re-skin the grid.

**`localStorage`** A small browser store for strings that survives page reloads. Used to remember things like saved column layouts (`JSON.stringify` to save, `JSON.parse` to read).

**Serializable** Able to be turned into a string (via `JSON.stringify`) and back, so it can be stored or sent over the network. The column-state object is serializable.

**CSV (Comma-Separated Values)** A plain-text table format — one line per row, cells separated by commas — that every spreadsheet program opens. (See [Chapter 10](/docs/vue/export).)

**Delimiter** The character placed between cells in a CSV (a comma by default; sometimes `;` or a tab `\t`).

**`Set`** A JavaScript collection of unique values. `getSelectedIds()` returns one; spread it into an array (`[...set]`) to use array methods like `.map`.

**ascending / descending** Sort directions. *Ascending* (`asc`) goes small→large (A→Z, 0→9); *descending* (`desc`) is the reverse.

**Locale** The user's language/region setting. `toLocaleString()` formats numbers and dates to match it.

---

## Accessibility terms

**a11y** Shorthand for *accessibility* ("a" + 11 letters + "y").

**i18n** Shorthand for *internationalization* ("i" + 18 letters + "n") — supporting multiple languages and regions.

**Screen reader** Software (VoiceOver, NVDA, JAWS) that reads the interface aloud for blind and low-vision users.

**ARIA** HTML attributes (like `role="grid"`, `aria-label`) that tell assistive technology what an element is and how it behaves.

**Assistive technology (AT)** Umbrella term for screen readers and similar tools.

**`prefers-reduced-motion`** A browser setting indicating the user wants less animation. EliteGrid honours it automatically.

---

## Vue-specific terms

**Component** A reusable unit of UI. In this manual, usually a **Single-File Component** (a `.vue` file with `<script setup>`, `<template>`, and optionally `<style>` blocks).

**Single-File Component (SFC)** A `.vue` file combining a component's script, template, and styles in one place.

**Composition API** Vue's function-based way of writing components (`ref`, `computed`, `watch`, composables…), used throughout this manual via `<script setup>`. The older, alternative style is the Options API, not used here.

**`<script setup>`** The concise syntax for writing a component's Composition API code. Crucially, it runs **once** per component instance — not on every re-render — which is why `createGrid()` is safe to call directly inside it. (See [Chapter 01](/docs/vue/getting-started#why-is-this-safe-in-script-setup-unlike-some-other-frameworks).)

**`ref`** A small reactive container with a `.value` property. Templates unwrap it automatically (`{{ myRef }}` instead of `{{ myRef.value }}`); script code must use `.value` explicitly. Because a `ref` is a container rather than a raw value, closures that read `.value` always see the current data — see [Chapter 11](/docs/vue/events#reading-component-state-inside-a-handler--vue-makes-this-easy).

**`computed`** A `ref`-like value derived from other reactive state, recalculated automatically when its dependencies change.

**`reactive`** A way to make a whole object (not just one value) trigger updates when its properties change, as an alternative to a `ref` of an object.

**`watch` / `watchEffect`** Composition API functions that run a callback when reactive state changes — Vue's equivalent of "run this side effect when X updates".

**`onMounted` / `onBeforeUnmount`** Lifecycle hooks that run code after the component is inserted into the page, or just before it's removed — used here to subscribe to and unsubscribe from grid events (see [Chapter 13](/docs/vue/accessibility#listening-to-announcements-yourself)).

**Composable** A function whose name conventionally starts with `use…` that packages up reactive logic for reuse — EliteGrid's state composables (`usePaginationState`, `useSelectionState`, …) let you read live grid state. Vue's version of what other frameworks call a "hook".

**Props** The typed inputs a component accepts from its parent, declared with `defineProps<...>()` in `<script setup>`.

**Fallthrough attributes** Attributes or listeners passed to a component that aren't declared as props — Vue automatically applies them to the component's root element (e.g. a `class` or `style` you put on `<Grid>`).

**Reactive** A value that automatically updates your template when it changes (as opposed to a one-off snapshot from an API `get…` method).

---

Back to the [manual index](/docs/vue).
