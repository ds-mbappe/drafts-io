import React from 'react'
import { DraftProps } from '@/lib/types';
import DraftCardInLibrary from '../card/DraftCardInLibrary';

const FeedCards = ({
  isLoading,
  drafts,
  emptyStateTitle,
}: {
  isLoading?: boolean;
  drafts?: DraftProps[];
  emptyStateTitle: string;
}) => {
  if (isLoading || drafts === undefined) {
    return null;
  }
  
  return drafts?.length ? (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {drafts.map((draft: DraftProps) => (
        <DraftCardInLibrary key={draft.id} draft={draft} />
      ))}
    </div>
  ) : (
    <p>{emptyStateTitle}</p>
  );
};

export default FeedCards