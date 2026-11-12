// Finishes the built docs site (dist/docs/browser), after `ng build docs`:
//
//   demos/demo-core/   demo-core's Vite build, copied as it is. It is built with
//                      a relative `base`, so it works from this folder wherever
//                      the site is served.
//   404.html           a copy of index.html: GitHub Pages serves it for a path
//                      it has no file for, which is every deep link into the app.
//
// Run by the docs `build` script; the demo is built first (a wireit dependency).
import { cpSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '../../..');
const site = path.join(repo, 'dist/docs/browser');
const demo = path.join(repo, 'demos/demo-core/dist');

function need(file: string, hint: string): void {
  if (!existsSync(file)) {
    console.error(`assemble: ${path.relative(repo, file)} is missing (${hint})`);
    process.exit(1);
  }
}

need(path.join(site, 'index.html'), 'run `ng build docs` first');
need(path.join(demo, 'index.html'), 'run `pnpm --filter demo-core build` first');

const target = path.join(site, 'demos/demo-core');
rmSync(target, { recursive: true, force: true });
cpSync(demo, target, { recursive: true });
copyFileSync(path.join(site, 'index.html'), path.join(site, '404.html'));

console.log(`assemble: demos/demo-core/ and 404.html written to ${path.relative(repo, site)}`);
