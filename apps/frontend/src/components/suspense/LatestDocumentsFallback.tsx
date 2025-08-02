import { Skeleton } from "@heroui/react";
import DraftCardInLibrary from "../card/DraftCardInLibrary";

export const LatestDocumentsFallback = () => {
  const elements = [];

  for (let i = 0; i < 8; i++) {
    elements.push(
      <Skeleton key={i} className="rounded-xl">
        <DraftCardInLibrary draft={{
          id: '0',
          author: {
            id: '0',
            avatar: '',
            firstname: '',
            lastname: ''
          },
          intro: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
          createdAt: '',
          updatedAt: '',
          cover: '',
          topic: '',
          title: 'This is just a title that I put there',
          content: '', private: false, locked: false
        }} />
      </Skeleton>
    );
  }
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {elements}
    </div>
  )
}  