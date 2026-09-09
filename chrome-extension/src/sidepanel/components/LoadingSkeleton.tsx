export const LoadingSkeleton = () => {
  return (
    <div className="sidepanel-container">
      {/* Header skeleton */}
      <div className="header-row">
        <div className="skeleton" style={{ width: 100, height: 26, borderRadius: 6 }} />
        <div className="header-actions">
          <div className="skeleton skeleton-header-box" />
          <div className="skeleton skeleton-header-box" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="filter-bar">
        <div className="skeleton skeleton-filter-box" />
        <div className="skeleton skeleton-filter-box" />
        <div className="skeleton skeleton-filter-box" />
        <div className="skeleton skeleton-filter-box" />
      </div>

      {/* Status text skeleton */}
      <div className="skeleton" style={{ width: 180, height: 14, marginBottom: 12 }} />

      {/* Select all skeleton */}
      <div className="select-all-row">
        <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 110, height: 14 }} />
      </div>

      {/* Image grid skeleton */}
      <div className="image-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton skeleton-media" style={{ height: index % 2 === 0 ? 140 : 180 }} />
            <div className="card-body">
              <div className="skeleton skeleton-text" style={{ width: '80%' }} />
              <div className="skeleton skeleton-text" style={{ width: '50%', height: 10 }} />
              <div className="skeleton skeleton-text" style={{ width: '60%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
