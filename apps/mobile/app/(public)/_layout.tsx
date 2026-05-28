import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/auth.store';

export default function PublicLayout() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && user) {
      router.replace('/(secure)/(tabs)/');
    }
  }, [isHydrated, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="account/sign-in" />
      <Stack.Screen name="account/sign-up" />
      <Stack.Screen name="account/reset-password" />
    </Stack>
  );
}
