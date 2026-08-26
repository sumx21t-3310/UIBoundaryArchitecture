import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

const repository = 'https://github.com/sumx21t-3310/UIBoundaryArchitecture';

export default defineConfig({
  site: 'https://ui-boundary-architecture.sumx21t.com',
  integrations: [
    starlight({
      title: 'UI Boundary Architecture',
      description: '責務と状態所有の境界によってUIを分割する設計手法',
      plugins: [starlightLlmsTxt()],
      locales: {
        root: {
          label: '日本語',
          lang: 'ja',
        },
      },
      social: [{ icon: 'github', label: 'GitHub', href: repository }],
      editLink: {
        baseUrl: `${repository}/edit/main/`,
      },
      lastUpdated: true,
      sidebar: [
        { slug: 'index' },
        { slug: '01-boundaries' },
        { slug: '02-stateownership' },
        { slug: '03-structure' },
        { slug: '04-responsivedesign' },
        { slug: '05-comparison' },
        { slug: '06-adoption' },
        { slug: '07-projectlayout' },
        { slug: '08-classification' },
      ],
      markdown: {
        processedDirs: ['./docs'],
      },
    }),
  ],
});
