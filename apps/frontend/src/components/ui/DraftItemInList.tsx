import React from 'react';
import { Button, Skeleton } from "@heroui/react";
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { FileIcon } from 'lucide-react';

const DraftItemInList = ({ id, cover, title, updatedAt, loading, onCloseModal }: {
  id?: string,
  cover: string | null;
  title?: string,
  updatedAt?: Date,
  loading: boolean,
  onCloseModal: () => void
}) => {
  const router = useRouter();

  const goToDraft = () => {
    onCloseModal();

    router.push(`/app/drafts/${id}`);
  }

  return (
    <div className="w-full">
      {
        loading ?
          <div className="max-w-[350px] w-full flex items-center gap-3">
            <div>
              <Skeleton className="flex rounded-full w-8 h-8" />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
        :
        <Button variant="ghost" className="w-full h-fit px-3 py-1 justify-start rounded-none" onPress={goToDraft}>
          <div className="flex items-center gap-2 w-full min-w-0">
            {cover ? (
              <img
                src={cover}
                alt={`cover_${id}`}
                className="object-cover shrink-0 rounded-full w-8 h-8"
                width={32}
                height={32}
              />
            ) : (
              <div className="w-8 h-8 shrink-0 rounded-full bg-foreground-100 flex items-center justify-center">
                <FileIcon size={14} className="text-foreground-400" />
              </div>
            )}

            <div className="flex flex-col items-start min-w-0 text-left">
              <p className="font-semibold text-sm truncate w-full">{title}</p>
              <p className="text-sm text-foreground-500">{`Updated at ${moment(updatedAt).format('MMM DD, YYYY')}`}</p>
            </div>
          </div>
        </Button>
      }
    </div>
  )
}

DraftItemInList.displayName = 'DraftItemInList'

export default DraftItemInList