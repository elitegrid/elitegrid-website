import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getManual, getChapter, getChapterNeighbors, frameworks, getGroupLabel } from '@/lib/docs'
import DocsToc from '@/components/docs/DocsToc'
import DocsProse from '@/components/docs/DocsProse'
import DocsHelpful from '@/components/docs/DocsHelpful'

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
  const manual = getManual(framework)
  const chapter = getChapter(framework, slug)
  if (!manual || !chapter) notFound()

  const { prev, next } = getChapterNeighbors(framework, slug)

  return (
    <div className="flex min-w-0">
      <main className="flex-1 min-w-0 max-w-[960px] px-6 md:px-14 py-12 md:py-16 mx-auto xl:mx-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[15.5px] text-[#a3a3a3] dark:text-[#374151] mb-7 flex-wrap">
          <Link href={`/docs/${framework}`} className="hover:text-[#7c3aed] transition-colors">
            Docs
          </Link>
          <span className="opacity-40 text-[12px]">›</span>
          <span>{getGroupLabel(slug)}</span>
          <span className="opacity-40 text-[12px]">›</span>
          <span className="text-[#525252] dark:text-[#7a8399]">{chapter.title}</span>
        </div>

        {chapter.num && (
          <div className="font-code text-[14.5px] font-semibold text-[#7c3aed] mb-2.5">
            Chapter {chapter.num}
          </div>
        )}
        <h1 className="font-heading font-extrabold text-[clamp(38px,5vw,50px)] tracking-[-0.03em] leading-[1.1] text-[#18181b] dark:text-[#edf0fa] mb-4">
          {chapter.title}
        </h1>
        {chapter.blurb && (
          <p className="text-[21px] text-[#525252] dark:text-[#7a8399] leading-[1.7] mb-10 pb-8 border-b border-black/[0.08] dark:border-white/[0.07]">
            {chapter.blurb}
          </p>
        )}

        <DocsProse html={chapter.html} />

        {/* Prev / Next */}
        <nav className="mt-14 flex justify-between gap-4 border-t border-black/[0.08] dark:border-white/[0.07] pt-7">
          {prev ? (
            <Link
              href={`/docs/${framework}/${prev.slug}`}
              className="flex-1 max-w-[48%] px-5 py-4 rounded-[10px] bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.07] dark:border-white/[0.065] transition-[border-color,background] duration-200 hover:border-[rgba(91,33,182,0.3)] hover:bg-[rgba(91,33,182,0.04)]"
            >
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#a3a3a3] dark:text-[#374151] mb-1.5">
                ← Previous
              </div>
              <div className="text-[17px] font-semibold text-[#18181b] dark:text-[#edf0fa] leading-snug">
                {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/docs/${framework}/${next.slug}`}
              className="flex-1 max-w-[48%] text-right px-5 py-4 rounded-[10px] bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.07] dark:border-white/[0.065] transition-[border-color,background] duration-200 hover:border-[rgba(91,33,182,0.3)] hover:bg-[rgba(91,33,182,0.04)]"
            >
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#a3a3a3] dark:text-[#374151] mb-1.5">
                Next →
              </div>
              <div className="text-[17px] font-semibold text-[#18181b] dark:text-[#edf0fa] leading-snug">
                {next.title}
              </div>
            </Link>
          )}
        </nav>

        <DocsHelpful />
      </main>

      <DocsToc items={chapter.toc} editHref="https://github.com/elitegrid" />
    </div>
  )
}
