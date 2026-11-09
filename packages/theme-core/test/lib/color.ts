// Evaluates the colour expressions the library emits — light-dark(), var(),
// absolute colours and CSS relative colour syntax (`oklch(from … l c h)`,
// `color(from … srgb-linear r g b)`) — with colorjs.io doing the colour maths.
// It reads the derivation rules from the compiled CSS instead of restating them,
// so a check written against it follows whatever the Sass actually emits.
import Color from 'colorjs.io';

export type Mode = 'light' | 'dark';

export interface EvalContext {
  mode: Mode;
  /** Declared value of a custom property, or undefined when it is not declared. */
  lookup: (name: string) => string | undefined;
}

interface Token {
  type: 'ident' | 'number' | 'punct' | 'hash';
  text: string;
  start: number;
  end: number;
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const prev = tokens[tokens.length - 1];
    const operandBefore =
      prev &&
      (prev.type === 'number' ||
        prev.type === 'ident' ||
        prev.type === 'hash' ||
        prev.text === ')');
    if (
      /[0-9.]/.test(ch) ||
      ((ch === '-' || ch === '+') && /[0-9.]/.test(src[i + 1] ?? '') && !operandBefore)
    ) {
      const m = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?(%|[a-z]+)?/i.exec(src.slice(i))!;
      tokens.push({ type: 'number', text: m[0], start: i, end: i + m[0].length });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_-]/.test(ch)) {
      const m = /^[A-Za-z_-][\w-]*/.exec(src.slice(i))!;
      tokens.push({ type: 'ident', text: m[0], start: i, end: i + m[0].length });
      i += m[0].length;
      continue;
    }
    if (ch === '#') {
      const m = /^#[0-9a-fA-F]+/.exec(src.slice(i))!;
      tokens.push({ type: 'hash', text: m[0], start: i, end: i + m[0].length });
      i += m[0].length;
      continue;
    }
    tokens.push({ type: 'punct', text: ch, start: i, end: i + 1 });
    i++;
  }
  return tokens;
}

// Channel names of each relative-colour function / color() space, and the
// colorjs.io space that holds them. `scale` maps CSS channel numbers to
// colorjs coordinates (rgb() channels are 0–255 in CSS, 0–1 in colorjs).
const SPACES: Record<string, { id: string; channels: string[]; scale?: number[] }> = {
  oklch: { id: 'oklch', channels: ['l', 'c', 'h'] },
  oklab: { id: 'oklab', channels: ['l', 'a', 'b'] },
  lab: { id: 'lab', channels: ['l', 'a', 'b'] },
  lch: { id: 'lch', channels: ['l', 'c', 'h'] },
  rgb: { id: 'srgb', channels: ['r', 'g', 'b'], scale: [255, 255, 255] },
  hsl: { id: 'hsl', channels: ['h', 's', 'l'] },
  hwb: { id: 'hwb', channels: ['h', 'w', 'b'] },
  srgb: { id: 'srgb', channels: ['r', 'g', 'b'] },
  'srgb-linear': { id: 'srgb-linear', channels: ['r', 'g', 'b'] },
  'display-p3': { id: 'p3', channels: ['r', 'g', 'b'] },
  'a98-rgb': { id: 'a98rgb', channels: ['r', 'g', 'b'] },
  'prophoto-rgb': { id: 'prophoto', channels: ['r', 'g', 'b'] },
  rec2020: { id: 'rec2020', channels: ['r', 'g', 'b'] },
  xyz: { id: 'xyz-d65', channels: ['x', 'y', 'z'] },
  'xyz-d65': { id: 'xyz-d65', channels: ['x', 'y', 'z'] },
  'xyz-d50': { id: 'xyz-d50', channels: ['x', 'y', 'z'] },
};

