import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'heroui-native/button';
import { TextField } from 'heroui-native/text-field';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useColorScheme() === 'dark';
  const accentColor = isDark ? '#7AA9F7' : '#006FEE';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!email.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow items-center justify-center px-5 py-8"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <View className="w-full max-w-sm gap-8">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 self-start">
          <Ionicons name="arrow-back" size={20} color={accentColor} />
          <Text className="text-sm text-accent">{t('common.back')}</Text>
        </TouchableOpacity>

        {sent ? (
          <View className="gap-4 items-center">
            <Ionicons name="mail-outline" size={48} color={accentColor} />
            <Text className="text-2xl font-bold text-center">Check your email</Text>
            <Text className="text-base text-default-500 text-center">
              We sent a password reset link to {email}. Check your inbox.
            </Text>
            <Button className="w-full" onPress={() => router.back()}>
              <Button.Label>{t('common.back')}</Button.Label>
            </Button>
          </View>
        ) : (
          <>
            <View className="gap-1">
              <Text className="text-3xl font-bold tracking-tight">
                {t('auth.forgotPassword')}
              </Text>
              <Text className="text-base text-default-500">
                Enter your email and we'll send you a reset link.
              </Text>
            </View>

            <View className="gap-4">
              <TextField isInvalid={!!error}>
                <Label>{t('auth.email')}</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {!!error && (
                  <Text className="text-sm text-danger mt-1">{error}</Text>
                )}
              </TextField>
            </View>

            <Button
              isDisabled={!email.trim() || loading}
              isPending={loading}
              onPress={onSubmit}
              className="w-full"
            >
              <Button.Label>Send reset link</Button.Label>
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}
