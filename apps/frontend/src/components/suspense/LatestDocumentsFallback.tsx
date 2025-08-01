import { Skeleton } from "@heroui/react";
import DocumentCard from "../card/DocumentCard";

export const LatestDocumentsFallback = () => {
  const elements = [];

  for (let i = 0; i < 8; i++) {
    elements.push(
      <Skeleton key={i} className="rounded-xl">
        <DocumentCard document={{
          id: '0',
          author: {
            id: '0',
            avatar: '',
            firstname: '',
            lastname: ''
          },
          createdAt: '',
          updatedAt: '',
          cover: '',
          topic: '',
          title: '',
          content: '', private: false, locked: false
        }} />
      </Skeleton>
    );
  }
  return (
    <div className="w-full flex flex-col gap-4">
      {elements}
    </div>
  )
}  