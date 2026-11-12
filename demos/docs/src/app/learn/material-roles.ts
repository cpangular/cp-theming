// Where a Material component's colours come from, read out of the stylesheets
// the page is running (Learn chapter 10). Nothing here is a table kept by
// hand: the component's own rule says which --mat-sys-* variable it reads, and
// the adapter's rule says what that variable is declared as.
//
// This is a device of the docs. It reads the page; it changes nothing.

/** One declaration, with the selector of its rule and its place in the cascade. */
interface Declared {
  selector: string;
  value: string;
  order: number;
}

/** One painted part of a component and the chain of variables behind it. */
export interface RoleLine {
  /** `Fill` or `Text`. */
  part: string;
  /** The Material variable the component reads: `--mat-sys-primary`. */
  role: string;
  /** The cp-theming variables that role is declared from. */
  tokens: string[];
  /** The role's declaration, as the adapter wrote it. */
  declaration: string;
  /** The element the role is declared on, as the HTML names it: `theme="ember"`. */
  scope: string;
  /** A component variable the adapter's patches set in between, if any. */
  patch?: string;
}

const PAINTED: [part: string, properties: string[]][] = [
  ['Fill', ['background-color', 'background']],
  ['Text', ['color']],
];

let index: Map<string, Declared[]> | undefined;
let indexedSheets = -1;

/** Every declaration that names a Material variable, by property. */
function declarations(doc: Document): Map<string, Declared[]> {
  // Angular adds a component's stylesheet when the component first renders.
  if (index && indexedSheets === doc.styleSheets.length) return index;
  const found = new Map<string, Declared[]>();
  let order = 0;
  const add = (property: string, selector: string, value: string) => {
    const list = found.get(property) ?? [];
    list.push({ selector, value: value.trim(), order: order++ });
    found.set(property, list);
  };
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const style = (rule as Partial<CSSStyleRule>).style;
      const selector = (rule as Partial<CSSStyleRule>).selectorText;
      if (style && typeof selector === 'string') {
        for (let i = 0; i < style.length; i++)
          if (style[i].startsWith('--mat-'))
            add(style[i], selector, style.getPropertyValue(style[i]));
        for (const [, properties] of PAINTED)
          for (const property of properties) {
            const value = style.getPropertyValue(property);
            if (value.includes('--mat-')) add(property, selector, value);
          }
      }
      const nested = (rule as Partial<CSSGroupingRule>).cssRules;
      if (nested) walk(nested);
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A stylesheet from another site (the web fonts): not readable, not needed.
    }
  }
  index = found;
  indexedSheets = doc.styleSheets.length;
  return found;
}

/** Top-level, comma-separated parts of a selector list. */
function parts(selector: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      out.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  out.push(selector.slice(start));
  return out.map((part) => part.trim()).filter(Boolean);
}

/** Near enough to a selector's specificity to order the rules that match one element. */
function specificity(selector: string): number {
  const counted = selector.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
  const ids = counted.match(/#[\w-]+/g)?.length ?? 0;
  const classes =
    counted.match(/\.[\w-]+|\[[^\]]*\]|(?<!:):(?!not\(|is\(|where\(|has\()[\w-]+/g)?.length ?? 0;
  const types = counted.match(/(?:^|[\s>+~(])[a-zA-Z][\w-]*|::[\w-]+/g)?.length ?? 0;
  return ids * 10000 + classes * 100 + types;
}

/** The declaration that wins on `el` among those given, or undefined. */
function winner(el: Element, declared: Declared[] | undefined): Declared | undefined {
  let best: Declared | undefined;
  let bestWeight = -1;
  for (const d of declared ?? []) {
    let weight = -1;
    for (const part of parts(d.selector)) {
      try {
        if (el.matches(part)) weight = Math.max(weight, specificity(part));
      } catch {
        // A selector this browser does not know.
      }
    }
    if (weight < 0) continue;
    if (weight > bestWeight || (weight === bestWeight && d.order > (best?.order ?? -1))) {
      best = d;
      bestWeight = weight;
    }
  }
  return best;
}

/** A custom property's declaration: on `el`, or on the nearest element around it that has one. */
function inherited(
  el: Element,
  name: string,
  all: Map<string, Declared[]>,
): { declared: Declared; on: Element } | undefined {
  for (let e: Element | null = el; e; e = e.parentElement) {
    const declared = winner(e, all.get(name));
    if (declared) return { declared, on: e };
  }
  return undefined;
}

const scopeOf = (on: Element, selector: string): string => {
  const palette = on.getAttribute('palette');
  if (palette && selector.includes('palette')) return `palette="${palette}"`;
  const theme = on.getAttribute('theme');
  if (theme) return `theme="${theme}"`;
  return on === on.ownerDocument.documentElement ? 'the page' : on.localName;
};

const unique = (names: string[]) => [...new Set(names)];

/**
 * The fill and the text of a Material component, each traced from the rule
 * that paints it to the cp-theming variables behind it. Empty when the element
 * paints neither through a Material variable.
 */
export function rolesOf(el: Element): RoleLine[] {
  const all = declarations(el.ownerDocument);
  const view = el.ownerDocument.defaultView;
  const lines: RoleLine[] = [];
  for (const [part, properties] of PAINTED) {
    if (part === 'Fill') {
      const painted = view?.getComputedStyle(el).backgroundColor ?? '';
      if (/^(?:transparent|rgba\(0, 0, 0, 0\))$/.test(painted)) continue;
    }
    const rule = properties.map((p) => winner(el, all.get(p))).find(Boolean);
    if (!rule) continue;

    // The component reads its own variable first and falls back to a role.
    let reads = rule.value;
    let patch: string | undefined;
    const own = /--mat-(?!sys-)[\w-]+/.exec(reads)?.[0];
    const patched = own ? inherited(el, own, all) : undefined;
    if (own && patched) {
      patch = own;
      reads = patched.declared.value;
    }
    const role = /--mat-sys-[\w-]+/.exec(reads)?.[0];
    if (!role) continue;
    const source = inherited(el, role, all);
    if (!source) continue;
    lines.push({
      part,
      role,
      tokens: unique(source.declared.value.match(/--(?:color|palette-color)--?[\w-]*/g) ?? []),
      declaration: source.declared.value.replace(/\s+/g, ' '),
      scope: scopeOf(source.on, source.declared.selector),
      ...(patch ? { patch } : {}),
    });
  }
  return lines;
}
