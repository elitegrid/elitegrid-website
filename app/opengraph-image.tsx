import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'EliteGrid — TypeScript Data Grid Built for Developer Experience'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Grid background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            display: 'flex',
          }}
        />

        {/* Violet glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            display: 'flex',
          }}
        />

        {/* Top: Logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #5b21b6, #a855f7)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}
            >
              <svg width="21" height="21" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
                <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
                <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
                <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
              </svg>
            </div>
            <span style={{ color: '#f4f4f5', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              EliteGrid
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', display: 'flex' }} />
            <span style={{ color: '#c4b5fd', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
              v0.1 · Live on npm
            </span>
          </div>
        </div>

        {/* Middle: Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <span
            style={{
              color: '#a855f7',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            TypeScript Data Grid
          </span>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#f4f4f5',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>The data grid</span>
            <span style={{ color: '#a855f7' }}>developers deserve.</span>
          </div>
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '22px',
              lineHeight: 1.5,
              maxWidth: '680px',
              margin: 0,
            }}
          >
            Grouped config API · React, Vue & JS adapters · WCAG 2.1 AA · Zero dependencies
          </p>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', position: 'relative' }}>
          {[
            { value: '1,000', label: 'passing tests' },
            { value: '13', label: 'core plugins' },
            { value: '0', label: 'dependencies' },
            { value: '100%', label: 'TypeScript' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#f4f4f5', fontSize: '28px', fontWeight: 800 }}>{s.value}</span>
              <span style={{ color: '#52525b', fontSize: '13px', fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}

          {/* Domain */}
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            <span style={{ color: '#52525b', fontSize: '16px', fontWeight: 700 }}>elitegrid.dev</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}