'use client'

import { useEffect, useRef, useState } from 'react'

type ReportType = 'Bug Report' | 'Feature Request' | 'General Feedback'

interface Props {
  onClose: () => void
}

export default function ReportModal({ onClose }: Props) {
  const [type, setType] = useState<ReportType>('Bug Report')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit() {
    if (message.trim().length < 10) {
      setErrorMsg('Please describe the issue in at least 10 characters.')
      return
    }
    setErrorMsg('')
    setStatus('loading')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('success')
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: '#111113', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, width: '100%', maxWidth: 480,
        padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace' }}>
              Report an Issue
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#52525b', fontFamily: 'monospace' }}>
              Found a bug or have a suggestion? We read every message.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#52525b', cursor: 'pointer',
              fontSize: '1.2rem', padding: '0 4px', lineHeight: 1, flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: '2rem' }}>✓</div>
            <p style={{ margin: 0, color: '#e8ff47', fontFamily: 'monospace', fontWeight: 700 }}>
              Thanks for the feedback!
            </p>
            <p style={{ margin: 0, color: '#52525b', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              We'll look into it and follow up if you left an email.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 8, padding: '8px 24px', borderRadius: 8,
                background: 'rgba(232,255,71,0.1)', border: '1px solid rgba(232,255,71,0.2)',
                color: '#e8ff47', fontFamily: 'monospace', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Type selector */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Bug Report', 'Feature Request', 'General Feedback'] as ReportType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8,
                    border: type === t ? '1px solid rgba(232,255,71,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    background: type === t ? 'rgba(232,255,71,0.08)' : 'transparent',
                    color: type === t ? '#e8ff47' : '#52525b',
                    fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Name + Email */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Message */}
            <textarea
              placeholder={
                type === 'Bug Report'
                  ? 'Describe what happened and what you expected...'
                  : type === 'Feature Request'
                  ? 'Describe the feature and why it would be useful...'
                  : 'Share your thoughts...'
              }
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
            />

            {errorMsg && (
              <p style={{ margin: 0, color: '#f87171', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                {errorMsg}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                  color: '#52525b', fontFamily: 'monospace', fontSize: '0.82rem',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                style={{
                  padding: '9px 24px', borderRadius: 8, border: 'none',
                  background: status === 'loading' ? 'rgba(232,255,71,0.5)' : '#e8ff47',
                  color: '#09090b', fontFamily: 'monospace', fontSize: '0.82rem',
                  fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Report →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '9px 12px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0f',
  color: '#f4f4f5', fontFamily: 'monospace', fontSize: '0.82rem',
  outline: 'none', width: '100%',
}
