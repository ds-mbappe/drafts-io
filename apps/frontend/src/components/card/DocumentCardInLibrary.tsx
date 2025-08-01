import React from 'react';
import moment from 'moment';
import Link from 'next/link';
import { DocumentCardTypeprops } from '@/lib/types';
import { Avatar, Card, CardBody, CardHeader, cn, Divider, Image } from "@heroui/react";

const DocumentCardInLibrary = ({ document }: { document: DocumentCardTypeprops }) => {
  return (
    <Link href={`/app/${document?.id}`}>
      <Card className="w-full h-[200px] md:h-[300px] border border-divider hover:scale-105 transition-all">
        <CardHeader className="flex h-[60px] items-start gap-4">
          <div>
            <Avatar
              size="sm"
              showFallback
              color="primary"
              classNames={{
                base: "border"
              }}
              src={document?.author?.avatar}
              name={document?.author?.firstname?.split("")?.[0]?.toUpperCase()}
            />
          </div>

          <div className="flex flex-col items-start">
            <p className="text-[10px] md:text-tiny uppercase font-bold line-clamp-1 break-all">{`${document?.title}`}</p>

            <small className="text-default-500 text-xs md:text-sm">{`Created ${moment(document?.createdAt).fromNow()}`}</small>
          </div>
        </CardHeader>

        <Divider></Divider>
        
        <CardBody className="py-2">
          <div className={cn("w-full rounded-xl! overflow-hidden h-full", document.cover ? "" : "bg-divider")}>
            {document?.cover &&
              <Image
                alt="Document cover"
                src={document.cover}
                className="object-cover h-full"
                // width={270}
                classNames={{
                  wrapper: 'w-full max-w-full! h-full',
                  img: "w-full"
                }}
              />
            }
          </div>
        </CardBody>
        {/* <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%-8px)] shadow-small ml-1 z-10">
          <p className="text-tiny text-white/80">{document?.}</p>
        </CardFooter> */}
      </Card>
    </Link>
  );
}

DocumentCardInLibrary.displayName = 'DocumentCardInLibrary'

export default DocumentCardInLibrary