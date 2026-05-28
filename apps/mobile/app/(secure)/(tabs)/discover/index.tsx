import { useState, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { DraftIndex, PageResult } from '@/src/components/DraftIndex';
import { useDebounce } from '@/src/hooks/useDebounce';

interface Topic {
  topic: string;
  count: number;
}

function TopicChips({
  topics,
  active,
  onToggle,
}: {
  topics: Topic[];
  active: string[];
  onToggle: (topic: string) => void;
}) {
  const isDark = useColorScheme() === 'dark';
  if (topics.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
    >
      {topics.map(({ topic }) => {
        const isActive = active.includes(topic);
        return (
          <TouchableOpacity
            key={topic}
            onPress={() => onToggle(topic)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: isActive
                ? '#006FEE'
                : isDark ? '#2C2C2E' : '#F4F4F5',
              borderWidth: isActive ? 0 : 1,
              borderColor: isDark ? '#3A3A3C' : '#E4E4E7',
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: isActive ? '#fff' : isDark ? '#A1A1AA' : '#71717A',
            }}>
              {topic}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pushDraft, pushUser } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const inputBg = isDark ? '#2C2C2E' : '#F4F4F5';
  const placeholderColor = isDark ? '#71717A' : '#A1A1AA';
  const iconColor = isDark ? '#71717A' : '#A1A1AA';
  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';

  useEffect(() => {
    api.get('/drafts/topics')
      .then(({ data }) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleTopic = (topic: string) =>
    setActiveTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );

  const fetchDiscover = useCallback(async (pageParam: string | null): Promise<PageResult> => {
    const params: Record<string, any> = {
      search: debouncedSearch || undefined,
      cursor: pageParam || undefined,
    };
    // axios serialises arrays as topic[]=… by default; backend expects topic=a&topic=b
    if (activeTopics.length > 0) params.topic = activeTopics;

    const { data } = await api.get('/drafts', { params });
    return {
      items: data.items ?? [],
      nextPageParam: data.nextCursor ?? null,
    };
  }, [debouncedSearch, activeTopics]);

  // Stable index key — remount DraftIndex when filters change
  const indexKey = `${debouncedSearch}::${activeTopics.join(',')}`;

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Sticky header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 14, gap: 12 }}>
        <Text className="text-2xl font-bold">{t('nav.discover')}</Text>

        {/* Search bar */}
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
      </View>

      <View style={{ height: 1, backgroundColor: dividerColor }} />

      {/* DraftIndex — topic chips scroll with content as ListHeaderComponent */}
      <DraftIndex
        key={indexKey}
        fetchFn={fetchDiscover}
        ListHeaderComponent={
          topics.length > 0 ? (
            <TopicChips topics={topics} active={activeTopics} onToggle={toggleTopic} />
          ) : undefined
        }
        emptyMessage={t('feed.noSearchResults')}
        onPressDraft={(id) => pushDraft(id)}
      />
    </View>
  );
}
