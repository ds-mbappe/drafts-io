import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
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

type Step = 'request' | 'confirm' | 'done';

export default function ChangeEmailScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('request');
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRequest = async () => {
    if (loading || !newEmail.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/settings/email/request', { newEmail });
      setStep('confirm');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (loading || !code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/settings/email/confirm', { code });
      setStep('done');
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
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScreenHeader title={t('settings.email.title')} />

      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        {step === 'done' ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 12 }}>
            <Ionicons name="checkmark-circle" size={56} color="#17C964" />
            <Text className="text-xl font-bold text-center">{t('settings.email.updated')}</Text>
            <Text className="text-sm text-muted text-center">{t('settings.email.updatedDesc', { email: newEmail })}</Text>
          </View>
        ) : step === 'request' ? (
          <>
            <View style={{ gap: 4 }}>
              <Text className="text-sm text-muted">{t('settings.email.currentEmail')}</Text>
              <Text className="text-base font-medium">{user?.email}</Text>
            </View>

            <TextField isInvalid={!!error}>
              <Label>{t('settings.email.newEmail')}</Label>
              <Input
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="new@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!error && <Text className="text-sm text-danger mt-1">{error}</Text>}
            </TextField>

            <Button
              layout={LinearTransition.springify()}
              isDisabled={!newEmail.trim() || loading}
              isIconOnly={loading}
              onPress={onRequest}
              className="w-full"
            >
              {loading ? (
                <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              ) : (
                <Button.Label>{t('settings.email.sendCode')}</Button.Label>
              )}
            </Button>
          </>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <Text className="text-sm text-muted">{t('settings.email.codeSentTo')}</Text>
              <Text className="text-base font-medium">{newEmail}</Text>
            </View>

            <TextField isInvalid={!!error}>
              <Label>{t('settings.email.confirmCode')}</Label>
              <Input
                value={code}
                onChangeText={setCode}
                placeholder="XXXXXX"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {!!error && <Text className="text-sm text-danger mt-1">{error}</Text>}
            </TextField>

            <Button
              layout={LinearTransition.springify()}
              isDisabled={!code.trim() || loading}
              isIconOnly={loading}
              onPress={onConfirm}
              className="w-full"
            >
              {loading ? (
                <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              ) : (
                <Button.Label>{t('common.confirm')}</Button.Label>
              )}
            </Button>

            <Button variant="ghost" onPress={() => { setStep('request'); setError(''); setCode(''); }} className="w-full">
              <Button.Label>{t('settings.email.useDifferentEmail')}</Button.Label>
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}
