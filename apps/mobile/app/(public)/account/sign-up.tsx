import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
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

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = t('auth.emailRequired');
    if (!form.password) e.password = t('auth.passwordRequired');
    if (form.password && form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSignUp = async () => {
    if (!validate() || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      await setSession(data.user, data.access_token, data.refresh_token);
      router.replace('/(secure)/(tabs)/');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setErrors({ general: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.email.trim() && form.password && form.username.trim();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow items-center justify-center px-5 py-8"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <View className="w-full max-w-sm gap-8">
        {/* Header */}
        <View className="gap-1">
          <Text className="text-3xl font-bold tracking-tight">
            {t('auth.signUp')}
          </Text>
          <Text className="text-base text-muted">
            Create your account to get started.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="flex-row gap-3">
            <TextField className="flex-1">
              <Label>{t('settings.profile.firstName')}</Label>
              <Input
                value={form.firstname}
                onChangeText={set('firstname')}
                placeholder="John"
                autoCapitalize="words"
              />
            </TextField>
            <TextField className="flex-1">
              <Label>{t('settings.profile.lastName')}</Label>
              <Input
                value={form.lastname}
                onChangeText={set('lastname')}
                placeholder="Doe"
                autoCapitalize="words"
              />
            </TextField>
          </View>

          <TextField>
            <Label>{t('settings.profile.username')}</Label>
            <Input
              value={form.username}
              onChangeText={set('username')}
              placeholder="johndoe"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </TextField>

          <TextField isInvalid={!!errors.email}>
            <Label>{t('auth.email')}</Label>
            <Input
              value={form.email}
              onChangeText={set('email')}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!errors.email && <FieldError>{errors.email}</FieldError>}
          </TextField>

          <TextField isInvalid={!!errors.password}>
            <Label>{t('auth.password')}</Label>
            <InputGroup>
              <InputGroup.Input
                value={form.password}
                onChangeText={set('password')}
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
                    color="#71717A"
                  />
                </TouchableOpacity>
              </InputGroup.Suffix>
            </InputGroup>
            {!!errors.password && <FieldError>{errors.password}</FieldError>}
          </TextField>

          {!!errors.general && (
            <Text className="text-sm text-danger">{errors.general}</Text>
          )}
        </View>

        {/* Submit */}
        <Button
          layout={LinearTransition.springify()}
          isDisabled={!isValid || loading}
          isIconOnly={loading}
          onPress={onSignUp}
          className="w-full"
        >
          {loading ? (
            <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
          ) : (
            <Button.Label>{t('auth.signUp')}</Button.Label>
          )}
        </Button>

        {/* Sign in link */}
        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted">
            {t('auth.alreadyHaveAccount')}
          </Text>
          <Link href="/(public)/account/sign-in" replace asChild>
            <TouchableOpacity>
              <Text className="text-sm text-accent font-medium">
                {t('auth.signIn')}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
