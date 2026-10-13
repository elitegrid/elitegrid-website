import Link from 'next/link'
import ThemeToggle from '@/components/landing/ThemeToggle'
import Brand from '@/components/Brand'

/**
 * Chrome for the showcase section.
 *
 * Not DocsHeader: that one carries a framework switcher and a chapter search,
 * neither of which means anything here. This is the landing page's header
 * reduced to what a showcase page needs — a way home, a way to the docs, and
 * the theme toggle, because every demo follows the site's theme and a visitor
 * who switches it expects the grid to follow.
 */
export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f4ef] dark:bg-[#09090e] text-[#18181b] dark:text-[#edf0fa] transition-colors duration-300">
      <header className="fixed inset-x-0 top-0 z-40 h-[60px] border-b border-black/[0.08] dark:border-white/[0.07] bg-[#f5f4ef]/85 dark:bg-[#09090e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1320px] items-center gap-5 px-5 md:px-8">
          <Brand />

          <nav className="ml-2 flex items-center gap-1 text-[14px]">
            <Link
              href="/demos"
              className="rounded-lg px-2.5 py-1.5 font-semibold text-[#7c3aed] transition-colors"
            >
              Demos
            </Link>
            <Link
              href="/docs"
              className="rounded-lg px-2.5 py-1.5 text-[#525252] transition-colors hover:text-[#18181b] dark:text-[#7a8399] dark:hover:text-[#edf0fa]"
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className="rounded-lg px-2.5 py-1.5 text-[#525252] transition-colors hover:text-[#18181b] dark:text-[#7a8399] dark:hover:text-[#edf0fa]"
            >
              Playground
            </Link>
          </nav>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="pt-[60px]">{children}</div>
    </div>
  )
}
