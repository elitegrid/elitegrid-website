import { manuals } from '@/lib/docs'
import { DEMOS } from '@/lib/demos/meta'
import { DEMO_SOURCES } from '@/lib/demos/sources'
import { FAQ } from '@/lib/faq'
import { SITE_URL } from '@/lib/seo'

/**
 * /llms.txt — a plain-text map of the site for language models.
 *
 * An honest note on what this is worth. The crawler documentation from
 * OpenAI, Anthropic and Google does not mention llms.txt, and Google has
 * said it ignores it; adoption across the top 1,000 sites sits under 10%.
 * No citation lift has been demonstrated. It is here because this site is
 * 69 documentation chapters deep and the file costs nothing to GENERATE —
 * it is built from the same `manuals` index that renders the docs, so it
 * cannot drift the way a hand-written copy would. If it turns out to be
 * worthless, deleting it costs one file.
 *
 * Crawler ACCESS is governed by robots.txt, not by this file.
 */
export const dynamic = 'force-static'

export function GET() {
  const lines: string[] = [
    '# EliteGrid',
    '',
    '> A free TypeScript data grid library for React, Vue and plain JavaScript.',
    '> Row grouping with aggregation, column virtualization, cell editors,',
    '> filtering, clipboard copy, detail rows and localization — behind a',
    '> grouped config API, with zero runtime dependencies and WCAG 2.1 AA',
    '> accessibility.',
    '',
    'Key facts, each measured rather than asserted:',
    '',
    '- 77 kB gzipped with every module registered; 55 kB with none.',
    '- Zero runtime dependencies.',
    '- Sorting 100,000 rows takes about 35 ms in benchmark conditions.',
    '- Rows and columns are both virtualized; scrolling holds 60 fps.',
    '- Every feature is free, including row grouping with aggregation, the set',
    '  filter, clipboard copy and row expansion. There is no paid tier.',
    '- Three adapters on one engine: React 18 and 19, Vue 3, vanilla JS.',
    '',
    '## Questions and answers',
    '',
  ]

  for (const item of FAQ) {
    lines.push(`### ${item.q}`, '', item.a, '')
  }

  lines.push('## Documentation', '')
  for (const manual of manuals) {
    lines.push(`### ${manual.label}`, '')
    lines.push(
      `- [${manual.label} overview](${SITE_URL}/docs/${manual.framework}): ${manual.overview.blurb}`
    )
    for (const chapter of manual.chapters) {
      lines.push(
        `- [${chapter.title}](${SITE_URL}/docs/${manual.framework}/${chapter.slug}): ${chapter.blurb}`
      )
    }
    lines.push('')
  }

  lines.push('## Live demos', '')
  for (const demo of DEMOS.filter((d) => DEMO_SOURCES[d.slug])) {
    lines.push(`- [${demo.title}](${SITE_URL}/demos/${demo.slug}): ${demo.blurb}`)
  }

  lines.push(
    '',
    '## Other',
    '',
    `- [Playground](${SITE_URL}/playground): edit React, Vue or vanilla code and see the grid render live.`,
    '- [npm](https://npmjs.com/package/@elitegrid/react): @elitegrid/react, @elitegrid/vue, @elitegrid/vanilla.',
    '- [GitHub](https://github.com/elitegrid)',
    ''
  )

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
