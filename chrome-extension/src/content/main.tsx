// Content script to extract images from web pages including Shadow DOMs

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractImages') {
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

    // Helper to check if URL is a valid image source
    const isValidImageUrl = (url: string): boolean => {
      if (!url) return false;
      return (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:image/') ||
        url.startsWith('blob:')
      );
    };

    // Helper to add unique image
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

    // Iterative scanner for DOM and nested Shadow DOM roots
    const rootsToScan: (Document | ShadowRoot)[] = [document];
    const scannedRoots = new Set<Node>();

    while (rootsToScan.length > 0) {
      const currentRoot = rootsToScan.pop()!;
      if (scannedRoots.has(currentRoot)) continue;
      scannedRoots.add(currentRoot);

      const walker = document.createTreeWalker(currentRoot, NodeFilter.SHOW_ELEMENT, null);

      while (walker.nextNode()) {
        const el = walker.currentNode as Element;

        // Queue open ShadowRoot for recursive scanning
        if (el.shadowRoot && !scannedRoots.has(el.shadowRoot)) {
          rootsToScan.push(el.shadowRoot);
        }

        const tagName = el.tagName.toLowerCase();

        // 1. Extract from <img> elements
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
          // 2. Extract from <picture> sources
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
        } else if (tagName === 'image' && (el.namespaceURI?.includes('svg') || el.closest('svg'))) {
          // 3. Extract from SVG <image>
          const href = el.getAttribute('href') || el.getAttribute('xlink:href');
          if (href) {
            const width = parseFloat(el.getAttribute('width') || '0');
            const height = parseFloat(el.getAttribute('height') || '0');
            addImage(href, width, height, el.getAttribute('alt') || '', imageData.length);
          }
        }

        // 4. Extract from CSS inline background images
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

    sendResponse({ images: imageData });
  }
  return true;
});