class Parser {
  pos = 0;
  private readonly src: string;
  private readonly tokens: Token[];
  private readonly ctx: EvalContext;
  private readonly vars: Record<string, number>;
  constructor(src: string, tokens: Token[], ctx: EvalContext, vars: Record<string, number> = {}) {
    this.src = src;
    this.tokens = tokens;
    this.ctx = ctx;
    this.vars = vars;
  }

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.pos + offset];
  }
  private next(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error(`unexpected end of expression in "${this.src}"`);
    return t;
  }
  private expect(text: string): void {
    const t = this.next();
    if (t.text !== text)
      throw new Error(`expected "${text}" but found "${t.text}" in "${this.src}"`);
  }
  /** Index just past the `)` that closes the `(` at the current position. */
  private closingParen(): number {
    let depth = 0;
    for (let k = this.pos; k < this.tokens.length; k++) {
      if (this.tokens[k].text === '(') depth++;
      else if (this.tokens[k].text === ')' && --depth === 0) return k + 1;
    }
    throw new Error(`unbalanced parentheses in "${this.src}"`);
  }

  atEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  // ── colours ──────────────────────────────────────────────────────────────

  color(): Color {
    const t = this.next();
    if (t.type === 'hash') return new Color(t.text);
    if (t.type !== 'ident')
      throw new Error(`cannot read a colour from "${t.text}" in "${this.src}"`);
    if (this.peek()?.text !== '(') return new Color(t.text);

    const fn = t.text.toLowerCase();
    if (fn === 'var') {
      this.expect('(');
      const name = this.next().text;
      let fallback: (() => Color) | null = null;
      if (this.peek()?.text === ',') {
        this.next();
        const save = this.pos;
        fallback = () => {
          this.pos = save;
          const c = this.color();
          return c;
        };
      }
      const declared = this.ctx.lookup(name);
      let result: Color;
      if (declared !== undefined) {
        result = evaluateColor(declared, this.ctx, this.vars);
        if (fallback) this.skipToClose();
        else this.expect(')');
      } else if (fallback) {
        result = fallback();
        this.expect(')');
      } else {
        throw new Error(`var(${name}) is not declared and has no fallback`);
      }
      return result;
    }
    if (fn === 'light-dark') {
      this.expect('(');
      const light = this.color();
      this.expect(',');
      const dark = this.color();
      this.expect(')');
      return this.ctx.mode === 'light' ? light : dark;
    }
    if (this.peek(1)?.text === 'from') {
      this.expect('(');
      this.expect('from');
      const origin = this.color();
      const spaceName = fn === 'color' ? this.next().text.toLowerCase() : fn;
      const space = SPACES[spaceName];
      if (!space) throw new Error(`unsupported relative colour space "${spaceName}"`);
      const converted = origin.to(space.id);
      const vars: Record<string, number> = { ...this.vars, alpha: converted.alpha ?? 1 };
      space.channels.forEach((name, k) => {
        const v = converted.coords[k] ?? 0;
        vars[name] = (Number.isNaN(v) ? 0 : v) * (space.scale?.[k] ?? 1);
      });
      const channelParser = new Parser(this.src, this.tokens, this.ctx, vars);
      channelParser.pos = this.pos;
      const coords = [channelParser.expr(), channelParser.expr(), channelParser.expr()];
      let alpha = vars.alpha;
      if (channelParser.peek()?.text === '/') {
        channelParser.next();
        alpha = channelParser.expr();
      }
      this.pos = channelParser.pos;
      this.expect(')');
      const scaled = coords.map((v, k) => v / (space.scale?.[k] ?? 1));
      return new Color(space.id, scaled as [number, number, number], alpha);
    }
    // An absolute colour function: hand its source text to colorjs.io.
    const end = this.closingParen();
    const text = this.src.slice(t.start, this.tokens[end - 1].end);
    this.pos = end;
    return new Color(text);
  }

  private skipToClose(): void {
    // We are inside a function after its first argument; skip to its `)`.
    let depth = 1;
    while (depth > 0) {
      const t = this.next();
      if (t.text === '(') depth++;
      else if (t.text === ')') depth--;
    }
  }

  // ── numeric channel expressions ──────────────────────────────────────────

  expr(): number {
    let value = this.term();
    while (this.peek()?.text === '+' || this.peek()?.text === '-') {
      const op = this.next().text;
      const rhs = this.term();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private term(): number {
    let value = this.factor();
    while (this.peek()?.text === '*' || this.peek()?.text === '/') {
      // A `/` directly before the alpha of a relative colour is not division:
      // it follows a complete channel list, which the caller handles. Inside a
      // channel expression we only see `/` between operands.
      if (this.peek()?.text === '/' && this.isAlphaSlash()) break;
      const op = this.next().text;
      const rhs = this.factor();
      value = op === '*' ? value * rhs : value / rhs;
    }
    return value;
  }

  private isAlphaSlash(): boolean {
    // Heuristic: a slash is the alpha separator when the token after the next
    // operand is `)`. Division inside calc() is always inside parentheses, so
    // the only top-level slash in a relative colour is the alpha one.
    let depth = 0;
    for (let k = this.pos - 1; k >= 0; k--) {
      const t = this.tokens[k];
      if (t.text === ')') depth++;
      else if (t.text === '(') {
        if (depth === 0) {
          const fnTok = this.tokens[k - 1];
          return (
            fnTok !== undefined &&
            fnTok.type === 'ident' &&
            !/^(calc|clamp|min|max|var)$/i.test(fnTok.text)
          );
        }
        depth--;
      }
    }
    return false;
  }

  private factor(): number {
    const t = this.next();
    if (t.type === 'number') {
      const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|[a-z]+)?$/i.exec(t.text)!;
      const n = Number(m[1]);
      return m[2] === '%' ? n / 100 : n;
    }
    if (t.text === '(') {
      const v = this.expr();
      this.expect(')');
      return v;
    }
    if (t.text === '-') return -this.factor();
    if (t.type === 'ident') {
      if (this.peek()?.text === '(') {
        const fn = t.text.toLowerCase();
        this.expect('(');
        if (fn === 'var') {
          const open = this.pos - 1;
          const name = this.next().text;
          let fallbackText: string | null = null;
          if (this.peek()?.text === ',') {
            this.next();
            const end = this.closingParenFrom(open);
            fallbackText = this.src.slice(this.tokens[this.pos].start, this.tokens[end - 1].start);
            this.pos = end - 1;
          }
          this.expect(')');
          const declared = this.ctx.lookup(name);
          const text = declared ?? fallbackText;
          if (text === null || text === undefined)
            throw new Error(`var(${name}) is not declared and has no fallback`);
          return evaluateNumber(text, this.ctx, this.vars);
        }
        const args: number[] = [this.expr()];
        while (this.peek()?.text === ',') {
          this.next();
          args.push(this.expr());
        }
        this.expect(')');
        switch (fn) {
          case 'calc':
            return args[0];
          case 'clamp':
            return Math.min(Math.max(args[1], args[0]), args[2]);
          case 'min':
            return Math.min(...args);
          case 'max':
            return Math.max(...args);
          default:
            throw new Error(`unsupported function "${fn}" in a channel expression`);
        }
      }
      if (t.text in this.vars) return this.vars[t.text];
      if (t.text === 'none') return 0;
      throw new Error(`unknown identifier "${t.text}" in "${this.src}"`);
    }
    throw new Error(`unexpected "${t.text}" in "${this.src}"`);
  }

  private closingParenFrom(openIndex: number): number {
    let depth = 0;
    for (let k = openIndex; k < this.tokens.length; k++) {
      if (this.tokens[k].text === '(') depth++;
      else if (this.tokens[k].text === ')' && --depth === 0) return k + 1;
    }
    throw new Error(`unbalanced parentheses in "${this.src}"`);
  }
}

