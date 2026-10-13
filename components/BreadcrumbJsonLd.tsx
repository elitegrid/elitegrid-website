import { SITE_URL } from '@/lib/seo'

/**
 * BreadcrumbList structured data.
 *
 * The docs chapters and the demo pages already draw a breadcrumb trail, but
 * only as markup a crawler has to guess at. This states it, which is what
 * turns "elitegrid.dev › docs › react › sorting" into the trail Google shows
 * under a result instead of a bare URL.
 *
 * `path` is relative to the site root, with a leading slash.
 */
export default function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[]
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
          })),
        }),
      }}
    />
  )
}
