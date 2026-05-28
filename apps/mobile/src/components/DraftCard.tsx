import { useState } from 'react';
import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';
import { Card } from 'heroui-native/card';
import { Button } from 'heroui-native/button';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { api } from '@/src/lib/api';

export interface DraftAuthor {
  id: string;
  username: string | null;
  avatar: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface DraftListItem {
  id: string;
  title: string;
  cover: string | null;
  topics: string[];
  createdAt: string;
  word_count: number | null;
  author: DraftAuthor;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  _count?: { likes?: number; Comment?: number };
}

const TOPIC_PALETTE = [
  { bg: 'rgba(0,111,238,0.12)', text: '#006FEE' },
  { bg: 'rgba(249,115,22,0.12)', text: '#EA580C' },
  { bg: 'rgba(168,85,247,0.12)', text: '#9333EA' },
  { bg: 'rgba(34,197,94,0.12)', text: '#16A34A' },
  { bg: 'rgba(236,72,153,0.12)', text: '#DB2777' },
  { bg: 'rgba(6,182,212,0.12)', text: '#0891B2' },
];

function topicColor(topic: string) {
  let h = 0;
  for (let i = 0; i < topic.length; i++) h = topic.charCodeAt(i) + ((h << 5) - h);
  return TOPIC_PALETTE[Math.abs(h) % TOPIC_PALETTE.length];
}

function relativeTime(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo}mo` : `${Math.floor(mo / 12)}y`;
}

interface Props {
  draft: DraftListItem;
  onPress: () => void;
}

export function DraftCard({ draft, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';

  const { toast } = useToast();
  const { t } = useTranslation();

  const [liked, setLiked] = useState(draft.hasLiked ?? false);
  const [likeCount, setLikeCount] = useState(draft._count?.likes ?? 0);
  const [bookmarked, setBookmarked] = useState(draft.hasBookmarked ?? false);

  const authorName =
    [draft.author.firstname, draft.author.lastname].filter(Boolean).join(' ') ||
    draft.author.username ||
    '?';
  const initials = (
    draft.author.firstname?.[0] ??
    draft.author.username?.[0] ??
    '?'
  ).toUpperCase();
  const readTime = draft.word_count ? Math.ceil(draft.word_count / 200) : null;
  const mutedColor = isDark ? '#71717A' : '#A1A1AA';
  const dimColor = isDark ? '#52525B' : '#D4D4D8';

  const toggleLike = async () => {
    const prev = { liked, likeCount };
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      await api.post(`/drafts/${draft.id}/toggle_like`);
      toast.show({ variant: next ? 'success' : 'default', label: t(next ? 'card.liked' : 'card.unliked') });
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    }
  };

  const toggleBookmark = async () => {
    const prev = bookmarked;
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await api.post(`/bookmarks/${draft.id}/toggle`);
      toast.show({ variant: next ? 'success' : 'default', label: t(next ? 'card.bookmarked' : 'card.unbookmarked') });
    } catch {
      setBookmarked(prev);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
        {!!draft.cover && (
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: draft.cover }}
              style={{ width: '100%', height: 180, borderRadius: 12 }}
              contentFit="cover"
            />
            <View style={{
              position: 'absolute', top: 10, right: 10,
              flexDirection: 'row', gap: 8,
            }}>
              <Button
                onPress={toggleLike}
                size="sm"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999 }}
              >
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? '#FB7185' : '#fff'} />
                {likeCount > 0 && (
                  <Button.Label style={{ fontSize: 12, color: liked ? '#FB7185' : '#fff', fontWeight: '600' }}>
                    {String(likeCount)}
                  </Button.Label>
                )}
              </Button>
              <Button
                onPress={toggleBookmark}
                size="sm"
                isIconOnly
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999 }}
              >
                <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color={bookmarked ? '#60A5FA' : '#fff'} />
              </Button>
            </View>
          </View>
        )}

        <Card.Body style={{ gap: 10, padding: 12, paddingHorizontal: 0 }}>
          {/* Topic chips */}
          {draft.topics.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {draft.topics.slice(0, 3).map((topic) => {
                const c = topicColor(topic);
                return (
                  <View
                    key={topic}
                    style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}
                  >
                    <Text style={{ fontSize: 11, color: c.text, fontWeight: '600' }}>{topic}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Title */}
          <Card.Title numberOfLines={2} style={{ fontSize: 16, lineHeight: 22 }}>
            {draft.title || 'Untitled'}
          </Card.Title>

          {/* Author + meta row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                borderWidth: 1.5, borderColor: 'rgba(0,111,238,0.25)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: '#006FEE', overflow: 'hidden',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {draft.author.avatar ? (
                    <Image source={{ uri: draft.author.avatar }} style={{ width: 20, height: 20 }} contentFit="cover" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{initials}</Text>
                  )}
                </View>
              </View>
              <Text style={{ fontSize: 12, color: mutedColor }} numberOfLines={1}>{authorName}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {readTime !== null && (
                <Text style={{ fontSize: 12, color: mutedColor }}>{readTime} min</Text>
              )}
              <Text style={{ fontSize: 12, color: dimColor }}>{relativeTime(draft.createdAt)}</Text>
            </View>
          </View>
        </Card.Body>
      </Card>
    </TouchableOpacity>
  );
}
