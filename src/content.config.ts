import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, caseSchema, seoSchema } from './content/schema';

export const collections = {
  seo: defineCollection({ loader: glob({ base: './src/content/seo', pattern: '*.md' }), schema: seoSchema }),
  articles: defineCollection({ loader: glob({ base: './src/content/articles', pattern: '*.md' }), schema: articleSchema }),
  cases: defineCollection({ loader: glob({ base: './src/content/cases', pattern: '*.md' }), schema: caseSchema }),
};
