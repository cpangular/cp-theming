// Small, dependency-free readers for the compiled CSS the harness checks.
// They assume Sass's expanded output (one declaration per line, no minification),
// which is what every build command and the harness itself produce.

export interface Rule {
  selector: string;
  /** Enclosing conditional at-rules, outermost first, e.g. ['@media (prefers-color-scheme: dark)']. */
  context: string[];
  declarations: [name: string, value: string][];
}

export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Names registered with `@property`, in document order (duplicates kept). */
export function registeredProperties(css: string): string[] {
  return [...stripComments(css).matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]);
}

/**
 * Every style rule with its declarations. Nested conditional at-rules (@media,
 * @supports, @layer) are descended into; `@property` and other at-rules with
 * declaration bodies are skipped.
 */
export function rules(css: string): Rule[] {
  const text = stripComments(css);
  const out: Rule[] = [];
  const context: string[] = [];
  let i = 0;
  let prelude = '';
  const stack: ('conditional' | 'skip' | 'style')[] = [];

  const flushDeclarations = (body: string): [string, string][] => {
    const decls: [string, string][] = [];
    let depth = 0;
    let current = '';
    const push = () => {
      const colon = current.indexOf(':');
      if (colon > 0) decls.push([current.slice(0, colon).trim(), current.slice(colon + 1).trim()]);
      current = '';
    };
    for (const ch of body) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ';' && depth === 0) push();
      else current += ch;
    }
    if (current.trim()) push();
    return decls;
  };

  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      const head = prelude.trim();
      prelude = '';
      if (head.startsWith('@')) {
        if (/^@(media|supports|layer|container|scope)\b/.test(head)) {
          context.push(head);
          stack.push('conditional');
        } else {
          // @property, @font-face, @keyframes …: skip the whole block.
          let depth = 1;
          i++;
          while (i < text.length && depth > 0) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') depth--;
            i++;
          }
          continue;
        }
      } else {
        // A style rule: its body runs to the matching brace (Sass never nests).
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
          if (text[j] === '{') depth++;
          else if (text[j] === '}') depth--;
          j++;
        }
        out.push({
          selector: head.replace(/\s+/g, ' '),
          context: [...context],
          declarations: flushDeclarations(text.slice(i + 1, j - 1)),
        });
        i = j;
        continue;
      }
    } else if (ch === '}') {
      if (stack.pop() === 'conditional') context.pop();
      prelude = '';
    } else {
      prelude += ch;
    }
    i++;
  }
  return out;
}

/** Names of every custom property declared anywhere in the CSS. */
export function declaredCustomProperties(css: string): Set<string> {
  const names = new Set<string>();
  for (const rule of rules(css))
    for (const [name] of rule.declarations) if (name.startsWith('--')) names.add(name);
  return names;
}

export interface VarRead {
  name: string;
  hasFallback: boolean;
}

/** Every `var(--x[, fallback])` read, including reads nested inside fallbacks. */
export function varReads(css: string): VarRead[] {
  const text = stripComments(css);
  const reads: VarRead[] = [];
  const re = /var\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    let depth = 1;
    let j = m.index + 4;
    let topComma = -1;
    while (j < text.length && depth > 0) {
      const c = text[j];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 1 && topComma < 0) topComma = j;
      j++;
    }
    const inner = text.slice(m.index + 4, j - 1);
    const name = (topComma < 0 ? inner : text.slice(m.index + 4, topComma)).trim();
    if (name.startsWith('--')) reads.push({ name, hasFallback: topComma >= 0 });
  }
  return reads;
}

/**
 * Custom properties read without a fallback that no stylesheet in the set
 * declares or registers. Sorted, unique.
 */
export function undefinedReads(cssSet: string[]): string[] {
  const declared = new Set<string>();
  for (const css of cssSet) {
    for (const n of declaredCustomProperties(css)) declared.add(n);
    for (const n of registeredProperties(css)) declared.add(n);
  }
  const missing = new Set<string>();
  for (const css of cssSet)
    for (const r of varReads(css)) if (!r.hasFallback && !declared.has(r.name)) missing.add(r.name);
  return [...missing].sort();
}

/** Sass drops the quotes of attribute values that do not need them; compare without. */
export function normalizeSelector(selector: string): string {
  return selector
    .replace(/\s+/g, ' ')
    .replace(/=["']([^"'\]]*)["']\]/g, '=$1]')
    .trim();
}

/**
 * The declarations of every top-level (no @media) rule whose selector list
 * includes `selector`, merged in order so later declarations win.
 */
export function declarationsFor(css: string, selector: string): Map<string, string> {
  const map = new Map<string, string>();
  const wanted = normalizeSelector(selector);
  for (const rule of rules(css)) {
    if (rule.context.length) continue;
    const parts = rule.selector.split(',').map((s) => normalizeSelector(s));
    if (!parts.includes(wanted)) continue;
    for (const [n, v] of rule.declarations) map.set(n, v);
  }
  return map;
}
