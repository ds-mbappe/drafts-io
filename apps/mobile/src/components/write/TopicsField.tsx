import { useState, useEffect } from 'react';
import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { TextField } from 'heroui-native/text-field';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { TagGroup } from 'heroui-native/tag-group';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/lib/api';

interface Props {
  value: string[];
  onChange: (topics: string[]) => void;
}

export function TopicsField({ value, onChange }: Props) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [topicInput, setTopicInput] = useState('');
  const [topicFocused, setTopicFocused] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  const suggestionBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const suggestionBorder = isDark ? '#3A3A3C' : '#E4E4E7';

  useEffect(() => {
    api.get('/drafts/topics')
      .then(({ data }) => setAvailableTopics((data as { name: string }[]).map((d) => d.name)))
      .catch(() => {});
  }, []);

  const trimmed = topicInput.trim().toLowerCase();

  const filteredTopics = availableTopics.filter(
    (t) => t.toLowerCase().includes(trimmed) && !value.includes(t),
  );

  const showCreate =
    trimmed.length > 0 &&
    !availableTopics.some((t) => t.toLowerCase() === trimmed) &&
    !value.includes(trimmed);

  const showSuggestions = topicFocused && (filteredTopics.length > 0 || showCreate);

  const add = (val: string) => {
    const v = val.trim().toLowerCase();
    if (!v || value.includes(v) || value.length >= 5) return;
    onChange([...value, v]);
    setTopicInput('');
    if (!availableTopics.includes(v)) setAvailableTopics((prev) => [...prev, v].sort());
  };

  return (
    <TextField>
      <Label>{t('newDraft.topicsLabel')} (max 5)</Label>

      {value.length > 0 && (
        <TagGroup
          onRemove={(keys) => onChange(value.filter((t) => !keys.has(t)))}
          style={{ marginBottom: 8 }}
        >
          <TagGroup.List style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {value.map((topic) => (
              <TagGroup.Item key={topic} id={topic}>
                <TagGroup.ItemLabel>{topic}</TagGroup.ItemLabel>
                <TagGroup.ItemRemoveButton />
              </TagGroup.Item>
            ))}
          </TagGroup.List>
        </TagGroup>
      )}

      {value.length < 5 && (
        <View>
          <Input
            value={topicInput}
            onChangeText={setTopicInput}
            placeholder={t('newDraft.topicPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onFocus={() => setTopicFocused(true)}
            onBlur={() => setTimeout(() => setTopicFocused(false), 150)}
            onSubmitEditing={() => add(topicInput)}
          />

          {showSuggestions && (
            <View style={{
              marginTop: 4, borderWidth: 1, borderColor: suggestionBorder,
              borderRadius: 10, backgroundColor: suggestionBg, overflow: 'hidden',
            }}>
              {showCreate && (
                <TouchableOpacity
                  onPress={() => add(trimmed)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11 }}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#006FEE" />
                  <Text style={{ fontSize: 14, color: '#006FEE', fontWeight: '500' }}>
                    {t('newDraft.createTopic', { topic: trimmed })}
                  </Text>
                </TouchableOpacity>
              )}
              {filteredTopics.slice(0, 6).map((topic, i) => (
                <TouchableOpacity
                  key={topic}
                  onPress={() => add(topic)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 11,
                    borderTopWidth: i === 0 && showCreate ? 1 : 0,
                    borderTopColor: suggestionBorder,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </TextField>
  );
}
