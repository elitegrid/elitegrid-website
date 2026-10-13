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
              'EliteGrid is a high-performance TypeScript data grid and table library. Row grouping with aggregation, column virtualization, cell editors, clipboard copy, detail rows and localization — with a grouped config API, React, Vue and vanilla JS adapters, full WCAG 2.1 AA accessibility, and zero dependencies.',
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
              'typescript data grid, react data grid, vue data grid, grid library, data grid library, react grid library, vue grid library, typescript grid library, elitegrid, elite grid, accessible data grid',
            softwareVersion: '0.2.0',
            releaseNotes: 'React, Vue, and vanilla JS adapters live on npm. 0.2.0 adds modular registration — features arrive as modules you import, so a grid only ships what it registers — plus row grouping with aggregation, column virtualization, cell editors, the set filter, detail rows, clipboard copy, saved state and localization.',
            featureList: [
              'Grouped namespaced config API',
              'React, Vue, and vanilla JS adapters',
              'Full WCAG 2.1 AA accessibility',
              'Zero runtime dependencies',
              'Microkernel plugin architecture with modular registration',
              'Multi-column sorting',
              'Per-column filtering',
              'Set filter and floating filters',
              'Global quick search',
              'Row grouping with aggregation',
              'Inline cell editing with async validation',
              'Custom cell and header renderers',
              'Column virtualization',
              'Column and context menus',
              'Clipboard copy',
              'CSV export',
              'Row selection',
              'Pinned top and bottom rows',
              'Multi-level column groups',
              'Detail rows and row drag',
              'Infinite scroll and batch transaction updates',
              'Grid state save and restore',
              'Localization',
              'Column resize, reorder, and pin',
              'Light, dark, and auto themes',
            ],
            isAccessibleForFree: true,
          }),
        }}
      />
    )
  }