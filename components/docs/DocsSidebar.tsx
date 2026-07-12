'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavChapter {
  num: string
  slug: string
  title: string
}

interface NavGroup {
  label: string
  chapters: NavChapter[]
}

interface FrameworkTab {
  framework: string
  label: string
}

function SidebarBody({
  framework,
  frameworks,
  groups,
  pathname,
}: {
  framework: string
  frameworks: FrameworkTab[]
  groups: NavGroup[]
  pathname: string | null
}) {
  const base = `/docs/${framework}`
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const isActive = (href: string) => pathname === href

  return (
    <>
      <div className="px-4 pb-4 flex gap-2">
        {frameworks.map((f) => {
          const active = f.framework === framework
          return (
            <Link
              key={f.framework}
              href={`/docs/${f.framework}`}
              className={[
                'flex-1 text-center font-code text-[12px] font-semibold px-2 py-2 rounded-md border transition-all',
                active
                  ? 'bg-[#5b21b6] dark:bg-[#7c3aed] text-white border-transparent'
                  : 'border-black/[0.08] dark:border-white/[0.07] text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa] hover:border-[rgba(91,33,182,0.25)]',
              ].join(' ')}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      <Link
        href={base}
        className={[
          'flex items-center gap-2.5 px-5 py-[6px] text-[13.5px] transition-colors border-l-2 mb-2',
          isActive(base)
            ? 'text-[#7c3aed] bg-[rgba(91,33,182,0.06)] border-[#7c3aed] font-semibold'
            : 'text-[#525252] dark:text-[#7a8399] border-transparent hover:text-[#18181b] dark:hover:text-[#edf0fa] hover:bg-black/[0.025] dark:hover:bg-white/[0.025]',
        ].join(' ')}
      >
        <span
          className={`w-[5px] h-[5px] rounded-full shrink-0 ${isActive(base) ? 'bg-current opacity-100' : 'bg-current opacity-40'}`}
        />
        Overview
      </Link>

      {groups.map((group) => {
        const isCollapsed = collapsed[group.label]
        return (
          <div key={group.label} className="mb-2 mt-2">
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [group.label]: !c[group.label] }))}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] font-bold tracking-[0.07em] uppercase text-[#a3a3a3] dark:text-[#374151] hover:text-[#525252] dark:hover:text-[#7a8399] transition-colors"
            >
              {group.label}
              <span className={`text-[8px] opacity-50 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
            </button>
            {!isCollapsed && (
              <div>
                {group.chapters.map((c) => {
                  const href = `${base}/${c.slug}`
                  const active = isActive(href)
                  return (
                    <Link
                      key={c.slug}
                      href={href}
                      className={[
                        'flex items-center gap-2.5 px-5 py-[6px] text-[13.5px] leading-snug transition-colors border-l-2',
                        active
                          ? 'text-[#7c3aed] bg-[rgba(91,33,182,0.06)] border-[#7c3aed] font-semibold'
                          : 'text-[#525252] dark:text-[#7a8399] border-transparent hover:text-[#18181b] dark:hover:text-[#edf0fa] hover:bg-black/[0.025] dark:hover:bg-white/[0.025]',
                      ].join(' ')}
                    >
                      <span
                        className={`w-[5px] h-[5px] rounded-full shrink-0 ${active ? 'bg-current opacity-100' : 'bg-current opacity-40'}`}
                      />
                      {c.title}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

/**
 * Left documentation rail: version chip, framework switcher, grouped
 * chapter list. Renders from data baked into lib/docs-content.json (passed
 * in by the server layout) — it never reads markdown at runtime.
 * Desktop: fixed sticky column. Mobile: collapses into a <details> dropdown.
 */
export default function DocsSidebar({
  framework,
  frameworks,
  groups,
}: {
  framework: string
  frameworks: FrameworkTab[]
  groups: NavGroup[]
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop rail */}
      <div className="hidden md:block h-full overflow-y-auto pt-6 pb-12 [scrollbar-width:thin]">
        <SidebarBody framework={framework} frameworks={frameworks} groups={groups} pathname={pathname} />
      </div>

      {/* Mobile dropdown */}
      <details className="md:hidden rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#0c0c14] mx-4 mt-4 mb-2">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-[13px] font-bold tracking-[0.07em] uppercase text-[#7c3aed] list-none">
          Documentation menu
          <span className="text-[#a3a3a3] dark:text-[#374151] text-[9px]">▾</span>
        </summary>
        <div className="pb-3">
          <SidebarBody framework={framework} frameworks={frameworks} groups={groups} pathname={pathname} />
        </div>
      </details>
    </>
  )
}
