import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/stores/auth.store';

export default function Index() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#006FEE" />
      </View>
    );
  }

  if (user) return <Redirect href="/(secure)/(tabs)/" />;
  return <Redirect href="/(public)/account/sign-in" />;
}
