import { defineConfig } from 'astro/config';

// PAGES_BASE is set when building for GitHub Pages, where the site lives in a
// subfolder (/prostor-2026-codex/); local builds keep the root path.
export default defineConfig({
  output: 'static',
  base: process.env.PAGES_BASE ?? '/',
});
