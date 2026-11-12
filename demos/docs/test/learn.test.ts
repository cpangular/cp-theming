// The Learn track's order check (PORT-PLAN.md, Phase 17), as a test. The docs
// build runs the same check (scripts/learn.ts) and stops on a violation.
//
// A chapter uses only what the chapters before it introduced: its example
// files and its prose match no pattern of a later chapter (PATTERNS), and its
// prose names only Reference entries taught so far (REFS), each through
// <cpa-ref>, which links it. The tables are in src/app/learn/chapters.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS,
  PATTERNS,
  REFS,
  frameFiles,
  frameNames,
  nestedTheme,
} from '../src/app/learn/chapters.ts';
import {
  SLOTS,
  checkExample,
  checkLearn,
  checkProse,
  checkRefs,
  checkShape,
  templateOf,
} from '../scripts/lib/order.ts';

test('the Learn track as written passes the order check', () => {
  assert.deepEqual(checkLearn(), []);
});

test('every Reference entry a chapter may name links to a section that has it', () => {
  assert.ok(REFS.length > 0);
  assert.deepEqual(checkRefs(), []);
});

test('the chapter list is numbered in order and every pattern names a chapter', () => {
  assert.deepEqual(
    CHAPTERS.map((c) => c.n),
    CHAPTERS.map((_, i) => i + 1),
  );
  assert.equal(new Set(CHAPTERS.map((c) => c.slug)).size, CHAPTERS.length, 'slugs are unique');
  for (const p of PATTERNS)
    assert.ok(p.chapter >= 2 && p.chapter <= CHAPTERS.length, `${p.what}: chapter ${p.chapter}`);
});

// ── The check refuses what it should ─────────────────────────────────────────

test('an example that uses a later chapter is refused', () => {
  const cases: [number, string, string, number][] = [
    [1, 'a.html', '<div theme="x" themeMode="dark"></div>', 2],
    [1, 'a.scss', '.a { color: var(--color--primary--high); }', 2],
    [1, 'theme.scss', '$t: t.theme($palettes: (primary: t.light-dark(t.palette(red))));', 2],
    [2, 'theme.scss', '$t: t.theme($brand: red);', 3],
    [2, 'a.scss', '.a { color: var(--color--surface); }', 3],
    [3, 'a.scss', '.a { background: var(--color--primary--tint-2); }', 4],
    [4, 'a.html', '<span palette="primary">x</span>', 5],
    [4, 'a.html', '<span class="x" filled>x</span>', 5],
    [4, 'a.scss', '.a { @include t.bg(); }', 5],
    [4, 'a.scss', '.a { color: var(--palette-color); }', 5],
    [5, 'theme.scss', '@include t.define-theme("x", $t, $default: true);', 6],
    [5, 'a.scss', '.a { padding: var(--space--lg); }', 8],
    [5, 'a.html', '<div palette="primary" bg container></div>', 8],
    [5, 'a.html', '<script>setTheme("x")</script>', 9],
    [5, 'a.html', '<mat-card></mat-card>', 10],
  ];
  for (const [n, file, text, later] of cases) {
    const found = checkExample(n, file, text);
    assert.ok(
      found.some((v) => v.includes(`chapter ${later} introduces`)),
      `chapter ${n}: ${text}`,
    );
    // …and the chapter that introduces it may use it.
    assert.deepEqual(
      checkExample(later, file, text).filter((v) => v.includes(`chapter ${later} `)),
      [],
      `chapter ${later}: ${text}`,
    );
  }
});

test('a nested theme= element is refused before chapter 6', () => {
  const nested = '<div theme="a"><p>x</p><section theme="b"></section></div>';
  const siblings = '<div theme="a"><p>x</p></div>\n<div theme="b"></div>';
  assert.ok(nestedTheme(nested));
  assert.ok(!nestedTheme(siblings));
  assert.ok(!nestedTheme('<div theme="a"><hr><input></div><div theme="b"></div>'));
  assert.equal(checkExample(5, 'a.html', nested).length, 1);
  assert.deepEqual(checkExample(6, 'a.html', nested), []);
  assert.deepEqual(checkExample(1, 'a.html', siblings), []);
});

