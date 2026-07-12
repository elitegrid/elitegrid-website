'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const DELAY_CLASS = {
  0: '',
  1: 'delay-[80ms]',
  2: 'delay-[160ms]',
  3: 'delay-[240ms]',
  4: 'delay-[320ms]',
} as const

export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: 0 | 1 | 2 | 3 | 4
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={[
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
        DELAY_CLASS[delay],
        'motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
