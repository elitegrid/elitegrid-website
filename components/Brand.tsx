import Link from 'next/link'

/**
 * The EliteGrid wordmark and tile.
 *
 * One definition, because three had drifted apart: the landing nav drew a
 * 30px gradient tile with a 17px wordmark, the docs header a 28px tile with
 * an 18px one, and the demos header a flat 26px SVG file at a 4px radius
 * beside a 16px extrabold wordmark. Side by side they read as three different
 * products, and the demos one looked broken on its own.
 *
 * `badge` is the small section tag the docs header carries after the name.
 */
export default function Brand({
  href = '/',
  badge,
  className = '',
}: {
  href?: string
  badge?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 shrink-0 ${className}`}
    >
      <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[#5b21b6] dark:from-[#7c3aed] to-[#a855f7] shadow-[0_0_14px_rgba(91,33,182,0.3)]">
        <svg width="19" height="19" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
          <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
          <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
          <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
        </svg>
      </div>
      <span className="font-heading font-bold text-[17px] tracking-[-0.02em] text-[#18181b] dark:text-[#edf0fa]">
        EliteGrid
      </span>
      {badge && (
        <span className="font-code text-[10px] font-bold text-[#a3a3a3] dark:text-[#374151] bg-black/[0.025] dark:bg-white/[0.025] border border-black/[0.08] dark:border-white/[0.07] px-1.5 py-0.5 rounded ml-0.5">
          {badge}
        </span>
      )}
    </Link>
  )
}
