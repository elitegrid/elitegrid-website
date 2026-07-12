# 13 · Accessibility

EliteGrid is built to work with keyboards and screen readers out of the box. The grid uses proper ARIA `role="grid"` structure, supports arrow-key navigation, and **announces** actions (sort, filter, page change, selection, edits) to assistive technology. This chapter shows how to configure and translate those announcements.

> **Why this chapter matters.** "Accessibility" (often abbreviated **a11y** — "a", then 11 letters, then "y") means making your app usable by people who navigate with a keyboard instead of a mouse, or who can't see the screen at all and rely on a screen reader. It's also a legal requirement in many contexts. The good news: EliteGrid does the hard parts for you; this chapter is mostly about *configuring* and *translating* what it already does.

> **Key terms used throughout:**
>
> - **Screen reader** — software (VoiceOver on Mac, NVDA/JAWS on Windows) that reads the interface aloud for blind and low-vision users.
> - **ARIA** — "Accessible Rich Internet Applications", a set of HTML attributes (like `role="grid"` and `aria-label`) that *tell* the screen reader what each element is and how it behaves. A plain `<div>` means nothing to a screen reader; a `<div role="grid">` is announced as a data grid.
> - **Announce** — to push a short spoken message to the screen reader when something changes ("Sorted by name, ascending"), so a non-sighted user knows what just happened.
> - **Assistive technology (AT)** — the umbrella term for screen readers and similar tools.

---

## Keyboard navigation (free, always on)

- **Arrow keys** — move the focused cell
- **Tab** — move focus (and, while editing, jump to the next editable cell)
- **Enter** — save an edit
- **Escape** — cancel an edit

---

## The `accessibility` group

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `gridLabel` | `string` | — | `aria-label` on the grid container |
| `announceFocus` | `boolean` | `true` | Announce the focused cell |
| `announceSort` | `boolean` | `true` | Announce sort changes |
| `announceFilter` | `boolean` | `true` | Announce filter results |
| `announceSelection` | `boolean` | `true` | Announce selection changes |
| `announceEdit` | `boolean` | `true` | Announce edit start/save/cancel |
| `announcePage` | `boolean` | `true` | Announce page changes |

```ts
const grid = createGrid<Employee>({
  columns,
  data,
  accessibility: {
    gridLabel: 'Employee data grid',
    announceFocus: false,   // focus announcements can be chatty — off here
    announceSort: true,
    announceFilter: true,
    announceSelection: true,
    announceEdit: true,
    announcePage: true,
  },
})
```

> **Tip:** `announceFocus` fires on every cell move, which some users find too verbose. Many apps leave it off and keep the others on.

---

## Translating announcements (i18n)

> **"i18n"** is shorthand for *internationalization* (again: "i", 18 letters, "n") — adapting your app to different languages and regions. Because every announcement is produced by a function you can override, translating them is just a matter of supplying functions that return text in your language.

The announcement text is fully customizable through `AnnouncementMessages`. Each entry is a function that returns the spoken string, so you can localize and include dynamic values (the row number, the column name, a result count).

```ts
import type { AnnouncementMessages } from '@elitegrid/vanilla'

const french: AnnouncementMessages = {
  focusCell: (row, header) => `Ligne ${row + 1}, colonne ${header}`,
  sortApplied: (field, dir) =>
    `Trié par ${field}, ${dir === 'asc' ? 'croissant' : 'décroissant'}`,
  sortCleared: (field) => `Tri supprimé pour ${field}`,
  allSortsCleared: () => `Tous les tris supprimés`,
  filterApplied: (count) => `${count} résultats trouvés`,
  filterCleared: () => `Filtre supprimé, toutes les lignes affichées`,
  pageChanged: (page, total) => `Page ${page} sur ${total}`,
  selectionChanged: (count) => `${count} lignes sélectionnées`,
  selectionCleared: () => `Sélection supprimée`,
  editStarted: (col, val) => `Modification de ${col}. Valeur : ${val || 'vide'}`,
  editCommitted: (col, val) => `Enregistré. ${col} : ${val || 'vide'}`,
  editCancelled: () => `Modification annulée`,
}
```

Apply the messages to the grid's announcement plugin:

```ts
grid.plugins.announcement.updateMessages(french)
```

You can switch languages at runtime by calling `updateMessages` again with a different message set — handy for a language switcher.

---

## Listening to announcements yourself

If you want to mirror announcements somewhere (e.g. a visible "activity log"), subscribe to the `ANNOUNCE` event on the grid's event bus:

```ts
import { GridEvent } from '@elitegrid/vanilla'

const off = grid.kernel.eventBus.on(GridEvent.ANNOUNCE, (payload) => {
  console.log(`[${payload.priority}] ${payload.message}`)
})

// When you're done listening (e.g. removing the activity log from the page):
off()
```

Because there's no component lifecycle to hook this into, just call `grid.kernel.eventBus.on(...)` wherever you set the rest of the grid up, and keep the returned `off` function next to your other cleanup — see [Cleaning up](/docs/vanilla/grid-api#cleaning-up) in Chapter 12.

---

## Reduced motion

Some users get dizziness or nausea from on-screen animation and turn on a system-level "reduce motion" setting. Browsers expose this as the `prefers-reduced-motion` media query. EliteGrid respects it automatically — decorative animations are toned down for those users. You don't need to do anything; it's mentioned here so you know the behaviour is intentional.

---

## A manual testing checklist

Automated tools catch some accessibility problems, but the only reliable way to know a grid is actually usable is to try it the way your users will. Before shipping a grid with custom cell renderers, filters, or empty/loading states, run through this list:

- [ ] **Unplug the mouse.** Tab into the grid, then use only arrow keys, Enter, Escape, and Space. Can you sort, filter, select, and edit without ever touching a pointer?
- [ ] **Turn on a screen reader** (VoiceOver on Mac: `Cmd+F5`; NVDA on Windows is free) and navigate the grid with it running. Do sort/filter/selection changes get announced? Is a custom `emptyStateComponent` or `loadingComponent` announced, or does it silently appear?
- [ ] **Zoom to 200%.** Text and controls should stay usable — nothing clipped or overlapping.
- [ ] **Check color contrast** on any custom `cellClass` styling (see [Chapter 08](/docs/vanilla/formatting-values#pairing-formatter-with-cellclass)) — colour alone (e.g. red text for "overdue") shouldn't be the *only* signal; pair it with an icon or label too.
- [ ] **Custom renderers get the same scrutiny as the grid.** A custom `emptyStateComponent`, `errorComponent`, or cell content is DOM you wrote by hand — EliteGrid can't make it accessible for you. Give it real text content and, if it's interactive, its own keyboard support.

---

## Common accessibility mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Screen reader says nothing when the grid loads | Missing `gridLabel` | Set `accessibility: { gridLabel: 'Descriptive name' }` so the grid announces what it is, not just "grid" |
| Custom empty/loading/error renderer is invisible to a screen reader | The custom renderer only draws an icon, no text content | Include real text (even visually hidden text) describing the state |
| Users complain focus announcements are "too chatty" | `announceFocus: true` (the default) announces every single cell move | Turn it off with `announceFocus: false` if your app already gives strong visual focus feedback |
| Translated announcements don't show up | `updateMessages()` was called before the grid existed, or the keys don't match `AnnouncementMessages` | Call it after `createGrid()` has returned, and double-check every key against the type |

---

Next: [14 · Performance & Large Data](/docs/vanilla/performance)
