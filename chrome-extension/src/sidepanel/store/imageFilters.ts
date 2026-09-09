import type { ImageItem, SortByOption, SortOrder } from '../types';

export function computeUniqueDimensions(images: ImageItem[]): string[] {
  const dimensions = new Set<string>();
  images.forEach((img) => {
    if (img.width && img.height) {
      dimensions.add(`${img.width}x${img.height}`);
    }
  });
  return Array.from(dimensions).sort((a, b) => {
    const [aWidth, aHeight] = a.split('x').map(Number);
    const [bWidth, bHeight] = b.split('x').map(Number);
    return bWidth * bHeight - aWidth * aHeight;
  });
}

export function computeUniqueFormats(images: ImageItem[]): string[] {
  const formats = new Set<string>();
  images.forEach((img) => {
    if (img.mimetype) {
      const format = img.mimetype.split('/')[1]?.toUpperCase() || 'UNKNOWN';
      formats.add(format);
    }
  });
  return Array.from(formats).sort();
}

export function computeFilteredImages(
  images: ImageItem[],
  selectedSize: string,
  selectedFormat: string
): ImageItem[] {
  return images.filter((img) => {
    const matchesSize =
      selectedSize === 'all' ||
      (img.width && img.height && `${img.width}x${img.height}` === selectedSize);

    const matchesFormat =
      selectedFormat === 'all' ||
      (img.mimetype && img.mimetype.split('/')[1]?.toUpperCase() === selectedFormat);

    return matchesSize && matchesFormat;
  });
}

export function computeSortedImages(
  filteredImages: ImageItem[],
  sortBy: SortByOption,
  sortOrder: SortOrder
): ImageItem[] {
  return [...filteredImages].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'size':
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      case 'width':
        aValue = a.width || 0;
        bValue = b.width || 0;
        break;
      case 'height':
        aValue = a.height || 0;
        bValue = b.height || 0;
        break;
      case 'dimensions':
        aValue = (a.width || 0) * (a.height || 0);
        bValue = (b.width || 0) * (b.height || 0);
        break;
      case 'mimetype':
        aValue = a.mimetype || '';
        bValue = b.mimetype || '';
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });
}

export function deriveAllImagesState(
  images: ImageItem[],
  selectedSize: string,
  selectedFormat: string,
  sortBy: SortByOption,
  sortOrder: SortOrder
) {
  const uniqueDimensions = computeUniqueDimensions(images);
  const uniqueFormats = computeUniqueFormats(images);
  const filteredImages = computeFilteredImages(images, selectedSize, selectedFormat);
  const sortedImages = computeSortedImages(filteredImages, sortBy, sortOrder);
  return {
    images,
    uniqueDimensions,
    uniqueFormats,
    filteredImages,
    sortedImages,
  };
}
