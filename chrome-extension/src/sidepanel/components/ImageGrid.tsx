import { toast } from '../utils/toast';
import { ImageCard } from './ImageCard';
import { downloadSingleImage } from '../utils/export';
import { useImageStore } from '../store/useImageStore';

export const ImageGrid = () => {
  const images = useImageStore((s) => s.sortedImages);
  const selectedImages = useImageStore((s) => s.selectedImages);
  const toggleImageSelect = useImageStore((s) => s.toggleImageSelect);
  const selectAllImages = useImageStore((s) => s.selectAllImages);
  const totalCount = useImageStore((s) => s.images.length);
  const filteredCount = useImageStore((s) => s.filteredImages.length);
  const sortBy = useImageStore((s) => s.sortBy);
  const sortOrder = useImageStore((s) => s.sortOrder);

  const handleSelectAll = (checked: boolean) => {
    selectAllImages(checked);
  };

  const handleCopyLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success('Image URL copied to clipboard!');
    } catch {
      toast.error('Failed to copy image URL');
    }
  };

  const handleExternalLink = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const isAllSelected = selectedImages.size === images.length && images.length > 0;

  return (
    <>
      <p className="status-text">
        Found {totalCount} image{totalCount !== 1 ? 's' : ''} on this page
        {filteredCount !== totalCount && (
          <span className="status-badge">(showing {filteredCount} filtered)</span>
        )}
        {sortBy !== 'size' && (
          <span className="status-badge">
            (sorted by {sortBy} {sortOrder === 'asc' ? 'ascending' : 'descending'})
          </span>
        )}
      </p>

      <div className="select-all-row">
        <input
          type="checkbox"
          id="select-all"
          checked={isAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="custom-checkbox"
        />
        <label htmlFor="select-all" className="select-all-label">
          Select All ({selectedImages.size}/{images.length})
        </label>
      </div>

      <div className="image-grid">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            isSelected={selectedImages.has(image.id)}
            onSelect={(id, checked) => toggleImageSelect(id, checked)}
            onDownload={downloadSingleImage}
            onCopyLink={handleCopyLink}
            onExternalLink={handleExternalLink}
          />
        ))}
      </div>
    </>
  );
};
