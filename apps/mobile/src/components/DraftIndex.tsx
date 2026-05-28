import { PaginatedList, PageResult } from './PaginatedList';
import { DraftCard, DraftListItem } from './DraftCard';

export type { PageResult };

interface DraftIndexProps {
  fetchFn: (pageParam: string | null) => Promise<PageResult<DraftListItem>>;
  ListHeaderComponent?: React.ReactNode;
  emptyMessage?: string;
  onPressDraft?: (id: string) => void;
}

export function DraftIndex({ onPressDraft, ...rest }: DraftIndexProps) {
  return (
    <PaginatedList
      {...rest}
      renderItem={(draft) => (
        <DraftCard draft={draft} onPress={() => onPressDraft?.(draft.id)} />
      )}
      keyExtractor={(draft) => draft.id}
      emptyIcon="document-text-outline"
      itemSeparatorHeight={12}
    />
  );
}
