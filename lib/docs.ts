// Runtime access to the baked documentation content.
// The site renders from lib/docs-content.ts (generated & committed), so the
// *-manual/ source folders are optional at build/run time — delete them freely.
// To refresh content after editing a manual: npm run docs:build
import { manuals } from './docs-content'
import type { DocPage, Manual, TocItem } from './docs-content'

export { manuals }
export type { DocPage, Manual, TocItem }

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
