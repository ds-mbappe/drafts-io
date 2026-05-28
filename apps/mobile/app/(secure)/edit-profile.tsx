import { useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Text } from 'heroui-native/text';
import { Button } from 'heroui-native/button';
import { Spinner } from 'heroui-native/spinner';
import { TextField } from 'heroui-native/text-field';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { Ionicons } from '@expo/vector-icons';
import { LinearTransition, FadeIn } from 'react-native-reanimated';

import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/stores/auth.store';
import { ScreenHeader } from '@/src/components/ScreenHeader';

const AVATAR_SIZE = 88;

function AvatarPicker({
  uri,
  firstname,
  lastname,
  username,
  uploading,
  onPress,
}: {
  uri: string | null;
  firstname: string;
  lastname: string;
  username: string;
  uploading: boolean;
  onPress: () => void;
}) {
  const initials = [firstname?.[0], lastname?.[0]].filter(Boolean).join('').toUpperCase() || username?.[0]?.toUpperCase() || '?';

  return (
    <TouchableOpacity onPress={onPress} disabled={uploading} style={{ alignSelf: 'center' }}>
      <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: 'hidden', backgroundColor: '#006FEE', alignItems: 'center', justifyContent: 'center' }}>
        {uri ? (
          <Image source={{ uri }} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} contentFit="cover" />
        ) : (
          <Text style={{ color: '#fff', fontSize: AVATAR_SIZE * 0.38, fontWeight: '700' }}>{initials}</Text>
        )}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 28, backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {uploading
            ? <Spinner color="current" size="sm" />
            : <Ionicons name="camera" size={16} color="#fff" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, setSession } = useAuthStore();

  const [form, setForm] = useState({
    firstname: user?.firstname ?? '',
    lastname: user?.lastname ?? '',
    username: user?.username ?? '',
  });
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('settings.profile.photoPermissionTitle'), t('settings.profile.photoPermissionDesc'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as any);
      formData.append('folder', 'avatars');

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatar(data.url);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.patch('/settings/profile', { ...form, avatar });
      const accessToken = useAuthStore.getState().accessToken!;
      const refreshToken = useAuthStore.getState().refreshToken!;
      await setSession(data.user ?? data, accessToken, refreshToken);
      Alert.alert(t('common.save'), t('settings.profile.profileUpdated'));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    form.firstname !== (user?.firstname ?? '') ||
    form.lastname !== (user?.lastname ?? '') ||
    form.username !== (user?.username ?? '') ||
    avatar !== (user?.avatar ?? null);

  return (
    <ScrollView
      className="flex-1 bg-background"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScreenHeader title={t('profile.editProfile')} />

      <View style={{ paddingHorizontal: 16, gap: 20 }}>
        <AvatarPicker
          uri={avatar}
          firstname={form.firstname}
          lastname={form.lastname}
          username={form.username}
          uploading={uploading}
          onPress={pickAvatar}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TextField className="flex-1">
            <Label>{t('settings.profile.firstName')}</Label>
            <Input value={form.firstname} onChangeText={set('firstname')} placeholder="John" autoCapitalize="words" />
          </TextField>
          <TextField className="flex-1">
            <Label>{t('settings.profile.lastName')}</Label>
            <Input value={form.lastname} onChangeText={set('lastname')} placeholder="Doe" autoCapitalize="words" />
          </TextField>
        </View>

        <TextField>
          <Label>{t('settings.profile.username')}</Label>
          <Input value={form.username} onChangeText={set('username')} placeholder="johndoe" autoCapitalize="none" autoCorrect={false} />
        </TextField>

        {!!error && <Text className="text-sm text-danger">{error}</Text>}

        <Button
          size="sm"
          layout={LinearTransition.springify()}
          isDisabled={!hasChanges || loading || uploading}
          isIconOnly={loading}
          onPress={onSave}
          className="w-full"
        >
          {loading ? (
            <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
          ) : (
            <Button.Label>{t('settings.profile.saveChanges')}</Button.Label>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
