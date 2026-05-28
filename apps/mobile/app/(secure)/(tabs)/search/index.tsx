import { useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ScrollView, useColorScheme, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBarCommands } from 'react-native-screens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { DraftIndex, PageResult } from '@/src/components/DraftIndex';
import { DraftListItem } from '@/src/components/DraftCard';
import { useDebounce } from '@/src/hooks/useDebounce';

interface Topic { name: string; count: number }

export default function SearchScreen() {
  const { t } = useTranslation();
  const { pushDraft } = useTabRouter();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const searchBarRef = useRef<SearchBarCommands>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const hasQuery = debouncedSearch.length > 0 || activeTopics.length > 0;

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => searchBarRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }, []),
  );

  useEffect(() => {
    api.get('/drafts/topics')
      .then(({ data }) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleTopic = (topic: string) =>
    setActiveTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );

  const fetchResults = useCallback(async (pageParam: string | null): Promise<PageResult<DraftListItem>> => {
    const params: Record<string, any> = {
      search: debouncedSearch || undefined,
      cursor: pageParam || undefined,
    };
    if (activeTopics.length > 0) params.topic = activeTopics;
    const { data } = await api.get('/drafts', { params });
    return { items: data.items ?? [], nextPageParam: data.nextCursor ?? null };
  }, [debouncedSearch, activeTopics]);

  const indexKey = `${debouncedSearch}::${activeTopics.join(',')}`;

  const TopicChips = topics.length > 0 ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingBottom: 4, paddingHorizontal: 16 }}
    >
      {topics.map(({ name }) => {
        const isActive = activeTopics.includes(name);
        return (
          <TouchableOpacity
            key={name}
            onPress={() => toggleTopic(name)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              backgroundColor: isActive ? '#006FEE' : isDark ? '#2C2C2E' : '#F4F4F5',
              borderWidth: isActive ? 0 : 1,
              borderColor: isDark ? '#3A3A3C' : '#E4E4E7',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? '#fff' : isDark ? '#A1A1AA' : '#71717A' }}>
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ) : undefined;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }} className="bg-background">
      <Stack.Screen
        options={{
          title: t('nav.search'),
          headerLargeTitleEnabled: true,
          headerSearchBarOptions: {
            ref: searchBarRef,
            placeholder: t('search.placeholder'),
            placement: 'automatic',
            onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) =>
              setSearch(e.nativeEvent.text),
            onCancelButtonPress: () => {
              setSearch('');
              router.navigate('/(secure)/(tabs)/home');
            },
          },
        }}
      />

      {hasQuery ? (
        <DraftIndex
          key={indexKey}
          fetchFn={fetchResults}
          ListHeaderComponent={TopicChips}
          emptyMessage={t('feed.noSearchResults')}
          onPressDraft={(id) => pushDraft(id)}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {TopicChips}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ionicons name="search-outline" size={44} color={isDark ? '#3A3A3C' : '#D4D4D8'} />
            <Text style={{ fontSize: 15, color: isDark ? '#71717A' : '#A1A1AA' }}>
              {t('search.idle')}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
