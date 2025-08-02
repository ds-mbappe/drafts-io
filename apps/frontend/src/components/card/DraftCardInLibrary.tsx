import React from 'react';
import moment from 'moment';
import Link from 'next/link';
import { DocumentCardTypeprops } from '@/lib/types';
import { Avatar, Button, Card, CardBody, Chip, Image } from '@heroui/react';
import { estimateReadTimeString } from '@/lib/utils';
import { ClockIcon, HeartIcon } from 'lucide-react';

const DraftCardInLibrary = ({ draft }: { draft: DocumentCardTypeprops }) => {
  const onToggleLike = (e: any) => {
    e.preventDefault();
  }

  return (
    <Link href={`/app/drafts/${draft?.id}`}>
      <Card className='w-full border border-divider hover:scale-[1.02] flex flex-col'>
        <div className='flex h-[150px] items-start gap-4'>
          <div className='w-full flex relative overflow-hidden'>
            {draft?.cover &&
              <Image
                alt='Document cover'
                src={draft.cover}
                className='object-cover h-full'
                height={150}
                radius='none'
                classNames={{
                  wrapper: 'w-full max-w-full!',
                  img: 'w-full'
                }}
              />
            }

            <div className='absolute w-full flex justify-between items-center gap-2 top-4 left-4 z-50'>
              <Chip variant='flat' color='primary'>
                {draft.topic}
              </Chip>
            </div>

            <Button isIconOnly size={"sm"} variant={"light"} onClick={onToggleLike} className='absolute top-4 right-4 z-50'>
              <HeartIcon fill={draft?.hasLiked ? "#006FEE" : "none"} strokeWidth={draft?.hasLiked ? 0 : undefined} className="text-foreground-500 transition-all duration-500" />
            </Button>
          </div>
        </div>
        
        <CardBody className='p-4'>
          <div className='flex flex-col gap-4'>
            <div className='w-full flex justify-between items-center gap-3'>
              <p className='text-2xl font-bold line-clamp-1 break-all'>{`${draft?.title}`}</p>

              <div className='flex items-center gap-1'>
                <div><ClockIcon className='text-foreground-500' size={16} /></div>

                <p className="text-foreground-500 text-xs">
                  {estimateReadTimeString(draft?.word_count || 0)}
                </p>
              </div>
            </div>

            <p className='text-sm text-default-500 line-clamp-2 break-all'>{`${draft?.intro}`}</p>

            <div className='w-full flex items-center justify-between gap-5'>
              <div className='flex items-center gap-2'>
                <div>
                  <Avatar
                    showFallback
                    color='primary'
                    classNames={{
                      base: 'border'
                    }}
                    className='w-6 h-6'
                    src={draft?.author?.avatar}
                    name={draft?.author?.firstname?.split('')?.[0]?.toUpperCase()}
                  />
                </div>

                <p className="text-foreground-500 text-sm">
                  {`${draft?.author?.firstname} ${draft?.author?.lastname}`}
                </p>
              </div>

              <p className="text-foreground-500 text-xs">
                {moment(draft?.createdAt).format('DD MMM YYYY')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

DraftCardInLibrary.displayName = 'DraftCardInLibrary'

export default DraftCardInLibrary