'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const navLinkClass =
  'text-[17px] font-medium text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa] transition-colors inline-flex items-center gap-1.5'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={[
        'fixed top-0 left-0 right-0 z-[200] h-16 px-6 min-[900px]:px-12 flex items-center justify-between border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'bg-[rgba(245,244,239,0.88)] dark:bg-[rgba(9,9,14,0.88)] border-black/[0.09] dark:border-white/[0.07] backdrop-blur-xl'
          : 'bg-transparent border-transparent',
      ].join(' ')}
    >
      <a href="#" className="flex items-center gap-2.5 shrink-0">
        <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center bg-gradient-to-br from-[#5b21b6] dark:from-[#7c3aed] to-[#a855f7] shadow-[0_0_14px_rgba(91,33,182,0.3)]">
          <svg width="19" height="19" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
            <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
          </svg>
        </div>
        <span className="font-heading font-bold text-[21px] tracking-[-0.02em] text-[#18181b] dark:text-[#edf0fa]">
          EliteGrid
        </span>
      </a>

      <div className="hidden min-[900px]:flex items-center gap-8">
        <Link href="/docs" className={navLinkClass}>
          Docs
          <span className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#7c3aed] bg-[rgba(91,33,182,0.1)] border border-[rgba(91,33,182,0.2)] px-1.5 py-0.5 rounded">
            Soon
          </span>
        </Link>
        <Link href="/playground" className={navLinkClass}>
          Playground
        </Link>
        <a href="#roadmap" className={navLinkClass}>
          Roadmap
        </a>
        <a href="#features" className={navLinkClass}>
          Features
        </a>
        <a
          href="https://github.com/elitegrid"
          target="_blank"
          rel="noopener noreferrer"
          className={navLinkClass}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <a
          href="#waitlist"
          className="shrink-0 inline-flex items-center gap-2 bg-[#5b21b6] dark:bg-[#7c3aed] text-white text-[16px] font-semibold px-5 py-2 rounded-[9px] transition-all hover:bg-[#4c1d95] dark:hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(91,33,182,0.35)]"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  )
}
