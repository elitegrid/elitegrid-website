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
const OUT_FILE = path.join(ROOT, 'lib', 'docs-content.ts')

// Each manual: a framework key, a display label, and its source folder
// (relative to the project root — the markdown lives under app/docs/).
const MANUALS = [
  { framework: 'react', label: 'React', dir: 'app/docs/react-manual' },
  { framework: 'vue', label: 'Vue', dir: 'app/docs/vue-manual' },
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

  return {
    num,
    slug,
    title,
    blurb: blurb ?? '',
    html: await renderMarkdown(body),
    toc: extractToc(body),
  }
}

// Read the manuals already baked into OUT_FILE so we can preserve content for
// a framework whose source folder has since been deleted.
async function loadExistingManuals() {
  if (!existsSync(OUT_FILE)) return []
  try {
    const src = await readFile(OUT_FILE, 'utf8')
    const marker = 'export const manuals: Manual[] = '
    const start = src.indexOf(marker)
    if (start === -1) return []
    const json = src.slice(start + marker.length).trim()
    return JSON.parse(json)
  } catch (err) {
    console.warn('  could not parse existing docs-content.ts:', err.message)
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

  const banner =
    '// AUTO-GENERATED by scripts/generate-docs.mjs — do not edit by hand.\n' +
    '// Source: app/docs/react-manual/*.md, app/docs/vue-manual/*.md. Regenerate: npm run docs:build\n'

  const types =
    'export interface TocItem {\n' +
    '  depth: 2 | 3\n' +
    '  text: string\n' +
    '  id: string\n' +
    '}\n\n' +
    'export interface DocPage {\n' +
    '  num: string\n' +
    '  slug: string\n' +
    '  title: string\n' +
    '  blurb: string\n' +
    '  html: string\n' +
    '  toc: TocItem[]\n' +
    '}\n\n' +
    'export interface Manual {\n' +
    '  framework: string\n' +
    '  label: string\n' +
    '  overview: DocPage\n' +
    '  chapters: DocPage[]\n' +
    '}\n\n'

  const out =
    banner + '\n' + types +
    'export const manuals: Manual[] = ' + JSON.stringify(manuals, null, 2) + '\n'

  await writeFile(OUT_FILE, out, 'utf8')
  console.log(`Wrote ${OUT_FILE} (${manuals.length} manual${manuals.length > 1 ? 's' : ''})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
