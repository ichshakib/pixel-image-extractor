import { GifWriter } from 'omggif';

/**
 * Creates a standard PDF 1.4 document containing a single JPEG image.
 */
export function createPdfFromJpeg(
  jpegBytes: Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const lines: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentPos = 0;
  const encoder = new TextEncoder();

  function addString(str: string) {
    const bytes = encoder.encode(str);
    lines.push(bytes);
    currentPos += bytes.length;
  }

  function addBytes(bytes: Uint8Array) {
    lines.push(bytes);
    currentPos += bytes.length;
  }

  // PDF Header
  addString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // 1: Catalog
  offsets[1] = currentPos;
  addString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  offsets[2] = currentPos;
  addString('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3: Page (media box is width x height)
  offsets[3] = currentPos;
  addString(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // 4: Image XObject with DCTDecode (JPEG stream)
  offsets[4] = currentPos;
  addString(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  addBytes(jpegBytes);
  addString('\nendstream\nendobj\n');

  // 5: Content stream painting image full size
  const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q\n`;
  const contentBytes = encoder.encode(content);
  offsets[5] = currentPos;
  addString(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  addBytes(contentBytes);
  addString('endstream\nendobj\n');

  // Cross-reference table
  const startXref = currentPos;
  addString('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    addString(`${offsetStr} 00000 n \n`);
  }

  // Trailer
  addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

  // Merge into single Uint8Array
  const totalLength = lines.reduce((acc, l) => acc + l.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of lines) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Encodes an RGBA pixel array into a single-frame GIF using omggif.
 */
export function createGifFromRgba(
  rgbaPixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8Array {
  // Build a color frequency map to extract the most representative 256 colors
  const colorMap = new Map<number, number>();
  for (let i = 0; i < rgbaPixels.length; i += 4) {
    const r = rgbaPixels[i];
    const g = rgbaPixels[i + 1];
    const b = rgbaPixels[i + 2];
    const rgb = (r << 16) | (g << 8) | b;
    colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
  }

  let palette: number[] = [];
  if (colorMap.size <= 256) {
    palette = Array.from(colorMap.keys());
  } else {
    // Pick top 256 most frequent colors
    palette = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 256)
      .map(([rgb]) => rgb);
  }

  // Ensure palette length is a valid power of 2 for GIF specification
  let pLen = 2;
  while (pLen < palette.length && pLen < 256) pLen *= 2;
  while (palette.length < pLen) palette.push(0);

  // Fast map lookup
  const paletteLookup = new Map<number, number>();
  palette.forEach((color, idx) => paletteLookup.set(color, idx));

  // Map each pixel to the nearest palette color index
  const numPixels = width * height;
  const indexedPixels = new Uint8Array(numPixels);

  for (let i = 0; i < numPixels; i++) {
    const offset = i * 4;
    const r = rgbaPixels[offset];
    const g = rgbaPixels[offset + 1];
    const b = rgbaPixels[offset + 2];
    const rgb = (r << 16) | (g << 8) | b;

    if (paletteLookup.has(rgb)) {
      indexedPixels[i] = paletteLookup.get(rgb)!;
    } else {
      // Find closest color using Euclidean distance
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let p = 0; p < palette.length; p++) {
        const pr = (palette[p] >> 16) & 0xff;
        const pg = (palette[p] >> 8) & 0xff;
        const pb = palette[p] & 0xff;
        const dist = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = p;
          if (dist === 0) break;
        }
      }
      paletteLookup.set(rgb, bestIdx);
      indexedPixels[i] = bestIdx;
    }
  }

  // Allocate buffer and write GIF
  const buffer = new Uint8Array(width * height * 2 + 2048);
  const gifWriter = new GifWriter(buffer, width, height, { palette });
  gifWriter.addFrame(0, 0, width, height, indexedPixels as unknown as number[], {});
  const gifLength = gifWriter.end();

  return buffer.subarray(0, gifLength);
}

/**
 * Converts a Uint8Array or Blob to Data URL format
 */
export function bytesToDataUrl(bytes: Uint8Array, mimeType: string): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}
