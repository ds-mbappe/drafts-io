import { useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Button } from 'heroui-native/button';
import { Text } from 'heroui-native/text';
import { useToast } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { PaginatedList, PageResult } from '@/src/components/PaginatedList';
import { useNotificationStore } from '@/src/stores/notification.store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationActor {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  avatar: string | null;
}

interface NotificationItem {
  id: string;
  type: 'FOLLOW' | 'LIKE' | 'COMMENT';
  read: boolean;
  createdAt: string;
  draftId: string | null;
  actor: NotificationActor;
  draft: { id: string; title: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo}mo` : `${Math.floor(mo / 12)}y`;
}

function actorName(actor: NotificationActor): string {
  return (
    [actor.firstname, actor.lastname].filter(Boolean).join(' ') ||
    actor.username ||
    'Someone'
  );
}

// ─── SwipeActions ─────────────────────────────────────────────────────────────

function SwipeActions({
  prog,
  isRead,
  deleting,
  onMarkRead,
  onDelete,
}: {
  prog: SharedValue<number>;
  isRead: boolean;
  deleting: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(prog.value, [0, 0.4, 1], [0, 0.6, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(prog.value, [0, 1], [0.6, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', paddingRight: 16, paddingLeft: 8, gap: 10 }, animStyle]}>
      {!isRead && (
        <Button
          onPress={onMarkRead}
          size="sm"
          isIconOnly
          style={{ backgroundColor: '#006FEE', borderRadius: 999 }}
        >
          <Ionicons name="checkmark-done" size={15} color="#fff" />
        </Button>
      )}
      <Button
        onPress={onDelete}
        size="sm"
        isIconOnly
        isDisabled={deleting}
        style={{ backgroundColor: '#F31260', borderRadius: 999, opacity: deleting ? 0.5 : 1 }}
      >
        <Ionicons name="trash" size={15} color="#fff" />
      </Button>
    </Animated.View>
  );
}

// ─── NotificationRow ──────────────────────────────────────────────────────────

function NotificationRow({
  item,
  onPress,
  onRead,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onRead?: () => void;
}) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const { toast } = useToast();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [read, setRead] = useState(item.read);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name = actorName(item.actor);
  const initials = (
    item.actor.firstname?.[0] ?? item.actor.username?.[0] ?? '?'
  ).toUpperCase();

  const message =
    item.type === 'FOLLOW'
      ? t('notifications.follow', { actor: name })
      : item.type === 'LIKE'
      ? t('notifications.like', { actor: name, title: item.draft?.title ?? '' })
      : t('notifications.comment', { actor: name, title: item.draft?.title ?? '' });

  const iconName: React.ComponentProps<typeof Ionicons>['name'] =
    item.type === 'FOLLOW'
      ? 'person-add-outline'
      : item.type === 'LIKE'
      ? 'heart-outline'
      : 'chatbubble-outline';

  const iconColor =
    item.type === 'FOLLOW' ? '#006FEE' : item.type === 'LIKE' ? '#F31260' : '#17C964';

  const handlePress = () => {
    if (!read) {
      setRead(true);
      onRead?.();
      api.patch(`/notifications/${item.id}/read`).catch(() => {});
    }
    onPress(item);
  };

  const handleMarkRead = () => {
    if (!read) {
      setRead(true);
      onRead?.();
      api.patch(`/notifications/${item.id}/read`).catch(() => {});
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('notifications.deleteOne') || 'Delete notification',
      t('notifications.deleteOneConfirm') || 'Remove this notification?',
      [
        { text: t('common.cancel'), style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/notifications/${item.id}`);
              if (!read) onRead?.();
              toast.show({ variant: 'success', label: t('notifications.deleteOne') });
              setDeleted(true);
            } catch {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (deleted) return null;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={(prog) => (
        <SwipeActions
          prog={prog}
          isRead={read}
          deleting={deleting}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      <GHPressable
        onPress={handlePress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          marginVertical: 3,
          borderRadius: 16,
          overflow: 'hidden',
          opacity: pressed ? 0.7 : 1,
          backgroundColor: read
            ? (isDark ? '#2C2C2E' : '#FFFFFF')
            : isDark ? 'rgba(0,111,238,0.12)' : 'rgba(0,111,238,0.06)',
        })}
      >
        {/* Actor avatar */}
        <View style={{ position: 'relative' }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: '#006FEE', overflow: 'hidden',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {item.actor.avatar ? (
              <Image source={{ uri: item.actor.avatar }} style={{ width: 44, height: 44 }} contentFit="cover" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{initials}</Text>
            )}
          </View>
          <View style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={iconName} size={11} color={iconColor} />
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: isDark ? '#FAFAFA' : '#18181B' }}>
            {message}
          </Text>
          <Text style={{ fontSize: 12, color: isDark ? '#71717A' : '#A1A1AA' }}>
            {relativeTime(item.createdAt)}
          </Text>
        </View>

        {/* Unread dot */}
        {!read && (
          <View style={{ paddingTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#006FEE' }} />
          </View>
        )}
      </GHPressable>
    </ReanimatedSwipeable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pushDraft, pushUser } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { toast } = useToast();

  // Bump to force PaginatedList to reset after bulk mutations
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasItems, setHasItems] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const resetUnread = useNotificationStore((s) => s.reset);
  const fetchUnread = useNotificationStore((s) => s.fetch);
  const decrementUnread = useNotificationStore((s) => s.decrement);

  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';

  const fetchNotifications = useCallback(async (pageParam: string | null): Promise<PageResult<NotificationItem>> => {
    const { data } = await api.get('/notifications', {
      params: { cursor: pageParam || undefined, take: 15 },
    });
    return {
      items: data.notifications ?? [],
      nextPageParam: data.nextCursor ?? null,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all');
    resetUnread();
    setHasItems(false);
    setRefreshKey((k) => k + 1);
    toast.show({ variant: 'success', label: t('notifications.allRead') });
  };

  const handleDeleteAll = () => {
    Alert.alert(
      t('notifications.deleteAll'),
      t('notifications.deleteAllConfirm') || 'Delete all notifications?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await api.delete('/notifications');
            resetUnread();
            setHasItems(false);
            setRefreshKey((k) => k + 1);
            toast.show({ variant: 'success', label: t('notifications.deleteAll') });
          },
        },
      ],
    );
  };

  const handlePressNotification = (item: NotificationItem) => {
    if (item.type === 'FOLLOW') {
      if (item.actor.username) {
        pushUser(item.actor.username);
      }
    } else if (item.draftId) {
      pushDraft(item.draftId);
    }
  };

  const Actions = hasItems ? (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TouchableOpacity
        onPress={handleMarkAllRead}
        disabled={unreadCount === 0}
        style={{
          paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
          backgroundColor: isDark ? '#2C2C2E' : '#F4F4F5',
          opacity: unreadCount === 0 ? 0.4 : 1,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#A1A1AA' : '#71717A' }}>
          {t('notifications.markAllRead')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteAll}
        style={{
          paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
          backgroundColor: isDark ? '#2C2C2E' : '#F4F4F5',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#F31260' }}>
          {t('notifications.deleteAll')}
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Sticky header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text className="text-2xl font-bold">{t('notifications.title')}</Text>
        </View>
        {Actions}
      </View>

      <View style={{ height: 1, backgroundColor: dividerColor }} />

      <PaginatedList<NotificationItem>
        key={refreshKey}
        fetchFn={fetchNotifications}
        renderItem={(item) => (
          <NotificationRow item={item} onPress={handlePressNotification} onRead={decrementUnread} />
        )}
        keyExtractor={(item) => item.id}
        emptyMessage={t('notifications.noNotifications')}
        emptyIcon="notifications-outline"
        itemSeparatorHeight={0}
        paddingHorizontal={0}
        onItemsLoaded={(count) => { setHasItems(count > 0); fetchUnread(); }}
      />
    </View>
  );
}
