// Serves the built docs site (dist/docs/browser) for the local browser checks.
import { createServer, type Server } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';

export const repo = path.resolve(import.meta.dirname, '../../../..');
export const siteDir = path.join(repo, 'dist/docs/browser');
/** The production build's base href. */
export const BASE = '/cp-theming/';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function serve(): Promise<{ server: Server; origin: string }> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const rel = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : '';
    let file = path.join(siteDir, rel);
    if (!file.startsWith(siteDir) || !existsSync(file) || !path.extname(file)) {
      file = path.join(siteDir, 'index.html'); // SPA fallback
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') throw new Error('no port');
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

/** Stops with a message when there is no production build to serve. */
export function requireBuild(): void {
  if (!existsSync(path.join(siteDir, 'index.html'))) {
    console.error(`No build at ${siteDir}. Run: pnpm build && npx ng build docs`);
    process.exit(2);
  }
}

// Web fonts are not part of the checks and need the network; colours do not depend on them.
export async function blockFonts(page: Page): Promise<void> {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
}
