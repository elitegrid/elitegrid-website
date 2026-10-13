import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { DEMOS } from '@/lib/demos/meta'
import { DEMO_SOURCES, LIVE_FEED_DEMOS } from '@/lib/demos/sources'
import DemoFrame from '@/components/demos/DemoFrame'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Demos — EliteGrid in real applications',
  description:
    'EliteGrid running as a crypto market table, a trading blotter, an HR directory, a warehouse inventory, an 80-column telemetry table and a SaaS dashboard. Live, interactive, no sign-up.',
  path: '/demos',
})

export default function DemosPage() {
  // The hero is whichever live demo comes first, rather than a hardcoded
  // slug — so reordering meta.ts reorders the page.
  const hero = DEMOS.find((d) => DEMO_SOURCES[d.slug])
  const rest = DEMOS.filter((d) => d.slug !== hero?.slug)

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-24 pt-10 md:px-8 md:pt-14">
      <header className="mb-10 max-w-[720px]">
        <p className="mb-3 font-code text-[12px] uppercase tracking-[0.14em] text-[#7c3aed]">
          Showcase
        </p>
        <h1 className="mb-4 font-heading text-[38px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[46px]">
          The same grid, six different products
        </h1>
        <p className="text-[17px] leading-[1.7] text-[#525252] dark:text-[#7a8399]">
          Not a feature tour — these are application screens. Every one is the
          real library running in your browser, with real data volumes and
          nothing stubbed out. Click into any of them and poke at it.
        </p>
      </header>

      {/* ── Hero demo, running inline ───────────────────────────────── */}
      {hero && (
        <section className="mb-16">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">
                {hero.title}
              </h2>
              <p className="text-[14.5px] text-[#525252] dark:text-[#7a8399]">
                {hero.tagline}
              </p>
            </div>
            <Link
              href={`/demos/${hero.slug}`}
              className="rounded-lg border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.1)] px-3.5 py-2 text-[13.5px] font-bold text-[#7c3aed] transition-colors hover:bg-[rgba(124,58,237,0.18)]"
            >
              Open full screen →
            </Link>
          </div>

          <DemoFrame
            source={DEMO_SOURCES[hero.slug]}
            title={`EliteGrid demo — ${hero.title}`}
            live={LIVE_FEED_DEMOS.has(hero.slug)}
            // Taller than a plain grid tile would need: the crypto demo puts a
            // ~130px chart panel above its grid, and at 560 the table beneath
            // it was down to about five visible rows.
            height={660}
          />

          <ul className="mt-3 flex flex-wrap gap-2">
            {hero.features.map((f) => (
              <li
                key={f}
                className="rounded-full border border-black/[0.07] px-2.5 py-0.5 font-code text-[12px] text-[#525252] dark:border-white/[0.07] dark:text-[#7a8399]"
              >
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── The rest, as cards ──────────────────────────────────────── */}
      {/* Posters, not live iframes. Six grids each with its own React runtime
          and ticker will peg a CPU — the lesson KeepAlive.tsx already paid
          for — so a tile goes live only on its own page.

          The posters are real screenshots of these demos, one per theme,
          captured against a running build. Recapture them when a demo's
          layout changes; a stale poster is worse than none. */}
      <h2 className="mb-5 font-heading text-[20px] font-bold tracking-[-0.02em]">
        More showcases
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((demo) => {
          const isLive = Boolean(DEMO_SOURCES[demo.slug])
          const card = (
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-white transition-all dark:border-white/[0.07] dark:bg-[#0c0c14]">
              <div
                className="relative h-[156px] shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(${demo.hue} 70% 54% / 0.22), hsl(${demo.hue + 40} 70% 54% / 0.08))`,
                }}
              >
                {/* Two files rather than one: a light screenshot on a dark
                    page reads as a rendering bug, so each theme gets its own.
                    The gradient behind them is what a visitor sees if a
                    poster is ever missing. */}
                <Image
                  src={`/demos/${demo.slug}-light.png`}
                  alt={`${demo.title} demo`}
                  width={1320}
                  height={760}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  className="absolute inset-0 h-full w-full object-cover object-left-top dark:hidden"
                />
                <Image
                  src={`/demos/${demo.slug}-dark.png`}
                  alt=""
                  aria-hidden
                  width={1320}
                  height={760}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  className="absolute inset-0 hidden h-full w-full object-cover object-left-top dark:block"
                />
                {/* Solid in both themes: it now sits on a screenshot, not
                    on a flat gradient, so a translucent chip is unreadable. */}
                <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-0.5 font-code text-[11px] text-white backdrop-blur-[2px]">
                  {demo.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <h3 className="font-heading text-[16.5px] font-bold tracking-[-0.01em]">
                    {demo.title}
                  </h3>
                  {!isLive && (
                    <span className="rounded px-1.5 py-px font-code text-[10.5px] uppercase tracking-wide text-[#a3a3a3] dark:text-[#4b5563]">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mb-3 text-[13.5px] leading-[1.6] text-[#525252] dark:text-[#7a8399]">
                  {demo.tagline}
                </p>
                <ul className="mt-auto flex flex-wrap gap-1.5">
                  {demo.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="rounded-full border border-black/[0.07] px-2 py-0.5 font-code text-[11px] text-[#a3a3a3] dark:border-white/[0.07] dark:text-[#4b5563]"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )

          return (
            <li key={demo.slug} className={isLive ? '' : 'opacity-60'}>
              {isLive ? (
                <Link href={`/demos/${demo.slug}`} className="block h-full">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-10 text-[14.5px] text-[#525252] dark:text-[#7a8399]">
        Want to build one of these yourself?{' '}
        <Link href="/playground" className="font-semibold text-[#7c3aed] hover:underline">
          Open the playground
        </Link>{' '}
        or{' '}
        <Link href="/docs" className="font-semibold text-[#7c3aed] hover:underline">
          read the manual
        </Link>
        .
      </p>
    </main>
  )
}
