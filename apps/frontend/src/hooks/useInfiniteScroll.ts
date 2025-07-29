
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  initialData: T[];
  loadMoreData: () => Promise<T[]>;
  hasMore: boolean;
}

const useInfiniteScroll = <T,>({ 
  initialData, 
  loadMoreData, 
  hasMore 
}: UseInfiniteScrollProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newData = await loadMoreData();
      setData(prev => [...prev, ...newData]);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMoreData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById('main_container')

      if (!scrollContainer) return

      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const scrollTop = scrollContainer.scrollTop;

      const hasScrollableContent = scrollHeight > clientHeight;
      const isScrolledDown = scrollTop > 200;
      if (hasScrollableContent && isScrolledDown) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return { data, loading, loadMore };
};

export default useInfiniteScroll;