import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from '@/components/JsonLd'
import FeedbackButton from '@/components/FeedbackButton'
import KeepAlivePlayground from './playground/KeepAlive'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://elitegrid.dev'),
  title: 'EliteGrid — The TypeScript Data Grid Library',
  description: 'EliteGrid is a high-performance TypeScript data grid and table library. Features a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
  verification: {
    google: 'xjTUOGQZsureR3PLnu4OQ0a_c9K-7A7li4cVv-7RGpM',
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${dmSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          // Runs before paint so there's no flash of the wrong theme.
          // Light is the default theme regardless of OS preference; dark only
          // applies once the user explicitly picks it via ThemeToggle.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('eg-theme');document.documentElement.classList.toggle('dark',s==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <JsonLd />
        <FeedbackButton />
        <KeepAlivePlayground />
      </body>
    </html>
  );
}
