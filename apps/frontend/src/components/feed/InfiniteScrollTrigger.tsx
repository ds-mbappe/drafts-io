import { useEffect, useRef } from 'react';
import { Spinner } from '@heroui/react';

export const InfiniteScrollTrigger = ({
  onIntersect,
  hasMore,
  isLoading,
}: {
  onIntersect: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isLoading) onIntersect(); },
      { rootMargin: '200px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onIntersect]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="w-full flex justify-center py-6">
      {isLoading && <Spinner size="sm" />}
    </div>
  );
};
