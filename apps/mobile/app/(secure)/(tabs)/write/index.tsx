import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'heroui-native/text';
import { Button } from 'heroui-native/button';
import { Spinner } from 'heroui-native/spinner';
import { TextField } from 'heroui-native/text-field';
import { Input } from 'heroui-native/input';
import { TextArea } from 'heroui-native/text-area';
import { Label } from 'heroui-native/label';
import { LinearTransition, FadeIn } from 'react-native-reanimated';

import { api } from '@/src/lib/api';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { CoverPicker } from '@/src/components/write/CoverPicker';
import { TopicsField } from '@/src/components/write/TopicsField';

export default function WriteScreen() {
  const { t } = useTranslation();
  const { pushDraft } = useTabRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/drafts', {
        title: title.trim(),
        intro: intro.trim() || undefined,
        topics,
        cover: cover ?? undefined,
      });
      setTitle('');
      setIntro('');
      setTopics([]);
      setCover(null);
      pushDraft(data.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('common.error');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }} className="bg-background">
      <ScrollView
        className="flex-1 bg-background"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 16 }}>
          <Text className="text-2xl font-bold">{t('newDraft.heading')}</Text>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 20 }}>
          <CoverPicker value={cover} onChange={setCover} />

          <TextField isRequired>
            <Label>{t('newDraft.titleLabel')}</Label>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder={t('newDraft.titlePlaceholder')}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          </TextField>

          <TextField>
            <Label>{t('newDraft.introLabel')}</Label>
            <TextArea
              value={intro}
              onChangeText={setIntro}
              placeholder={t('newDraft.introPlaceholder')}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />
          </TextField>

          <TopicsField value={topics} onChange={setTopics} />

          {!!error && <Text className="text-sm text-danger">{error}</Text>}

          <Button
            layout={LinearTransition.springify()}
            isDisabled={!title.trim() || loading}
            isIconOnly={loading}
            onPress={onSubmit}
            className="w-full"
          >
            {loading
              ? <Spinner entering={FadeIn.delay(50)} color="current" size="sm" />
              : <Button.Label>{t('newDraft.createDraft')}</Button.Label>}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
