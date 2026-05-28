import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

export interface PageResult<T = unknown> {
  items: T[];
  nextPageParam: string | null;
}

export interface PaginatedListProps<T> {
  /**
   * Must be stable (useCallback). Its identity changing triggers a full reset + reload.
   * Close over all filter/search state in the caller so the component stays simple.
   */
  fetchFn: (pageParam: string | null) => Promise<PageResult<T>>;

  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;

  /** Rendered inside the FlatList before items — scrolls with content (chips, tabs, etc.) */
  ListHeaderComponent?: React.ReactNode;

  emptyMessage?: string;
  emptyIcon?: React.ComponentProps<typeof Ionicons>['name'];
  itemSeparatorHeight?: number;
  showDivider?: boolean;
  paddingHorizontal?: number;
  paddingTop?: number;
  /** Called after the first page loads with the item count (0 = empty). */
  onItemsLoaded?: (count: number) => void;
}

export function PaginatedList<T>({
  fetchFn,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  emptyMessage = 'Nothing here yet.',
  emptyIcon = 'document-text-outline',
  itemSeparatorHeight = 12,
  showDivider = false,
  paddingHorizontal = 16,
  paddingTop = 16,
  onItemsLoaded,
}: PaginatedListProps<T>) {
  const isDark = useColorScheme() === 'dark';
  const { bottom } = useSafeAreaInsets();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refs keep callbacks stable while still reading latest values
  const nextPageParamRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Reset + initial load whenever fetchFn identity changes (search, filters, etc.)
  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setLoading(true);
    nextPageParamRef.current = null;

    fetchFn(null)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        nextPageParamRef.current = result.nextPageParam;
        onItemsLoaded?.(result.items.length);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [fetchFn]);

  const loadMore = useCallback(() => {
    const pageParam = nextPageParamRef.current;
    if (!pageParam || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    fetchFnRef.current(pageParam)
      .then((result) => {
        setItems((prev) => [...prev, ...result.items]);
        nextPageParamRef.current = result.nextPageParam;
      })
      .catch(() => {})
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFnRef.current(null)
      .then((result) => {
        setItems(result.items);
        nextPageParamRef.current = result.nextPageParam;
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, []);

  const mutedIconColor = isDark ? '#3A3A3C' : '#D4D4D8';
  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';

  return (
    <FlatList
      data={loading ? [] : items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      ItemSeparatorComponent={() =>
        showDivider ? (
          <View style={{ height: itemSeparatorHeight, justifyContent: 'center' }}>
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </View>
        ) : (
          <View style={{ height: itemSeparatorHeight }} />
        )
      }
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal, paddingTop, paddingBottom: bottom + 80 }}
      ListHeaderComponent={
        ListHeaderComponent ? (
          <View style={{ marginBottom: 12 }}>{ListHeaderComponent}</View>
        ) : undefined
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ paddingVertical: 24 }} /> : null
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={{ marginTop: 80 }} />
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 80, gap: 10 }}>
            <Ionicons name={emptyIcon} size={48} color={mutedIconColor} />
            <Text className="text-sm text-muted">{emptyMessage}</Text>
          </View>
        )
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
    />
  );
}
