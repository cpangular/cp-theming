// PNG → RGBA, for the browser checks that read screenshots.
import { inflateSync } from 'node:zlib';

export interface Image {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel. */
  data: Uint8Array;
}

/** Decodes the PNGs a browser screenshot produces: 8-bit RGB or RGBA, not interlaced. */
export function decodePng(png: Buffer): Image {
  let offset = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Buffer[] = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('latin1', offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const [depth, colorType, , , interlace] = body.subarray(8);
      if (depth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0)
        throw new Error(`unsupported PNG (depth ${depth}, colour type ${colorType})`);
      channels = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(body);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const data = new Uint8Array(width * height * 4);
  const line = new Uint8Array(stride);
  let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    for (let x = 0; x < stride; x++) {
      const value = raw[start + 1 + x];
      const left = x >= channels ? line[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let predicted = 0;
      if (filter === 1) predicted = left;
      else if (filter === 2) predicted = up;
      else if (filter === 3) predicted = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const [a, b, c] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
        predicted = a <= b && a <= c ? left : b <= c ? up : upLeft;
      }
      line[x] = (value + predicted) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = line[x * channels];
      data[o + 1] = line[x * channels + 1];
      data[o + 2] = line[x * channels + 2];
      data[o + 3] = channels === 4 ? line[x * channels + 3] : 255;
    }
    previous = line.slice();
  }
  return { width, height, data };
}
