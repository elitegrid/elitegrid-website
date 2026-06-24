import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getManual, getChapter, getChapterNeighbors, frameworks } from '@/lib/docs'
import DocsToc from '@/components/docs/DocsToc'

export async function generateStaticParams() {
  const params: { framework: string; slug: string }[] = []
  for (const { framework } of frameworks) {
    const manual = getManual(framework)
    if (!manual) continue
    for (const chapter of manual.chapters) {
      params.push({ framework, slug: chapter.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string; slug: string }>
}): Promise<Metadata> {
  const { framework, slug } = await params
  const chapter = getChapter(framework, slug)
  if (!chapter) return {}
  return {
    title: `${chapter.title} — EliteGrid Docs`,
    description: chapter.blurb,
  }
}

export default async function DocsChapterPage({
  params,
}: {
  params: Promise<{ framework: string; slug: string }>
}) {
  const { framework, slug } = await params
  const chapter = getChapter(framework, slug)
  if (!chapter) notFound()

  const { prev, next } = getChapterNeighbors(framework, slug)

  return (
    <div className="flex gap-10 min-w-0">
      <article className="flex-1 min-w-0 max-w-3xl">
        <div className="mb-8">
          {chapter.num && (
            <div className="font-mono text-xs text-[#52525b] mb-2">
              Chapter {chapter.num}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-[#f4f4f5]">
            {chapter.title}
          </h1>
          {chapter.blurb && (
            <p className="mt-2 text-[#71717a] text-sm">{chapter.blurb}</p>
          )}
        </div>

        <div
          className="docs-prose"
          dangerouslySetInnerHTML={{ __html: chapter.html }}
        />

        {/* Prev / Next navigation */}
        <nav className="mt-12 flex justify-between gap-4 border-t border-white/8 pt-6">
          {prev ? (
            <Link
              href={`/docs/${framework}/${prev.slug}`}
              className="group flex flex-col gap-1 max-w-[45%]"
            >
              <span className="font-mono text-[0.65rem] text-[#52525b] uppercase tracking-widest">
                ← Previous
              </span>
              <span className="text-sm text-[#a1a1aa] group-hover:text-[#e8ff47] transition-colors leading-snug">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/docs/${framework}/${next.slug}`}
              className="group flex flex-col gap-1 items-end max-w-[45%]"
            >
              <span className="font-mono text-[0.65rem] text-[#52525b] uppercase tracking-widest">
                Next →
              </span>
              <span className="text-sm text-[#a1a1aa] group-hover:text-[#e8ff47] transition-colors leading-snug text-right">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>

      <DocsToc items={chapter.toc} />
    </div>
  )
}
