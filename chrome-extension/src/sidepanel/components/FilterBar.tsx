import { useImageStore } from '../store/useImageStore';
import type { SortByOption, SortOrder } from '../types';

export const FilterBar = () => {
  const sortBy = useImageStore((s) => s.sortBy);
  const sortOrder = useImageStore((s) => s.sortOrder);
  const selectedSize = useImageStore((s) => s.selectedSize);
  const selectedFormat = useImageStore((s) => s.selectedFormat);
  const setSortBy = useImageStore((s) => s.setSortBy);
  const setSortOrder = useImageStore((s) => s.setSortOrder);
  const setSelectedSize = useImageStore((s) => s.setSelectedSize);
  const setSelectedFormat = useImageStore((s) => s.setSelectedFormat);
  const uniqueDimensions = useImageStore((s) => s.uniqueDimensions);
  const uniqueFormats = useImageStore((s) => s.uniqueFormats);

  return (
    <div className="filter-bar">
      {/* Sort by */}
      <div className="filter-group">
        <label htmlFor="filter-sort-by" className="filter-label">Sort by:</label>
        <select
          id="filter-sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortByOption)}
          className="filter-select"
        >
          <option value="size">File Size</option>
          <option value="width">Width</option>
          <option value="height">Height</option>
          <option value="dimensions">Dimensions</option>
          <option value="mimetype">MIME Type</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="filter-group">
        <label htmlFor="filter-sort-order" className="filter-label">Order:</label>
        <select
          id="filter-sort-order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="filter-select"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Filter by Size */}
      <div className="filter-group">
        <label htmlFor="filter-size" className="filter-label">Size:</label>
        <select
          id="filter-size"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="filter-select"
        >
          <option value="all">All sizes</option>
          {uniqueDimensions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Filter by Format */}
      <div className="filter-group">
        <label htmlFor="filter-format" className="filter-label">Format:</label>
        <select
          id="filter-format"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="filter-select"
        >
          <option value="all">All formats</option>
          {uniqueFormats.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
