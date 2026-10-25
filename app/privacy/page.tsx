import type { Metadata } from 'next'
import Link from 'next/link'
import Brand from '@/components/Brand'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy — EliteGrid',
  description:
    'What elitegrid.dev collects, why, and how to have it deleted. Analytics only with consent, no advertising, no selling of data.',
  path: '/privacy',
})

const UPDATED = '25 October 2026'

/**
 * Deliberately plain: no hero, no reveal animations, no chrome beyond a way
 * home. Someone reading this is checking a fact, not being sold to.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#18181b] transition-colors duration-300 dark:bg-[#09090e] dark:text-[#edf0fa]">
      <div className="mx-auto max-w-[720px] px-5 py-10 md:px-8 md:py-14">
        <div className="mb-10">
          <Brand href="/" />
        </div>

        <h1 className="mb-3 font-heading text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em]">
          Privacy
        </h1>
        <p className="mb-10 text-[13px] text-[#a3a3a3] dark:text-[#374151]">
          Last updated {UPDATED}
        </p>

        <Prose>
          <P>
            EliteGrid is an open-source data grid library. This page covers the
            website at elitegrid.dev. The library itself sends nothing anywhere
            — it runs entirely in your browser and makes no network calls of
            its own.
          </P>

          <H>The short version</H>
          <P>
            We collect as little as we can get away with. Analytics run only if
            you accept them. We do not run advertising, we do not build
            profiles, and we do not sell or share your data with anyone.
          </P>

          <H>Analytics</H>
          <P>
            We use <Ext href="https://posthog.com">PostHog</Ext> to understand
            which pages are useful and where people get stuck. Our PostHog
            project is hosted in the European Union, and your data stays there.
          </P>
          <P>
            Nothing is recorded until you choose from the consent banner.
          </P>
          <P>
            <B>If you accept</B>, we record the pages you visit, where you
            arrived from, your browser and device type, your country, clicks on
            page elements, and a recording of how you move through the site.
            An identifier is stored in your browser so repeat visits can be
            recognised.
          </P>
          <P>
            <B>If you reject</B>, your visit is still counted, but anonymously.
            Nothing is stored on your device, no identifier is created, your IP
            address is discarded before it can be used to work out your
            location, and no recording is made. We learn that a page was viewed
            and nothing about who viewed it.
          </P>
          <P>
            Analytics data is deleted after one year.{' '}
            <Link href="#cookies" className="text-[#7c3aed] underline underline-offset-2">
              Change your choice
            </Link>{' '}
            at any time.
          </P>

          <H>If you join the waitlist</H>
          <P>
            We store your email address so we can tell you when EliteGrid
            launches, and we send you a confirmation email. That is the only
            thing it is used for. It is kept until you ask us to remove it.
          </P>

          <H>If you send feedback</H>
          <P>
            The feedback form stores the name, email address and message you
            type, so we can read the report and reply to it. If you leave the
            name and email blank, we keep only the message.
          </P>

          <H>Who else sees it</H>
          <P>
            Three services process data on our behalf, and none of them use it
            for their own purposes:{' '}
            <Ext href="https://posthog.com">PostHog</Ext> for analytics,{' '}
            <Ext href="https://supabase.com">Supabase</Ext> for storing waitlist
            and feedback entries, and{' '}
            <Ext href="https://resend.com">Resend</Ext> for sending email. The
            site is hosted by <Ext href="https://vercel.com">Vercel</Ext>, whose
            servers log requests as part of running the site.
          </P>

          <H>Your rights</H>
          <P>
            You can ask us for a copy of what we hold about you, ask for it to
            be corrected, or ask for it to be deleted. Email{' '}
            <a
              href="mailto:hello@elitegrid.dev"
              className="text-[#7c3aed] underline underline-offset-2"
            >
              hello@elitegrid.dev
            </a>{' '}
            and we will act on it. You do not need to give a reason.
          </P>
          <P>
            If you are in the EU or UK and think we have handled your data
            badly, you can complain to your national data protection authority.
          </P>

          <H>Changes</H>
          <P>
            If this page changes in a way that affects what we collect, we will
            update the date at the top and ask for your consent again.
          </P>
        </Prose>

        <div className="mt-12 border-t border-black/[0.09] pt-6 dark:border-white/[0.07]">
          <Link
            href="/"
            className="text-[13px] text-[#a3a3a3] transition-colors hover:text-[#525252] dark:text-[#374151] dark:hover:text-[#7a8399]"
          >
            ← Back to EliteGrid
          </Link>
        </div>
      </div>
    </main>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] leading-[1.75]">{children}</div>
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-9 font-heading text-[19px] font-bold tracking-[-0.01em]">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[#525252] dark:text-[#7a8399]">{children}</p>
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#18181b] dark:text-[#edf0fa]">{children}</strong>
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#7c3aed] underline underline-offset-2"
    >
      {children}
    </a>
  )
}
