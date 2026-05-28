import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';
import { Card } from 'heroui-native/card';

import { ProfileDraft } from '@/src/hooks/useUserProfile';

interface Props {
  draft: ProfileDraft;
  onPress: () => void;
  isPrivate?: boolean;
}

export function ProfileDraftRow({ draft, onPress, isPrivate }: Props) {
  const readTime = draft.word_count ? `${Math.ceil(draft.word_count / 200)} min` : null;

  return (
    <Card asChild style={{ borderRadius: 12, overflow: 'hidden' }} className="p-1">
      <TouchableOpacity onPress={onPress}>
        <Card.Body style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 8 }}>
          {!!draft.cover && (
            <Image
              source={{ uri: draft.cover }}
              style={{ width: 60, height: 60, borderRadius: 8, flexShrink: 0 }}
              contentFit="cover"
            />
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', lineHeight: 20 }} numberOfLines={2}>
              {draft.title || 'Untitled'}
            </Text>
            {!!draft.intro && (
              <Text className="text-sm text-muted" numberOfLines={2}>{draft.intro}</Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              {isPrivate && (
                <View style={{ backgroundColor: 'rgba(234,88,12,0.12)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: '#EA580C', fontWeight: '600' }}>DRAFT</Text>
                </View>
              )}
              {!!readTime && <Text className="text-xs text-muted">{readTime} read</Text>}
            </View>
          </View>
        </Card.Body>
      </TouchableOpacity>
    </Card>
  );
}
