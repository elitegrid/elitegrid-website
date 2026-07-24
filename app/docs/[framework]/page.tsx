import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getManual, frameworks } from '@/lib/docs'
import DocsToc from '@/components/docs/DocsToc'
import DocsProse from '@/components/docs/DocsProse'

export async function generateStaticParams() {
  return frameworks.map((f) => ({ framework: f.framework }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string }>
}): Promise<Metadata> {
  const { framework } = await params
  const manual = getManual(framework)
  if (!manual) return {}
  return {
    title: `${manual.label} Grid Library Documentation — EliteGrid`,
    description: `${manual.label} data grid and table library manual. ${manual.overview.blurb}`,
  }
}

export default async function DocsOverviewPage({
  params,
}: {
  params: Promise<{ framework: string }>
}) {
  const { framework } = await params
  const manual = getManual(framework)
  if (!manual) notFound()

  const { overview } = manual
  const nextUp = manual.chapters.slice(0, 4)

  return (
    <div className="flex min-w-0">
      <main className="flex-1 min-w-0 max-w-[740px] px-5 md:px-10 pt-8 md:pt-12 pb-[60px] md:pb-20 mx-auto xl:mx-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12.5px] text-[#a3a3a3] dark:text-[#374151] mb-6">
          <Link href={`/docs/${framework}`} className="hover:text-[#7c3aed] transition-colors">
            Docs
          </Link>
          <span className="opacity-40 text-[11px]">›</span>
          <span className="text-[#525252] dark:text-[#7a8399]">{manual.label} Manual</span>
        </div>

        <h1 className="font-heading font-extrabold text-[38px] tracking-[-0.03em] leading-[1.1] text-[#18181b] dark:text-[#edf0fa] mb-3.5">
          {overview.title === 'Overview' ? `${manual.label} Manual` : overview.title}
        </h1>
        {overview.blurb && (
          <p className="text-[17px] text-[#525252] dark:text-[#7a8399] leading-[1.7] mb-10 pb-8 border-b border-black/[0.08] dark:border-white/[0.07]">
            {overview.blurb}
          </p>
        )}

        <DocsProse html={overview.html} />

        {nextUp.length > 0 && (
          <div className="mt-14">
            <h2 className="font-heading font-bold text-[18px] tracking-[-0.01em] text-[#18181b] dark:text-[#edf0fa] mb-4">
              Start here
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {nextUp.map((c) => (
                <Link
                  key={c.slug}
                  href={`/docs/${framework}/${c.slug}`}
                  className="group bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.07] dark:border-white/[0.065] rounded-[10px] px-[18px] py-4 transition-[border-color,background] duration-200 hover:border-[rgba(91,33,182,0.3)] hover:bg-[rgba(91,33,182,0.04)]"
                >
                  <div className="flex items-center justify-between text-[14px] font-semibold text-[#18181b] dark:text-[#edf0fa] mb-1">
                    {c.title}
                    <span className="opacity-40 group-hover:opacity-100 group-hover:text-[#7c3aed] transition-all">→</span>
                  </div>
                  <div className="text-[13px] text-[#a3a3a3] dark:text-[#374151] leading-[1.5]">{c.blurb}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <DocsToc items={overview.toc} editHref="https://github.com/elitegrid" />
    </div>
  )
}
