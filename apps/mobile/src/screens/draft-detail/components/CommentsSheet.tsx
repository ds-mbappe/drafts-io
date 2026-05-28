import { View, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import { DraftDetail, Comment } from '../types';
import { CommentRow } from './CommentRow';

// ── CommentsSheet ──────────────────────────────────────────────────────────────

export interface CommentsSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  snapPoints: number[];
  draft: DraftDetail;
  comments: Comment[];
  commentText: string;
  setCommentText: (v: string) => void;
  submittingComment: boolean;
  onSubmit: () => void;
}

export function CommentsSheet({
  sheetRef,
  snapPoints,
  draft,
  comments,
  commentText,
  setCommentText,
  submittingComment,
  onSubmit,
}: CommentsSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#000000' : '#FFFFFF';
  const surface = isDark ? '#1C1C1E' : '#F4F4F5';
  const border = isDark ? '#2C2C2E' : '#E4E4E7';
  const muted = isDark ? '#71717A' : '#A1A1AA';
  const textPrimary = isDark ? '#FAFAFA' : '#18181B';
  const accentColor = '#006FEE';

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: border }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {/* Sheet header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: border,
      }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>
          {t('draft.comments')}
          <Text style={{ fontWeight: '400', color: muted }}> · {draft._count.Comment}</Text>
        </Text>
      </View>

      {/* Comment list */}
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
      >
        {comments.length === 0 ? (
          <Text style={{ color: muted, fontSize: 14 }}>{t('comments.noCommentsYet')}</Text>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} isDark={isDark} />)
        )}
      </BottomSheetScrollView>

      {/* Comment input pinned at sheet bottom */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
        paddingBottom: insets.bottom + 10,
        borderTopWidth: 1, borderTopColor: border,
        backgroundColor: bg, gap: 10,
      }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center',
          backgroundColor: surface, borderRadius: 20,
          paddingHorizontal: 14, paddingVertical: 8,
        }}>
          <BottomSheetTextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder={t('comments.addCommentPlaceholder')}
            placeholderTextColor={muted}
            style={{ flex: 1, fontSize: 14, color: textPrimary, padding: 0, maxHeight: 80 }}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!commentText.trim() || submittingComment}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: commentText.trim() ? accentColor : border,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={16} color={commentText.trim() ? '#fff' : muted} />
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
