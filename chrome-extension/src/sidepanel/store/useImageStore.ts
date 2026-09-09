import { create } from 'zustand';
import { toast } from '../utils/toast';
import JSZip from 'jszip';
import { extractImagesFromTab, fetchImageMetadata } from '../services/imageExtractor';
import {
  downloadSingleImage,
  exportImagesAsCSV,
  exportImagesAsJSON,
  getFileExtension,
} from '../utils/export';
import type { ImageItem, SortByOption, SortOrder } from '../types';

function computeUniqueDimensions(images: ImageItem[]): string[] {
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

function computeUniqueFormats(images: ImageItem[]): string[] {
  const formats = new Set<string>();
  images.forEach((img) => {
    if (img.mimetype) {
      const format = img.mimetype.split('/')[1]?.toUpperCase() || 'UNKNOWN';
      formats.add(format);
    }
  });
  return Array.from(formats).sort();
}

function computeFilteredImages(
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

function computeSortedImages(
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

function deriveAllImagesState(
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

interface ImageState {
  images: ImageItem[];
  loading: boolean;
  sortBy: SortByOption;
  sortOrder: SortOrder;
  selectedSize: string;
  selectedFormat: string;
  selectedImages: Set<number>;
  downloading: boolean;

  // Derived states
  uniqueDimensions: string[];
  uniqueFormats: string[];
  filteredImages: ImageItem[];
  sortedImages: ImageItem[];

  // Setters
  setSortBy: (sortBy: SortByOption) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setSelectedSize: (size: string) => void;
  setSelectedFormat: (format: string) => void;
  setDownloading: (downloading: boolean) => void;

  // Selection
  toggleImageSelect: (id: number, checked?: boolean) => void;
  selectAllImages: (checked: boolean) => void;

  // Async actions
  fetchImagesFromTab: () => Promise<void>;
  downloadBulk: () => Promise<void>;
  exportCSV: () => void;
  exportJSON: () => void;

  // Derived selectors
  getUniqueDimensions: () => string[];
  getUniqueFormats: () => string[];
  getFilteredImages: () => ImageItem[];
  getSortedImages: () => ImageItem[];
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  loading: true,
  sortBy: 'size',
  sortOrder: 'desc',
  selectedSize: 'all',
  selectedFormat: 'all',
  selectedImages: new Set<number>(),
  downloading: false,

  uniqueDimensions: [],
  uniqueFormats: [],
  filteredImages: [],
  sortedImages: [],

  setSortBy: (sortBy) =>
    set((state) => ({
      sortBy,
      sortedImages: computeSortedImages(state.filteredImages, sortBy, state.sortOrder),
    })),

  setSortOrder: (sortOrder) =>
    set((state) => ({
      sortOrder,
      sortedImages: computeSortedImages(state.filteredImages, state.sortBy, sortOrder),
    })),

  setSelectedSize: (selectedSize) =>
    set((state) => {
      const filteredImages = computeFilteredImages(
        state.images,
        selectedSize,
        state.selectedFormat
      );
      return {
        selectedSize,
        filteredImages,
        sortedImages: computeSortedImages(filteredImages, state.sortBy, state.sortOrder),
      };
    }),

  setSelectedFormat: (selectedFormat) =>
    set((state) => {
      const filteredImages = computeFilteredImages(
        state.images,
        state.selectedSize,
        selectedFormat
      );
      return {
        selectedFormat,
        filteredImages,
        sortedImages: computeSortedImages(filteredImages, state.sortBy, state.sortOrder),
      };
    }),

  setDownloading: (downloading) => set({ downloading }),

  toggleImageSelect: (id, checked) => {
    set((state) => {
      const next = new Set(state.selectedImages);
      const shouldSelect = checked !== undefined ? checked : !next.has(id);
      if (shouldSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return { selectedImages: next };
    });
  },

  selectAllImages: (checked) => {
    if (checked) {
      const sorted = get().sortedImages;
      set({ selectedImages: new Set(sorted.map((img) => img.id)) });
    } else {
      set({ selectedImages: new Set() });
    }
  },

  fetchImagesFromTab: async () => {
    set({ loading: true });
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        console.error('No active tab found');
        set({ loading: false });
        return;
      }

      const extracted = await extractImagesFromTab(tab.id);
      const current = get();
      const derived = deriveAllImagesState(
        extracted,
        current.selectedSize,
        current.selectedFormat,
        current.sortBy,
        current.sortOrder
      );

      set({
        ...derived,
        selectedImages: new Set(),
      });

      if (extracted.length > 0) {
        await fetchImageMetadata(extracted, (updated) => {
          const state = get();
          const updatedDerived = deriveAllImagesState(
            updated,
            state.selectedSize,
            state.selectedFormat,
            state.sortBy,
            state.sortOrder
          );
          set({ ...updatedDerived });
        });
      }
    } catch (error) {
      console.error('Error fetching images from tab:', error);
      toast.error('Failed to extract images directly. Loaded fallback demo images.');
      const fallbackImages: ImageItem[] = [
        {
          id: 1,
          url: 'https://picsum.photos/300/200?random=1',
          width: 300,
          height: 200,
          alt: 'Test Image 1',
        },
        {
          id: 2,
          url: 'https://picsum.photos/400/300?random=2',
          width: 400,
          height: 300,
          alt: 'Test Image 2',
        },
      ];
      const current = get();
      const derived = deriveAllImagesState(
        fallbackImages,
        current.selectedSize,
        current.selectedFormat,
        current.sortBy,
        current.sortOrder
      );
      set({
        ...derived,
        selectedImages: new Set(),
      });
    } finally {
      set({ loading: false });
    }
  },

  downloadBulk: async () => {
    const { selectedImages, sortedImages, setDownloading } = get();
    const selectedImageData = sortedImages.filter((img) => selectedImages.has(img.id));

    if (selectedImageData.length === 0) return;

    if (selectedImageData.length === 1) {
      const image = selectedImageData[0];
      await downloadSingleImage(image.url, image.alt);
      return;
    }

    setDownloading(true);
    const toastId = toast.loading(`Preparing ZIP file (0/${selectedImageData.length} images)...`);

    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();
      const failedImages: Array<{ alt: string; url: string; reason: string }> = [];
      let completed = 0;

      const concurrencyLimit = 5;
      const queue = [...selectedImageData];

      const processImage = async (image: ImageItem) => {
        try {
          const response = await fetch(image.url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const ext = getFileExtension(blob, image.url);

          let baseName = (image.alt || 'image').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'image';
          if (baseName.length > 60) baseName = baseName.substring(0, 60);
          let fileName = `${baseName}${ext}`;
          let counter = 1;
          while (usedNames.has(fileName.toLowerCase())) {
            fileName = `${baseName}_${counter}${ext}`;
            counter++;
          }
          usedNames.add(fileName.toLowerCase());

          const arrayBuffer = await blob.arrayBuffer();
          zip.file(fileName, arrayBuffer);

          completed++;
          toast.loading(`Preparing ZIP file (${completed}/${selectedImageData.length} images)...`, {
            id: toastId,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
          console.error(`Failed to fetch image "${image.alt || 'image'}": ${errorMessage}`);
          failedImages.push({
            alt: image.alt || 'image',
            url: image.url,
            reason: errorMessage,
          });
          completed++;
          toast.loading(`Preparing ZIP file (${completed}/${selectedImageData.length} images)...`, {
            id: toastId,
          });
        }
      };

      for (let i = 0; i < queue.length; i += concurrencyLimit) {
        const batch = queue.slice(i, i + concurrencyLimit);
        await Promise.all(batch.map(processImage));
      }

      if (failedImages.length === selectedImageData.length) {
        toast.error('Failed to download any of the selected images.', { id: toastId });
        return;
      }

      toast.loading('Generating ZIP file...', { id: toastId });

      const successfulCount = selectedImageData.length - failedImages.length;
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images_${successfulCount}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (failedImages.length > 0) {
        toast.warning(
          `Downloaded ${successfulCount} of ${selectedImageData.length} images. ${failedImages.length} image(s) could not be retrieved.`,
          { id: toastId, duration: 5000 }
        );
      } else {
        toast.success('Zip file processed. Very soon it will start downloading.', { id: toastId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown ZIP generation error';
      console.error(`ZIP creation failed: ${errorMessage}`);
      toast.error('Failed to create ZIP file', { id: toastId });
    } finally {
      setDownloading(false);
    }
  },

  exportCSV: () => {
    const { selectedImages, sortedImages } = get();
    const selectedImageData = sortedImages.filter((img) => selectedImages.has(img.id));
    exportImagesAsCSV(selectedImageData);
  },

  exportJSON: () => {
    const { selectedImages, sortedImages } = get();
    const selectedImageData = sortedImages.filter((img) => selectedImages.has(img.id));
    exportImagesAsJSON(selectedImageData);
  },

  getUniqueDimensions: () => get().uniqueDimensions,
  getUniqueFormats: () => get().uniqueFormats,
  getFilteredImages: () => get().filteredImages,
  getSortedImages: () => get().sortedImages,
}));
