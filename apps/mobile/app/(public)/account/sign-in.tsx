import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'heroui-native/button';
import { Spinner } from 'heroui-native/spinner';
import { LinearTransition, FadeIn } from 'react-native-reanimated';
import { TextField } from 'heroui-native/text-field';
import { Input } from 'heroui-native/input';
import { InputGroup } from 'heroui-native/input-group';
import { Label } from 'heroui-native/label';
import { FieldError } from 'heroui-native/field-error';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/stores/auth.store';
import { useSocialAuth } from '@/src/hooks/useSocialAuth';

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FAFAFA' : '#18181B';
  const mutedIconColor = isDark ? '#A1A1AA' : '#71717A';

  const google = useSocialAuth('google');
  const facebook = useSocialAuth('facebook');
  const github = useSocialAuth('github');

  const isValid = email.trim().length > 0 && password.length > 0;

  const onSignIn = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/signin', { email, password });
      await setSession(data.user, data.access_token, data.refresh_token);
      router.replace('/(secure)/(tabs)/');
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
      contentContainerClassName="flex-grow items-center justify-center px-5"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <View className="w-full max-w-sm gap-8">
        {/* Header */}
        <View className="gap-1">
          <Text className="text-3xl font-bold">{t('auth.signIn')}</Text>
          <Text className="text-base text-muted">
            Welcome back. Sign in to continue.
          </Text>
        </View>

        {/* Social buttons */}
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1" onPress={google.signIn}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
          </Button>
          <Button variant="outline" className="flex-1" onPress={facebook.signIn}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          </Button>
          <Button variant="outline" className="flex-1" onPress={github.signIn}>
            <Ionicons name="logo-github" size={20} color={iconColor} />
          </Button>
        </View>

        {/* Divider */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-sm text-muted">{t('auth.orContinueWith')}</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Form */}
        <View className="gap-4">
          <TextField>
            <Label>{t('auth.email')}</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </TextField>

          <TextField isInvalid={!!error}>
            <Label>{t('auth.password')}</Label>
            <InputGroup>
              <InputGroup.Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <InputGroup.Suffix>
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  className="px-3 h-full justify-center"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={mutedIconColor}
                  />
                </TouchableOpacity>
              </InputGroup.Suffix>
            </InputGroup>
            {!!error && <FieldError>{error}</FieldError>}
          </TextField>

          <Link href="/(public)/account/reset-password" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-accent">{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Submit */}
        <Button
          layout={LinearTransition.springify()}
          isDisabled={!isValid || loading}
          isIconOnly={loading}
          onPress={onSignIn}
          className="w-full"
        >
          {loading ? (
            <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
          ) : (
            <Button.Label>{t('auth.signIn')}</Button.Label>
          )}
        </Button>

        {/* Sign up link */}
        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted">{t('auth.noAccount')}</Text>
          <Link href="/(public)/account/sign-up" replace asChild>
            <TouchableOpacity>
              <Text className="text-sm text-accent font-medium">{t('auth.signUp')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
