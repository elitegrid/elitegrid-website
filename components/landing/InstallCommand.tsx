'use client'

import { useState } from 'react'

const PACKAGES = [
  { key: 'react', label: 'React', pkg: '@elitegrid/react' },
  { key: 'vue', label: 'Vue', pkg: '@elitegrid/vue' },
  { key: 'vanilla', label: 'JS', pkg: '@elitegrid/vanilla' },
] as const

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 9.5v-6a1 1 0 0 1 1-1h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Compact copy-to-clipboard button for the hero — always installs @elitegrid/react. */
export function InstallButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={async () => {
        if (await copy('npm install @elitegrid/react')) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        }
      }}
      className={className}
    >
      {copied ? (
        <>
          Copied! <CheckIcon />
        </>
      ) : (
        <>
          npm install @elitegrid/react <CopyIcon />
        </>
      )}
    </button>
  )
}

/** Framework-tabbed install panel for the final CTA section (always-dark). */
export default function InstallCommand() {
  const [active, setActive] = useState<(typeof PACKAGES)[number]['key']>('react')
  const [copied, setCopied] = useState(false)
  const current = PACKAGES.find(p => p.key === active)!
  const command = `npm install ${current.pkg}`

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="flex justify-center gap-1.5 mb-3">
        {PACKAGES.map(p => (
          <button
            key={p.key}
            onClick={() => { setActive(p.key); setCopied(false) }}
            className={[
              'text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors',
              active === p.key
                ? 'bg-[#7c3aed] text-white'
                : 'text-[#7a8399] hover:text-[#edf0fa] bg-white/[0.05] hover:bg-white/[0.08]',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={async () => {
          if (await copy(command)) {
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }
        }}
        className="w-full flex items-center justify-between gap-3 bg-white/[0.07] border border-white/[0.12] rounded-[9px] px-5 py-3 text-left transition-colors hover:border-[rgba(124,58,237,0.55)]"
      >
        <span className="font-code text-[15px] text-[#edf0fa] truncate">
          <span className="text-[#7a8399]">$</span> {command}
        </span>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7c3aed]">
          {copied ? (
            <>
              Copied <CheckIcon />
            </>
          ) : (
            <>
              Copy <CopyIcon />
            </>
          )}
        </span>
      </button>
    </div>
  )
}
