import React, { useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@heroui/react";
import { CommentCardProps } from '@/lib/types';
import CommentCard from '../card/CommentCard';
import { Editor } from '@tiptap/react';
import { useComments } from '@/hooks/useComments';
import { useMobile } from '@/hooks/useMobile';

const DrawerComments = ({ isOpen, editorRef, size, documentId, onOpenChange }: {
  isOpen: boolean | undefined,
  editorRef: React.RefObject<{
    editor: Editor | null;
  }>,
  size?: "2xl" | "xs" | "sm" | "md" | "lg" | "xl" | "3xl" | "4xl" | "5xl" | "full" | undefined,
  documentId: string,
  onOpenChange: () => void | undefined,
}) => {
  const isLargeScreen = useMobile();
  const { comments, mutate: mutateComments } = useComments(documentId);

  const placement = useMemo(() => {
    if (isLargeScreen) {
      return 'right'
    }

    return 'bottom'
  }, [isLargeScreen])

  return (
    <Drawer
      isOpen={isOpen}
      size={size ?? "sm"}
      placement={placement}
      backdrop="transparent"
      scrollBehavior="inside"
      shouldBlockScroll={false}
      onOpenChange={onOpenChange}
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            x: 0,
            animationDuration: 0.5
          },
          exit: {
            x: 100,
            opacity: 0,
            animationDuration: 0.5
          },
        },
      }}
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader>
              {`Comments (${comments?.length})`}
            </DrawerHeader>

            <DrawerBody className="flex flex-col gap-2">
              {
                comments?.map((comment: CommentCardProps) => {
                  return (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onRemoveComment={async (comment: CommentCardProps) => {
                        const editor = editorRef.current?.editor;
                        const from = comment.from;
                        const to = comment.to;
                        
                        if (editorRef) {
                          editor?.commands.setTextSelection({ from, to });
                          editor?.commands.removeComment();
    
                          await mutateComments();
                        }
                      }}
                    />
                  )
                })
              }
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

DrawerComments.displayName = 'DrawerComments'

export default DrawerComments