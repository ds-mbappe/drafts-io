import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Link from 'next/link';
import { DraftProps } from '@/lib/types';
import { Avatar, Button, Card, Chip } from '@heroui/react';
import { BookmarkIcon, HeartIcon } from 'lucide-react';
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { errorToast, infoToast } from '@/actions/showToast';

const DraftCardInLibrary = ({
  draft,
  likeToggled,
  bookmarkToggled,
}: {
  draft: DraftProps,
  likeToggled: () => void;
  bookmarkToggled?: () => void;
}) => {
  const { fetcher } = useAuthFetcher();
  const [optimisticHasLiked, setOptimisticHasLiked] = useState<boolean | null>(
    draft?.hasLiked ?? null,
  );
  const [optimisticHasBookmarked, setOptimisticHasBookmarked] = useState<boolean | null>(
    draft?.hasBookmarked ?? null,
  );

  useEffect(() => {
    setOptimisticHasLiked(draft?.hasLiked ?? null);
  }, [draft?.hasLiked]);

  useEffect(() => {
    setOptimisticHasBookmarked(draft?.hasBookmarked ?? null);
  }, [draft?.hasBookmarked]);

  const onToggleLike = async (e: any) => {
    e?.preventDefault();

    const previousHasLiked = optimisticHasLiked ?? draft?.hasLiked ?? false;
    setOptimisticHasLiked(!previousHasLiked);
    likeToggled();

    try {
      const { liked } = await fetcher(`/api/drafts/${draft.id}/toggle_like`, { method: 'POST' });
      infoToast(`Draft ${liked ? 'liked' : 'disliked'} successfully.`)
    } catch {
      setOptimisticHasLiked(previousHasLiked);
      likeToggled();
      errorToast('An error occured, please try again.')
    }
  };

  const onToggleBookmark = async (e: any) => {
    e?.preventDefault();

    const previous = optimisticHasBookmarked ?? draft?.hasBookmarked ?? false;
    const next = !previous;
    setOptimisticHasBookmarked(next);
    bookmarkToggled?.();

    try {
      await fetcher(`/api/bookmarks/${draft.id}/toggle`, { method: 'POST' });
      infoToast(next ? 'Draft saved to your reading list.' : 'Draft removed from your reading list.');
    } catch {
      setOptimisticHasBookmarked(previous);
      bookmarkToggled?.();
      errorToast('An error occured, please try again.')
    }
  };

  return (
    <Link href={`/app/drafts/${draft?.id}`}>
      <Card className='w-full border border-divider hover:scale-[1.02] transition-all flex flex-col'>
        <div className='flex h-[150px] items-start gap-4'>
          <div className='w-full h-full relative overflow-hidden'>
            {draft?.cover &&
              <img
                alt={`cover_${draft.id}`}
                src={draft.cover}
                className='object-cover h-full w-full rounded-2xl'
              />
            }

            <div className='absolute flex flex-wrap items-center gap-1 top-4 left-4 z-50 max-w-[70%]'>
              {draft.topics.slice(0, 2).map((t) => (
                <Chip key={t} variant='primary' color='accent' size='sm'>{t}</Chip>
              ))}
              {draft.topics.length > 2 &&
                <Chip variant='secondary' size='sm'>+{draft.topics.length - 2}</Chip>
              }
            </div>

            <div className="absolute top-2 right-2 z-50 flex gap-1">
              <Button isIconOnly size="sm" variant="secondary" onClick={onToggleBookmark}>
                <BookmarkIcon
                  size={14}
                  fill={(optimisticHasBookmarked ?? draft?.hasBookmarked) ? 'currentColor' : 'none'}
                  className={`transition-all duration-300 ${(optimisticHasBookmarked ?? draft?.hasBookmarked) ? 'text-primary' : 'text-foreground-500'}`}
                />
              </Button>
              <Button isIconOnly size="sm" variant="secondary" onClick={onToggleLike}>
                <HeartIcon
                  fill={(optimisticHasLiked ?? draft?.hasLiked) ? "#006FEE" : "none"}
                  strokeWidth={(optimisticHasLiked ?? draft?.hasLiked) ? 0 : undefined}
                  className="text-foreground-500 transition-all duration-500"
                />
              </Button>
            </div>
          </div>
        </div>

        <Card.Content>
          <div className='flex flex-col gap-4'>
            <div className='w-full flex justify-between items-center gap-3'>
              <p className='text-2xl font-bold line-clamp-1 break-all'>{`${draft?.title}`}</p>
            </div>

            <div className='w-full flex items-center justify-between gap-5'>
              <div className='flex items-center gap-2'>
                <div>
                  <Avatar
                    color='accent'
                    className='w-6 h-6'
                  >
                    <Avatar.Image src={draft?.author?.avatar as string} />
                    <Avatar.Fallback>{draft?.author?.firstname?.split('')?.[0]?.toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                </div>

                <p className="text-foreground-500 text-sm line-clamp-1">
                  {`${draft?.author?.firstname} ${draft?.author?.lastname}`}
                </p>
              </div>

              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <p className="text-foreground-500 text-xs">
                  {moment(draft?.createdAt).format('DD MMM YYYY')}
                </p>
                {draft?.savedAt && (
                  <p className="text-foreground-400 text-xs">
                    Saved {moment(draft.savedAt).fromNow()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}

DraftCardInLibrary.displayName = 'DraftCardInLibrary'

export default DraftCardInLibrary
