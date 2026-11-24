import { access, readFile, writeFile } from 'node:fs/promises';

// The exported image-slot runtime resolves its state file against the page URL.
// Nested pages start with their authored images; keep any supplied state intact.
export function imageSlotState() {
  const filename = '.image-slots.state.json';
  return {
    name: 'image-slot-state',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (request, response, next) => {
          const path = request.url?.split('?')[0];
          if (!path?.endsWith('/' + filename) || path === '/' + filename) return next();
          try {
            await access(new URL('../public' + path, import.meta.url));
            return next();
          } catch {
            response.setHeader('Content-Type', 'application/json');
            response.end('{}');
          }
        });
      },
      'astro:build:done': async ({ pages, dir }) => {
        for (const { pathname } of pages) {
          const folder = new URL('./' + pathname.replace(/^\/+|\/+$/g, '') + '/', dir);
          const html = await readFile(new URL('index.html', folder), 'utf8');
          if (!html.includes('<image-slot')) continue;
          try {
            await writeFile(new URL(filename, folder), '{}\n', { flag: 'wx' });
          } catch (error) {
            if (error.code !== 'EEXIST') throw error;
          }
        }
      },
    },
  };
}
