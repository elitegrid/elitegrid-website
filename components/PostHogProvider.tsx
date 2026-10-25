'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

// Analytics. Autocapture handles clicks and pageviews, including app-router
// client navigations — `defaults` wires the history-API listener, so there is
// no route-change effect to maintain here.
//
// Cookieless by deliberate choice, and that choice is what buys the site its
// lack of a consent banner: nothing is written to the visitor's device, so the
// EU cookie rule has nothing to attach to. PostHog counts visitors with a
// server-side hash instead. The cost is real and accepted — a returning
// visitor reads as a new one, so cross-visit retention and `identify()` do not
// work. Turning this off means adding a consent banner in the same change.
//
// `cookieless_mode: 'always'` also needs "Cookieless server hash mode" enabled
// in PostHog project settings; without it the events are rejected.
//
// Session recording is off here as well as in project settings. The dashboard
// toggle is one click away from being flipped back by anyone in the org, so
// this is the half of that decision that lives in review.
//
// No-ops without a key, which is what keeps local dev and preview builds out
// of the production project.
export default function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    posthog.init(key, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      defaults: '2025-05-24',
      cookieless_mode: 'always',
      disable_session_recording: true,
    })
  }, [])

  return null
}
