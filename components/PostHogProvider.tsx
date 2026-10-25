'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import posthog from 'posthog-js'
import ConsentBanner from './ConsentBanner'

// Analytics. Autocapture handles clicks and pageviews, including app-router
// client navigations — `defaults` wires the history-API listener, so there is
// no route-change effect to maintain here.
//
// `cookieless_mode: 'on_reject'` is what makes the banner worth its friction:
// nothing is captured until the visitor chooses, an accept gets full tracking
// with storage, and a REJECT is still counted cookielessly rather than going
// dark. That last part is the whole reason this mode beats a plain opt-in —
// pageview totals stay honest even when most visitors decline.
//
// It needs "Cookieless server hash mode" enabled in PostHog project settings.
// Without it, rejected visitors are dropped instead of counted.
//
// Two things only an accept buys back, because both need stored identity:
// country (the cookieless path strips the IP before GeoIP runs) and anything
// spanning visits — retention, `identify()`. So the geography and retention
// panels describe consenting visitors only, not all traffic.
//
// Session recording starts on accept and never before. It is off at init
// rather than gated afterwards so that a mistake fails closed.
//
// No-ops without a key, which is what keeps local dev and preview builds out
// of the production project.

// Banner visibility lives outside React on purpose. It is read once per page
// load from storage — an external system — and a `useState` set from inside
// the mount effect is the cascading-render pattern `react-hooks` rejects.
let visible = false
let started = false
const listeners = new Set<() => void>()

function setVisible(next: boolean) {
  if (next === visible) return
  visible = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => visible
// Never on the server: the decision lives in the visitor's browser, and
// rendering the banner into the HTML would flash it at people who already
// chose.
const getServerSnapshot = () => false

export default function PostHogProvider() {
  const showBanner = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    // StrictMode mounts effects twice in development; init once.
    if (!started) {
      started = true

      posthog.init(key, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        defaults: '2025-05-24',
        cookieless_mode: 'on_reject',
        disable_session_recording: true,
        opt_out_capturing_by_default: true,
      })

      // `get_explicit_consent_status()` is the three-state read: 'pending'
      // means never asked, which is the only state the banner is for. Do NOT
      // substitute `has_opted_in_capturing()` — that collapses "never asked"
      // into "opted in" and the banner then never renders.
      const consent = posthog.get_explicit_consent_status()
      if (consent === 'granted') {
        posthog.startSessionRecording()
      } else if (consent === 'pending') {
        setVisible(true)
      }
      // 'denied' needs no call: `on_reject` already has them on the cookieless
      // path. So does 'pending', because `opt_out_capturing_by_default` counts
      // as "defaulted to opt-out" — which is what keeps the visitors who never
      // click the banner in the pageview totals instead of invisible.
    }

    // Withdrawal route. "As easy to withdraw as to give" is a requirement, not
    // a courtesy, so any `#cookies` link anywhere on the site reopens the
    // banner — the footer link is one caller, not the only one.
    const reopen = () => {
      if (window.location.hash === '#cookies') setVisible(true)
    }
    reopen()
    window.addEventListener('hashchange', reopen)
    return () => window.removeEventListener('hashchange', reopen)
  }, [])

  const onDecide = useCallback((accepted: boolean) => {
    if (accepted) {
      posthog.opt_in_capturing()
      posthog.startSessionRecording()
    } else {
      posthog.opt_out_capturing()
    }

    setVisible(false)

    // Leaving #cookies in the URL would reopen the banner on the next
    // hashchange, and would be shared by anyone copying the link.
    if (window.location.hash === '#cookies') {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  if (!showBanner) return null

  return <ConsentBanner onDecide={onDecide} />
}
