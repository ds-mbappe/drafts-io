import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Switch } from 'heroui-native/switch';
import { ListGroup } from 'heroui-native/list-group';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { ScreenHeader } from '@/src/components/ScreenHeader';

interface NotificationSettings {
  notifyOnFollow: boolean;
  notifyOnLike: boolean;
  notifyOnComment: boolean;
}

const DEFAULTS: NotificationSettings = { notifyOnFollow: true, notifyOnLike: true, notifyOnComment: true };

export default function NotificationsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState<keyof NotificationSettings | null>(null);

  const descColor = isDark ? '#A1A1AA' : '#71717A';

  const ROWS: { key: keyof NotificationSettings; icon: React.ComponentProps<typeof Ionicons>['name']; label: string; description: string }[] = [
    { key: 'notifyOnFollow', icon: 'person-add-outline', label: t('settings.notifPrefs.newFollower'), description: t('settings.notifPrefs.newFollowerDesc') },
    { key: 'notifyOnComment', icon: 'chatbubble-outline', label: t('settings.notifPrefs.newComment'), description: t('settings.notifPrefs.newCommentDesc') },
    { key: 'notifyOnLike', icon: 'heart-outline', label: t('settings.notifPrefs.draftLiked'), description: t('settings.notifPrefs.draftLikedDesc') },
  ];

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/notifications');
      setSettings(data);
    } catch {
      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const onRefresh = () => { setRefreshing(true); fetchSettings(); };

  const toggle = async (key: keyof NotificationSettings) => {
    if (!settings || saving) return;
    const newValue = !settings[key];
    setSettings((s) => s ? { ...s, [key]: newValue } : s);
    setSaving(key);
    try {
      await api.patch('/settings/notifications', { [key]: newValue });
    } catch {
      setSettings((s) => s ? { ...s, [key]: !newValue } : s);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title={t('settings.notifPrefs.title')} />
        <ActivityIndicator style={{ marginTop: 40 }} />
      </View>
    );
  }

  const current = settings ?? DEFAULTS;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ScreenHeader title={t('settings.notifPrefs.title')} />

      <ListGroup style={{ marginHorizontal: 16 }}>
        {ROWS.map((row) => (
          <ListGroup.Item key={row.key}>
            <ListGroup.ItemPrefix>
              <Ionicons name={row.icon} size={20} color={descColor} />
            </ListGroup.ItemPrefix>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{row.label}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>{row.description}</ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <Switch
                isSelected={current[row.key]}
                isDisabled={saving !== null}
                onSelectedChange={() => toggle(row.key)}
              />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </ScrollView>
  );
}
