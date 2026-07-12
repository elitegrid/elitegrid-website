'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { LOADING_DOC, buildDemoSrcDoc } from '@/lib/gridDemoSrcDoc'

type Theme = 'light' | 'dark'
type Density = 'compact' | 'normal' | 'comfortable'

const FEATURES = [
  'Multi-sort',
  'Column Filters',
  'Pagination',
  'Inline Editing',
  'Row Selection',
  'CSV Export',
  'Keyboard Nav',
  'Virtual Scroll',
]

export default function GridDemo() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [density, setDensity] = useState<Density>('normal')
  const [selectedCount, setSelectedCount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(500)
  const [ready, setReady] = useState(false)
  const [srcDoc, setSrcDoc] = useState(LOADING_DOC)

  useEffect(() => {
    setSrcDoc(buildDemoSrcDoc(window.location.origin))
  }, [])

  const send = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  const siteTheme = useCallback((): Theme => (
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  ), [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'GRID_READY') {
        setReady(true)
        setFilteredCount(e.data.totalCount ?? 500)
        // Iframe just finished mounting its own listener — sync it to
        // whatever theme the site is on right now.
        send({ type: 'SET_THEME', theme: siteTheme() })
      }
      if (e.data?.type === 'SELECTION_CHANGED') setSelectedCount(e.data.count ?? 0)
      if (e.data?.type === 'FILTER_CHANGED')    setFilteredCount(e.data.filteredCount ?? 500)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [send, siteTheme])

  // Follow the site-wide theme toggle: whenever <html class="dark"> changes,
  // mirror it into the demo grid so it never looks mismatched against the page.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      send({ type: 'SET_THEME', theme: siteTheme() })
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [send, siteTheme])

  const handleDensity = (d: Density) => {
    setDensity(d)
    send({ type: 'SET_DENSITY', density: d })
  }
  const handleExport = () => send({ type: 'EXPORT_CSV' })

  return (
    <div className="rounded-[14px] border border-black/[0.08] dark:border-white/[0.07] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.09)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">

      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-black/[0.025] dark:bg-white/[0.025] border-b border-black/[0.08] dark:border-white/[0.07] flex-wrap">

        {/* Density */}
        <div className="flex bg-black/[0.04] dark:bg-black/40 rounded-lg p-0.5 gap-px">
          {(['compact', 'normal', 'comfortable'] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => handleDensity(d)}
              className={[
                'px-2.5 py-1 rounded-md text-[15px] font-medium font-body transition-all capitalize',
                density === d
                  ? 'bg-[#5b21b6] dark:bg-[#7c3aed] text-white font-bold'
                  : 'text-[#a3a3a3] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa]',
              ].join(' ')}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg text-[15px] font-bold font-body bg-[rgba(91,33,182,0.1)] text-[#7c3aed] border border-[rgba(91,33,182,0.25)] hover:bg-[rgba(91,33,182,0.18)] transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-black/[0.015] dark:bg-white/[0.015] border-b border-black/[0.06] dark:border-white/[0.04] font-code text-[14px] text-[#a3a3a3] dark:text-[#374151]">
        <span className={ready ? 'text-[#525252] dark:text-[#7a8399]' : ''}>
          {filteredCount.toLocaleString()} rows
        </span>
        {selectedCount > 0 && (
          <span className="text-[#7c3aed]">{selectedCount} selected</span>
        )}
        {!ready && <span>Loading…</span>}
        {ready && (
          <span className="hidden sm:inline">
            Double-click to edit · Shift+click header to multi-sort
          </span>
        )}
      </div>

      {/* ── Grid iframe ───────────────────────────────────────────── */}
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        className="w-full block"
        style={{ height: 520, border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
        title="EliteGrid live demo"
      />

      {/* ── Feature badges ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-black/[0.015] dark:bg-white/[0.015] border-t border-black/[0.06] dark:border-white/[0.04]">
        {FEATURES.map(f => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 font-code text-[13px] px-2 py-0.5 rounded-full border border-black/[0.07] dark:border-white/[0.07] text-[#a3a3a3] dark:text-[#374151]"
          >
            <span className="w-1 h-1 rounded-full bg-[#7c3aed] flex-shrink-0" />
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}
