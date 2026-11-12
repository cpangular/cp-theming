// Browser check of the Learn track on the built docs (PORT-PLAN.md Phase 17).
// Local only, not in CI.
//
//   pnpm --filter docs build
//   node demos/docs/test/learn.ts            # chromium
//   node demos/docs/test/learn.ts firefox webkit
//
// For every written chapter, with the site in light and in dark:
//   1. the page has the chapter's title and question, and its five parts in
//      order;
//   2. every live example is rendered: the frame loaded, each of its
//      stylesheets has rules, its <body> has the example's markup, the frame
//      shows all of its content and is in the site's mode;
//   3. the source beside it is the text of the frame's own files;
//   4. every tab of a "Try it" loads its frame and marks the files it swapped;
//   5. every Reference link of the prose leads to a section that exists.
// Chapter 1 also moves its picker and expects the colours worked out from the
// primary to change with it.
// Screenshots go to dist/docs-render/learn/. Exits 1 when an assertion fails.
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType, type Frame, type Page } from 'playwright';
import { CHAPTERS, REFS, frameFiles } from '../src/app/learn/chapters.ts';
import { exampleFiles, exampleFolder } from '../scripts/lib/order.ts';
import { BASE, blockFonts, repo, requireBuild, serve } from './lib/site.ts';

const outDir = path.join(repo, 'dist/docs-render/learn');
const MODES = ['light', 'dark'] as const;
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const PARTS = ['example', 'idea', 'code', 'try-it'];

const failures: string[] = [];
let checks = 0;
function expect(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

/** The frame document of the nth live example on the page, once it has loaded. */
async function frameOf(page: Page, index: number, name: string): Promise<Frame> {
  const iframe = page.locator('iframe.live-frame').nth(index);
  await page.waitForFunction(
    ([i, n]) => {
      const el = document.querySelectorAll<HTMLIFrameElement>('iframe.live-frame')[i as number];
      const doc = el?.contentDocument;
      return (
        !!doc &&
        doc.readyState === 'complete' &&
        doc.location.pathname.endsWith(`/${n}.html`) &&
        el.style.height !== ''
      );
    },
    [index, name] as const,
  );
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error(`no frame ${name}`);
  return frame;
}

interface FrameState {
  sheets: number[];
  links: number;
  elements: number;
  bodyHeight: number;
  mode: string | null;
  scheme: string;
}

function stateOf(frame: Frame): Promise<FrameState> {
  return frame.evaluate(() => ({
    sheets: [...document.styleSheets].map((s) => s.cssRules.length),
    links: document.querySelectorAll('link[rel=stylesheet]').length,
    elements: document.body.querySelectorAll('*').length,
    bodyHeight: document.body.offsetHeight,
    mode: document.documentElement.getAttribute('themeMode'),
    scheme: getComputedStyle(document.documentElement).colorScheme,
  }));
}

async function checkFrame(
  page: Page,
  index: number,
  folder: string,
  name: string,
  mode: string,
  label: string,
): Promise<Frame> {
  const frame = await frameOf(page, index, name);
  const state = await stateOf(frame);
  expect(state.links >= 3, `${label}: the frame links frame.css, core and its theme`);
  expect(
    state.sheets.length === state.links && state.sheets.every((n) => n > 0),
    `${label}: every stylesheet of the frame loaded with rules (${state.sheets.join(', ')})`,
  );
  expect(state.elements > 3, `${label}: the frame's <body> has the example's markup`);
  expect(state.mode === mode, `${label}: the frame is in the site's mode (${state.mode})`);
  expect(state.scheme === mode, `${label}: the frame's color-scheme is ${mode} (${state.scheme})`);

  const height = await page
    .locator('iframe.live-frame')
    .nth(index)
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(
    height >= state.bodyHeight - 1 && height > 60,
    `${label}: the frame is at least as tall as its content (${height} / ${state.bodyHeight})`,
  );

  // The source beside it: one panel per file of the frame, with the file's text.
  const files = exampleFiles(CHAPTERS.find((c) => c.folder === folder)!);
  const use = frameFiles(name, files);
  const block = page.locator('figure.live').nth(index);
  const tabs = (await block.locator('.live-file').allTextContents()).map((t) =>
    squash(t).replace(/ changed$/, ''),
  );
  const wanted = [use.html, ...(use.styles ? [use.styles] : []), use.theme];
  expect(
    tabs.join() === wanted.join(),
    `${label}: the source tabs are the frame's files (${tabs.join(', ')})`,
  );
  for (const file of wanted) {
    await block.locator('.live-file', { hasText: file }).first().click();
    await block.locator('.live-file--active', { hasText: file }).waitFor();
    const shown = squash(await block.locator('.live-pre:not(.live-pre--hidden)').innerText());
    const onDisk = squash(
      readFileSync(path.join(exampleFolder({ folder } as never), file), 'utf8'),
    );
    expect(shown === onDisk, `${label}: ${file} is shown as it is on disk`);
  }
  await block.locator('.live-file').first().click();
  return frame;
}

const colourOf = (frame: Frame, selector: string, property: string) =>
  frame.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)!).getPropertyValue(p), [
    selector,
    property,
  ] as const);