/** Evaluates a CSS colour value to a colorjs.io Color. */
export function evaluateColor(
  expr: string,
  ctx: EvalContext,
  vars: Record<string, number> = {},
): Color {
  const parser = new Parser(expr, tokenize(expr), ctx, vars);
  const color = parser.color();
  if (!parser.atEnd()) throw new Error(`trailing tokens in "${expr}"`);
  return color;
}

/** Evaluates a numeric CSS value (plain number, percentage, calc(), var()). */
export function evaluateNumber(
  expr: string,
  ctx: EvalContext,
  vars: Record<string, number> = {},
): number {
  const parser = new Parser(expr, tokenize(expr), ctx, vars);
  const n = parser.expr();
  if (!parser.atEnd()) throw new Error(`trailing tokens in "${expr}"`);
  return n;
}

/**
 * The private 0/1 flag the mode rules set (see scss/_mode.scss). Core declares
 * it as 0 on :root; the context answers it from `mode` instead, the way a
 * themeMode rule would on the element.
 */
export const MODE_FLAG = '--theme--_dark';

/** A context over a declaration map, with optional overriding declarations. */
export function contextFor(
  decls: Map<string, string>,
  mode: Mode,
  overrides?: Map<string, string>,
): EvalContext {
  return {
    mode,
    lookup: (name) => {
      const o = overrides?.get(name);
      if (o !== undefined) return o;
      if (name === MODE_FLAG) return mode === 'dark' ? '1' : '0';
      return decls.get(name);
    },
  };
}

/** What the screen paints: the colour clipped into sRGB, channel by channel. */
export function painted(color: Color): Color {
  return color.to('srgb').toGamut({ method: 'clip' });
}

/** WCAG 2.1 contrast ratio between the painted versions of two colours. */
export function wcagContrast(a: Color, b: Color): number {
  return Color.contrastWCAG21(painted(a), painted(b));
}

/** Largest sRGB channel difference between two colours (0–1), after clipping. */
export function maxChannelDiff(a: Color, b: Color): number {
  const pa = painted(a).coords;
  const pb = painted(b).coords;
  return Math.max(...pa.map((v, i) => Math.abs((v ?? 0) - (pb[i] ?? 0))));
}

export function cssColor(text: string): Color {
  return new Color(text);
}

export { Color };
