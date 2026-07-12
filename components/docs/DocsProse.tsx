'use client'

import { useEffect, useRef } from 'react'

function guessLang(code: string): string {
  if (/^\s*(npm|pnpm|yarn|bun)\s/m.test(code)) return 'bash'
  if (/^\s*</.test(code) && /className=|<Grid|<EliteGrid|<[A-Z]/.test(code)) return 'tsx'
  if (/\b(interface|type)\s+\w+/.test(code) || /:\s*(string|number|boolean)\b/.test(code)) return 'ts'
  return 'ts'
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

    return () => cleanups.forEach((fn) => fn())
  }, [html])

  return <div ref={ref} className="docs-prose" dangerouslySetInnerHTML={{ __html: html }} />
}
