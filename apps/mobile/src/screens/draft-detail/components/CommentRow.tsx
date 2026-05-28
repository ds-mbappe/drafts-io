import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';

import { Comment } from '../types';
import { relativeTime } from '../helpers';

// ── Comment Row ────────────────────────────────────────────────────────────────

interface CommentRowProps {
  comment: Comment;
  isDark: boolean;
}

export function CommentRow({ comment, isDark }: CommentRowProps) {
  const name = [comment.user.firstname, comment.user.lastname].filter(Boolean).join(' ') || '?';
  const initial = (comment.user.firstname?.[0] ?? '?').toUpperCase();
  const mutedColor = isDark ? '#71717A' : '#A1A1AA';
  const surfaceColor = isDark ? '#1C1C1E' : '#F4F4F5';

  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
      <View style={{
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#006FEE',
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {comment.user.avatar ? (
          <Image source={{ uri: comment.user.avatar }} style={{ width: 32, height: 32 }} contentFit="cover" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{initial}</Text>
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: surfaceColor, borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#FAFAFA' : '#18181B' }}>{name}</Text>
          <Text style={{ fontSize: 12, color: mutedColor }}>{relativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={{ fontSize: 14, color: isDark ? '#D4D4D8' : '#3F3F46', lineHeight: 20 }}>{comment.text}</Text>
      </View>
    </View>
  );
}
