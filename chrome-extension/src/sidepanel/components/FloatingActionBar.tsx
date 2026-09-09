import { Download, Loader2 } from 'lucide-react';
import { useImageStore } from '../store/useImageStore';

export const FloatingActionBar = () => {
  const selectedCount = useImageStore((s) => s.selectedImages.size);
  const downloading = useImageStore((s) => s.downloading);
  const downloadBulk = useImageStore((s) => s.downloadBulk);
  const exportCSV = useImageStore((s) => s.exportCSV);
  const exportJSON = useImageStore((s) => s.exportJSON);

  if (selectedCount === 0) return null;

  return (
    <div className="floating-bar-wrapper">
      <div className="floating-bar">
        <div className="floating-count">
          {selectedCount} image{selectedCount !== 1 ? 's' : ''} selected
        </div>

        <div className="floating-actions">
          <button
            type="button"
            onClick={downloadBulk}
            disabled={downloading}
            className="btn btn-primary"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="spin-animation" style={{ marginRight: '6px' }} />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <Download size={14} style={{ marginRight: '6px' }} />
                <span>{selectedCount === 1 ? 'Download Image' : 'Download ZIP'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="btn btn-outline"
          >
            CSV Format
          </button>

          <button
            type="button"
            onClick={exportJSON}
            className="btn btn-outline"
          >
            JSON Format
          </button>
        </div>
      </div>
    </div>
  );
};
