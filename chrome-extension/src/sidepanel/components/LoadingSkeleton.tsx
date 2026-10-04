const CARD_HEIGHTS = [140, 185, 160, 135, 175, 150];

interface LoadingSkeletonProps {
  showHeader?: boolean;
}

export const LoadingSkeleton = ({ showHeader = false }: LoadingSkeletonProps) => {
  return (
    <div className="skeleton-container">
      {/* Header skeleton (rendered when standalone) */}
      {showHeader && (
        <div className="header-row">
          <div className="header-brand">
            <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 7 }} />
            <div className="skeleton" style={{ width: 52, height: 16, borderRadius: 4 }} />
          </div>
          <div className="header-actions">
            <div className="skeleton skeleton-header-box" />
            <div className="skeleton skeleton-header-box" />
          </div>
        </div>
      )}

      {/* Filter Accordion skeleton matching FilterBar */}
      <div className="skeleton-filter-accordion">
        <div className="skeleton-filter-left">
          <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 155, height: 13, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} />
      </div>

      {/* Status text skeleton */}
      <div
        className="skeleton"
        style={{ width: 150, height: 13, marginBottom: 10, borderRadius: 4 }}
      />

      {/* Select all skeleton */}
      <div className="select-all-row">
        <div
          className="skeleton"
          style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }}
        />
        <div className="skeleton" style={{ width: 95, height: 13, borderRadius: 4 }} />
      </div>

      {/* Image grid skeleton */}
      <div className="image-grid">
        {CARD_HEIGHTS.map((height, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-media-wrapper">
              <div className="skeleton skeleton-media" style={{ height }} />
              <div className="skeleton skeleton-overlay-check" />
              <div className="skeleton skeleton-overlay-badge" />
            </div>
            <div className="card-body">
              <div
                className="skeleton skeleton-text"
                style={{ width: '80%', height: 12, borderRadius: 3, marginBottom: 8 }}
              />
              <div className="card-badges-row">
                <div className="skeleton skeleton-badge" style={{ width: 56 }} />
                <div className="skeleton skeleton-badge" style={{ width: 44 }} />
              </div>
              <div className="skeleton-card-footer">
                <div className="skeleton skeleton-btn-action" />
                <div className="skeleton skeleton-btn-action" />
                <div className="skeleton skeleton-btn-action" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
