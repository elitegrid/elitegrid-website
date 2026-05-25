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
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex gap-2 flex-wrap justify-center w-full">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="you@company.com"
          disabled={status === 'loading' || status === 'success'}
          className="font-mono text-sm px-5 py-3.5 rounded-xl border border-white/8 bg-[#111113] text-[#f4f4f5] placeholder:text-[#52525b] outline-none focus:border-[#e8ff47]/40 focus:ring-2 focus:ring-[#e8ff47]/10 transition-all w-72 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || status === 'success'}
          className="font-bold text-sm px-7 py-3.5 rounded-xl bg-[#e8ff47] text-[#09090b] hover:bg-[#d4eb3a] active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining...' : status === 'success' ? '✓ Joined!' : 'Join Waitlist →'}
        </button>
      </div>

      {message && (
        <p className={`font-mono text-xs ${
          status === 'success' ? 'text-[#e8ff47]' :
          status === 'duplicate' ? 'text-[#facc15]' :
          'text-[#f87171]'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}