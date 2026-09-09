import type { ImageItem } from '../types';

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper to get a proper file extension from a blob or url
export const getFileExtension = (blob: Blob, url: string): string => {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/avif': '.avif',
    'image/x-icon': '.ico',
    'image/vnd.microsoft.icon': '.ico',
  };
  if (blob.type && mimeToExt[blob.type]) {
    return mimeToExt[blob.type];
  }
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|gif|webp|svg|bmp|tiff|avif|ico)(\?.*)?$/i);
    if (match) return `.${match[1].toLowerCase()}`;
  } catch {
    // Ignore URL parsing errors
  }
  return '.png'; // Default fallback
};

// Handle single image download
export const downloadSingleImage = async (imageUrl: string, alt: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = alt || 'image';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed';
    console.error(`Download failed: ${message}`);
  }
};

// Handle CSV export of image metadata
export const exportImagesAsCSV = (selectedImageData: ImageItem[]) => {
  const csvContent = [
    ['URL', 'Alt Text', 'Width', 'Height', 'Size', 'MIME Type'],
    ...selectedImageData.map((img) => [
      img.url,
      `"${(img.alt || '').replace(/"/g, '""')}"`,
      img.width,
      img.height,
      img.size ? formatFileSize(img.size) : 'Unknown',
      img.mimetype || 'Unknown',
    ]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_images.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Handle JSON export of image metadata
export const exportImagesAsJSON = (selectedImageData: ImageItem[]) => {
  const jsonContent = JSON.stringify(selectedImageData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_images.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
