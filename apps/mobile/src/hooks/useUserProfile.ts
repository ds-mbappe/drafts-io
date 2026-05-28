import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from 'heroui-native';

import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/stores/auth.store';

export interface UserProfile {
  id: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  avatar: string | null;
  isFollowing: boolean;
  isOwnProfile: boolean;
  stats: {
    followers: number;
    following: number;
    publishedDrafts: number;
    totalLikes: number;
  };
}

export interface ProfileDraft {
  id: string;
  title: string;
  intro: string | null;
  word_count: number | null;
  createdAt: string;
  cover: string | null;
  private?: boolean;
}

export function useUserProfile(username: string | undefined) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [drafts, setDrafts] = useState<ProfileDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const load = useCallback(async () => {
    if (!username) return;
    try {
      const [profileRes, draftsRes] = await Promise.all([
        api.get(`/user/${username}/profile`),
        api.get(`/drafts/user/${username}`),
      ]);
      setProfile(profileRes.data);
      setDrafts(draftsRes.data?.items ?? []);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleFollow = useCallback(async () => {
    if (!profile || !currentUser) return;
    const wasFollowing = profile.isFollowing;
    setProfile((p) => p ? {
      ...p,
      isFollowing: !wasFollowing,
      stats: { ...p.stats, followers: p.stats.followers + (wasFollowing ? -1 : 1) },
    } : p);
    setFollowLoading(true);
    try {
      if (wasFollowing) {
        await api.delete('/relations/unfollow', { data: { followerId: currentUser.id, followingId: profile.id } });
        toast.show({ variant: 'default', label: t('profile.unfollowedToast') });
      } else {
        await api.post('/relations/follow', { followerId: currentUser.id, followingId: profile.id });
        toast.show({ variant: 'success', label: t('profile.followedToast') });
      }
    } catch {
      setProfile((p) => p ? {
        ...p,
        isFollowing: wasFollowing,
        stats: { ...p.stats, followers: p.stats.followers + (wasFollowing ? 1 : -1) },
      } : p);
    } finally {
      setFollowLoading(false);
    }
  }, [profile, currentUser, t, toast]);

  return { profile, drafts, loading, refreshing, followLoading, onRefresh, handleFollow };
}
