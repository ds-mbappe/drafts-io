import React from 'react';
import moment from 'moment';
import NextImage from "next/image";
import { Avatar, Button, Card, CardBody, Chip, Image } from '@nextui-org/react';
import { CalendarIcon, EllipsisIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';

export type DocumentTypeprops = {
  _id: string,
  private: Boolean,
  locked: Boolean | undefined
  creator: {
    email: string,
    avatar: string | undefined,
    fullname: string,
  },
  created_at: string,
  updated_at: string,
  cover: string | undefined,
  topic: string,
  title: string,
  caption: string,
  content: string | null,
}

const DocumentCard = ({ document }: { document: DocumentTypeprops }) => {
  const toggleLike = () => {

  }

  return (
    <Card className="border border-divider cursor-pointer hover:bg-foreground-100">
      <CardBody className="flex flex-row gap-4">
        <div className="hidden sm:!flex border border-divider rounded-large">
          <Image
            as={NextImage}
            isZoomed
            width={200}
            height={200}
            src={document?.cover}
            alt={`${document?.title}_cover`}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 justify-around">
          {/* User & topic */}
          <div className="flex items-center justify-between">
            {/* User */}
            <div className="flex gap-3 items-center">
              <Avatar
                isBordered
                color="primary"
                className="w-6 h-6"
                name={document?.creator?.fullname?.split("")?.[0]?.toUpperCase()}
                src={document?.creator?.avatar}
              />

              <p className="line-clamp-1 text-xs">
                {document?.creator?.fullname}
              </p>
            </div>

            {/* Topic */}
            <Chip variant="bordered">
              <div className="flex items-center gap-1">
                <span className="text-base font-medium">#</span>
                <p>{document?.topic}</p>
              </div>
            </Chip>
          </div>

          {/* Title & caption */}
          <div className="flex flex-col gap-1">
            <p className="font-medium text-base line-clamp-1">
              {document?.title}
            </p>

            <p className="text-base line-clamp-2 text-foreground-500">
              {document?.caption}
            </p>
          </div>

          <div className="flex items-center justify-between">
            {/* Crated at */}
            <div className="flex items-center gap-1">
              <CalendarIcon className="text-foreground-500" />

              <p className="text-foreground-500 text-sm">
                {moment(document?.created_at).format('DD MMMM YYYY')}
              </p>
            </div>

            {/* Like & comment button */}
            <div className="flex items-center gap-2">
              <Button isIconOnly size={"sm"} variant={"light"}>
                <HeartIcon />
              </Button>

              <Button isIconOnly size={"sm"} variant={"light"}>
                <MessageCircleIcon />
              </Button>

              <Button isIconOnly size={"sm"} variant={"light"}>
                <EllipsisIcon />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

DocumentCard.displayName = 'DocumentCard'

export default DocumentCard