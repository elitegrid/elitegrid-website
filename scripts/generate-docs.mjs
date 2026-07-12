// Bakes the manual markdown (app/docs/react-manual/, app/docs/vue-manual/) into the committed
// file lib/docs-content.ts. Run with: npm run docs:build
//
// Once generated, the *-manual/ source folders can be deleted — the site
// renders from the generated file, not from the markdown at runtime. A manual
// whose source folder is missing is simply skipped; the generated file is only
// rewritten when at least one manual is found, so deleting sources is safe.

import { readFile, readdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeShiki from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import GithubSlugger from 'github-slugger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_FILE = path.join(ROOT, 'lib', 'docs-content.json')

// Each manual: a framework key, a display label, and its source folder
// (relative to the project root — the markdown lives under app/docs/).
const MANUALS = [
  { framework: 'react', label: 'React', dir: 'app/docs/react-manual' },
  { framework: 'vue', label: 'Vue', dir: 'app/docs/vue-manual' },
  { framework: 'vanilla', label: 'Vanilla JS', dir: 'app/docs/vanilla-manual' },
]

// --- markdown helpers -------------------------------------------------------

function stripLeadingH1(md) {
  return md.replace(/^#\s+.*(\r?\n)+/, '')
}

// Rewrite a manual's relative links to live /docs/<framework>/... routes.
function rewriteLinks(md, framework) {
  return md
    .replace(/\]\(\.\/(?:\d+)-([a-z0-9-]+)\.md(#[a-z0-9-]+)?\)/gi, `](/docs/${framework}/$1$2)`)
    .replace(/\]\(\.\/README\.md\)/gi, `](/docs/${framework})`)
    .replace(/\]\(\.?\/?examples\/?[^)]*\)/gi, `](/docs/${framework}/getting-started)`)
}

// Extract h2/h3 for the "On this page" rail. github-slugger matches rehype-slug.
function extractToc(md) {
  const slugger = new GithubSlugger()
  const items = []
  let inFence = false
  for (const line of md.split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = /^(#{2,3})\s+(.*)$/.exec(line)
    if (!m) continue
    const depth = m[1].length
    const text = m[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .trim()
    items.push({ depth, text, id: slugger.slug(text) })
  }
  return items
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeShiki, { theme: 'github-dark-default' })
  .use(rehypeStringify)

async function renderMarkdown(md) {
  return String(await processor.process(md))
}

// Pull "| 01 | [Title](./01-x.md) | blurb |" rows from the README for nav blurbs.
function parseBlurbs(readme) {
  const map = {}
  const re = /\|\s*\d+\s*\|\s*\[[^\]]+\]\(\.\/\d+-([a-z0-9-]+)\.md\)\s*\|\s*([^|]+?)\s*\|/gi
  let m
  while ((m = re.exec(readme))) map[m[1]] = m[2].trim()
  return map
}

// Embed live-demo placeholders into baked HTML, without touching the
// shiki/remark pipeline. Authoring convention: a fenced code block
// immediately followed (after a blank line) by a lone marker paragraph
// `[[LIVE_DEMO:framework:index]]` in the raw markdown. That marker is inert
// plain text to remark (renders as a plain `<p>`), so every other code block
// and the rest of the pipeline is completely unaffected. We pull the *raw*
// source (not the shiki-highlighted HTML) out of the markdown here, because
// the client needs plain text to hand to Babel at runtime, not markup.
// The code group must not itself contain a fence-closing sequence — with a
// plain lazy `[\s\S]*?` the regex doesn't respect fence pairing and can skip
// straight from the *first* fence in the whole document to whichever later
// "```" happens to precede a marker, silently grabbing the wrong block's
// content. `(?:(?!\n```)[\s\S])*` forces each fence to close at its own next
// "\n```", so this only ever matches the fence immediately before the marker.
const LIVE_DEMO_RE = /```(\w+)\n((?:(?!\n```)[\s\S])*)\n```\s*\n+\s*\[\[LIVE_DEMO:(\w+):(\d+)\]\]/g

function injectLiveDemos(rawBody, html) {
  let out = html
  let m
  // Source .md files are CRLF — normalize so the literal \n's in
  // LIVE_DEMO_RE actually match, and so the extracted code (which gets
  // shipped to the browser and fed to Babel) is clean LF-only.
  const normalized = rawBody.replace(/\r\n/g, '\n')
  LIVE_DEMO_RE.lastIndex = 0
  while ((m = LIVE_DEMO_RE.exec(normalized))) {
    const [, , code, framework, index] = m
    const b64 = Buffer.from(code, 'utf8').toString('base64')
    const marker = `[[LIVE_DEMO:${framework}:${index}]]`
    const div = `<div class="docs-live-demo" data-framework="${framework}" data-code="${b64}"></div>`
    // Exact-string match confirmed against this repo's actual remark/rehype
    // output; fall back to a looser regex if a future dependency bump ever
    // changes how the marker paragraph is serialized.
    const exact = `<p>${marker}</p>`
    if (out.includes(exact)) {
      out = out.replace(exact, div)
    } else {
      out = out.replace(new RegExp(`<p>\\s*\\[\\[LIVE_DEMO:${framework}:${index}\\]\\]\\s*</p>`), div)
    }
  }
  return out
}

// --- build ------------------------------------------------------------------

async function buildPage(dir, file, framework, titleOverride, blurb) {
  const raw = await readFile(path.join(ROOT, dir, file), 'utf8')

  const h1 = /^#\s+(.*)$/m.exec(raw)?.[1] ?? ''
  let num = ''
  let title = titleOverride ?? h1
  if (!titleOverride && h1.includes('·')) {
    const [left, right] = h1.split('·')
    num = left.trim()
    title = right.trim()
  }

  const slug = /^(\d+)-(.+)\.md$/.exec(file)?.[2] ?? ''
  const body = rewriteLinks(stripLeadingH1(raw), framework)

  const html = injectLiveDemos(body, await renderMarkdown(body))

  return {
    num,
    slug,
    title,
    blurb: blurb ?? '',
    html,
    toc: extractToc(body),
  }
}

// Read the manuals already baked into OUT_FILE so we can preserve content for
// a framework whose source folder has since been deleted.
async function loadExistingManuals() {
  if (!existsSync(OUT_FILE)) return []
  try {
    const src = await readFile(OUT_FILE, 'utf8')
    return JSON.parse(src)
  } catch (err) {
    console.warn('  could not parse existing docs-content.json:', err.message)
    return []
  }
}

async function buildManual({ framework, label, dir }) {
  const files = (await readdir(path.join(ROOT, dir))).filter((f) =>
    f.endsWith('.md')
  )

  const readme = await readFile(path.join(ROOT, dir, 'README.md'), 'utf8')
  const blurbs = parseBlurbs(readme)

  const overview = await buildPage(
    dir,
    'README.md',
    framework,
    'Overview',
    `Start here — the ${label} manual for EliteGrid`
  )

  const chapterFiles = files
    .filter((f) => /^\d+-/.test(f))
    .sort((a, b) => a.localeCompare(b))

  const chapters = []
  for (const file of chapterFiles) {
    const slug = /^\d+-(.+)\.md$/.exec(file)[1]
    chapters.push(await buildPage(dir, file, framework, null, blurbs[slug]))
  }

  console.log(`  built ${framework}: overview + ${chapters.length} chapters`)
  return { framework, label, overview, chapters }
}

async function main() {
  const existing = await loadExistingManuals()
  const manuals = []

  for (const cfg of MANUALS) {
    if (existsSync(path.join(ROOT, cfg.dir))) {
      // Source present — (re)build from markdown.
      manuals.push(await buildManual(cfg))
    } else {
      // Source deleted — keep whatever was previously baked, so the docs stay
      // live even without the source folder.
      const prev = existing.find((m) => m.framework === cfg.framework)
      if (prev) {
        console.log(`  reuse ${cfg.framework}: source ${cfg.dir}/ missing, kept baked content`)
        manuals.push(prev)
      } else {
        console.warn(`  skip ${cfg.framework}: source ${cfg.dir}/ missing and nothing baked`)
      }
    }
  }

  if (manuals.length === 0) {
    console.warn('No manual content available — leaving existing lib/docs-content.ts untouched.')
    return
  }

  const out = JSON.stringify(manuals, null, 2) + '\n'

  await writeFile(OUT_FILE, out, 'utf8')
  console.log(`Wrote ${OUT_FILE} (${manuals.length} manual${manuals.length > 1 ? 's' : ''})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
