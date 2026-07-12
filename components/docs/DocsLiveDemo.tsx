'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  PLAYGROUND_SANDBOX,
  buildReactIframeSrcDoc,
  buildVueIframeSrcDoc,
  buildVanillaIframeSrcDoc,
} from '@/lib/playgroundSrcDoc'

const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100%;font-family:system-ui;color:#52525b;font-size:12.5px;background:#09090b;}
</style></head><body><span>Loading…</span></body></html>`

const BUILDERS = {
  react: buildReactIframeSrcDoc,
  vue: buildVueIframeSrcDoc,
  vanilla: buildVanillaIframeSrcDoc,
} as const

const FRAMEWORK_LABEL = {
  react: 'React',
  vue: 'Vue',
  vanilla: 'Vanilla JS',
} as const

export default function DocsLiveDemo({
  framework,
  code,
}: {
  framework: 'react' | 'vue' | 'vanilla'
  code: string
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [srcDoc, setSrcDoc] = useState(LOADING_DOC)
  const [ready, setReady] = useState(false)

  // Built client-side (not during SSR) to avoid a hydration mismatch, same
  // reason GridDemo.tsx does it.
  useEffect(() => {
    setSrcDoc(BUILDERS[framework](window.location.origin))
  }, [framework])

  const send = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  // The iframe is a separate document — it needs its own SET_THEME message
  // to follow the docs page's light/dark toggle, same pattern as the
  // playground (app/playground/page.tsx) and the landing page's GridDemo.
  const siteIsDark = useCallback(() => document.documentElement.classList.contains('dark'), [])

  useEffect(() => {
    const observer = new MutationObserver(() => send({ type: 'SET_THEME', theme: siteIsDark() ? 'dark' : 'light' }))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [send, siteIsDark])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === 'IFRAME_READY') {
        setReady(true)
        send({ type: 'SET_THEME', theme: siteIsDark() ? 'dark' : 'light' })
        send({ type: 'RUN_CODE', code })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [code, send, siteIsDark])

  return (
    <div className="docs-live-demo-card">
      <div className="docs-live-demo-toolbar">
        <span className="docs-live-demo-badge">
          <span className="docs-live-demo-dot" />
          Live Example
        </span>
        <span className="docs-live-demo-framework">{FRAMEWORK_LABEL[framework]}</span>
        <button
          type="button"
          className="docs-live-demo-reset"
          onClick={() => send({ type: 'RUN_CODE', code })}
          title="Reset the demo back to its starting state"
        >
          Reset
        </button>
      </div>
      <div className="docs-live-demo-frame-wrap">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          className="docs-live-demo-frame"
          sandbox={PLAYGROUND_SANDBOX}
          title={`EliteGrid ${FRAMEWORK_LABEL[framework]} live example`}
        />
        {!ready && <div className="docs-live-demo-loading">Loading live grid…</div>}
      </div>
    </div>
  )
}
