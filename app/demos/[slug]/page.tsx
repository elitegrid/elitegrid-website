import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DEMOS, findDemo } from '@/lib/demos/meta'
import { DEMO_SOURCES, LIVE_FEED_DEMOS } from '@/lib/demos/sources'
import DemoFrame from '@/components/demos/DemoFrame'
import { codeToHtml } from 'shiki'
import { pageMetadata } from '@/lib/seo'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

/** Strips the common leading indent a template-literal source carries. */
function dedent(source: string): string {
  const lines = source.replace(/\t/g, '  ').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length)
  const common = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(common)).join('\n').trim()
}

export function generateStaticParams() {
  // Only the demos that actually have a source. A planned tile has no page —
  // it is a card on the gallery, not a 404 waiting to be found.
  return DEMOS.filter((d) => DEMO_SOURCES[d.slug]).map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const demo = findDemo(slug)
  if (!demo) return {}
  return pageMetadata({
    title: `${demo.title} — EliteGrid demo`,
    description: demo.blurb,
    path: `/demos/${slug}`,
  })
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const demo = findDemo(slug)
  const source = demo && DEMO_SOURCES[demo.slug]
  if (!demo || !source) notFound()

  // Highlighted at build time — these six pages are prerendered, so Shiki
  // never runs on a request. Same theme as the manuals, so a visitor moving
  // between /docs and /demos sees one code style.
  //
  // Dedented first: a demo's source is a template literal indented to sit
  // inside its module, so every line but the first carries four spaces it
  // should not be shown with.
  const scriptHtml = await codeToHtml(dedent(source.script), {
    lang: 'js',
    theme: 'github-dark-default',
  })
  const cssHtml = source.css
    ? await codeToHtml(dedent(source.css), { lang: 'css', theme: 'github-dark-default' })
    : null

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-20 pt-8 md:px-8 md:pt-10">
      <BreadcrumbJsonLd
        items={[
          { name: 'Demos', path: '/demos' },
          { name: demo.title, path: `/demos/${slug}` },
        ]}
      />
      <div className="mb-5 flex items-center gap-1.5 text-[12.5px] text-[#a3a3a3] dark:text-[#374151]">
        <Link href="/demos" className="transition-colors hover:text-[#7c3aed]">
          Demos
        </Link>
        <span className="text-[11px] opacity-40">›</span>
        <span className="text-[#525252] dark:text-[#7a8399]">{demo.title}</span>
      </div>

      <header className="mb-6 max-w-[760px]">
        <h1 className="mb-3 font-heading text-[32px] font-extrabold leading-[1.12] tracking-[-0.03em] md:text-[38px]">
          {demo.title}
        </h1>
        <p className="text-[16.5px] leading-[1.7] text-[#525252] dark:text-[#7a8399]">
          {demo.blurb}
        </p>
      </header>

      {/* Tall on a demo page — this is the whole point of the route, so it
          gets the viewport rather than a card's worth of it. */}
      <DemoFrame
        source={source}
        title={`EliteGrid demo — ${demo.title}`}
        live={LIVE_FEED_DEMOS.has(demo.slug)}
        height="min(72vh, 760px)"
      />

      <section className="mt-8 max-w-[760px]">
        <h2 className="mb-3 font-heading text-[17px] font-bold tracking-[-0.01em]">
          What you are looking at
        </h2>
        <ul className="flex flex-wrap gap-2">
          {demo.features.map((f) => (
            <li
              key={f}
              className="rounded-full border border-black/[0.07] px-3 py-1 font-code text-[12.5px] text-[#525252] dark:border-white/[0.07] dark:text-[#7a8399]"
            >
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[14.5px] leading-[1.7] text-[#525252] dark:text-[#7a8399]">
          Every one of those is a documented option, not demo-only code.{' '}
          <Link href="/docs" className="font-semibold text-[#7c3aed] hover:underline">
            The manual
          </Link>{' '}
          has the config for each, and{' '}
          <Link
            href="/playground"
            className="font-semibold text-[#7c3aed] hover:underline"
          >
            the playground
          </Link>{' '}
          lets you edit a grid like this one live.
        </p>
      </section>

      {/* ── The code behind it ──────────────────────────────────────── */}
      {/* <details> rather than a tab component: the browser already has an
          open/closed disclosure with the right keyboard and a11y behaviour,
          and a 400-line script should start closed. */}
      <section className="mt-12">
        <h2 className="mb-3 font-heading text-[17px] font-bold tracking-[-0.01em]">
          The code behind it
        </h2>
        <p className="mb-4 max-w-[760px] text-[14.5px] leading-[1.7] text-[#525252] dark:text-[#7a8399]">
          The whole demo, exactly as it runs above. It is plain JavaScript
          against the published packages — <code className="font-code text-[13px] text-[#7c3aed]">createGrid</code>,{' '}
          <code className="font-code text-[13px] text-[#7c3aed]">AllModules</code> and the same options the
          manual documents. Nothing here is private API.
        </p>

        <details className="group overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/[0.07]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-black/[0.02] px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-black/[0.04] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
            <span>
              {demo.title} — script
              <span className="ml-2 font-code text-[12px] font-normal text-[#a3a3a3] dark:text-[#4b5563]">
                {dedent(source.script).split('\n').length} lines
              </span>
            </span>
            <span className="font-code text-[12px] text-[#7c3aed] group-open:hidden">show</span>
            <span className="hidden font-code text-[12px] text-[#7c3aed] group-open:inline">hide</span>
          </summary>
          <div
            className="demo-code max-h-[70vh] overflow-auto border-t border-black/[0.08] dark:border-white/[0.07]"
            dangerouslySetInnerHTML={{ __html: scriptHtml }}
          />
        </details>

        {cssHtml && (
          <details className="group mt-3 overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/[0.07]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-black/[0.02] px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-black/[0.04] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
              <span>
                {demo.title} — styles
                <span className="ml-2 font-code text-[12px] font-normal text-[#a3a3a3] dark:text-[#4b5563]">
                  cell renderers and layout
                </span>
              </span>
              <span className="font-code text-[12px] text-[#7c3aed] group-open:hidden">show</span>
              <span className="hidden font-code text-[12px] text-[#7c3aed] group-open:inline">hide</span>
            </summary>
            <div
              className="demo-code max-h-[70vh] overflow-auto border-t border-black/[0.08] dark:border-white/[0.07]"
              dangerouslySetInnerHTML={{ __html: cssHtml }}
            />
          </details>
        )}
      </section>
    </main>
  )
}
