import type { MetadataRoute } from 'next'
import { manuals } from '@/lib/docs'

const BASE_URL = 'https://elitegrid.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/playground`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  const docsRoutes: MetadataRoute.Sitemap = manuals.flatMap((manual) => [
    {
      url: `${BASE_URL}/docs/${manual.framework}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...manual.chapters.map((chapter) => ({
      url: `${BASE_URL}/docs/${manual.framework}/${chapter.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ])

  return [...staticRoutes, ...docsRoutes]
}
