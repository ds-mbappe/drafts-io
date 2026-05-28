import { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { DraftIndex } from '@/src/components/DraftIndex';
import { useDebounce } from '@/src/hooks/useDebounce';
import type { PageResult } from '@/src/components/PaginatedList';
import type { DraftListItem } from '@/src/components/DraftCard';

export default function LibraryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pushDraft, pushUser } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const inputBg = isDark ? '#2C2C2E' : '#F4F4F5';
  const placeholderColor = isDark ? '#71717A' : '#A1A1AA';
  const iconColor = isDark ? '#71717A' : '#A1A1AA';
  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';

  const fetchLibrary = useCallback(async (pageParam: string | null): Promise<PageResult<DraftListItem>> => {
    const { data } = await api.get('/drafts/my_library', {
      params: { search: debouncedSearch || undefined, cursor: pageParam || undefined },
    });
    return {
      items: data.items ?? [],
      nextPageParam: data.nextCursor ?? null,
    };
  }, [debouncedSearch]);

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Sticky header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text className="text-2xl font-bold">{t('library.title')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/(secure)/(tabs)/write')}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#006FEE', paddingHorizontal: 14,
              paddingVertical: 8, borderRadius: 20,
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{t('library.newDraft')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 12, height: 40, gap: 8 }}>
          <Ionicons name="search" size={16} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('library.searchPlaceholder')}
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

      <DraftIndex
        key={debouncedSearch}
        fetchFn={fetchLibrary}
        emptyMessage={search ? t('library.noResults') : t('library.noDrafts')}
        onPressDraft={(id) => pushDraft(id)}
      />
    </View>
  );
}
