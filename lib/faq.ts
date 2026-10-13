/**
 * The questions a developer actually types into an AI assistant before
 * choosing a grid, with answers short enough to be quoted whole.
 *
 * ONE source for both the visible section and the FAQPage structured data.
 * That is not a tidiness preference: schema whose answers do not appear on
 * the page is cloaking, and Google drops rich results for it. If an answer
 * changes here it changes in both places at once.
 *
 * Every number below is measured and traceable:
 *   - 77 kB and 55 kB         tests/bench/results/BUNDLE.md
 *   - 35 ms sort on 100k      tests/bench/results/REPORT.md
 * Do not add a figure here that no file in the repo can produce.
 *
 * Answers describe EliteGrid on its own terms. No named comparison with
 * another grid library, and no claim framed against one.
 */
export interface FaqItem {
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    q: 'What is EliteGrid?',
    a: 'EliteGrid is a free, open TypeScript data grid library for React, Vue and plain JavaScript. It ships row grouping, column virtualization, cell editors, filtering, clipboard copy, detail rows and localization behind a grouped config API, with zero runtime dependencies and WCAG 2.1 AA accessibility.',
  },
  {
    q: 'Is every EliteGrid feature free?',
    a: 'Yes. There is no paid tier and no licence key, so nothing is held back: row grouping with aggregation, the set filter, clipboard copy, detail rows, cell editors, column virtualization and localization all ship in the package you install.',
  },
  {
    q: 'Is row grouping free in EliteGrid?',
    a: 'Yes. Row grouping with sum, average, min, max and count aggregation is included at no cost, and so are the set filter, clipboard copy and detail-row expansion. There is no paid tier, so no feature is held back from one.',
  },
  {
    q: 'Does EliteGrid work with React, Vue and vanilla JavaScript?',
    a: 'Yes. There are three first-class adapters — React 18 and 19, Vue 3, and framework-free JavaScript — built on one shared engine. A single parity test suite runs against all three, so behaviour that works in React works the same way in Vue and in vanilla.',
  },
  {
    q: 'How big is EliteGrid and how many dependencies does it have?',
    a: 'Zero runtime dependencies. The React adapter is 77 kB gzipped with every module registered, and 55 kB with none, because optional features are modules you import rather than code that ships whether or not you use it.',
  },
  {
    q: 'Is EliteGrid fast enough for 100,000 rows?',
    a: 'Yes. Rows and columns are both virtualized, so the number of DOM nodes tracks the viewport rather than the dataset. Sorting 100,000 rows takes about 35 ms in benchmark conditions.',
  },
  {
    q: 'Is EliteGrid accessible?',
    a: 'Yes. It implements the full ARIA grid pattern with complete keyboard navigation, screen reader announcements for state changes, and support for prefers-reduced-motion and Windows High Contrast. Accessibility is covered by the test suite rather than claimed in a README.',
  },
]
