// The contrast ratio of an element's text as it is painted, for the readouts
// of a Learn example (chapter 7). This is the docs measuring the page, not
// part of cp-theming: the library chooses its text colours in CSS.

let pixel: CanvasRenderingContext2D | null | undefined;

/** A 1×1 canvas: painting a CSS colour on it turns any notation into sRGB bytes. */
function context(): CanvasRenderingContext2D | null {
  if (pixel === undefined) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    pixel = canvas.getContext('2d', { willReadFrequently: true });
  }
  return pixel;
}

/** WCAG relative luminance of an sRGB colour given as bytes. */
function luminance(r: number, g: number, b: number): number {
  const linear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * The WCAG contrast ratio between the text colour of `el` and what is painted
 * behind it: the backgrounds of the element and of everything around it, laid
 * over each other from the page inward, so a see-through fill counts as the
 * mix the reader sees. NaN when the colours cannot be read.
 */
export function contrastOf(el: Element): number {
  const ctx = context();
  const view = el.ownerDocument.defaultView;
  if (!ctx || !view) return NaN;

  const chain: Element[] = [];
  for (let e: Element | null = el; e; e = e.parentElement) chain.unshift(e);

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1, 1);
  for (const e of chain) {
    ctx.fillStyle = view.getComputedStyle(e).backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
  }
  const behind = ctx.getImageData(0, 0, 1, 1).data;
  const back = luminance(behind[0], behind[1], behind[2]);

  ctx.fillStyle = view.getComputedStyle(el).color;
  ctx.fillRect(0, 0, 1, 1);
  const text = ctx.getImageData(0, 0, 1, 1).data;
  const front = luminance(text[0], text[1], text[2]);

  return (Math.max(back, front) + 0.05) / (Math.min(back, front) + 0.05);
}
