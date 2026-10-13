'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { buildDemoSrcDoc, LOADING_DOC, type DemoSource } from '@/lib/demos/shell'

/**
 * Runs one showcase demo in its sandboxed iframe.
 *
 * Three things it owns that the demo inside deliberately does not:
 *
 *  - Theme. The iframe is a separate document, so the site's light/dark class
 *    has to be forwarded as a message. Same pattern as GridDemo.tsx and
 *    DocsLiveDemo.tsx.
 *  - Liveness. A demo with a ticker gets SET_LIVE false whenever the tab is
 *    hidden or the frame scrolls off screen. An unattended setInterval
 *    repricing 100 rows is exactly the idle CPU burn that KeepAlive.tsx
 *    exists to prevent, and a visitor who opened the page an hour ago should
 *    not still be paying for it.
 *  - Failure. If the demo throws, the shell posts DEMO_ERROR, and we say so.
 *    Leaving the spinner up forever reads as "this library is broken" rather
 *    than "this demo has a bug".
 */
export default function DemoFrame({
  source,
  title,
  height = 560,
  /** Demos with no ticker ignore SET_LIVE; skip the observer for them. */
  live = false,
  className = '',
}: {
  source: DemoSource
  title: string
  height?: number | string
  live?: boolean
  className?: string
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The document cannot be built during render: it embeds
  // window.location.origin in its import map (a srcdoc iframe has no usable
  // base URL for relative specifiers), and the server does not know the
  // origin — so rendering it on both sides would be a hydration mismatch.
  //
  // Assigned to the DOM property rather than held in state. Both get the same
  // result, but `setState` in an effect body is a cascading render the
  // react-hooks rules reject, whereas writing to an element is precisely the
  // "update an external system" an effect is for. `srcDoc` below stays at the
  // loading document so the server-rendered HTML and the first client render
  // agree.
  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    el.srcdoc = buildDemoSrcDoc(window.location.origin, source)
  }, [source])

  const send = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  const siteTheme = useCallback(
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    [],
  )

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === 'DEMO_READY') {
        setReady(true)
        send({ type: 'SET_THEME', theme: siteTheme() })
      }
      if (e.data?.type === 'DEMO_ERROR') setError(e.data.message ?? 'Unknown error')
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [send, siteTheme])

  useEffect(() => {
    const observer = new MutationObserver(() =>
      send({ type: 'SET_THEME', theme: siteTheme() }),
    )
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [send, siteTheme])

  // Pause the feed when nobody is looking. Two independent reasons to stop —
  // tab hidden, or frame scrolled out of view — so the state is the AND of
  // both rather than whichever fired last.
  useEffect(() => {
    if (!live) return
    let visible = !document.hidden
    let onScreen = true
    const sync = () => send({ type: 'SET_LIVE', live: visible && onScreen })

    const onVisibility = () => {
      visible = !document.hidden
      sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { threshold: 0.05 },
    )
    if (wrapRef.current) io.observe(wrapRef.current)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      io.disconnect()
    }
  }, [live, send])

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#0f0f1a] ${className}`}
    >
      <iframe
        ref={iframeRef}
        srcDoc={LOADING_DOC}
        className="block w-full"
        style={{ height, border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-downloads"
        title={title}
      />

      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-white/80 dark:bg-[#0f0f1a]/80 text-sm text-[#6b7280] dark:text-[#94a3b8]">
          Loading live grid…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center gap-2 bg-white dark:bg-[#0f0f1a] p-6 text-center">
          <p className="text-sm font-semibold text-[#dc2626] dark:text-[#f87171]">
            This demo failed to start.
          </p>
          <code className="font-code text-xs text-[#6b7280] dark:text-[#94a3b8]">
            {error}
          </code>
        </div>
      )}
    </div>
  )
}
