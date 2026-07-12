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

/** Previous/next chapters within a framework, for footer navigation. */
export function getChapterNeighbors(
  framework: string,
  slug: string
): { prev: DocPage | null; next: DocPage | null } {
  const chapters = getManual(framework)?.chapters ?? []
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
  { label: 'Getting Started', slugs: ['getting-started', 'columns'] },
  {
    label: 'Core Features',
    slugs: ['sorting', 'filtering', 'pagination', 'selection', 'editing', 'formatting-values'],
  },
  { label: 'Appearance & Data', slugs: ['appearance', 'export'] },
  { label: 'Advanced', slugs: ['events', 'grid-api', 'accessibility', 'performance'] },
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
