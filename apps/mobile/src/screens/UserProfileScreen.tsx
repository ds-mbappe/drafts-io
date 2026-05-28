import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Button } from 'heroui-native/button';
import { Ionicons } from '@expo/vector-icons';

import { useUserProfile } from '@/src/hooks/useUserProfile';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { ProfileStatRow } from '@/src/components/ProfileStatRow';
import { ProfileDraftRow } from '@/src/components/ProfileDraftRow';

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { pushDraft } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();

  const { profile, drafts, loading, refreshing, followLoading, onRefresh, handleFollow } =
    useUserProfile(username);

  const dividerColor = isDark ? '#2C2C2E' : '#D4D4D8';
  const bg = isDark ? '#000000' : '#FFFFFF';
  const textPrimary = isDark ? '#FAFAFA' : '#18181B';

  const displayName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') ||
    profile?.username ||
    username;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header bar */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: bg, borderBottomWidth: 1, borderBottomColor: dividerColor,
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: textPrimary }}>
          {profile?.username ? `@${profile.username}` : username}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <ActivityIndicator color="#006FEE" />
          </View>
        ) : !profile ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 }}>
            <Ionicons name="person-outline" size={48} color={isDark ? '#3A3A3C' : '#D4D4D8'} />
            <Text className="text-sm text-muted">{t('common.error')}</Text>
          </View>
        ) : (
          <>
            {/* Avatar + name + follow */}
            <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 28, paddingBottom: 24 }}>
              <ProfileAvatar
                avatar={profile.avatar}
                firstname={profile.firstname}
                lastname={profile.lastname}
                username={profile.username}
                size={88}
              />

              <View style={{ alignItems: 'center', gap: 2 }}>
                <Text className="text-2xl font-bold">{displayName}</Text>
                {profile.username && (
                  <Text className="text-sm text-muted">@{profile.username}</Text>
                )}
              </View>

              {!profile.isOwnProfile && (
                <Button
                  onPress={handleFollow}
                  isDisabled={followLoading}
                  variant={profile.isFollowing ? 'outline' : 'primary'}
                  size="sm"
                  style={{ marginTop: 4, minWidth: 120 }}
                >
                  <Button.Label>
                    {profile.isFollowing ? t('profile.unfollow') : t('profile.follow')}
                  </Button.Label>
                </Button>
              )}
            </View>

            {/* Stats */}
            <ProfileStatRow stats={[
              { value: profile.stats.publishedDrafts, label: t('profile.published') },
              { value: profile.stats.followers, label: t('profile.followers') },
              { value: profile.stats.following, label: t('profile.following') },
            ]} />

            <View style={{ height: 1, backgroundColor: dividerColor, marginBottom: 20 }} />

            {/* Drafts */}
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {drafts.length === 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
                  <Ionicons name="document-text-outline" size={48} color={isDark ? '#3A3A3C' : '#D4D4D8'} />
                  <Text className="text-sm text-muted">{t('profile.noPublished')}</Text>
                </View>
              ) : (
                drafts.map((draft) => (
                  <ProfileDraftRow
                    key={draft.id}
                    draft={draft}
                    onPress={() => pushDraft(draft.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
