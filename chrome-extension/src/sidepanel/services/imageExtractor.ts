import type { ImageItem, RawImageItem } from '../types';

/**
 * Extracts images from the active Chrome tab.
 * Attempts content script messaging first, and falls back to direct script injection if needed.
 */
export const extractImagesFromTab = async (tabId: number): Promise<ImageItem[]> => {
  // 1. Try to send message to content script first
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'extractImages',
    });

    if (response && response.images) {
      return response.images.map((img: RawImageItem, index: number) => ({
        id: index,
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
        mimetype: img.mimetype,
        size: img.size,
      }));
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.debug('Content script message failed, attempting script injection fallback:', errorMsg);
  }

  // 2. Fallback: Inject script to extract images directly
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const imageData: Array<{
        url: string;
        width: number;
        height: number;
        alt: string;
        mimetype?: string;
        size?: number;
      }> = [];
      const seenUrls = new Set<string>();

      // Helper to resolve relative URLs to absolute
      const resolveUrl = (url: string, baseUrl: string = window.location.href): string => {
        try {
          return new URL(url, baseUrl).href;
        } catch {
          return url;
        }
      };

      // Helper to check if URL is valid (http, https, or data)
      const isValidImageUrl = (url: string): boolean => {
        if (!url) return false;
        return (
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('data:image/') ||
          url.startsWith('blob:')
        );
      };

      // Helper to add image if not duplicate
      const addImage = (url: string, width: number, height: number, alt: string, index: number) => {
        const resolvedUrl = resolveUrl(url);
        if (isValidImageUrl(resolvedUrl) && !seenUrls.has(resolvedUrl)) {
          seenUrls.add(resolvedUrl);
          imageData.push({
            url: resolvedUrl,
            width: width || 0,
            height: height || 0,
            alt: alt || `Image ${index + 1}`,
            mimetype: undefined,
            size: undefined,
          });
        }
      };

      // Iterative single-pass scanner for DOM and nested Shadow DOMs
      const rootsToScan: (Document | ShadowRoot)[] = [document];
      const scannedRoots = new Set<Node>();

      while (rootsToScan.length > 0) {
        const currentRoot = rootsToScan.pop()!;
        if (scannedRoots.has(currentRoot)) continue;
        scannedRoots.add(currentRoot);

        const walker = document.createTreeWalker(currentRoot, NodeFilter.SHOW_ELEMENT, null);

        while (walker.nextNode()) {
          const el = walker.currentNode as Element;

          // Queue open ShadowRoot for scanning if present
          if (el.shadowRoot && !scannedRoots.has(el.shadowRoot)) {
            rootsToScan.push(el.shadowRoot);
          }

          const tagName = el.tagName.toLowerCase();

          // Extract from <img> elements
          if (tagName === 'img') {
            const img = el as HTMLImageElement;
            const sources = [
              img.src,
              img.currentSrc,
              img.getAttribute('src'),
              img.getAttribute('data-src'),
              img.getAttribute('data-lazy-src'),
              img.getAttribute('data-original'),
              img.getAttribute('data-srcset'),
              img.getAttribute('data-url'),
              img.getAttribute('data-image'),
            ].filter(Boolean);

            for (const src of sources) {
              if (src && isValidImageUrl(src)) {
                addImage(
                  src,
                  img.naturalWidth || img.width || 0,
                  img.naturalHeight || img.height || 0,
                  img.alt || img.getAttribute('title') || '',
                  imageData.length
                );
                break;
              }
            }
          } else if (tagName === 'picture') {
            // Extract from <picture> elements
            const sources = el.querySelectorAll('source');
            sources.forEach((source) => {
              const srcset = source.getAttribute('srcset');
              if (srcset) {
                const firstUrl = srcset.split(',')[0].trim().split(/\s+/)[0];
                if (firstUrl) {
                  const img = el.querySelector('img');
                  addImage(
                    firstUrl,
                    img?.naturalWidth || img?.width || 0,
                    img?.naturalHeight || img?.height || 0,
                    img?.alt || img?.getAttribute('title') || '',
                    imageData.length
                  );
                }
              }
            });
          } else if (
            tagName === 'image' &&
            (el.namespaceURI?.includes('svg') || el.closest('svg'))
          ) {
            // Extract from SVG <image> elements
            const href = el.getAttribute('href') || el.getAttribute('xlink:href');
            if (href) {
              const width = parseFloat(el.getAttribute('width') || '0');
              const height = parseFloat(el.getAttribute('height') || '0');
              addImage(href, width, height, el.getAttribute('alt') || '', imageData.length);
            }
          }

          // Extract from inline background images
          const inlineStyle = (el as HTMLElement).style?.backgroundImage;
          if (inlineStyle) {
            const match = inlineStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
              addImage(
                match[1],
                0,
                0,
                el.getAttribute('alt') ||
                  el.getAttribute('title') ||
                  el.getAttribute('aria-label') ||
                  '',
                imageData.length
              );
            }
          }
        }
      }

      return imageData;
    },
  });

  if (results && results[0] && results[0].result) {
    return results[0].result.map((img: RawImageItem, index: number) => ({
      id: index,
      url: img.url,
      width: img.width,
      height: img.height,
      alt: img.alt,
      mimetype: img.mimetype,
      size: img.size,
    }));
  }

  return [];
};

/**
 * Fetches image metadata (file size, MIME type) asynchronously in batches
 */
export const fetchImageMetadata = async (
  images: ImageItem[],
  onBatchUpdate: (updatedImages: ImageItem[]) => void
): Promise<void> => {
  const updatedImages = [...images];
  const concurrencyLimit = 5;
  const queue = [...Array(updatedImages.length).keys()];
  let activeRequests = 0;
  let completed = 0;

  return new Promise<void>((resolve) => {
    const processQueue = async () => {
      if (queue.length === 0 && activeRequests === 0) {
        onBatchUpdate([...updatedImages]);
        resolve();
        return;
      }

      while (queue.length > 0 && activeRequests < concurrencyLimit) {
        const index = queue.shift()!;
        const image = updatedImages[index];
        activeRequests++;

        (async () => {
          try {
            const response = await fetch(image.url, { method: 'HEAD' });
            if (response.ok) {
              const contentLength = response.headers.get('content-length');
              const contentType = response.headers.get('content-type');

              if (contentLength) {
                updatedImages[index].size = parseInt(contentLength, 10);
              }
              if (contentType) {
                updatedImages[index].mimetype = contentType;
              }
            }
          } catch (error) {
            console.log(`Could not fetch metadata for ${image.url}:`, error);
          } finally {
            activeRequests--;
            completed++;

            // Update state every 5 images or when finished
            if (completed % 5 === 0 || completed === images.length) {
              onBatchUpdate([...updatedImages]);
            }

            processQueue();
          }
        })();
      }
    };

    processQueue();
  });
};
