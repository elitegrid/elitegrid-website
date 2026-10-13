import type { Metadata } from 'next'

export const SITE_URL = 'https://elitegrid.dev'
const TWITTER = '@elitegridhq'

/**
 * Title, description, canonical, Open Graph and Twitter card from one call.
 *
 * It exists because four routes — /demos, /demos/[slug], /docs/[framework]
 * and /docs/[framework]/[slug] — each set title + description + canonical and
 * none of them set `openGraph` or `twitter`. Next does not derive those from
 * `title`/`description`, so every docs chapter and every demo shared on social
 * fell back to the root layout's generic card, or to no card at all. Writing
 * the same twelve lines in four places is what let them drift in the first
 * place, so there is one place now.
 *
 * The home page and the playground keep their own hand-written metadata: both
 * say something different in the card than in the <title>, which is a
 * deliberate choice this helper would flatten.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  /** Route path with a leading slash, e.g. `/demos/crypto-market`. */
  path: string
}): Metadata {
  const url = `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'EliteGrid',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: TWITTER,
      creator: TWITTER,
    },
  }
}
