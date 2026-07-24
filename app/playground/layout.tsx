import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playground — Try EliteGrid Live in Your Browser',
  description:
    'Edit React, Vue, or vanilla JS code and see the EliteGrid data grid render instantly. No install required — sorting, filtering, editing, and theming, all live in the browser.',
  alternates: {
    canonical: 'https://elitegrid.dev/playground',
  },
  openGraph: {
    title: 'EliteGrid Playground — Try It Live',
    description:
      'Edit React, Vue, or vanilla JS code and see the EliteGrid data grid render instantly in your browser.',
    url: 'https://elitegrid.dev/playground',
    siteName: 'EliteGrid',
    type: 'website',
  },
}

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children
}