test('an example that stays inside its chapter is accepted', () => {
  assert.deepEqual(checkExample(1, 'a.scss', '.a { color: var(--color--primary--dark); }'), []);
  assert.deepEqual(checkExample(1, 'a.html', '<div theme="ocean" class="filled"></div>'), []);
  assert.deepEqual(checkExample(2, 'a.html', '<div class="background surface"></div>'), []);
});

test('prose that names a Reference entry before its chapter is refused', () => {
  const early = '<p>Use <cpa-ref name="t.light-dark()" /> here.</p>';
  assert.ok(checkProse(1, 'p', early).some((v) => v.includes('chapter 2 introduces')));
  assert.deepEqual(checkProse(2, 'p', early), []);
  // A later chapter's word in plain text is caught by the patterns.
  assert.ok(checkProse(1, 'p', '<p>Set themeMode on it.</p>').some((v) => v.includes('themeMode')));
});

test('prose names library entries through cpa-ref only', () => {
  assert.ok(
    checkProse(5, 'p', '<p><code>t.palette()</code></p>').some((v) => v.includes('cpa-ref')),
  );
  assert.ok(
    checkProse(5, 'p', '<p><code>--color--primary</code></p>').some((v) => v.includes('cpa-ref')),
  );
  assert.ok(checkProse(5, 'p', '<p><code>$palettes</code></p>').some((v) => v.includes('cpa-ref')));
  assert.ok(
    checkProse(5, 'p', '<p><cpa-ref name="t.made-up()" /></p>').some((v) => v.includes('REFS')),
  );
  assert.deepEqual(checkProse(5, 'p', '<p><code>#2f6fde</code> and <code>rgb()</code></p>'), []);
});

test('a chapter page without one of its parts is refused', () => {
  const page = (slots: string[]) =>
    slots
      .map((s) =>
        s === 'chapterExample' || s === 'chapterTry'
          ? `<div ${s}><cpa-live-example /></div>`
          : s === 'chapterCode'
            ? `<div ${s}><cpa-code /></div>`
            : `<div ${s}>text</div>`,
      )
      .join('\n');
  assert.deepEqual(checkShape('p', page(SLOTS)), []);
  for (const missing of SLOTS)
    assert.ok(checkShape('p', page(SLOTS.filter((s) => s !== missing))).length > 0, missing);
  assert.ok(checkShape('p', page([...SLOTS].reverse())).length > 0, 'out of order');
  assert.ok(checkShape('p', `${page(SLOTS)}<table></table>`).length > 0, 'an API table');
});

test('the template of a page is read out of its source', () => {
  assert.equal(templateOf('@Component({ template: `<p>a \\` b</p>`, })'), '<p>a \\` b</p>');
});

// ── Frames ───────────────────────────────────────────────────────────────────

test('a frame is the example with the files of its own name swapped in', () => {
  const files = [
    'example.html',
    'example.scss',
    'theme.scss',
    'try-a.theme.scss',
    'try-b.html',
    'try-b.scss',
  ];
  assert.deepEqual(frameNames(files), ['example', 'try-a', 'try-b']);
  assert.deepEqual(frameFiles('example', files), {
    theme: 'theme.scss',
    html: 'example.html',
    styles: 'example.scss',
  });
  assert.deepEqual(frameFiles('try-a', files), {
    theme: 'try-a.theme.scss',
    html: 'example.html',
    styles: 'example.scss',
  });
  assert.deepEqual(frameFiles('try-b', files), {
    theme: 'theme.scss',
    html: 'try-b.html',
    styles: 'try-b.scss',
  });
  assert.deepEqual(frameFiles('example', ['example.html', 'theme.scss']), {
    theme: 'theme.scss',
    html: 'example.html',
  });
});
