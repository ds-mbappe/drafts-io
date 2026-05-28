import { useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTabRouter } from '@/src/hooks/useTabRouter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from 'heroui-native/text';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useDraftDetail } from './hooks/useDraftDetail';
import { DraftHeader } from './components/DraftHeader';
import { DraftContent } from './components/DraftContent';
import { CommentsSheet } from './components/CommentsSheet';

const SCREEN_HEIGHT = Dimensions.get('screen').height;

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function DraftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { pushUser } = useTabRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [Math.round(SCREEN_HEIGHT * 0.85)], []);

  const openComments = () => {
    bottomSheetRef.current?.present();
    bottomSheetRef.current?.snapToIndex(0);
  };

  const {
    draft,
    comments,
    loading,
    commentText,
    setCommentText,
    submittingComment,
    publishing,
    isOwner,
    isDraft,
    toggleLike,
    toggleBookmark,
    handlePublish,
    handleDelete,
    submitComment,
  } = useDraftDetail({ id: id ?? '', t, router, openComments });

  // Colors
  const bg = isDark ? '#000000' : '#FFFFFF';
  const muted = isDark ? '#71717A' : '#A1A1AA';
  const accentColor = '#006FEE';

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <ActivityIndicator color={accentColor} size="large" />
      </View>
    );
  }

  if (!draft) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, paddingTop: insets.top }}>
        <Ionicons name="alert-circle-outline" size={48} color={muted} />
        <Text style={{ color: muted, marginTop: 12, fontSize: 15 }}>{t('common.error')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: accentColor, fontWeight: '600' }}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <DraftHeader
        draft={draft}
        isOwner={isOwner}
        isDraft={isDraft}
        publishing={publishing}
        onBack={() => router.back()}
        onToggleLike={toggleLike}
        onToggleBookmark={toggleBookmark}
        onOpenComments={openComments}
        onPublish={handlePublish}
        onDelete={handleDelete}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <DraftContent
          draft={draft}
          isDraft={isDraft}
          isDark={isDark}
          onAuthorPress={(username) => pushUser(username)}
        />
      </ScrollView>

      <CommentsSheet
        sheetRef={bottomSheetRef}
        snapPoints={snapPoints}
        draft={draft}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        submittingComment={submittingComment}
        onSubmit={submitComment}
      />
    </View>
  );
}
