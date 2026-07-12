import { notFound } from 'next/navigation'
import { getManual, frameworks as allFrameworks, getGroupedChapters } from '@/lib/docs'
import DocsHeader from '@/components/docs/DocsHeader'
import DocsSidebar from '@/components/docs/DocsSidebar'

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ framework: string }>
}) {
  const { framework } = await params
  const manual = getManual(framework)
  if (!manual) notFound()

  const groups = getGroupedChapters(manual).map((g) => ({
    label: g.label,
    chapters: g.chapters.map((c) => ({ num: c.num, slug: c.slug, title: c.title })),
  }))

  const searchEntries = [
    { slug: '', title: manual.overview.title, blurb: manual.overview.blurb },
    ...manual.chapters.map((c) => ({ slug: c.slug, title: c.title, blurb: c.blurb })),
  ]

  return (
    <div className="min-h-screen bg-[#f5f4ef] dark:bg-[#09090e] text-[#18181b] dark:text-[#edf0fa] transition-colors duration-300">
      <DocsHeader framework={framework} entries={searchEntries} />

      <div className="flex flex-col md:flex-row pt-[60px] min-h-screen">
        {/* Sidebar — sticky rail on desktop, inline dropdown on mobile */}
        <aside className="md:w-[260px] md:shrink-0 md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:bg-white md:dark:bg-[#0c0c14] md:border-r md:border-black/[0.08] md:dark:border-white/[0.07]">
          <DocsSidebar framework={framework} frameworks={allFrameworks} groups={groups} />
        </aside>

        {/* Page content (article + right TOC rail) */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
