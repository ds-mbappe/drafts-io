import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';

import { DraftDetail } from '../types';

// ── DraftHeader ────────────────────────────────────────────────────────────────

export interface DraftHeaderProps {
  draft: DraftDetail;
  isOwner: boolean;
  isDraft: boolean;
  publishing: boolean;
  onBack: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onOpenComments: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export function DraftHeader({
  draft,
  isOwner,
  isDraft,
  publishing,
  onBack,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onPublish,
  onDelete,
}: DraftHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const border = isDark ? '#2C2C2E' : '#E4E4E7';
  const textPrimary = isDark ? '#FAFAFA' : '#18181B';
  const accentColor = '#006FEE';
  const iconColor = isDark ? '#A1A1AA' : '#71717A';

  return (
    <View style={{
      paddingTop: insets.top + 8,
      paddingBottom: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: bg,
      borderBottomWidth: 1,
      borderBottomColor: border,
    }}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="arrow-back" size={22} color={textPrimary} />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {/* Like */}
        <TouchableOpacity onPress={onToggleLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 6 }}>
          <Ionicons
            name={draft.hasLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={draft.hasLiked ? '#EF4444' : iconColor}
          />
          <Text style={{ fontSize: 13, color: draft.hasLiked ? '#EF4444' : iconColor }}>{draft._count.likes}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity onPress={onToggleBookmark} style={{ paddingHorizontal: 7, paddingVertical: 6 }}>
          <Ionicons
            name={draft.hasBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={draft.hasBookmarked ? accentColor : iconColor}
          />
        </TouchableOpacity>

        {/* Open comments sheet */}
        <TouchableOpacity onPress={onOpenComments} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 6 }}>
          <Ionicons name="chatbubble-outline" size={20} color={iconColor} />
          <Text style={{ fontSize: 13, color: iconColor }}>{draft._count.Comment}</Text>
        </TouchableOpacity>

        {/* Owner: publish */}
        {isOwner && isDraft && (
          <TouchableOpacity
            onPress={onPublish}
            disabled={publishing}
            style={{
              backgroundColor: accentColor, borderRadius: 8,
              paddingHorizontal: 10, paddingVertical: 6, marginLeft: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
              {publishing ? '…' : t('draft.publish')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Owner: delete */}
        {isOwner && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ paddingLeft: 8 }}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
