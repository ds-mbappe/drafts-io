import React from 'react'
import { DraftProps } from '@/lib/types';
import DraftCardInLibrary from '../card/DraftCardInLibrary';

const FeedCards = ({
  drafts,
  emptyStateTitle,
  likeToggled,
}: {
  drafts?: DraftProps[] | null;
  emptyStateTitle: string;
  likeToggled: (draftId: string) => void;
}) => {
  if (drafts === undefined) {
    return null;
  }
  
  return drafts?.length ? (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {drafts.map((draft: DraftProps) => (
        <DraftCardInLibrary
          key={draft.id}
          draft={draft}
          likeToggled={() => likeToggled(draft.id)}
        />
      ))}
    </div>
  ) : (
    <p className="text-sm font-normal text-foreground-500">
      {emptyStateTitle}
    </p>
  );
};

export default FeedCards
