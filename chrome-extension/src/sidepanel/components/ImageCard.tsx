import { Copy, Download, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../utils/export';
import type { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onDownload: (url: string, alt: string) => void;
  onCopyLink: (url: string) => void;
  onExternalLink: (url: string) => void;
}

export const ImageCard = ({
  image,
  isSelected,
  onSelect,
  onDownload,
  onCopyLink,
  onExternalLink,
}: ImageCardProps) => {
  return (
    <div className={`image-card ${isSelected ? 'is-selected' : ''}`}>
      <div className="card-media" onClick={() => onSelect(image.id, !isSelected)}>
        <img
          src={image.url}
          alt={image.alt}
          className="card-img"
          loading="lazy"
        />
        <div className="card-checkbox-overlay" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(image.id, e.target.checked)}
            className="custom-checkbox"
            aria-label={`Select ${image.alt}`}
          />
        </div>
      </div>

      <div className="card-body">
        <p className="card-alt" title={image.alt}>
          {image.alt}
        </p>
        <div className="card-meta">
          <span className="card-meta-line">
            {image.width} × {image.height}
          </span>
          {image.size ? (
            <span className="card-meta-line">Size: {formatFileSize(image.size)}</span>
          ) : null}
          {image.mimetype ? (
            <span className="card-meta-line">Type: {image.mimetype}</span>
          ) : null}
        </div>

        <div className="card-footer">
          <button
            type="button"
            className="btn btn-ghost-sm"
            onClick={() => onDownload(image.url, image.alt)}
            title="Download image"
            aria-label="Download image"
          >
            <Download size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost-sm"
            onClick={() => onCopyLink(image.url)}
            title="Copy image URL"
            aria-label="Copy image URL"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost-sm"
            onClick={() => onExternalLink(image.url)}
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
