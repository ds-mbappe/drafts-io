import { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Tabs, useTabsTrigger } from 'heroui-native/tabs';
import { Ionicons } from '@expo/vector-icons';

function TabLabel({ children }: { children: string }) {
  const { isSelected } = useTabsTrigger();
  const isDark = useColorScheme() === 'dark';
  return (
    <Tabs.Label style={{ color: isSelected ? (isDark ? '#FAFAFA' : '#18181B') : undefined }}>
      {children}
    </Tabs.Label>
  );
}

import { api } from '@/src/lib/api';
import { DraftIndex, PageResult } from '@/src/components/DraftIndex';
import { useDebounce } from '@/src/hooks/useDebounce';

type FeedTab = 'trending' | 'following';

export default function FeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pushDraft, pushUser } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState<FeedTab>('trending');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const inputBg = isDark ? '#2C2C2E' : '#F4F4F5';
  const placeholderColor = isDark ? '#71717A' : '#A1A1AA';
  const iconColor = isDark ? '#71717A' : '#A1A1AA';
  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';

  const fetchTrending = useCallback(async (pageParam: string | null): Promise<PageResult> => {
    const skip = pageParam ? parseInt(pageParam, 10) : 0;
    const { data } = await api.get('/drafts/trending', { params: { limit: 10, skip } });
    return {
      items: data.items ?? [],
      nextPageParam: data.hasMore ? String(data.nextSkip) : null,
    };
  }, []);

  const fetchFollowing = useCallback(async (pageParam: string | null): Promise<PageResult> => {
    const { data } = await api.get('/drafts/following', {
      params: { search: debouncedSearch || undefined, cursor: pageParam || undefined },
    });
    return {
      items: data.items ?? [],
      nextPageParam: data.nextCursor ?? null,
    };
  }, [debouncedSearch]);

  const onTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    setSearch('');
  };

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Sticky header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 14, gap: 12 }}>
        <Text className="text-2xl font-bold">{t('nav.feed')}</Text>

        {/* Segment control */}
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as FeedTab)}>
          <Tabs.List className="w-full">
            <Tabs.Trigger value="trending" style={{ flex: 1 }}>
              <TabLabel>{t('feed.trendingTitle')}</TabLabel>
            </Tabs.Trigger>
            <Tabs.Trigger value="following" style={{ flex: 1 }}>
              <TabLabel>{t('feed.followingTitle')}</TabLabel>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs>

        {/* Search bar — Following tab only */}
        {activeTab === 'following' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 12, height: 40, gap: 8 }}>
            <Ionicons name="search" size={16} color={iconColor} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('feed.searchPlaceholder')}
              placeholderTextColor={placeholderColor}
              style={{ flex: 1, fontSize: 15, color: isDark ? '#FAFAFA' : '#18181B', padding: 0 }}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={{ height: 1, backgroundColor: dividerColor }} />

      {/* key on activeTab remounts DraftIndex cleanly on tab switch */}
      <DraftIndex
        key={activeTab}
        fetchFn={activeTab === 'trending' ? fetchTrending : fetchFollowing}
        emptyMessage={activeTab === 'following' ? t('feed.notFollowingAnybody') : t('feed.noTrendingDrafts')}
        onPressDraft={(id) => pushDraft(id)}
      />

    </View>
  );
}
