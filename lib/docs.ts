import rawManuals from './docs-content.json'
import type { DocPage, Manual, TocItem } from './docs-types'

export type { DocPage, Manual, TocItem }

export const manuals = rawManuals as Manual[]

/** Lightweight list of frameworks for tabs / static params. */
export const frameworks = manuals.map((m) => ({
  framework: m.framework,
  label: m.label,
}))

export function getManual(framework: string): Manual | undefined {
  return manuals.find((m) => m.framework === framework)
}

export function getChapter(
  framework: string,
  slug: string
): DocPage | undefined {
  return getManual(framework)?.chapters.find((c) => c.slug === slug)
}

/**
 * Previous/next chapters within a framework, for footer navigation.
 *
 * Ordered by `CHAPTER_GROUPS` — the same order the sidebar shows — not by the
 * generated `chapters` array, which follows the source filenames. The two used
 * to be the same sequence; they stopped being so once a chapter needed to sit
 * somewhere other than where its file number put it, and footer links that
 * disagree with the sidebar are worse than either order on its own.
 */
export function getChapterNeighbors(
  framework: string,
  slug: string
): { prev: DocPage | null; next: DocPage | null } {
  const manual = getManual(framework)
  const chapters = manual ? getGroupedChapters(manual).flatMap((g) => g.chapters) : []
  const i = chapters.findIndex((c) => c.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i < chapters.length - 1 ? chapters[i + 1] : null,
  }
}

/**
 * Sidebar/breadcrumb grouping — purely presentational, mirrors the section
 * headers in the approved docs mock (`design docs/EliteGrid Docs.dc.html`).
 * Chapter slugs are shared across every framework manual.
 */
export const CHAPTER_GROUPS: { label: string; slugs: string[] }[] = [
  // `modules` sits second deliberately: nothing else in the manual works as
  // written until the reader knows which features are opt-in. Its source file
  // is numbered last (17-modules.md) so that adding it did not renumber the
  // other sixteen chapters and the ~145 "Chapter NN" cross-references in them.
  { label: 'Getting Started', slugs: ['getting-started', 'modules', 'columns'] },
  {
    label: 'Core Features',
    slugs: ['sorting', 'filtering', 'pagination', 'selection', 'editing', 'formatting-values'],
  },
  { label: 'Rows & Grouping', slugs: ['grouping', 'row-features'] },
  {
    label: 'Appearance & Data',
    slugs: ['appearance', 'export', 'menus-and-clipboard', 'live-data'],
  },
  {
    label: 'Advanced',
    slugs: [
      'events',
      'grid-api',
      'localization-and-state',
      'accessibility',
      'performance',
    ],
  },
  { label: 'Reference', slugs: ['full-example', 'glossary'] },
]

/** Groups a manual's chapters for the sidebar, in `CHAPTER_GROUPS` order. */
export function getGroupedChapters(manual: Manual) {
  const bySlug = new Map(manual.chapters.map((c) => [c.slug, c]))
  const used = new Set<string>()
  const groups = CHAPTER_GROUPS.map((g) => ({
    label: g.label,
    chapters: g.slugs
      .map((s) => {
        used.add(s)
        return bySlug.get(s)
      })
      .filter((c): c is DocPage => Boolean(c)),
  })).filter((g) => g.chapters.length > 0)

  const rest = manual.chapters.filter((c) => !used.has(c.slug))
  if (rest.length > 0) groups.push({ label: 'More', chapters: rest })
  return groups
}

/** The group label a given chapter slug belongs to — used for breadcrumbs. */
export function getGroupLabel(slug: string): string {
  return CHAPTER_GROUPS.find((g) => g.slugs.includes(slug))?.label ?? 'Docs'
}
