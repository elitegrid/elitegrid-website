'use client'

import { useState } from 'react'

export default function DocsHelpful() {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null)

  return (
    <div className="flex items-center gap-3.5 py-5 mt-6 border-t border-black/[0.08] dark:border-white/[0.07]">
      <span className="text-[15.5px] text-[#525252] dark:text-[#7a8399]">
        {feedback ? (feedback === 'yes' ? 'Glad it helped — thanks for the feedback!' : 'Thanks — we’ll use this to improve the page.') : 'Was this page helpful?'}
      </span>
      {!feedback && (
        <>
          <button
            onClick={() => setFeedback('yes')}
            className="px-4 py-2 rounded-[7px] text-[15px] font-medium border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.025] dark:bg-white/[0.025] text-[#525252] dark:text-[#7a8399] hover:border-[rgba(91,33,182,0.3)] hover:text-[#7c3aed] transition-colors"
          >
            👍 Yes
          </button>
          <button
            onClick={() => setFeedback('no')}
            className="px-4 py-2 rounded-[7px] text-[15px] font-medium border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.025] dark:bg-white/[0.025] text-[#525252] dark:text-[#7a8399] hover:border-[rgba(91,33,182,0.3)] hover:text-[#7c3aed] transition-colors"
          >
            👎 No
          </button>
        </>
      )}
    </div>
  )
}
