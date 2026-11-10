// Rewrites root-absolute URLs in the built output so the site works under the
// GitHub Pages subfolder. Astro's `base` covers the assets it bundles itself;
// this pass catches hardcoded paths in markup (logos, image slots, favicon)
// and runtime fetches in the bundles. URLs already carrying the base are left
// alone.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.PAGES_BASE;
if (!base || base === '/') {
  console.log('PAGES_BASE not set — nothing to rebase');
  process.exit(0);
}
const segment = base.replace(/^\//, '').replace(/\/$/, '');

const root = 'dist';
const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(html|js|css|webmanifest)$/.test(entry.name)) files.push(path);
  }
};
walk(root);

const attr = new RegExp(`((?:src|href|poster|data-src)=["'])/(?!/|${segment}/)`, 'g');
const fetchCall = new RegExp('(fetch\\()(["\'`])/(?!' + segment + '/)', 'g');
const cssUrl = new RegExp(`(url\\()(["']?)/(?!/|${segment}/|data:)`, 'g');

let touched = 0;
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  let out = source;
  out = out.replace(attr, `$1${base}/`);
  out = out.replace(fetchCall, `$1$2${base}/`);
  out = out.replace(cssUrl, `url($2${base}/`);
  if (out !== source) {
    writeFileSync(file, out);
    touched += 1;
  }
}
console.log(`rebased ${touched} of ${files.length} files to ${base}`);
