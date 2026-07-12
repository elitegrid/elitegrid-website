'use client'

import { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setStatus('duplicate')
        setMessage('You are already on the waitlist!')
        return
      }

      if (!res.ok) throw new Error(data.error)

      setStatus('success')
      setEmail('')
      setMessage('✓ You are on the list! Check your inbox.')

    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex gap-2.5 max-w-[440px] mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="your@email.com"
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 min-w-0 bg-white/[0.07] border border-white/[0.12] rounded-[9px] px-[18px] py-3 text-[15px] font-body text-[#edf0fa] placeholder:text-white/20 outline-none focus:border-[rgba(124,58,237,0.55)] transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || status === 'success'}
          className="shrink-0 inline-flex items-center gap-2 bg-[#7c3aed] text-white text-[14px] font-semibold px-6 py-3 rounded-[9px] transition-all hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(91,33,182,0.35)] disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining…' : status === 'success' ? '✓ Joined!' : 'Join Waitlist'}
        </button>
      </div>

      <p className="text-[13px] text-[#374151] mt-3.5 mb-0">
        {message ? (
          <span
            className={
              status === 'success'
                ? 'text-[#22c55e]'
                : status === 'duplicate'
                ? 'text-[#facc15]'
                : 'text-[#f87171]'
            }
          >
            {message}
          </span>
        ) : (
          'No spam. One email at launch.'
        )}
      </p>
    </div>
  )
}
