'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const ReportModal = dynamic(() => import('./ReportModal'), { ssr: false })

export default function FeedbackButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/playground') return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Report an issue or send feedback"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 999,
          background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
          color: '#71717a', fontFamily: 'monospace', fontSize: '0.75rem',
          fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(232,255,71,0.3)'
          el.style.color = '#e8ff47'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(255,255,255,0.1)'
          el.style.color = '#71717a'
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>⚑</span>
        Report / Feedback
      </button>

      {open && <ReportModal onClose={() => setOpen(false)} />}
    </>
  )
}
