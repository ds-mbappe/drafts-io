import React from 'react';
import moment from 'moment';
import Link from 'next/link';
import { DocumentCardTypeprops } from '@/lib/types';
import { Card, CardBody, CardFooter, CardHeader, Image } from '@nextui-org/react';

const DocumentCardInLibrary = ({ document }: { document: DocumentCardTypeprops }) => {
  return (
    <Link href={`/app/${document?.id}`}>
      <Card className="py-2 w-[200PX] h-[200PX] md:w-[300px] md:h-[300px] hover:scale-105 transition-all">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-[10px] md:text-tiny uppercase font-bold line-clamp-1">{`${document?.title}`}</p>
          <small className="text-default-500">{`Created ${moment(document?.createdAt).fromNow()}`}</small>
          {/* <h4 className="font-bold text-base md:text-large line-clamp-1">{document?.title}</h4> */}
        </CardHeader>
        <CardBody className="py-2">
          <div className="w-full !rounded-xl overflow-hidden">
            <Image
              alt="Document cover"
              className="object-cover"
              src={document?.cover}
              width={270}
            />
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