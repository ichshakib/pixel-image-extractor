import { createPdfFromJpeg, createGifFromRgba, bytesToDataUrl } from '../utils/converters';

export type TargetFormat = 'png' | 'jpeg' | 'webp' | 'jfif' | 'gif' | 'pdf';

// Helper to sanitize filenames
export function getBaseFilename(url: string): string {
  try {
    if (url.startsWith('data:')) {
      return `pixel-image-${Date.now()}`;
    }
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    const clean = last.split('?')[0].split('#')[0];
    const dotIndex = clean.lastIndexOf('.');
    const base = dotIndex > 0 ? clean.substring(0, dotIndex) : clean;
    const sanitized = base.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
    if (sanitized.length > 0 && sanitized.length <= 60) {
      return sanitized;
    }
  } catch {
    // Ignore URL parse error
  }
  return `pixel-image-${Date.now()}`;
}

// Helper to determine original extension
export function getOriginalExtension(url: string): string {
  try {
    if (url.startsWith('data:')) {
      const match = url.match(/^data:image\/([a-zA-Z0-9+]+);/);
      if (match && match[1]) {
        const subtype = match[1].toLowerCase();
        if (subtype === 'jpeg') return '.jpg';
        if (subtype === 'svg+xml') return '.svg';
        return `.${subtype}`;
      }
      return '.png';
    }
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|gif|webp|svg|bmp|tiff|avif|ico|jfif)(\?.*)?$/i);
    if (match && match[1]) {
      return `.${match[1].toLowerCase()}`;
    }
  } catch {
    // Ignore URL parse error
  }
  return '.png';
}

// Helper to convert Blob to Data URL
async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return bytesToDataUrl(new Uint8Array(buffer), blob.type || 'application/octet-stream');
}

// Convert image to desired format
export async function convertImageToDataUrl(
  srcUrl: string,
  targetFormat: TargetFormat,
  tabId?: number
): Promise<{ dataUrl: string; filenameExt: string }> {
  // Check if target is GIF and image is already a GIF
  if (targetFormat === 'gif' && (srcUrl.includes('.gif') || srcUrl.startsWith('data:image/gif'))) {
    return { dataUrl: srcUrl, filenameExt: '.gif' };
  }

  // Attempt 1: In-worker conversion using OffscreenCanvas
  try {
    const response = await fetch(srcUrl);
    if (!response.ok) throw new Error(`HTTP fetch error: ${response.status}`);
    const blob = await response.blob();

    // If source is already a GIF and target is GIF, return directly to preserve animation
    if (targetFormat === 'gif' && blob.type === 'image/gif') {
      const dataUrl = await blobToDataUrl(blob);
      return { dataUrl, filenameExt: '.gif' };
    }

    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    // Fill white background for JPEG/JFIF/PDF to preserve transparency readability
    if (targetFormat === 'jpeg' || targetFormat === 'jfif' || targetFormat === 'pdf') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, bitmap.width, bitmap.height);
    }

    ctx.drawImage(bitmap, 0, 0);

    // 1. PDF Conversion
    if (targetFormat === 'pdf') {
      const jpegBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      const jpegBuffer = await jpegBlob.arrayBuffer();
      const pdfBytes = createPdfFromJpeg(new Uint8Array(jpegBuffer), bitmap.width, bitmap.height);
      const dataUrl = bytesToDataUrl(pdfBytes, 'application/pdf');
      return { dataUrl, filenameExt: '.pdf' };
    }

    // 2. GIF Conversion
    if (targetFormat === 'gif') {
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const gifBytes = createGifFromRgba(imageData.data, bitmap.width, bitmap.height);
      const dataUrl = bytesToDataUrl(gifBytes, 'image/gif');
      return { dataUrl, filenameExt: '.gif' };
    }

    // 3. JFIF (JPEG with .jfif extension)
    if (targetFormat === 'jfif') {
      const convertedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      const dataUrl = await blobToDataUrl(convertedBlob);
      return { dataUrl, filenameExt: '.jfif' };
    }

    // 4. Standard raster formats (PNG, JPG, WebP)
    const mimeType =
      targetFormat === 'jpeg' ? 'image/jpeg' : targetFormat === 'webp' ? 'image/webp' : 'image/png';

    const filenameExt =
      targetFormat === 'jpeg' ? '.jpg' : targetFormat === 'webp' ? '.webp' : '.png';

    const convertedBlob = await canvas.convertToBlob({
      type: mimeType,
      quality: 0.95,
    });

    const dataUrl = await blobToDataUrl(convertedBlob);
    return { dataUrl, filenameExt };
  } catch (workerError) {
    console.debug(
      '[Background] Worker conversion failed, attempting in-tab fallback:',
      workerError
    );

    // Attempt 2: Fallback in tab context (for blob: URLs or page-scoped resources)
    if (tabId) {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: async (url: string, format: string) => {
          return new Promise<{
            dataUrl: string;
            width: number;
            height: number;
            isBlobUrl?: boolean;
          }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
              try {
                const width = img.naturalWidth || img.width || 300;
                const height = img.naturalHeight || img.height || 300;
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

                if (format === 'jpeg' || format === 'jfif' || format === 'pdf') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                const mime =
                  format === 'jpeg' || format === 'jfif' || format === 'pdf'
                    ? 'image/jpeg'
                    : format === 'webp'
                      ? 'image/webp'
                      : 'image/png';

                resolve({ dataUrl: canvas.toDataURL(mime, 0.95), width, height });
              } catch (e) {
                reject(e);
              }
            };

            img.onerror = () => {
              fetch(url)
                .then((r) => r.blob())
                .then((b) => {
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    resolve({
                      dataUrl: reader.result as string,
                      width: 300,
                      height: 300,
                      isBlobUrl: true,
                    });
                  reader.onerror = reject;
                  reader.readAsDataURL(b);
                })
                .catch(reject);
            };

            img.src = url;
          });
        },
        args: [srcUrl, targetFormat],
      });

      if (results && results[0]?.result) {
        const { dataUrl, width, height } = results[0].result;

        if (targetFormat === 'pdf') {
          const base64Data = dataUrl.split(',')[1];
          const binary = atob(base64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const pdfBytes = createPdfFromJpeg(bytes, width, height);
          return { dataUrl: bytesToDataUrl(pdfBytes, 'application/pdf'), filenameExt: '.pdf' };
        }

        if (targetFormat === 'jfif') {
          return { dataUrl, filenameExt: '.jfif' };
        }

        const filenameExt =
          targetFormat === 'jpeg'
            ? '.jpg'
            : targetFormat === 'webp'
              ? '.webp'
              : targetFormat === 'gif'
                ? '.gif'
                : '.png';

        return { dataUrl, filenameExt };
      }
    }

    throw workerError;
  }
}
