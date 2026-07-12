'use client'

import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import DocsLiveDemo from './DocsLiveDemo'

function guessLang(code: string): string {
  if (/^\s*(npm|pnpm|yarn|bun)\s/m.test(code)) return 'bash'
  if (/^\s*</.test(code) && /className=|<Grid|<EliteGrid|<[A-Z]/.test(code)) return 'tsx'
  if (/\b(interface|type)\s+\w+/.test(code) || /:\s*(string|number|boolean)\b/.test(code)) return 'ts'
  return 'ts'
}

// Teardown of a `.docs-live-demo` root is deferred (see below) so it can't
// race React's own commit of the same root's initial render. React Strict
// Mode's dev-mode double-invoke (mount -> cleanup -> mount, synchronously,
// on every real mount) would otherwise hit this window and either throw
// ("Attempted to synchronously unmount a root while React was already
// rendering") or, if teardown is naively deferred without also tracking it,
// call createRoot() a second time on the same still-mounted node ("container
// that has already been passed to createRoot() before"). Keyed by DOM node
// identity (module-level, not component state) so the second Strict Mode
// invocation — a fresh call of this same effect — can find and cancel the
// first invocation's pending teardown instead of creating a competing root.
const pendingTeardowns = new WeakMap<Element, ReturnType<typeof setTimeout>>()
const liveRootsByEl = new WeakMap<Element, Root>()

function scheduleTeardown(el: Element, liveRoot: Root | undefined) {
  const timeoutId = setTimeout(() => {
    pendingTeardowns.delete(el)
    liveRootsByEl.delete(el)
    if (!liveRoot) return
    try {
      liveRoot.unmount()
    } catch {
      // A markdown edit during `next dev` re-bakes docs-content.json, which
      // HMRs a new `html` prop in — dangerouslySetInnerHTML replaces this
      // element (detaching this root's container) before this timeout fires,
      // so unmount() can throw on an already-detached node. Nothing to clean
      // up in that case.
    }
  }, 0)
  pendingTeardowns.set(el, timeoutId)
}

/**
 * Renders a chapter/overview's baked HTML and, once mounted, enhances every
 * `<pre>` (shiki output) with the design system's code-block chrome: a
 * toolbar with a guessed language chip and a copy-to-clipboard button.
 * The source HTML has no language metadata (baked from markdown fences with
 * the language stripped), so the chip is a best-effort heuristic — purely
 * decorative labeling, matching the docs mock.
 */
export default function DocsProse({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const cleanups: (() => void)[] = []
    const pres = root.querySelectorAll<HTMLPreElement>('pre:not([data-enhanced])')

    pres.forEach((pre) => {
      pre.setAttribute('data-enhanced', 'true')
      const code = pre.textContent ?? ''
      const lang = guessLang(code)

      const wrapper = document.createElement('div')
      wrapper.className = 'docs-cb'

      const toolbar = document.createElement('div')
      toolbar.className = 'docs-cb-toolbar'

      const langChip = document.createElement('span')
      langChip.className = 'docs-cb-lang'
      langChip.textContent = lang

      const copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'docs-cb-copy'
      copyBtn.setAttribute('aria-label', 'Copy code')
      copyBtn.innerHTML =
        '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 4v6a1 1 0 001 1h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span>Copy</span>'

      const onCopy = () => {
        navigator.clipboard.writeText(code).catch(() => {})
        copyBtn.classList.add('copied')
        copyBtn.querySelector('span')!.textContent = '✓ Copied'
        setTimeout(() => {
          copyBtn.classList.remove('copied')
          copyBtn.querySelector('span')!.textContent = 'Copy'
        }, 2000)
      }
      copyBtn.addEventListener('click', onCopy)
      cleanups.push(() => copyBtn.removeEventListener('click', onCopy))

      toolbar.appendChild(langChip)
      toolbar.appendChild(copyBtn)

      pre.parentNode?.insertBefore(wrapper, pre)
      wrapper.appendChild(toolbar)
      wrapper.appendChild(pre)
    })

    // Mount a live, running grid sandbox (see components/docs/DocsLiveDemo.tsx)
    // into every `.docs-live-demo` placeholder baked in by
    // scripts/generate-docs.mjs.
    const liveDemoEls = root.querySelectorAll<HTMLDivElement>('.docs-live-demo')
    liveDemoEls.forEach((el) => {
      // Strict Mode's second invocation of this same effect finds the exact
      // same DOM node again (dangerouslySetInnerHTML didn't change, so
      // nothing regenerated it). If the first invocation's teardown is still
      // pending, cancel it and reuse the root that's already mounted here —
      // do NOT create a second one on the same node.
      const pending = pendingTeardowns.get(el)
      if (pending !== undefined) {
        clearTimeout(pending)
        pendingTeardowns.delete(el)
        cleanups.push(() => scheduleTeardown(el, liveRootsByEl.get(el)))
        return
      }

      const framework = el.dataset.framework as 'react' | 'vue' | 'vanilla' | undefined
      const encoded = el.dataset.code
      if (!framework || !encoded) return

      const code = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)))
      const liveRoot: Root = createRoot(el)
      liveRootsByEl.set(el, liveRoot)
      liveRoot.render(<DocsLiveDemo framework={framework} code={code} />)

      cleanups.push(() => scheduleTeardown(el, liveRoot))
    })

    return () => cleanups.forEach((fn) => fn())
  }, [html])

  return <div ref={ref} className="docs-prose" dangerouslySetInnerHTML={{ __html: html }} />
}
