import { RefreshCcw } from 'lucide-react';
import { useImageStore } from '../store/useImageStore';

export const Header = () => {
  const loading = useImageStore((s) => s.loading);
  const fetchImagesFromTab = useImageStore((s) => s.fetchImagesFromTab);

  return (
    <header className="header-row">
      <div className="header-brand">
        <div className="header-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16" fill="none">
            <g fill="#1c1510" transform="translate(5 0)">
              <path d="m25.0008 24c0 3.3137-2.6863 6-6 6s-6-2.6863-6-6 2.6863-6 6-6 6 2.6863 6 6z" />
              <path d="m25.0008 10c0 3.3137-2.6863 6-6 6s-6-2.6863-6-6c0-3.31371 2.6863-6 6-6s6 2.68629 6 6z" />
              <path d="m37.125 31c0 3.3137-2.6863 6-6 6s-6-2.6863-6-6 2.6863-6 6-6 6 2.6863 6 6z" />
              <path d="m37.127 17.0002c0 3.3137-2.6863 6-6 6-3.3138 0-6-2.6863-6-6s2.6862-6 6-6c3.3137 0 6 2.6863 6 6z" />
              <path d="m25.0008 38c0 3.3137-2.6863 6-6 6s-6-2.6863-6-6 2.6863-6 6-6 6 2.6863 6 6z" />
              <path d="m12.877 17c0 3.3137-2.6863 6-6.00005 6-3.31371 0-5.999997-2.6863-5.999997-6s2.686287-6 5.999997-6c3.31375 0 6.00005 2.6863 6.00005 6z" />
              <path d="m12.875 30.9997c0 3.3137-2.6863 6-6 6-3.31371 0-6-2.6863-6-6s2.68629-6 6-6c3.3137 0 6 2.6863 6 6z" />
            </g>
          </svg>
        </div>
        <span className="header-title">Pixel</span>
      </div>

      <div className="header-actions">
        <button
          onClick={fetchImagesFromTab}
          disabled={loading}
          className="btn btn-icon"
          title="Refresh images"
          aria-label="Refresh images"
        >
          <RefreshCcw size={15} className={loading ? 'spin-animation' : ''} />
        </button>

        <button
          onClick={() =>
            window.open('https://github.com/ichshakib/pixel-image-extractor', '_blank')
          }
          className="btn btn-icon"
          title="View on GitHub"
          aria-label="View on GitHub"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
};
