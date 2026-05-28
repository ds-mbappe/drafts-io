import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';

import { DraftDetail } from '../types';
import { topicColor, formatDate } from '../helpers';
import { TipTapNode } from '@/src/components/TipTapRenderer';

// ── DraftContent ───────────────────────────────────────────────────────────────

export interface DraftContentProps {
  draft: DraftDetail;
  isDraft: boolean;
  isDark: boolean;
  onAuthorPress: (username: string) => void;
}

export function DraftContent({ draft, isDraft, isDark, onAuthorPress }: DraftContentProps) {
  const { t } = useTranslation();

  const textPrimary = isDark ? '#FAFAFA' : '#18181B';
  const muted = isDark ? '#71717A' : '#A1A1AA';
  const border = isDark ? '#2C2C2E' : '#E4E4E7';
  const accentColor = '#006FEE';

  const authorName = [draft.author.firstname, draft.author.lastname].filter(Boolean).join(' ') || draft.author.username || '?';
  const authorInitial = (draft.author.firstname?.[0] ?? draft.author.username?.[0] ?? '?').toUpperCase();
  const readTime = draft.word_count ? Math.ceil(draft.word_count / 200) : null;

  return (
    <>
      {/* Cover image */}
      {!!draft.cover && (
        <Image
          source={{ uri: draft.cover }}
          style={{ width: '100%', height: 240 }}
          contentFit="cover"
        />
      )}

      <View style={{ padding: 20 }}>
        {/* Status badge (unpublished) */}
        {isDraft && (
          <View style={{
            alignSelf: 'flex-start', backgroundColor: 'rgba(234,88,12,0.12)',
            borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
          }}>
            <Text style={{ fontSize: 11, color: '#EA580C', fontWeight: '600' }}>DRAFT</Text>
          </View>
        )}

        {/* Topics */}
        {draft.topics.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {draft.topics.map((topic) => {
              const c = topicColor(topic);
              return (
                <View key={topic} style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, color: c.text, fontWeight: '600' }}>{topic}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Title */}
        <Text style={{ fontSize: 26, fontWeight: '800', color: textPrimary, lineHeight: 34, marginBottom: 16 }}>
          {draft.title || 'Untitled'}
        </Text>

        {/* Author + meta */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => draft.author.username && onAuthorPress(draft.author.username)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 18, backgroundColor: accentColor,
              overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
            }}>
              {draft.author.avatar ? (
                <Image source={{ uri: draft.author.avatar }} style={{ width: 36, height: 36 }} contentFit="cover" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{authorInitial}</Text>
              )}
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>{authorName}</Text>
              <Text style={{ fontSize: 12, color: muted }}>
                {formatDate(draft.createdAt)}
                {readTime !== null && `  ·  ${readTime} min read`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: border, marginBottom: 20 }} />

        {/* Intro */}
        {!!draft.intro && (
          <Text style={{
            fontSize: 17, fontStyle: 'italic', color: muted,
            lineHeight: 26, marginBottom: 24,
            paddingLeft: 16, borderLeftWidth: 3, borderLeftColor: muted,
          }}>
            {draft.intro}
          </Text>
        )}

        {/* Body content */}
        {draft.content && <TipTapNode node={draft.content} isDark={isDark} />}
      </View>
    </>
  );
}
