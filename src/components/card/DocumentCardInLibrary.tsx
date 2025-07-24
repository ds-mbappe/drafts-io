import React from 'react';
import moment from 'moment';
import Link from 'next/link';
import { DocumentCardTypeprops } from '@/lib/types';
import { Avatar, Card, CardBody, CardHeader, Image } from "@heroui/react";

const DocumentCardInLibrary = ({ document }: { document: DocumentCardTypeprops }) => {
  return (
    <Link href={`/app/${document?.id}`}>
      <Card className="w-full h-[200px] md:h-[300px] border border-divider hover:scale-105 transition-all">
        <CardHeader className="flex items-center gap-4">
          <div>
            <Avatar
              isBordered
              color="primary"
              showFallback
              name={document?.author?.firstname?.split("")?.[0]?.toUpperCase()}
              size="sm"
              src={document?.author?.avatar}
            />
          </div>

          <div className="flex flex-col items-start">
            <p className="text-[10px] md:text-tiny uppercase font-bold line-clamp-2 break-all">{`${document?.title}`}</p>

            <small className="text-default-500 text-xs md:text-sm">{`Created ${moment(document?.createdAt).fromNow()}`}</small>
          </div>
        </CardHeader>
        
        <CardBody className="py-2">
          <div className="w-full !rounded-xl overflow-hidden h-full">
            { document.cover &&
              <Image
                alt="Document cover"
                className="object-cover h-full"
                src={document?.cover}
                // width={270}
                classNames={{
                  wrapper: 'w-full !max-w-full h-full',
                  img: "w-full"
                }}
              />
            }
          </div>
        </CardBody>
        {/* <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <p className="text-tiny text-white/80">{document?.}</p>
        </CardFooter> */}
      </Card>
    </Link>
  );
}

DocumentCardInLibrary.displayName = 'DocumentCardInLibrary'

export default DocumentCardInLibrary