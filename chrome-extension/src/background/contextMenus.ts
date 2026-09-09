import {
  getBaseFilename,
  getOriginalExtension,
  convertImageToDataUrl,
  type TargetFormat,
} from './imageDownloader';

// Initialize context menus
export function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Parent Menu
    chrome.contextMenus.create({
      id: 'pixel-save-image-root',
      title: 'Pixel — Save Image As',
      contexts: ['image'],
    });

    // Submenu: Save as PNG
    chrome.contextMenus.create({
      id: 'pixel-save-png',
      parentId: 'pixel-save-image-root',
      title: 'Save as PNG (.png)',
      contexts: ['image'],
    });

    // Submenu: Save as JPG
    chrome.contextMenus.create({
      id: 'pixel-save-jpg',
      parentId: 'pixel-save-image-root',
      title: 'Save as JPG (.jpg)',
      contexts: ['image'],
    });

    // Submenu: Save as WebP
    chrome.contextMenus.create({
      id: 'pixel-save-webp',
      parentId: 'pixel-save-image-root',
      title: 'Save as WebP (.webp)',
      contexts: ['image'],
    });

    // Submenu: Save as JFIF
    chrome.contextMenus.create({
      id: 'pixel-save-jfif',
      parentId: 'pixel-save-image-root',
      title: 'Save as JFIF (.jfif)',
      contexts: ['image'],
    });

    // Submenu: Save as GIF
    chrome.contextMenus.create({
      id: 'pixel-save-gif',
      parentId: 'pixel-save-image-root',
      title: 'Save as GIF (.gif)',
      contexts: ['image'],
    });

    // Submenu: Save as PDF
    chrome.contextMenus.create({
      id: 'pixel-save-pdf',
      parentId: 'pixel-save-image-root',
      title: 'Save as PDF (.pdf)',
      contexts: ['image'],
    });

    // Submenu Separator
    chrome.contextMenus.create({
      id: 'pixel-separator-1',
      parentId: 'pixel-save-image-root',
      type: 'separator',
      contexts: ['image'],
    });

    // Submenu: Save as Original
    chrome.contextMenus.create({
      id: 'pixel-save-original',
      parentId: 'pixel-save-image-root',
      title: 'Save in Original Format',
      contexts: ['image'],
    });

    // Submenu: Copy Image URL
    chrome.contextMenus.create({
      id: 'pixel-copy-url',
      parentId: 'pixel-save-image-root',
      title: 'Copy Image Address',
      contexts: ['image'],
    });

    // Submenu: Open Side Panel
    chrome.contextMenus.create({
      id: 'pixel-open-sidepanel',
      parentId: 'pixel-save-image-root',
      title: 'Extract All Images on Page...',
      contexts: ['image'],
    });
  });
}

// Handle click on context menu item
export async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  const srcUrl = info.srcUrl;

  // Handle open side panel option
  if (info.menuItemId === 'pixel-open-sidepanel') {
    if (tab?.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId }).catch((err) => {
        console.error('[Background] Failed to open side panel:', err);
      });
    }
    return;
  }

  if (!srcUrl) return;

  // Handle Copy URL
  if (info.menuItemId === 'pixel-copy-url') {
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text: string) => {
          navigator.clipboard.writeText(text);
        },
        args: [srcUrl],
      });
    }
    return;
  }

  const baseName = getBaseFilename(srcUrl);

  try {
    if (info.menuItemId === 'pixel-save-original') {
      const ext = getOriginalExtension(srcUrl);
      await chrome.downloads.download({
        url: srcUrl,
        filename: `${baseName}${ext}`,
        saveAs: false,
      });
      return;
    }

    let targetFormat: TargetFormat | null = null;

    if (info.menuItemId === 'pixel-save-png') {
      targetFormat = 'png';
    } else if (info.menuItemId === 'pixel-save-jpg') {
      targetFormat = 'jpeg';
    } else if (info.menuItemId === 'pixel-save-webp') {
      targetFormat = 'webp';
    } else if (info.menuItemId === 'pixel-save-jfif') {
      targetFormat = 'jfif';
    } else if (info.menuItemId === 'pixel-save-gif') {
      targetFormat = 'gif';
    } else if (info.menuItemId === 'pixel-save-pdf') {
      targetFormat = 'pdf';
    }

    if (targetFormat) {
      const { dataUrl, filenameExt } = await convertImageToDataUrl(srcUrl, targetFormat, tab?.id);
      await chrome.downloads.download({
        url: dataUrl,
        filename: `${baseName}${filenameExt}`,
        saveAs: false,
      });
    }
  } catch (error) {
    console.error('[Background] Failed to process and download image:', error);
    // Direct download fallback
    try {
      await chrome.downloads.download({
        url: srcUrl,
        filename: `${baseName}.png`,
        saveAs: false,
      });
    } catch (fallbackError) {
      console.error('[Background] Fallback download failed:', fallbackError);
    }
  }
}
