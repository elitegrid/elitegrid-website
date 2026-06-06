'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlaygroundPage } from './page'

export default function KeepAlivePlayground() {
  const pathname = usePathname()
  const isPlayground = pathname === '/playground'
  // Track whether we've ever mounted — don't render at all until the user
  // first visits /playground, so the home page stays lightweight.
  const [hasVisited, setHasVisited] = useState(isPlayground)

  useEffect(() => {
    if (isPlayground) setHasVisited(true)
  }, [isPlayground])

  if (!hasVisited) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        background: '#09090b',
        // visibility:hidden keeps Monaco's DOM layout intact (it retains its
        // calculated dimensions). display:none removes the element from layout —
        // Monaco measures a 0-size container and re-triggers loading on re-show.
        visibility: isPlayground ? 'visible' : 'hidden',
        pointerEvents: isPlayground ? 'auto' : 'none',
      }}
      aria-hidden={!isPlayground}
    >
      <PlaygroundPage />
    </div>
  )
}
