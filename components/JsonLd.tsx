export default function JsonLd() {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'EliteGrid',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            url: 'https://elitegrid.dev',
            description:
              'EliteGrid is a high-performance TypeScript data grid and table library. Features a grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free to use — see license for terms',
            },
            creator: {
              '@type': 'Organization',
              name: 'EliteGrid',
              url: 'https://elitegrid.dev',
              sameAs: [
                'https://github.com/elitegrid',
                'https://x.com/elitegridhq',
                'https://npmjs.com/package/@elitegrid/react',
              ],
            },
            keywords:
              'typescript data grid, react data grid, vue data grid, grid library, data grid library, react grid library, vue grid library, typescript grid library, elitegrid, elite grid, ag grid alternative, tanstack table alternative, accessible data grid',
            softwareVersion: '0.1.0',
            releaseNotes: 'Public launch — React, Vue, and vanilla JS adapters live on npm.',
            featureList: [
              'Grouped namespaced config API',
              'React and Vue adapters',
              'Full WCAG 2.1 AA accessibility',
              'Zero runtime dependencies',
              'Microkernel plugin architecture',
              'Multi-column sorting',
              'Per-column filtering',
              'Inline cell editing',
              'CSV export',
              'Row selection',
              'Column resize, reorder, and pin',
              'Light, dark, and auto themes',
            ],
            isAccessibleForFree: true,
          }),
        }}
      />
    )
  }