async function run(engine: string): Promise<void> {
  const { server, origin } = await serve();
  const browser = await ENGINES[engine].launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 5200 } });
  await blockFonts(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => {
    if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push(`failed: ${r.url()}`);
  });

  // The home page leads with Learn.
  await page.goto(`${origin}${BASE}`, { waitUntil: 'networkidle' });
  const nav = (await page.locator('.main-nav .nav-link').allTextContents()).map(squash);
  expect(nav.join() === 'Learn,Reference,Explore', `home: the navigation is ${nav.join(', ')}`);
  const firstTrack = squash((await page.locator('.track-title').first().textContent()) ?? '');
  expect(firstTrack === 'Learn', `home: the first section is ${firstTrack}`);
  const cta = await page.locator('.hero-actions a').first().getAttribute('href');
  expect(
    cta === `${BASE}learn/${CHAPTERS[0].slug}`,
    `home: the first button opens chapter 1 (${cta})`,
  );
  await page.screenshot({
    path: path.join(outDir, `${engine}-home.png`),
    clip: { x: 0, y: 0, width: 1500, height: 2300 },
  });

  // The Learn index lists every chapter and links the written ones.
  await page.goto(`${origin}${BASE}learn`, { waitUntil: 'networkidle' });
  const listed = await page.locator('.learn-list li').count();
  const linked = await page.locator('.learn-list a.learn-item').count();
  expect(listed === CHAPTERS.length, `learn: lists ${listed} chapters`);
  expect(linked === CHAPTERS.filter((c) => c.written).length, `learn: links ${linked} chapters`);
  await page.screenshot({
    path: path.join(outDir, `${engine}-learn.png`),
    clip: { x: 0, y: 0, width: 1500, height: 1500 },
  });

  for (const chapter of CHAPTERS.filter((c) => c.written)) {
    for (const mode of MODES) {
      const label = `${engine} ${chapter.folder} ${mode}`;
      await page.goto(`${origin}${BASE}learn/${chapter.slug}`, { waitUntil: 'networkidle' });
      await page.evaluate((m) => document.documentElement.setAttribute('themeMode', m), mode);

      expect(
        squash((await page.locator('.learn h1').textContent()) ?? '') === chapter.title,
        `${label}: the title`,
      );
      expect(
        squash((await page.locator('.learn-question').textContent()) ?? '') === chapter.question,
        `${label}: the question under the title`,
      );
      const parts = await page
        .locator('.learn section.learn-part')
        .evaluateAll((els) => els.map((el) => el.id));
      expect(parts.join() === PARTS.join(), `${label}: the parts are ${parts.join(', ')}`);
      expect(
        (await page.locator('.learn-now').count()) === 1 &&
          squash((await page.locator('.learn-now').innerText()) ?? '').startsWith('You can now'),
        `${label}: the last line is "You can now …"`,
      );

      // Every live example on the page, with the frame each one starts on.
      const blocks = page.locator('figure.live');
      const count = await blocks.count();
      expect(count >= 2, `${label}: an example and a Try it (${count} live examples)`);
      for (let i = 0; i < count; i++) {
        const src = (await blocks.nth(i).locator('iframe').getAttribute('src')) ?? '';
        const name = path.basename(src, '.html');
        await checkFrame(page, i, chapter.folder, name, mode, `${label} #${i} ${name}`);
      }

      await page
        .locator('.page-main')
        .screenshot({ path: path.join(outDir, `${engine}-${chapter.folder}-${mode}.png`) });

      if (chapter.n === 1) {
        const frame = await frameOf(page, 0, 'example');
        const before = {
          given: await colourOf(frame, '.given', 'background-color'),
          text: await colourOf(frame, '.given', 'color'),
          dark: await colourOf(frame, '.dark', 'background-color'),
          soft: await colourOf(frame, '.soft', 'background-color'),
          border: await colourOf(frame, '.border', 'border-top-color'),
          ring: await colourOf(frame, '.ring', 'outline-color'),
        };
        await page.locator('.live-control input').evaluate((el: HTMLInputElement) => {
          el.value = '#ffe14d';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const after = {
          given: await colourOf(frame, '.given', 'background-color'),
          text: await colourOf(frame, '.given', 'color'),
          dark: await colourOf(frame, '.dark', 'background-color'),
          soft: await colourOf(frame, '.soft', 'background-color'),
          border: await colourOf(frame, '.border', 'border-top-color'),
          ring: await colourOf(frame, '.ring', 'outline-color'),
        };
        expect(
          after.given === 'rgb(255, 225, 77)',
          `${label}: the picker sets the primary (${after.given})`,
        );
        for (const key of Object.keys(before) as (keyof typeof before)[])
          expect(before[key] !== after[key], `${label}: the picker moves ${key} (${after[key]})`);
        await blocks.first().screenshot({
          path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-picked.png`),
        });
      }

      // Each tab of every block with tabs.
      for (let i = 0; i < count; i++) {
        const tabs = blocks.nth(i).locator('.live-tab');
        for (let t = 1; t < (await tabs.count()); t++) {
          const was = await blocks.nth(i).locator('iframe').getAttribute('src');
          await tabs.nth(t).click();
          await page.waitForFunction(
            ([n, old]) =>
              document.querySelectorAll('figure.live iframe')[n as number].getAttribute('src') !==
              old,
            [i, was] as const,
          );
          const src = (await blocks.nth(i).locator('iframe').getAttribute('src')) ?? '';
          const name = path.basename(src, '.html');
          await checkFrame(page, i, chapter.folder, name, mode, `${label} #${i} ${name}`);
          const marked = await blocks.nth(i).locator('.live-file .live-changed').count();
          expect(marked > 0, `${label} #${i} ${name}: the swapped files are marked`);
          await blocks.nth(i).screenshot({
            path: path.join(outDir, `${engine}-${chapter.folder}-${mode}-${name}.png`),
          });
        }
      }
    }

    // The Reference links of the prose.
    const links = await page
      .locator('.learn a.learn-ref')
      .evaluateAll((els) =>
        els.map((a) => [a.textContent?.trim() ?? '', a.getAttribute('href') ?? '']),
      );
    expect(links.length > 0, `${engine} ${chapter.folder}: the prose links to the Reference`);
    for (const [name, href] of links) {
      // An attribute may be shown with a value: theme="ocean".
      const ref = REFS.find((r) => r.name === name.replace(/="[^"]*"$/, ''));
      expect(
        !!ref && href === `${BASE}packages/${ref.page}#${ref.anchor}`,
        `${engine} ${chapter.folder}: ${name} links to its Reference entry (${href})`,
      );
    }
  }

  // One Reference link followed all the way: the section is on the page.
  for (const ref of [REFS[0], REFS.find((r) => r.chapter === 5)!]) {
    await page.goto(`${origin}${BASE}packages/${ref.page}#${ref.anchor}`, {
      waitUntil: 'networkidle',
    });
    expect(
      (await page.locator(`[id="${ref.anchor}"]`).count()) === 1,
      `${engine}: ${ref.page}#${ref.anchor} exists (${ref.name})`,
    );
  }

  // Explore holds the gallery and the showcase.
  await page.goto(`${origin}${BASE}explore`, { waitUntil: 'networkidle' });
  expect(
    page.url().endsWith('/explore/components'),
    `${engine}: Explore opens the gallery (${page.url()})`,
  );
  const explore = (await page.locator('.sidenav a[mat-list-item]').allTextContents()).map(squash);
  expect(
    explore.join() === 'Components,Showcase',
    `${engine}: Explore lists ${explore.join(', ')}`,
  );

  expect(errors.length === 0, `${engine}: page errors: ${errors.join('; ')}`);
  await browser.close();
  server.close();
}

requireBuild();
mkdirSync(outDir, { recursive: true });
const engines = process.argv.slice(2).filter((a) => a in ENGINES);
for (const engine of engines.length ? engines : ['chromium']) await run(engine);

console.log(
  `learn: ${checks - failures.length}/${checks} checks passed; screenshots in ${path.relative(repo, outDir)}`,
);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
