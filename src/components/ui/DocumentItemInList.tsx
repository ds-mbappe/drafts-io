import React from 'react';
import { Button, Skeleton } from '@nextui-org/react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { FileIcon } from 'lucide-react';

const DocumentItemInList = ({ id, title, updatedAt, loading, onCloseModal }: {
  id: string | undefined,
  title: string | undefined,
  updatedAt: string | undefined,
  loading: boolean,
  onCloseModal: () => void
}) => {
  const router = useRouter();

  const goToDocument = () => {
    onCloseModal();
    router.push(`/app/${id}`);
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
        <Button variant="light" className="w-full h-fit px-3 py-1" radius="none" onPress={goToDocument}>
          <div className="w-full flex items-center gap-2">
            <FileIcon size={32} />

            <div className="w-full flex flex-col items-start">
              <p className="font-semibold text-sm">{`${title}`}</p>
              <p className="font-semibold text-sm text-foreground-500">{`Updated at ${moment(updatedAt).format('MMM DD, YYYY')}`}</p>
            </div>
          </div>
        </Button>
      }
    </div>
  )
}

DocumentItemInList.displayName = 'DocumentItemInList'

export default DocumentItemInList