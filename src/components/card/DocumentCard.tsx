import React, { MouseEventHandler } from 'react';
import moment from 'moment';
import NextImage from "next/image";
import { Avatar, Button, Card, CardBody, Chip, Image } from '@nextui-org/react';
import { BookmarkIcon, CalendarIcon, EllipsisIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';
import Link from "next/link";
import { useSidebar } from '../editor/hooks/useSidebar';

export type DocumentCardTypeprops = {
  id: string,
  private: Boolean,
  locked: Boolean | undefined
  creator: {
    email: string,
    avatar: string | undefined,
    fullname: string,
  },
  createdAt: string,
  updatedAt: string,
  cover: string | undefined,
  topic: string,
  title: string,
  caption: string,
  content: string | null,
}

const DocumentCard = ({ document }: { document: DocumentCardTypeprops }) => {
  const toggleLike = (e: any) => {
    e.preventDefault();
  }

  const toggleComment = (e: any) => {
    e.preventDefault();
  }

  const toggleOptions = (e: any) => {
    e.preventDefault();
  }

  const toggleBookmark = (e: any) => {
    e.stopPropagation();
  }

  return (
    <Link href={`/app/${document?.id}`}>
      <Card shadow="none" className="border border-divider cursor-pointer hover:bg-foreground-100 active:scale-[0.95]">
        <CardBody className="flex flex-row gap-4">
          {document?.cover &&
            <div className="hidden sm:!flex border border-divider rounded-large">
              <Image
                isZoomed
                width={140}
                height={140}
                src={document?.cover}
                alt={`${document?.title}_cover`}
              />
            </div>
          }

          <div className="flex flex-1 flex-col gap-2 justify-around">
            {/* User & topic */}
            <div className="flex items-center gap-2.5">
              {/* User */}
              <div className="flex gap-2 items-center">
                <Avatar
                  color="primary"
                  className="w-6 h-6"
                  name={document?.creator?.fullname?.split("")?.[0]?.toUpperCase()}
                  src={document?.creator?.avatar}
                />

                <p className="line-clamp-1 text-sm">
                  {document?.creator?.fullname}
                </p>
              </div>

              <p className="font-medium">
                {'•'}
              </p>

              {/* Topic */}
              {document?.topic &&
                <p className="font-medium text-xs text-foreground-500">
                  {document?.topic}
                </p>
              }
            </div>

            {/* Title & caption */}
            <div className="flex flex-col gap-1">
              <p className="font-medium line-clamp-1">
                {document?.title}
              </p>

              <p className="text-sm line-clamp-2 text-foreground-500">
                {document?.caption}
              </p>
            </div>

            <div className="flex items-center justify-between">
              {/* Crated at */}
              <div className="flex items-center gap-1">
                <CalendarIcon className="text-foreground-500 w-5 h-5" />

                <p className="text-foreground-500 text-sm">
                  {moment(document?.createdAt).format('DD MMM YYYY')}
                </p>
              </div>

              {/* Like & comment button */}
              <div className="flex items-center gap-2">
                <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleBookmark}>
                  <BookmarkIcon />
                </Button>
                
                {/* <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleLike}>
                  <HeartIcon />
                </Button> */}

                {/* <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleComment}>
                  <MessageCircleIcon />
                </Button>

                <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleOptions}>
                  <EllipsisIcon />
                </Button> */}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

DocumentCard.displayName = 'DocumentCard'

export default DocumentCard