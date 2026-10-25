'use client'

import Link from 'next/link'

/**
 * Analytics consent.
 *
 * Reject and Accept are the SAME size, weight and prominence, and that is the
 * load-bearing part rather than a style choice: refusing has to be as easy as
 * accepting, and an accept button beside a "manage settings" link is the exact
 * asymmetry regulators have fined. If a later change makes one of these louder
 * than the other, it stops being valid consent.
 *
 * There is no preferences panel because there is nothing to prefer between —
 * the site runs one analytics tool and no advertising or personalisation
 * trackers, so a panel would hold a single toggle that duplicates Reject.
 * Add one when a second category genuinely exists.
 */
export default function ConsentBanner({
  onDecide,
}: {
  onDecide: (accepted: boolean) => void
}) {
  // One class for both buttons, so they cannot drift apart. Colour is set
  // explicitly rather than inherited — left to the cascade these rendered as
  // pale grey on the cream background, which reads as "disabled" and makes
  // refusing look like the discouraged option.
  const buttonClass =
    'shrink-0 rounded-lg border px-5 py-2 text-[13px] font-semibold transition-colors ' +
    'border-black/[0.22] text-[#18181b] bg-white/70 hover:bg-white ' +
    'dark:border-white/[0.24] dark:text-[#edf0fa] dark:bg-white/[0.06] dark:hover:bg-white/[0.12]'

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-[300] border-t border-black/[0.09] bg-[#f5f4ef]/95 px-5 py-4 backdrop-blur-md dark:border-white/[0.07] dark:bg-[#09090e]/95 md:px-8"
    >
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
        <p className="max-w-[640px] text-[13px] leading-[1.6] text-[#525252] dark:text-[#7a8399]">
          We use analytics to see which pages are useful and where people get
          stuck. Nothing is sold or shared, and you can change your mind at any
          time.{' '}
          <Link
            href="/privacy"
            className="text-[#7c3aed] underline underline-offset-2"
          >
            Privacy policy
          </Link>
        </p>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => onDecide(false)} className={buttonClass}>
            Reject
          </button>
          <button type="button" onClick={() => onDecide(true)} className={buttonClass}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
