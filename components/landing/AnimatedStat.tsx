'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedStat({
  target,
  className = '',
}: {
  target: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)

          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setValue(target)
            return
          }

          const step = target / 55
          let cur = 0
          const t = setInterval(() => {
            cur = Math.min(cur + step, target)
            setValue(Math.round(cur))
            if (cur >= target) clearInterval(t)
          }, 20)
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className={className}>
      {value}
    </div>
  )
}
