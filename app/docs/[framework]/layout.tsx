import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getManual, frameworks as allFrameworks } from '@/lib/docs'
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#09090b]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-xl px-6 h-14 flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-sm font-bold text-[#e8ff47] tracking-tight shrink-0"
          >
            EliteGrid
          </Link>
          <span className="text-white/15 text-xs select-none">/</span>
          <span className="font-mono text-xs text-[#71717a] uppercase tracking-widest">
            Docs
          </span>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              <DocsSidebar
                framework={framework}
                frameworks={allFrameworks}
                chapters={manual.chapters.map((c) => ({
                  num: c.num,
                  slug: c.slug,
                  title: c.title,
                }))}
              />
            </div>
          </aside>

          {/* Page content (includes article + right TOC rail) */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
