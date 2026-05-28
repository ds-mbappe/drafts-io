import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/auth.store';

export default function SecureLayout() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/(public)/account/sign-in');
    }
  }, [isHydrated, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="settings/index"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings/change-email"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings/change-password"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings/delete-account"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings/notifications"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings/language"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
