import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Button } from 'heroui-native/button';
import { Spinner } from 'heroui-native/spinner';
import { TextField } from 'heroui-native/text-field';
import { InputGroup } from 'heroui-native/input-group';
import { Label } from 'heroui-native/label';
import { Ionicons } from '@expo/vector-icons';
import { LinearTransition, FadeIn } from 'react-native-reanimated';

import { api } from '@/src/lib/api';
import { ScreenHeader } from '@/src/components/ScreenHeader';

type Step = 'request' | 'confirm' | 'done';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('request');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [code, setCode] = useState('');
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }));
  const toggleShow = (key: keyof typeof show) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const onRequest = async () => {
    if (loading) return;
    if (form.newPassword !== form.confirmPassword) {
      setError(t('settings.password.noMatch'));
      return;
    }
    if (form.newPassword.length < 8) {
      setError(t('settings.password.tooShort'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/settings/password/request', {
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
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
      await api.post('/settings/password/confirm', { code, newPassword: form.newPassword });
      setStep('done');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ field }: { field: keyof typeof show }) => (
    <TouchableOpacity onPress={() => toggleShow(field)} className="px-3 h-full justify-center">
      <Ionicons name={show[field] ? 'eye-off-outline' : 'eye-outline'} size={20} color="#71717A" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScreenHeader title={t('settings.password.title')} />

      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        {step === 'done' ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 12 }}>
            <Ionicons name="checkmark-circle" size={56} color="#17C964" />
            <Text className="text-xl font-bold text-center">{t('settings.password.updated')}</Text>
            <Text className="text-sm text-muted text-center">{t('settings.password.updatedDesc')}</Text>
          </View>
        ) : step === 'request' ? (
          <>
            <TextField>
              <Label>{t('settings.password.currentPassword')}</Label>
              <InputGroup>
                <InputGroup.Input value={form.currentPassword} onChangeText={set('currentPassword')} placeholder="••••••••" secureTextEntry={!show.current} />
                <InputGroup.Suffix><EyeToggle field="current" /></InputGroup.Suffix>
              </InputGroup>
            </TextField>

            <TextField isInvalid={!!error && error === t('settings.password.noMatch')}>
              <Label>{t('settings.password.newPassword')}</Label>
              <InputGroup>
                <InputGroup.Input value={form.newPassword} onChangeText={set('newPassword')} placeholder="••••••••" secureTextEntry={!show.new} />
                <InputGroup.Suffix><EyeToggle field="new" /></InputGroup.Suffix>
              </InputGroup>
            </TextField>

            <TextField isInvalid={!!error}>
              <Label>{t('settings.password.confirmPassword')}</Label>
              <InputGroup>
                <InputGroup.Input value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="••••••••" secureTextEntry={!show.confirm} />
                <InputGroup.Suffix><EyeToggle field="confirm" /></InputGroup.Suffix>
              </InputGroup>
              {!!error && <Text className="text-sm text-danger mt-1">{error}</Text>}
            </TextField>

            <Button
              layout={LinearTransition.springify()}
              isDisabled={!form.newPassword || !form.confirmPassword || loading}
              isIconOnly={loading}
              onPress={onRequest}
              className="w-full"
            >
              {loading ? (
                <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              ) : (
                <Button.Label>{t('settings.password.sendCode')}</Button.Label>
              )}
            </Button>
          </>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <Text className="text-sm text-muted">{t('settings.email.codeSentTo')} {t('common.email') ?? 'your email'}.</Text>
            </View>

            <TextField isInvalid={!!error}>
              <Label>{t('settings.password.confirmCode')}</Label>
              <InputGroup>
                <InputGroup.Input value={code} onChangeText={setCode} placeholder="XXXXXX" autoCapitalize="characters" autoCorrect={false} />
              </InputGroup>
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
              <Button.Label>{t('settings.password.goBack')}</Button.Label>
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}
