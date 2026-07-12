'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import ThemeToggle from '@/components/landing/ThemeToggle'

interface SearchEntry {
  slug: string
  title: string
  blurb: string
}

export default function DocsHeader({
  framework,
  entries,
}: {
  framework: string
  entries: SearchEntry[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onClick)
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return entries
      .filter(e => e.title.toLowerCase().includes(q) || e.blurb.toLowerCase().includes(q))
      .slice(0, 7)
  }, [entries, query])

  function go(slug: string) {
    router.push(slug ? `/docs/${framework}/${slug}` : `/docs/${framework}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] h-[60px] bg-[rgba(245,244,239,0.9)] dark:bg-[rgba(9,9,14,0.9)] border-b border-black/[0.08] dark:border-white/[0.07] backdrop-blur-xl flex items-center px-4 min-[900px]:px-7 gap-0">
      <Link href="/" className="flex items-center gap-2.5 shrink-0 w-auto min-[900px]:w-[300px]">
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center bg-gradient-to-br from-[#5b21b6] dark:from-[#7c3aed] to-[#a855f7] shrink-0">
          <svg width="17" height="17" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
            <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
            <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
          </svg>
        </div>
        <span className="font-heading font-bold text-[18px] tracking-[-0.02em] text-[#18181b] dark:text-[#edf0fa]">
          EliteGrid
        </span>
        <span className="font-code text-[10px] font-bold text-[#a3a3a3] dark:text-[#374151] bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.08] dark:border-white/[0.07] px-1.5 py-0.5 rounded ml-0.5">
          Docs
        </span>
      </Link>

      <div className="hidden min-[900px]:block w-px h-5 bg-black/[0.12] dark:bg-white/[0.11] mx-6 shrink-0" />

      <div ref={boxRef} className="relative flex-1 max-w-[320px] hidden min-[640px]:block">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-35 pointer-events-none text-[#18181b] dark:text-[#edf0fa]">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && results[0]) go(results[0].slug)
          }}
          placeholder="Search docs…"
          className="w-full bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.08] dark:border-white/[0.07] rounded-lg pl-8 pr-9 py-[7px] text-[13px] font-body text-[#18181b] dark:text-[#edf0fa] placeholder:text-[#a3a3a3] dark:placeholder:text-[#374151] outline-none focus:border-[rgba(91,33,182,0.45)] transition-colors"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-code text-[10px] text-[#a3a3a3] dark:text-[#374151] bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.07] px-1 py-0.5 rounded pointer-events-none">
          ⌘K
        </span>

        {open && results.length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-[340px] max-h-[360px] overflow-y-auto bg-white dark:bg-[#0e0e17] border border-black/[0.08] dark:border-white/[0.1] rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.55)] py-1.5">
            {results.map(r => (
              <button
                key={r.slug || 'overview'}
                onClick={() => go(r.slug)}
                className="w-full text-left px-3.5 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="text-[14.5px] font-semibold text-[#18181b] dark:text-[#edf0fa]">{r.title}</div>
                {r.blurb && (
                  <div className="text-[13.5px] text-[#a3a3a3] dark:text-[#374151] leading-snug mt-0.5 line-clamp-1">
                    {r.blurb}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden min-[900px]:flex items-center gap-6 ml-auto mr-7">
        <Link href="/playground" className="text-[13.5px] font-medium text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa] transition-colors">
          Playground
        </Link>
        <a
          href="https://github.com/elitegrid"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13.5px] font-medium text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa] transition-colors inline-flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </div>

      <div className="ml-auto min-[900px]:ml-0 shrink-0">
        <ThemeToggle />
      </div>
    </nav>
  )
}
