import { useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
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

type Step = 'choose' | 'deactivate' | 'delete';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const { clearSession } = useAuthStore();
  const [step, setStep] = useState<Step>('choose');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CONFIRM_PHRASE = t('settings.delete.confirmPhrase');
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E4E4E7';

  const onDeactivate = () => {
    Alert.alert(
      t('settings.delete.deactivateAlertTitle'),
      t('settings.delete.deactivateAlertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.delete.deactivateAlertButton'), style: 'destructive', onPress: confirmDeactivate },
      ],
    );
  };

  const confirmDeactivate = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete('/settings/account', { data: { type: 'deactivate' } });
      await clearSession();
      router.replace('/(public)/account/sign-in');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
      setLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      t('settings.delete.alertTitle'),
      t('settings.delete.alertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.delete.alertButton'), style: 'destructive', onPress: confirmDelete },
      ],
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete('/settings/account', { data: { type: 'delete' } });
      await clearSession();
      router.replace('/(public)/account/sign-in');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('choose');
    setConfirmation('');
    setError('');
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScreenHeader title={t('settings.delete.title')} />

      <View style={{ paddingHorizontal: 16, gap: 16 }}>

        {/* Step 1 — choose */}
        {step === 'choose' && (
          <>
            <Text className="text-sm text-muted">{t('settings.delete.chooseDesc')}</Text>

            <TouchableOpacity
              onPress={() => setStep('deactivate')}
              style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, padding: 16, gap: 4 }}
            >
              <Text className="text-base font-semibold">{t('settings.delete.deactivateLabel')}</Text>
              <Text className="text-sm text-muted">{t('settings.delete.deactivateCardDesc')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep('delete')}
              style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(243,18,96,0.3)', padding: 16, gap: 4 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#F31260' }}>{t('settings.delete.deletePermanentLabel')}</Text>
              <Text className="text-sm text-muted">{t('settings.delete.deleteCardDesc')}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2a — deactivate confirm */}
        {step === 'deactivate' && (
          <>
            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 16, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="pause-circle-outline" size={20} color="#F97316" />
                <Text style={{ color: '#F97316', fontWeight: '600', fontSize: 15 }}>{t('settings.delete.deactivateLabel')}</Text>
              </View>
              <Text style={{ color: '#F97316', fontSize: 14, lineHeight: 20 }}>
                {t('settings.delete.deactivateCardDesc')}
              </Text>
            </View>

            {!!error && <Text className="text-sm text-danger">{error}</Text>}

            <Button
              layout={LinearTransition.springify()}
              isDisabled={loading}
              isIconOnly={loading}
              onPress={onDeactivate}
              className="w-full"
              style={{ backgroundColor: '#F97316' }}
            >
              {loading ? (
                <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              ) : (
                <Button.Label>{t('settings.delete.deactivateButton')}</Button.Label>
              )}
            </Button>

            <Button variant="ghost" onPress={goBack} className="w-full">
              <Button.Label>{t('common.back')}</Button.Label>
            </Button>
          </>
        )}

        {/* Step 2b — delete confirm */}
        {step === 'delete' && (
          <>
            <View style={{ backgroundColor: '#FFF0F3', borderRadius: 12, padding: 16, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning-outline" size={20} color="#F31260" />
                <Text style={{ color: '#F31260', fontWeight: '600', fontSize: 15 }}>{t('settings.delete.warningTitle')}</Text>
              </View>
              <Text style={{ color: '#F31260', fontSize: 14, lineHeight: 20 }}>
                {t('settings.delete.warningDesc')}
              </Text>
            </View>

            <TextField isInvalid={!!error}>
              <Label>{t('settings.delete.confirmLabel')}</Label>
              <Input
                value={confirmation}
                onChangeText={setConfirmation}
                placeholder={CONFIRM_PHRASE}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!error && <Text className="text-sm text-danger mt-1">{error}</Text>}
            </TextField>

            <Button
              layout={LinearTransition.springify()}
              isDisabled={confirmation !== CONFIRM_PHRASE || loading}
              isIconOnly={loading}
              onPress={onDelete}
              className="w-full bg-danger"
            >
              {loading ? (
                <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              ) : (
                <Button.Label>{t('settings.delete.deleteButton')}</Button.Label>
              )}
            </Button>

            <Button variant="ghost" onPress={goBack} className="w-full">
              <Button.Label>{t('common.back')}</Button.Label>
            </Button>
          </>
        )}

      </View>
    </ScrollView>
  );
}
