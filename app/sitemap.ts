import type { MetadataRoute } from 'next'
import { manuals } from '@/lib/docs'
import { DEMOS } from '@/lib/demos/meta'
import { DEMO_SOURCES } from '@/lib/demos/sources'

const BASE_URL = 'https://elitegrid.dev'

// No `lastModified` anywhere below. It used to be `new Date()`, so every
// page in the sitemap claimed it had changed at the moment of the last
// deploy — including docs chapters untouched for months. A lastmod that is
// wrong on every URL is worse than none: crawlers learn to ignore the
// field, and it is the one signal that tells them what to recrawl first.
// Wire it to real content dates (file mtime, or a date in the manual
// metadata) if it is wanted back.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/demos`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/playground`, changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Only demos that have a source get a route — a planned tile would 404.
  const demoRoutes: MetadataRoute.Sitemap = DEMOS.filter(
    (d) => DEMO_SOURCES[d.slug],
  ).map((d) => ({
    url: `${BASE_URL}/demos/${d.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const docsRoutes: MetadataRoute.Sitemap = manuals.flatMap((manual) => [
    {
      url: `${BASE_URL}/docs/${manual.framework}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...manual.chapters.map((chapter) => ({
      url: `${BASE_URL}/docs/${manual.framework}/${chapter.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ])

  return [...staticRoutes, ...demoRoutes, ...docsRoutes]
}
