import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getManual, frameworks } from '@/lib/docs'
import DocsToc from '@/components/docs/DocsToc'

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
    title: `${manual.label} Docs — EliteGrid`,
    description: manual.overview.blurb,
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

  return (
    <div className="flex gap-10 min-w-0">
      <article className="flex-1 min-w-0 max-w-3xl">
        <div className="mb-8">
          <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase mb-3">
            {manual.label} Manual
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f4f4f5]">
            {overview.title}
          </h1>
          {overview.blurb && (
            <p className="mt-2 text-[#71717a] text-sm">{overview.blurb}</p>
          )}
        </div>
        <div
          className="docs-prose"
          dangerouslySetInnerHTML={{ __html: overview.html }}
        />
      </article>
      <DocsToc items={overview.toc} />
    </div>
  )
}
