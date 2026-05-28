import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, right }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#FAFAFA' : '#18181B'} />
        <Text className="text-xl font-bold">{title}</Text>
      </TouchableOpacity>
      {right && <View>{right}</View>}
    </View>
  );
}
