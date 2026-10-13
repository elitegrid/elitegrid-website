// Capture one gallery poster per demo per theme, from a running build.
//
// The gallery cards at /demos show screenshots rather than six live iframes —
// six grids each with its own React runtime and ticker peg a CPU. Rerun this
// whenever a demo's layout changes; a stale poster is worse than none.
//
// Playwright is NOT a dependency of this site. It is borrowed from the library
// repo beside it, which already has it for its own e2e suite, so the showcase
// costs the website no extra install.
//
//   npm run build
//   npx next start -p 3100     (one terminal)
//   npm run demos:posters      (another)
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEMO_DIR = path.join(ROOT, 'lib/demos')
const toUrl = (p) => 'file:///' + p.split(path.sep).join('/')

// meta.ts directly, and the demo modules from disk — the same route
// verify-demos.mjs takes, because sources.ts uses the extensionless
// specifiers the bundler wants and Node's ESM resolver does not.
const { DEMOS } = await import(toUrl(path.join(DEMO_DIR, 'meta.ts')))
const INFRA = new Set(['shell.ts', 'meta.ts', 'sources.ts'])
const built = new Set()
for (const file of fs.readdirSync(DEMO_DIR)) {
  if (!file.endsWith('.ts') || INFRA.has(file)) continue
  const mod = await import(toUrl(path.join(DEMO_DIR, file)))
  for (const value of Object.values(mod)) {
    if (value && typeof value === 'object' && 'slug' in value) built.add(value.slug)
  }
}

const LIBRARY_REPO = new URL('../../GridLibraryProject/package.json', import.meta.url)
if (!fs.existsSync(fileURLToPath(LIBRARY_REPO))) {
  console.error(
    'Playwright comes from the library repo, expected at ../GridLibraryProject.\n' +
      'Clone it beside this one, or install @playwright/test here and import it directly.',
  )
  process.exit(1)
}
const { chromium } = createRequire(LIBRARY_REPO)('@playwright/test')

const BASE = process.argv[2] ?? 'http://localhost:3100'
const OUT = fileURLToPath(new URL('../public/demos/', import.meta.url))

// Derived, not listed: a demo with a source is a demo with a card to fill.
const SLUGS = DEMOS.filter((d) => built.has(d.slug)).map((d) => d.slug)

fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
let failures = 0

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1320, height: 900 },
    // 1x on purpose: the card renders these at ~420px wide and next/image
    // resizes from here, so a 2x capture is three times the bytes in git for
    // detail nothing displays.
    deviceScaleFactor: 1,
    colorScheme: theme,
  })
  // The site reads its own theme from localStorage on first paint.
  await ctx.addInitScript(`try { localStorage.setItem('eg-theme', '${theme}') } catch {}`)

  for (const slug of SLUGS) {
    const page = await ctx.newPage()
    try {
      await page.goto(`${BASE}/demos/${slug}`, { waitUntil: 'load', timeout: 60_000 })
      // The floating feedback widget is site chrome, not the demo.
      await page.addStyleTag({
        content: '[aria-label="Report an issue or send feedback"]{display:none !important}',
      })
      const frame = page.frameLocator('iframe')
      // A rendered header cell means the grid mounted inside the sandbox.
      await frame.locator('.yg-header-cell').first().waitFor({ timeout: 45_000 })
      // Let tickers, sparklines and the auto-height pass settle.
      await page.waitForTimeout(3000)
      const file = path.join(OUT, `${slug}-${theme}.png`)
      await page.locator('iframe').screenshot({ path: file })
      console.log(`  ok    ${slug}-${theme}.png  ${(fs.statSync(file).size / 1024).toFixed(0)} kB`)
    } catch (err) {
      failures++
      console.log(`  FAIL  ${slug}-${theme}: ${err.message.split('\n')[0]}`)
    } finally {
      await page.close()
    }
  }
  await ctx.close()
}

await browser.close()
console.log(failures ? `\n${failures} capture(s) failed` : `\n${SLUGS.length * 2} posters captured`)
process.exit(failures ? 1 : 0)
