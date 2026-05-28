import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';

interface Props {
  avatar: string | null | undefined;
  firstname: string | null | undefined;
  lastname: string | null | undefined;
  username?: string | null;
  size?: number;
}

export function ProfileAvatar({ avatar, firstname, lastname, username, size = 88 }: Props) {
  const initials = (
    firstname?.[0] ?? username?.[0] ?? '?'
  ).toUpperCase();

  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#006FEE', overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '700' }}>{initials}</Text>
      )}
    </View>
  );
}
