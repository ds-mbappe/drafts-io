import { useEffect } from 'react';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { DynamicColorIOS } from 'react-native';

import { useNotificationStore } from '@/src/stores/notification.store';

const tintColor = DynamicColorIOS({ dark: '#7AA9F7', light: '#006FEE' });

// Cast SF symbol names to bypass version-specific type narrowing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = (name: string) => name as any;

export default function TabsLayout() {
  const { t, i18n } = useTranslation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnread = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  const badgeValue = unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : undefined;

  return (
    <NativeTabs key={i18n.language} blurEffect="systemMaterial" tintColor={tintColor}>
      <NativeTabs.Trigger name="home">
        <Icon sf={{ default: s('newspaper'), selected: s('newspaper.fill') }} />
        <Label>{t('nav.feed')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="write">
        <Icon sf={{ default: s('pencil'), selected: s('pencil') }} />
        <Label>{t('nav.write')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <Icon sf={{ default: s('bell'), selected: s('bell.fill') }} />
        <Label>{t('nav.notifications')}</Label>
        <Badge hidden={!badgeValue}>{badgeValue}</Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: s('person'), selected: s('person.fill') }} />
        <Label>{t('nav.profile')}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
