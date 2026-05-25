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
              'High-performance TypeScript data grid with grouped config API, React & Vue adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Community version — free and open source',
            },
            creator: {
              '@type': 'Organization',
              name: 'EliteGrid',
              url: 'https://elitegrid.dev',
              sameAs: [
                'https://github.com/elitegrid',
                'https://x.com/elitegridhq',
                'https://npmjs.com/package/@elitegrid/core',
              ],
            },
            keywords:
              'typescript data grid, react data grid, vue data grid, ag grid alternative, tanstack table alternative, accessible data grid',
            softwareVersion: '0.1.0',
            releaseNotes: 'Pre-launch — core engine complete, React and Vue adapters in development.',
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
            license: 'https://opensource.org/licenses/MIT',
          }),
        }}
      />
    )
  }