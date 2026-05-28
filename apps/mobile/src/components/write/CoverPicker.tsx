import { useState } from 'react';
import { TouchableOpacity, View, Alert, useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';
import { Spinner } from 'heroui-native/spinner';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { api } from '@/src/lib/api';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function CoverPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [uploading, setUploading] = useState(false);

  const inputBg = isDark ? '#2C2C2E' : '#F4F4F5';
  const borderColor = isDark ? '#3A3A3C' : '#E4E4E7';
  const placeholderColor = isDark ? '#52525B' : '#A1A1AA';

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('settings.profile.photoPermissionTitle'), t('settings.profile.photoPermissionDesc'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: 'cover.jpg', type: asset.mimeType ?? 'image/jpeg' } as any);
      formData.append('folder', 'covers');
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(data.url);
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={pick}
      disabled={uploading}
      style={{
        height: 180, borderRadius: 14, overflow: 'hidden',
        backgroundColor: inputBg, borderWidth: 1, borderColor,
        borderStyle: value ? 'solid' : 'dashed',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {value ? (
        <>
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 36, backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {uploading
              ? <Spinner color="current" size="sm" />
              : <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{t('newDraft.coverLabel')}</Text>}
          </View>
        </>
      ) : (
        <View style={{ alignItems: 'center', gap: 8 }}>
          {uploading
            ? <Spinner color="current" size="sm" />
            : <>
                <Ionicons name="image-outline" size={32} color={placeholderColor} />
                <Text style={{ fontSize: 13, color: placeholderColor }}>{t('newDraft.coverLabel')}</Text>
              </>}
        </View>
      )}
    </TouchableOpacity>
  );
}
