import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const link = z.strictObject({ label: text, href: text });
const photo = z.strictObject({ src: text, alt: text });
const heading = { heading: text, description: text };

export const caseSchema = z.strictObject({
  title: text, description: text, image: text, placeholder: text, slotId: text,
  label: text, sector: text, value: z.number(), metric: text, href: text,
});
export type CaseCard = z.infer<typeof caseSchema>;

export const blockSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('hero'), ...heading, accent: text.optional(),
    primaryCTA: link, secondaryCTA: link.optional(),
  }),
  z.strictObject({
    type: z.literal('cases'), heading: text, caseIds: z.array(text).min(1),
    cta: link.optional(),
  }),
  z.strictObject({
    type: z.literal('faq'), ...heading, cta: link.optional(),
    items: z.array(z.strictObject({ question: text, answer: text })).min(1),
  }),
  z.strictObject({
    type: z.literal('tasks'), ...heading, photo,
    caption: text.optional(), cta: link.optional(),
    items: z.array(z.strictObject({ title: text, description: text })).min(1),
  }),
  z.strictObject({
    type: z.literal('contacts'), ...heading, submitLabel: text.optional(),
    brief: z.strictObject({ ...heading, secondLine: text.optional(), cta: link }).optional(),
  }),
]);
export type ContentBlock = z.infer<typeof blockSchema>;

const metadata = { title: text, description: text, noindex: z.boolean().default(false) };
// Both the hero and the contacts block contain page-wide navigation.
const blocks = z.array(blockSchema).superRefine((items, ctx) => {
  for (const type of ['hero', 'contacts']) {
    if (items.filter(item => item.type === type).length > 1) {
      ctx.addIssue({ code: 'custom', message: `Блок «${type}» может появиться на странице один раз.` });
    }
  }
});
export const seoSchema = z.strictObject({ ...metadata, blocks: blocks.refine(items => items.length > 0, 'Добавьте хотя бы один блок страницы.') });
export const articleSchema = z.strictObject({
  ...metadata, cover: photo.optional(), blocks: blocks.refine(items => items.every(item => item.type !== 'hero'), 'Заголовок статьи задаётся полем title.').default([]),
});
