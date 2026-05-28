import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, RefreshControl, ActivityIndicator, useColorScheme } from 'react-native';

import { useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Tabs, useTabsTrigger } from 'heroui-native/tabs';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/stores/auth.store';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { ProfileStatRow } from '@/src/components/ProfileStatRow';
import { ProfileDraftRow } from '@/src/components/ProfileDraftRow';
import type { ProfileDraft } from '@/src/hooks/useUserProfile';

type ActiveTab = 'published' | 'drafts';

interface ProfileData {
  id: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
  avatar: string | null;
  stats: { followers: number; following: number; publishedDrafts: number; totalLikes: number };
}

function TabLabel({ children }: { children: string }) {
  const { isSelected } = useTabsTrigger();
  const isDark = useColorScheme() === 'dark';
  return (
    <Tabs.Label style={{ color: isSelected ? (isDark ? '#FAFAFA' : '#18181B') : undefined }}>
      {children}
    </Tabs.Label>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pushDraft } = useTabRouter();
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [publishedDrafts, setPublishedDrafts] = useState<ProfileDraft[]>([]);
  const [privateDrafts, setPrivateDrafts] = useState<ProfileDraft[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('published');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    const [profileRes, libraryRes] = await Promise.allSettled([
      api.get('/user/me/profile'),
      api.get('/drafts/my_library'),
    ]);

    if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);

    const all: ProfileDraft[] =
      libraryRes.status === 'fulfilled' ? (libraryRes.value.data?.items ?? []) : [];

    const published = all.filter((d) => !d.private);
    const drafts = all.filter((d) => d.private);
    setPublishedDrafts(published);
    setPrivateDrafts(drafts);

    if (published.length === 0 && drafts.length > 0) setActiveTab('drafts');

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchProfile(); }, [fetchProfile]);

  const dividerColor = isDark ? '#2C2C2E' : '#D4D4D8';
  const displayName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || '';
  const visibleDrafts = activeTab === 'published' ? publishedDrafts : privateDrafts;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} className="bg-background">
        <ActivityIndicator color={isDark ? '#FAFAFA' : '#18181B'} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} className="bg-background">
    <ScrollView
      className="flex-1 bg-background"
      stickyHeaderIndices={[1]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 0 — scrollable profile header */}
      <View style={{ paddingTop: insets.top }}>
        <TouchableOpacity
          onPress={() => router.push('/(secure)/settings')}
          style={{ position: 'absolute', top: insets.top + 8, right: 16, zIndex: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={isDark ? '#FAFAFA' : '#18181B'} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 24 }}>
          {user && (
            <ProfileAvatar
              avatar={user.avatar}
              firstname={user.firstname}
              lastname={user.lastname}
              username={user.username}
              size={88}
            />
          )}
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text className="text-2xl font-bold">{displayName}</Text>
            <Text className="text-sm text-muted">@{user?.username}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(secure)/edit-profile')}
            style={{ marginTop: 4, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: dividerColor }}
          >
            <Text className="text-sm font-medium">{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>

        <ProfileStatRow stats={[
          { value: profile?.stats.publishedDrafts ?? 0, label: t('profile.published') },
          { value: profile?.stats.followers ?? 0, label: t('profile.followers') },
          { value: profile?.stats.following ?? 0, label: t('profile.following') },
        ]} />

        <View style={{ height: 1, backgroundColor: dividerColor }} />
      </View>

      {/* 1 — sticky tab bar */}
      <View className="bg-background" style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Tabs
          value={activeTab}
          variant="primary"
          onValueChange={(v) => setActiveTab(v as ActiveTab)}
        >
          <Tabs.List className="w-full">
            <Tabs.Trigger value="published" style={{ flex: 1 }}>
              <TabLabel>{t('profile.published')}</TabLabel>
            </Tabs.Trigger>
            <Tabs.Trigger value="drafts" style={{ flex: 1 }}>
              <TabLabel>{t('profile.drafts')}</TabLabel>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs>
      </View>

      {/* 2 — tab content */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        {visibleDrafts.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
            <Ionicons name="document-text-outline" size={48} color={isDark ? '#3A3A3C' : '#D4D4D8'} />
            <Text className="text-sm text-muted">
              {activeTab === 'published' ? t('profile.noPublished') : t('profile.noDrafts')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            {visibleDrafts.map((draft) => (
              <ProfileDraftRow
                key={draft.id}
                draft={draft}
                isPrivate={draft.private}
                onPress={() => pushDraft(draft.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    </View>
  );
}
