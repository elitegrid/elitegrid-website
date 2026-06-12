'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavChapter {
  num: string
  slug: string
  title: string
}

interface FrameworkTab {
  framework: string
  label: string
}

/**
 * Left documentation rail: framework switcher + chapter list.
 * Renders from data baked into lib/docs-content.ts (passed in by the server
 * layout) — it never reads the markdown source at runtime.
 * On mobile it collapses into a <details> dropdown.
 */
export default function DocsSidebar({
  framework,
  frameworks,
  chapters,
}: {
  framework: string
  frameworks: FrameworkTab[]
  chapters: NavChapter[]
}) {
  const pathname = usePathname()
  const base = `/docs/${framework}`

  const isActive = (href: string) => pathname === href

  const tabs = (
    <div className="flex gap-2">
      {frameworks.map((f) => {
        const active = f.framework === framework
        return (
          <Link
            key={f.framework}
            href={`/docs/${f.framework}`}
            className={`flex-1 text-center font-mono text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
              active
                ? 'bg-[#e8ff47] text-[#09090b] border-[#e8ff47]'
                : 'border-white/8 bg-white/[0.02] text-[#a1a1aa] hover:text-[#e8ff47] hover:border-[#e8ff47]/25'
            }`}
          >
            {f.label}
          </Link>
        )
      })}
    </div>
  )

  const list = (
    <nav className="flex flex-col gap-0.5">
      <Link
        href={base}
        className={`font-mono text-xs px-3 py-1.5 rounded-lg border-l-2 transition-all ${
          isActive(base)
            ? 'border-[#e8ff47] text-[#e8ff47] bg-[#e8ff47]/5'
            : 'border-transparent text-[#71717a] hover:text-[#f4f4f5]'
        }`}
      >
        Overview
      </Link>
      {chapters.map((c) => {
        const href = `${base}/${c.slug}`
        const active = isActive(href)
        return (
          <Link
            key={c.slug}
            href={href}
            className={`flex items-baseline gap-2 px-3 py-1.5 rounded-lg border-l-2 transition-all ${
              active
                ? 'border-[#e8ff47] bg-[#e8ff47]/5'
                : 'border-transparent hover:bg-white/[0.03]'
            }`}
          >
            <span className="font-mono text-[0.7rem] text-[#52525b] w-5 shrink-0">
              {c.num}
            </span>
            <span
              className={`text-sm leading-snug ${
                active ? 'text-[#e8ff47]' : 'text-[#a1a1aa]'
              }`}
            >
              {c.title}
            </span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop rail */}
      <div className="hidden lg:flex flex-col gap-5">
        <div className="font-mono text-xs text-[#e8ff47] tracking-widest uppercase">
          Documentation
        </div>
        {tabs}
        {list}
      </div>

      {/* Mobile dropdown */}
      <details className="lg:hidden rounded-xl border border-white/8 bg-[#111113]">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-mono text-xs text-[#a1a1aa] list-none">
          <span className="tracking-widest uppercase text-[#e8ff47]">
            Documentation menu
          </span>
          <span className="text-[#52525b]">▾</span>
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {tabs}
          {list}
        </div>
      </details>
    </>
  )
}
