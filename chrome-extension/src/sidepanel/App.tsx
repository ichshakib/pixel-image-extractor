import { useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { FloatingActionBar } from './components/FloatingActionBar';
import { ImageGrid } from './components/ImageGrid';
import { EmptyState } from './components/EmptyState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/Toaster';
import { useImageStore } from './store/useImageStore';

export default function App() {
  const loading = useImageStore((s) => s.loading);
  const imagesCount = useImageStore((s) => s.images.length);
  const fetchImagesFromTab = useImageStore((s) => s.fetchImagesFromTab);

  useEffect(() => {
    fetchImagesFromTab();
  }, [fetchImagesFromTab]);

  return (
    <ErrorBoundary>
      <div className="sidepanel-container">
        <Header />
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {imagesCount > 0 && <FilterBar />}
            <FloatingActionBar />
            {imagesCount === 0 ? <EmptyState /> : <ImageGrid />}
          </>
        )}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
