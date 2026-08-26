import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: ['*.md', '!docs.review.md'],
      base: './docs',
      generateId: ({ entry }) => {
        if (entry === 'README.md') return 'index';
        return entry.replace(/\.md$/, '').toLowerCase();
      },
    }),
    schema: docsSchema(),
  }),
};
