import { useState } from 'react';
import { View, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';
import { ListGroup } from 'heroui-native/list-group';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/src/stores/auth.store';
import { ScreenHeader } from '@/src/components/ScreenHeader';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsItem {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();
  const { user, clearSession } = useAuthStore();

  const [signingOut, setSigningOut] = useState(false);

  const iconColor = isDark ? '#A1A1AA' : '#71717A';

  const onSignOut = () => {
    Alert.alert(t('settings.signOut'), t('auth.signOut') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await clearSession();
          router.replace('/(public)/account/sign-in');
        },
      },
    ]);
  };

  const sections: SettingsSection[] = [
    {
      title: t('settings.account'),
      items: [
        { icon: 'person-outline', label: t('profile.editProfile'), onPress: () => router.push('/(secure)/edit-profile') },
        { icon: 'mail-outline', label: t('settings.changeEmail'), onPress: () => router.push('/(secure)/settings/change-email') },
        { icon: 'lock-closed-outline', label: t('settings.changePassword'), onPress: () => router.push('/(secure)/settings/change-password') },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: 'notifications-outline', label: t('notifications.title'), onPress: () => router.push('/(secure)/settings/notifications') },
        { icon: 'language-outline', label: t('settings.language.title'), onPress: () => router.push('/(secure)/settings/language') },
      ],
    },
    {
      title: t('settings.dangerZone.title'),
      items: [
        { icon: 'log-out-outline', label: signingOut ? t('settings.signingOut') : t('settings.signOut'), onPress: onSignOut, destructive: true },
        { icon: 'trash-outline', label: t('settings.dangerZone.deactivateOrDelete'), onPress: () => router.push('/(secure)/settings/delete-account'), destructive: true },
      ],
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32, gap: 24 }}
    >
      <ScreenHeader title={t('settings.title')} />

      <ListGroup style={{ marginHorizontal: 16 }}>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#006FEE', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={{ width: 44, height: 44 }} contentFit="cover" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                  {user?.firstname?.[0] ?? user?.username?.[0] ?? '?'}
                </Text>
              )}
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>
              {[user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username}
            </ListGroup.ItemTitle>
            <ListGroup.ItemDescription>{user?.email}</ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>

      {sections.map((section) => (
        <View key={section.title} style={{ marginHorizontal: 16 }}>
          <Text className="text-xs text-muted font-medium uppercase" style={{ marginBottom: 8, marginLeft: 4, letterSpacing: 0.8 }}>
            {section.title}
          </Text>
          <ListGroup>
            {section.items.map((item) => (
              <ListGroup.Item key={item.label} onPress={item.onPress}>
                <ListGroup.ItemPrefix>
                  <Ionicons name={item.icon} size={20} color={item.destructive ? '#F31260' : iconColor} />
                </ListGroup.ItemPrefix>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle className='text-[14px] font-normal' style={item.destructive ? { color: '#F31260' } : undefined}>
                    {item.label}
                  </ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                {!item.destructive && <ListGroup.ItemSuffix />}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </View>
      ))}
    </ScrollView>
  );
}
