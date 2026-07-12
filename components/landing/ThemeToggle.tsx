'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('eg-theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={mounted ? (isDark ? 'Switch to light theme' : 'Switch to dark theme') : 'Toggle theme'}
      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-[9px] border border-black/[0.13] dark:border-white/[0.11] text-[#525252] dark:text-[#7a8399] hover:text-[#18181b] dark:hover:text-[#edf0fa] hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors"
    >
      {!mounted ? null : isDark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 9.3A6 6 0 116.7 2a4.7 4.7 0 007.3 7.3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
