import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { useImageStore } from '../store/useImageStore';
import type { SortByOption, SortOrder } from '../types';

export const FilterBar = () => {
  const [isOpen, setIsOpen] = useState(false);

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

  const hasActiveFilters =
    selectedSize !== 'all' || selectedFormat !== 'all' || sortBy !== 'size' || sortOrder !== 'desc';

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSize('all');
    setSelectedFormat('all');
    setSortBy('size');
    setSortOrder('desc');
  };

  return (
    <div className={`filter-accordion ${isOpen ? 'is-open' : ''}`}>
      <div
        className="filter-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <div className="filter-accordion-title">
          <SlidersHorizontal size={14} className="filter-icon" />
          <span className="filter-title-text">Advanced Filters & Sorting</span>
          {hasActiveFilters && <span className="filter-active-badge">Active</span>}
        </div>

        <div className="filter-accordion-right">
          {hasActiveFilters && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={handleReset}
              title="Reset all filters"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
          <div className={`chevron-wrapper ${isOpen ? 'rotated' : ''}`}>
            <ChevronDown size={15} />
          </div>
        </div>
      </div>

      <div className="filter-accordion-body">
        <div className="filter-accordion-inner">
          <div className="filter-grid">
            {/* Sort by */}
            <div className="filter-field">
              <label htmlFor="filter-sort-by" className="filter-field-label">
                Sort by
              </label>
              <select
                id="filter-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortByOption)}
                className="filter-select"
              >
                <option value="size">File Size</option>
                <option value="width">Width</option>
                <option value="height">Height</option>
                <option value="dimensions">Dimensions (Pixels)</option>
                <option value="mimetype">MIME Type</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="filter-field">
              <label htmlFor="filter-sort-order" className="filter-field-label">
                Order
              </label>
              <select
                id="filter-sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="filter-select"
              >
                <option value="desc">Descending (High to Low)</option>
                <option value="asc">Ascending (Low to High)</option>
              </select>
            </div>

            {/* Filter by Size */}
            <div className="filter-field">
              <label htmlFor="filter-size" className="filter-field-label">
                Resolution
              </label>
              <select
                id="filter-size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="filter-select"
              >
                <option value="all">All resolutions</option>
                {uniqueDimensions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Format */}
            <div className="filter-field">
              <label htmlFor="filter-format" className="filter-field-label">
                Format
              </label>
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
        </div>
      </div>
    </div>
  );
};
