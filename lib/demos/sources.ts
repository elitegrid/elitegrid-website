import type { Demo } from './shell'
import { crypto } from './crypto'
import { trading } from './trading'
import { hr } from './hr'
import { warehouse } from './warehouse'
import { telemetry } from './telemetry'
import { dashboard } from './dashboard'

/**
 * Every runnable demo. Adding one means importing it here and nothing else —
 * the maps below are derived, so there is no second list to keep in step.
 *
 * Imported by `app/demos/[slug]/page.tsx` and the gallery, both server
 * components, so a demo's script string crosses to the browser as a prop of
 * the route that runs it rather than inside the page bundle.
 */
const ALL: Demo[] = [crypto, trading, hr, warehouse, telemetry, dashboard]

/**
 * slug → runnable source.
 *
 * A slug in `meta.ts` with no entry here is a `status: 'planned'` tile. The
 * routes check this map rather than the status field, so the two cannot
 * disagree about what exists: adding the source is what makes a tile live.
 * `scripts/verify-demos.mjs` fails if the status says otherwise.
 */
export const DEMO_SOURCES: Record<string, Demo> = Object.fromEntries(
  ALL.map((d) => [d.slug, d]),
)

/** Demos whose script runs a timer, and so need SET_LIVE gating. */
export const LIVE_FEED_DEMOS = new Set(ALL.filter((d) => d.live).map((d) => d.slug))
