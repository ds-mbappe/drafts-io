import { useMobile } from '@/hooks/useMobile'
import { DocumentCardTypeprops } from '@/lib/types'
import { Avatar, Chip } from '@heroui/react'
import { CloudUploadIcon } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const DraftDetails = ({
  draft
}: {
  draft: DocumentCardTypeprops
}) => {
  const isLargeScreen = useMobile();

  return (
    <div className="w-full flex flex-col gap-5 mx-auto p-4 md:px-0">
      <div className="w-full flex items-center gap-3 mx-auto">
        <Avatar
          size="sm"
          as="button"
          showFallback
          color="primary"
          classNames={{
            base: "border"
          }}
          src={draft?.author?.avatar}
          name={draft?.author?.firstname?.split("")?.[0]?.toUpperCase()}
        />

        <div className="flex flex-col items-start">
          <p className="text-foreground text-lg font-semibold">
            { `${draft?.author?.firstname} ${draft?.author?.lastname}` }
          </p>

          <p className="text-default-500 text-sm">
            { moment(draft?.createdAt).format("MMMM D, YYYY, h:mm a") }
          </p>
        </div>
      </div>

      <Chip variant="flat" color='primary' size={isLargeScreen ? "md" : "sm"}>
        {draft?.topic || 'No topic'}
      </Chip>

      <div className="flex flex-col gap-2">
        <p className="text-3xl font-semibold text-foreground">
          { draft?.title }
        </p>

        <p className="text-default-500">
          { draft?.intro }
        </p>
      </div>

      {draft?.cover &&
        <div
          className="bg-cover bg-center w-full h-[350px] md:h-[450px] rounded-xl border border-divider"
          style={{
            backgroundImage: `url(${draft?.cover})`
          }}
        />
      }

      {!draft?.cover &&
        <div className="w-full h-[350px] md:h-[450px] rounded-[12px] gap-1 flex flex-col justify-center items-center bg-cover bg-center overflow-hidden border border-divider">
          <CloudUploadIcon
            width={80}
            height={80}
            className="text-foreground"
          />

          <p className="text-foreground text-center">
            <span className="underline">{ "Click to upload" }</span>
            { " or drag and drop" }
          </p>
        </div>
      }
    </div>
  )
}

export default DraftDetails