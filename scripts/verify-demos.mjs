// Verifies every showcase demo without a browser.
//
//   node --experimental-strip-types scripts/verify-demos.mjs
//
// WHY THIS EXISTS. A demo's body is a STRING (it runs inside a sandboxed
// iframe against the CDN bundle, not against the site's module graph), so
// `tsc` and eslint see an opaque template literal and check nothing inside
// it. A misspelled option, a formatter that returns NaN on one row out of
// 100, or an unescaped `</script>` all build cleanly and fail as a blank
// tile in front of a visitor.
//
// So: build each demo's real srcDoc through the real shell, then execute the
// module body against stubs. The stubs replace the BROWSER (document, window)
// and the LIBRARY (createGrid, React), never the shell's own helpers — those
// are part of what is being tested.
//
// What this cannot check: that the grid renders correctly, or that an option
// name exists in the library. It checks the demo is internally consistent and
// runs. Visual confirmation is still a human opening /demos.

import path from 'node:path'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEMO_DIR = path.join(ROOT, 'lib/demos')
const toUrl = (p) => 'file:///' + p.split(path.sep).join('/')

const { buildDemoSrcDoc } = await import(toUrl(path.join(DEMO_DIR, 'shell.ts')))
const { DEMOS } = await import(toUrl(path.join(DEMO_DIR, 'meta.ts')))

// Discovered from disk rather than imported through sources.ts: Node's ESM
// resolver needs a file extension, and sources.ts uses the extensionless
// specifiers the bundler wants. Globbing also means a demo module that was
// written but never wired into sources.ts still gets checked — and the
// cross-check below is what reports it.
const INFRA = new Set(['shell.ts', 'meta.ts', 'sources.ts'])
const demos = []
for (const file of readdirSync(DEMO_DIR)) {
  if (!file.endsWith('.ts') || INFRA.has(file)) continue
  const mod = await import(toUrl(path.join(DEMO_DIR, file)))
  const found = Object.values(mod).filter((v) => v && typeof v === 'object' && 'script' in v)
  if (found.length !== 1) {
    console.error(`  FAIL  ${file}: expected exactly one Demo export, found ${found.length}`)
    process.exitCode = 1
    continue
  }
  demos.push({ file, demo: found[0] })
}

let failures = 0

for (const { file, demo } of demos) {
  try {
    if (!demo.slug) throw new Error('no slug')
    verify(demo.slug, demo)
    console.log(`  ok    ${demo.slug}`)
  } catch (err) {
    failures++
    console.error(`  FAIL  ${demo.slug ?? file}: ${err.message}`)
  }
}

// The gallery reads meta.ts and the routes read sources.ts. If those disagree
// the result is a tile that 404s, or a finished demo nobody can reach — both
// invisible until someone clicks.
const slugs = new Set(demos.map((d) => d.demo.slug))
for (const slug of slugs) {
  if (!DEMOS.some((d) => d.slug === slug)) {
    failures++
    console.error(`  FAIL  ${slug}: has a source but no entry in meta.ts`)
  }
}
for (const demo of DEMOS) {
  if (demo.status === 'live' && !slugs.has(demo.slug)) {
    failures++
    console.error(`  FAIL  ${demo.slug}: marked live in meta.ts but has no source`)
  }
  if (demo.status === 'planned' && slugs.has(demo.slug)) {
    failures++
    console.error(`  FAIL  ${demo.slug}: has a source but is still marked planned`)
  }
}

console.log(
  failures ? `\n  ${failures} demo check(s) failed` : `\n  ${demos.length} demo(s) verified`,
)
process.exit(failures ? 1 : 0)

// ──────────────────────────────────────────────────────────────────

