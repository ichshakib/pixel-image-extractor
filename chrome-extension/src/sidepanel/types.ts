export interface ImageItem {
  id: number;
  url: string;
  width: number;
  height: number;
  alt: string;
  mimetype?: string;
  size?: number; // file size in bytes
}

export interface RawImageItem {
  url: string;
  width: number;
  height: number;
  alt: string;
  mimetype?: string;
  size?: number;
}

export type SortByOption = 'size' | 'width' | 'height' | 'mimetype' | 'dimensions';
export type SortOrder = 'asc' | 'desc';
