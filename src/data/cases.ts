import { getCollection } from 'astro:content';

export const featuredCases = ['legal-company', 'electronics-store', 'sochi-hotels'];

export async function resolveCases(ids: string[], source: string) {
  const catalog = await getCollection('cases');
  return ids.map(id => {
    const entry = catalog.find(item => item.id === id);
    if (!entry) throw new Error(`${source}: неизвестный ID кейса «${id}».`);
    return entry.data;
  });
}
