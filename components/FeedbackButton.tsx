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
        className="fixed bottom-5 right-5 z-[100] flex items-center gap-1.5 px-3.5 py-2 rounded-full
          bg-white dark:bg-[#18181b] border border-black/[0.1] dark:border-white/[0.12]
          text-[#525252] dark:text-[#a3a3a3] font-code text-[12px] font-semibold cursor-pointer
          shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]
          transition-colors hover:border-[rgba(124,58,237,0.4)] hover:text-[#7c3aed]"
      >
        <span className="text-[13px]">⚑</span>
        Report / Feedback
      </button>

      {open && <ReportModal onClose={() => setOpen(false)} />}
    </>
  )
}
