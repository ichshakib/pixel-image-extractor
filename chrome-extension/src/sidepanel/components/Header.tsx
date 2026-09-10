import { RefreshCcw } from 'lucide-react';
import { useImageStore } from '../store/useImageStore';

export const Header = () => {
  const loading = useImageStore((s) => s.loading);
  const fetchImagesFromTab = useImageStore((s) => s.fetchImagesFromTab);

  return (
    <header className="header-row">
      <div className="header-brand">
        <div className="header-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" fill="none">
            <defs>
              <linearGradient id="hdr-center" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF3B69"/>
                <stop offset="50%" stop-color="#8B5CF6"/>
                <stop offset="100%" stop-color="#00C9FF"/>
              </linearGradient>
              <linearGradient id="hdr-top" x1="24" y1="4" x2="24" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF2E56"/>
                <stop offset="100%" stop-color="#FF6B4A"/>
              </linearGradient>
              <linearGradient id="hdr-topright" x1="30" y1="11" x2="42" y2="23" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF8A00"/>
                <stop offset="100%" stop-color="#FFAE00"/>
              </linearGradient>
              <linearGradient id="hdr-botright" x1="30" y1="25" x2="42" y2="37" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#00D072"/>
                <stop offset="100%" stop-color="#00B4D8"/>
              </linearGradient>
              <linearGradient id="hdr-bottom" x1="24" y1="32" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#0088FF"/>
                <stop offset="100%" stop-color="#244BFF"/>
              </linearGradient>
              <linearGradient id="hdr-botleft" x1="6" y1="25" x2="18" y2="37" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#5E17EB"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
              <linearGradient id="hdr-topleft" x1="6" y1="11" x2="18" y2="23" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#D9138A"/>
                <stop offset="100%" stop-color="#FF2A6D"/>
              </linearGradient>
            </defs>
            <g>
              <circle cx="24" cy="10" r="6" fill="url(#hdr-top)"/>
              <circle cx="36.124" cy="17" r="6" fill="url(#hdr-topright)"/>
              <circle cx="36.124" cy="31" r="6" fill="url(#hdr-botright)"/>
              <circle cx="24" cy="38" r="6" fill="url(#hdr-bottom)"/>
              <circle cx="11.876" cy="31" r="6" fill="url(#hdr-botleft)"/>
              <circle cx="11.876" cy="17" r="6" fill="url(#hdr-topleft)"/>
              <circle cx="24" cy="24" r="6" fill="url(#hdr-center)"/>
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
