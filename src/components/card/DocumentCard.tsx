import React, { useMemo } from 'react';
import moment from 'moment';
import Link from "next/link";
import { DocumentCardTypeprops } from '@/lib/types';
import { BookmarkIcon, CalendarIcon, CircleHelpIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';
import { Avatar, Button, Card, CardBody, Chip, Image } from "@heroui/react";
import { estimateReadTimeString } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

const DocumentCard = ({ document }: { document: DocumentCardTypeprops }) => {
  const isLargeScreen = useMobile();

  const toggleLike = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const toggleComment = (e: any) => {
    e.preventDefault();
  }

  const toggleOptions = (e: any) => {
    e.preventDefault();
  }

  const toggleBookmark = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <Link href={`/app/${document.id}`}>
      <Card shadow="none" className="border border-divider cursor-pointer hover:bg-foreground-100 hover:scale-[1.02] active:scale-100 !rounded-large">
        <CardBody className="flex flex-row gap-4">
          {document.cover ?
            <div className="hidden sm:!flex border border-divider rounded-large">
              <Image
                width={146}
                height={146}
                src={document.cover}
                alt={`${document.title}_cover`}
              />
            </div> :
            <div className="w-[140px] h-[142px] bg-divider justify-center items-center hidden sm:!flex border border-divider rounded-large">
              <CircleHelpIcon size={50} />
            </div>
          }

          <div className="flex flex-1 flex-col gap-2">
            {/* Category */}
            <div className="flex items-center justify-between">
              <Chip variant="solid" size={isLargeScreen ? "md" : "sm"}>
                {document.topic || 'No topic'}
              </Chip>

              <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleBookmark}>
                <BookmarkIcon />
              </Button>
            </div>

            {/* Title & caption */}
            <div className="h-full flex flex-col gap-1 flex-1">
              <p className="font-medium line-clamp-2 text-sm md:text-base">
                {document.title}
              </p>

              <p className="line-clamp-2 text-sm text-foreground-500">
                {document.intro}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* User */}
                <div className="flex gap-1.5 items-center">
                  <div>
                    <Avatar
                      color="primary"
                      className="w-6 h-6"
                      classNames={{
                        base: "border"
                      }}
                      src={document.author?.avatar}
                      name={document.author?.firstname?.split("")?.[0]?.toUpperCase()}
                    />
                  </div>

                  <p className="line-clamp-1 text-xs md:text-sm font-medium">
                    {`${document.author?.firstname} ${document.author?.lastname}`}
                  </p>
                </div>

                •

                {/* Crated at */}
                <p className="text-foreground-500 text-xs">
                  {/* {moment(document?.createdAt).format('DD MMM YYYY')} */}
                  {estimateReadTimeString(document.word_count || 0)}
                </p>
              </div>

              {/* Like & comment button */}
              <div className="flex items-center gap-3">                
                <Button
                  isIconOnly
                  size={"sm"}
                  variant={"light"}
                  endContent={
                    <p className="mx-1">
                      {document._count?.likes}
                    </p>
                  }
                  onClick={toggleLike}
                >
                  <HeartIcon fill={document.hasLiked ? "#006FEE" : "none"} strokeWidth={document.hasLiked ? 0 : undefined} className="text-foreground-500 transition-all duration-500" />
                </Button>

                <div className="flex items-center gap-1">
                  <MessageCircleIcon size={20} />

                  {document._count?.Comment }
                </div>

                {/* <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onPress={toggleOptions}>
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