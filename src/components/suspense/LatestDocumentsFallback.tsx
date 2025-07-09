import { Skeleton } from "@heroui/react";
import DocumentCard from "../card/DocumentCard";

export const LatestDocumentsFallback = () => {
  const elements = [];

  for (let i = 0; i < 8; i++) {
    elements.push(
      <Skeleton key={i}>
        <DocumentCard document={{
          id: '0',
          authorFirstname: '',
          authorLastname: '',
          authorAvatar: '',
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
    <div className="w-full flex flex-col gap-4 md:!grid md:!grid-cols-2">
      {elements}
    </div>
  )
}  