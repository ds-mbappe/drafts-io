import React from 'react';
import moment from 'moment';
import Link from "next/link";
import { DocumentCardTypeprops } from '@/lib/types';
import { CalendarIcon, CircleHelpIcon } from 'lucide-react';
import { Avatar, Card, CardBody, Chip, Image } from "@heroui/react";

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
      <Card shadow="none" className="border border-divider cursor-pointer hover:bg-foreground-100 active:scale-[0.95] !rounded-large">
        <CardBody className="flex flex-row gap-4">
          {document?.cover ?
            <div className="hidden sm:!flex border border-divider rounded-large">
              <Image
                isZoomed
                width={140}
                height={140}
                src={document?.cover}
                alt={`${document?.title}_cover`}
              />
            </div> :
            <div className="w-[140px] h-[142px] bg-divider justify-center items-center hidden sm:!flex border border-divider rounded-large">
              <CircleHelpIcon size={50} />
            </div>
          }

          <div className="flex flex-1 flex-col gap-2">
            {/* User */}
            <div className="flex gap-3 items-center">
              <div>
                <Avatar
                  isBordered
                  color="default"
                  className="w-6 h-6"
                  name={document?.authorFirstname?.split("")?.[0]?.toUpperCase()}
                  src={document?.authorAvatar}
                />
              </div>

              <p className="line-clamp-1 text-sm font-medium">
                {`${document?.authorFirstname} ${document?.authorLastname}`}
              </p>
            </div>

            {/* Title & caption */}
            <div className="h-full flex flex-col gap-1 flex-1">
              <p className="font-medium line-clamp-2">
                {document?.title}
              </p>
            </div>

            {/* Topic */}
            { document?.topic &&
              <div className="flex items-center gap-2">
                <Chip variant="flat">
                  <p className="font-medium text-sm text-foreground-500">
                    {document?.topic}
                  </p>
                </Chip>
              </div>
            }

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
                {/* <Button className="text-foreground-500" isIconOnly size={"sm"} variant={"light"} onClick={toggleBookmark}>
                  <BookmarkIcon />
                </Button> */}
                
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