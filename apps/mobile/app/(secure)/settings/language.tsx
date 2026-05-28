import { View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import { ScreenHeader } from '@/src/components/ScreenHeader';

interface Language {
  code: string;
  label: string;
  native: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'jp', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
];

export default function LanguageScreen() {
  const isDark = useColorScheme() === 'dark';
  const { t, i18n } = useTranslation();

  // i18n.language is updated by react-i18next when changeLanguage is called,
  // which re-renders this component and moves the checkmark automatically.
  const current = i18n.language ?? 'en';

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const dividerColor = isDark ? '#2C2C2E' : '#E4E4E7';
  const checkColor = '#006FEE';

  const onSelect = (code: string) => {
    i18n.changeLanguage(code);
    SecureStore.setItemAsync('app_language', code).catch(() => {});
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScreenHeader title={t('settings.language.title')} />

      <View style={{ marginHorizontal: 16 }}>
        <View style={{ backgroundColor: cardBg, borderRadius: 14, overflow: 'hidden' }}>
          {LANGUAGES.map((lang, index) => (
            <View key={lang.code}>
              <TouchableOpacity
                onPress={() => onSelect(lang.code)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}
              >
                <View style={{ flex: 1 }}>
                  <Text className="text-base">{lang.native}</Text>
                  {lang.native !== lang.label && (
                    <Text style={{ fontSize: 13, color: isDark ? '#A1A1AA' : '#71717A', marginTop: 2 }}>{lang.label}</Text>
                  )}
                </View>
                {current === lang.code && (
                  <Ionicons name="checkmark" size={20} color={checkColor} />
                )}
              </TouchableOpacity>
              {index < LANGUAGES.length - 1 && (
                <View style={{ height: 1, backgroundColor: dividerColor, marginLeft: 16 }} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