function verify(slug, source) {
  const html = buildDemoSrcDoc('https://example.test', source)

  // ── The document must be whole ──────────────────────────────────
  // An unescaped </script> inside the template ends the block early: the
  // grid never mounts, and nothing else in the toolchain notices.
  const opens = (html.match(/<script/g) || []).length
  const closes = (html.match(/<\/script>/g) || []).length
  ok(opens === 2, `expected 2 <script> tags, found ${opens}`)
  ok(closes === 2, `expected 2 </script> tags, found ${closes}`)
  ok(html.trimEnd().endsWith('</html>'), 'document is truncated')

  const body = html.split('<script type="module">')[1].split('</script>')[0]
  const runnable = body.replace(/^\s*import .*$/gm, '')

  try {
    new Function(runnable)
  } catch (err) {
    throw new Error(`module body is not valid JS: ${err.message}`)
  }

  // ── Run it ──────────────────────────────────────────────────────
  const created = []
  const transactions = []
  const posted = []
  const themeProps = {}
  let sortModel = null
  let listener = null
  let intervalFn = null

  const api = {
    setSortModel: (m) => { sortModel = m },
    getSortModel: () => sortModel ?? [],
    clearSort: () => { sortModel = null },
    applyTransaction: (tx) => {
      transactions.push(tx)
      return { added: [], updated: [], removed: [], skipped: [] }
    },
    exportCSV: () => {},
    getPaginationState: () => ({ totalRows: 0, page: 1, pageSize: 25 }),
    setFilterModel: () => {},
    setSearch: () => {},
    expandAllRows: () => {},
    collapseAllRows: () => {},
    flashCells: () => {},
  }

  // Enough React to let a demo's own components actually RUN. Without hooks
  // the components are only passed around as functions and never invoked, so
  // their arithmetic — a chart's min/max/scale, a path string — went
  // completely unchecked while the run still reported green.
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    Fragment: 'Fragment',
    useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
    useEffect: (fn) => effects.push(fn),
    useMemo: (fn) => fn(),
    useRef: (init) => ({ current: init }),
    useCallback: (fn) => fn,
  }
  const effects = []

  let rendered = null

  const fn = new Function(
    'React', 'createRoot', 'createGrid', 'Grid', 'AllModules', 'InfiniteScrollModule',
    'document', 'window', 'console', 'setInterval', 'clearInterval',
    runnable,
  )

  fn(
    React,
    () => ({ render: (el) => { rendered = el }, unmount: () => {} }),
    (options) => {
      created.push(options)
      // The real createGrid fires onReady a tick later; here it is called
      // synchronously so the whole check can stay synchronous. The demos do
      // not depend on the delay — they only stash the api — and a demo that
      // did would be relying on ordering the library does not promise.
      options.events?.onReady?.(api)
      return { kernel: { destroy() {} }, plugins: {}, ui: {}, options }
    },
    'Grid',
    ['AllModules'],
    ['InfiniteScrollModule'],
    {
      getElementById: () => ({ id: 'grid-mount' }),
      documentElement: {
        style: { setProperty: (k, v) => { themeProps[k] = v } },
        setAttribute: () => {},
      },
    },
    {
      parent: { postMessage: (msg) => posted.push(msg) },
      addEventListener: (_e, f) => { listener = f },
    },
    { error: () => {}, warn: () => {}, log: () => {} },
    (f) => { intervalFn = f; return 1 },
    () => { intervalFn = null },
  )

  const send = (msg) => listener({ data: msg })

  // ── Config sanity, true of every demo ───────────────────────────
  ok(created.length === 1, `expected one createGrid call, got ${created.length}`)
  const opts = created[0]

  // Without modules the plugins do not exist and the features silently do
  // nothing — the single most likely way one of these demos breaks.
  ok(Array.isArray(opts.modules) && opts.modules.length > 0, 'no modules registered')
  ok(Array.isArray(opts.columns) && opts.columns.length > 0, 'no columns')

  // ── Every renderer against every row ────────────────────────────
  // The point of running all of them: a formatter that divides by a zero
  // present in one row out of 100 is invisible until a visitor sorts.
  const rows = opts.data ?? []
  for (const col of opts.columns) {
    const d = col.display || {}
    for (const row of rows) {
      const v = row[col.field]
      const where = `${col.field}/${row.id ?? '?'}`
      if (d.cellRenderer) ok(d.cellRenderer(v, row) != null, `${where}: cellRenderer returned null`)
      if (d.formatter) {
        const s = d.formatter(v, row)
        ok(typeof s === 'string', `${where}: formatter returned ${typeof s}`)
        ok(!s.includes('NaN') && !s.includes('undefined'), `${where}: formatter gave "${s}"`)
      }
      if (d.exportFormatter) {
        const s = d.exportFormatter(v, row)
        ok(!String(s).includes('NaN'), `${where}: exportFormatter gave "${s}"`)
      }
      if (typeof d.cellClass === 'function') {
        ok(typeof d.cellClass(v, row) === 'string', `${where}: cellClass did not return a string`)
      }
      if (typeof d.tooltip === 'function') {
        const t = d.tooltip(v, row)
        ok(t != null, `${where}: tooltip returned null`)
      }
    }
  }

  // Flash tracks rows by identity. Without rowId every tick looks like a new
  // row and nothing flashes — which looks like the feature is broken.
  if (opts.appearance?.flash || opts.columns.some((c) => c.display?.flash)) {
    ok(opts.rowId, 'uses flash but sets no rowId')
    const ids = new Set(rows.map((r) => r[opts.rowId]))
    ok(ids.size === rows.length, `rowId "${opts.rowId}" is not unique across ${rows.length} rows`)
  }

  // ── The shell's own plumbing ────────────────────────────────────
  ok(listener, 'shell never registered its message listener')
  send({ type: 'SET_THEME', theme: 'dark' })
  ok(themeProps['--eg-row-bg'] === '#0f0f1a', 'SET_THEME did not apply dark tokens')
  send({ type: 'SET_THEME', theme: 'light' })
  ok(themeProps['--eg-row-bg'] === '#ffffff', 'SET_THEME did not apply light tokens')

  // ── Live feeds ──────────────────────────────────────────────────
  if (source.live) {
    ok(intervalFn, 'listed as a live feed but started no ticker')

    const before = new Map(rows.map((r) => [r.id, r.price]))
    for (let i = 0; i < 40; i++) intervalFn()
    ok(transactions.length > 0, 'ticker applied no transactions')

    let moved = 0
    for (const [id, p] of before) {
      if (rows.find((r) => r.id === id)?.price !== p) moved++
    }
    ok(moved > rows.length / 2, `only ${moved}/${rows.length} rows changed over 40 ticks`)

    // A partial update with no resolvable id is dropped as 'unresolvable-id',
    // so the feed would run and change nothing.
    for (const tx of transactions) {
      ok(Array.isArray(tx.update) && tx.update.length > 0, 'empty transaction')
      for (const u of tx.update) {
        ok(u[opts.rowId] != null, `update entry missing ${opts.rowId}`)
      }
    }

    // Long run: a compounding drift bug only diverges after thousands of
    // ticks, which is a visitor leaving the tab open, not a test.
    for (let i = 0; i < 3000; i++) intervalFn()
    for (const row of rows) {
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'number') {
          ok(Number.isFinite(v), `${row.id}.${k} diverged to ${v}`)
        }
      }
    }

    send({ type: 'SET_LIVE', live: false })
    ok(intervalFn === null, 'SET_LIVE false did not stop the ticker')
    send({ type: 'SET_LIVE', live: true })
    ok(intervalFn !== null, 'SET_LIVE true did not restart the ticker')
  }

  // ── The demo's own components ───────────────────────────────────
  // Walk what was handed to root.render and actually invoke every function
  // component. A chart whose scale divides by a zero range, or whose path
  // picks up a NaN, renders as an empty box — visible to a visitor and to
  // nothing else in this toolchain.
  if (rendered) {
    const seen = []
    walk(rendered, seen, 0)
    for (const node of seen) {
      for (const [k, v] of Object.entries(node.props ?? {})) {
        if (typeof v !== 'string' && typeof v !== 'number') continue
        const s = String(v)
        ok(!s.includes('NaN'), `<${node.type}> prop ${k} contains NaN: "${s.slice(0, 80)}"`)
        ok(
          !s.includes('undefined'),
          `<${node.type}> prop ${k} contains undefined: "${s.slice(0, 80)}"`,
        )
      }
    }
    // An SVG path with fewer than two points is a blank panel, not a chart.
    for (const node of seen.filter((n) => n.type === 'path')) {
      const d = node.props?.d
      if (typeof d !== 'string') continue
      ok(d.length > 0, '<path> has an empty d')
      ok((d.match(/[ML]/g) || []).length >= 2, `<path> has too few points: "${d.slice(0, 60)}"`)
    }
  }

  ok(posted.some((p) => p.type === 'DEMO_READY'), 'never posted DEMO_READY')

  function walk(node, out, depth) {
    if (node == null || typeof node !== 'object' || depth > 40) return
    if (Array.isArray(node)) {
      for (const n of node) walk(n, out, depth + 1)
      return
    }
    if (typeof node.type === 'function') {
      // Invoke it. A throw here is the point of the exercise.
      walk(node.type(node.props ?? {}), out, depth + 1)
      return
    }
    out.push(node)
    walk(node.children, out, depth + 1)
    if (node.props?.children) walk(node.props.children, out, depth + 1)
  }
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg)
}
