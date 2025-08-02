"use client"

import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation'
import { Avatar, Button, Chip, cn, useDisclosure } from '@heroui/react';
import { toggleDocumentLike, updateDocument, useDocument } from '@/hooks/useDocument';
import { CloudUploadIcon } from 'lucide-react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useDebouncedCallback } from 'use-debounce';
import { errorToast, successToast } from '@/actions/showToast';
import BlockEditor from '@/components/editor';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { Editor } from '@tiptap/react';
import ModalValidation from '@/components/pannels/ModalValidation';
import { uploadFileToCloudinary } from '@/app/_helpers/cloudinary';
import { CustomDrawer } from '@/components/pannels/CustomDrawer';
import { useMobile } from '@/hooks/useMobile';
import { useComments } from '@/hooks/useComments';
import CommentCard from '@/components/card/CommentCard';
import { CharacterCount, CommentCardProps, DocumentCardTypeprops } from '@/lib/types';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import DraftToolbar from '@/components/toolbar/DraftToolbar';
import { updateComment } from '@/actions/comment';
import EditorToolbar from '@/components/editor/toolbars/EditorToolbar';
import DraftDetails from '@/components/draft/DraftDetails';

export default function Page() {
  const params = useParams();
  const { id } = params;
  const documentId = id?.toString() || '';
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id;
  const token = session?.accessToken;

  const editorRef = useRef<{
    editor: Editor | null,
  }>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isOpen, onOpenChange } = useDisclosure();

  const MemoButton = memo(Button);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const { document, mutate: mutateDoc } = useDocument(documentId, token);
  // const { comments, mutate: mutateComments } = useComments(documentId);

  useEscapeKey(() => setDrawerOpened(false)), drawerOpened;

  const [doc, setDoc] = useState<DocumentCardTypeprops>(() => {
    return {
      id: document?.id,
      content: document?.content,
      cover: document?.cover,
      title: document?.title,
      intro: document?.intro,
      author: document?.author,
      private: document?.private,
      createdAt: document?.createdAt,
      topic: document?.topic,
      locked: document?.locked,
      updatedAt: document?.updatedAt,
      word_count: document?.word_count,
      hasLiked: document?.hasLiked,
      _count: document?._count,
    };
  });

  const onPublishDraft = async () => {
    setLoading(true);
    await mutateDoc(
      async (currentData?: DocumentCardTypeprops) => {
        if (currentData) {
          const formData = {
            private: false,
          }
  
          await updateDocument(documentId, token, formData);
  
          return { ...currentData, private: false };
        }
      },
      {
        optimisticData: {
          ...(document as DocumentCardTypeprops),
          private: false
        },
        rollbackOnError: true,
        revalidate: false,
      }
    );
    setLoading(false);
    successToast('Story published, it is now visible in the discovery tab.')
    onOpenChange();
  }

  const onToggleLike = useDebouncedCallback(async () => {
    try {
      await mutateDoc(
        (prev: DocumentCardTypeprops | undefined) => {
          const prevLikeCount = prev?._count?.likes ?? 0;

          return {
            ...prev,
            _count: {
              likes: document?.hasLiked ? prevLikeCount - 1 : prevLikeCount + 1,
            }
          };
        },
      );

      await toggleDocumentLike(documentId, token);
    } catch (e) {
      errorToast("Something went wrong, please try again.");
    } finally {
      mutateDoc()
    }
  }, 300);

  const onDebouncedUpdates = useDebouncedCallback(async (updatedContent: string | null | undefined, characterCount: CharacterCount) => {
    await mutateDoc(
      async (currentData: any) => {
        const formData = {
          content: updatedContent,
          word_count: characterCount?.words(),
          character_count: characterCount?.characters(),
        }

        await updateDocument(documentId, token, formData);

        return { ...currentData, content: updatedContent };
      },
      {
        optimisticData: {
          ...(document as DocumentCardTypeprops),
          content: updatedContent
        },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }, 1000);

  const handleDebouncedUpdates = useCallback(
    ({ updatedDoc, characterCount }: { updatedDoc: DocumentCardTypeprops; characterCount: CharacterCount }) => {
      setDoc((oldValue: DocumentCardTypeprops) => ({
        ...(oldValue),
        content: updatedDoc?.content
      }));

      onDebouncedUpdates(updatedDoc?.content, characterCount);
    },
    [onDebouncedUpdates]
  );

  const isUserTheDraftAuthor = useMemo(() => {
    return doc?.author?.id === userID;
  }, [doc.author?.id, userID]);
  const canEditDraft = useMemo(() => {
    return document?.author?.id === userID && isEditMode;
  }, [document?.author?.id, isEditMode, userID]);

  useEffect(() => {
    if (document?.id) {
      setDoc(document)
    }
  }, [document])

  if (!document) return <>Loading...</>

  return (
    <div className="w-full flex flex-col bg-content1 relative overflow-visible">
      <div className="">
        <DraftToolbar
          hasLiked={document?.hasLiked}
          likeCount={document?._count?.likes}
          documentId={documentId}
          isEditMode={isEditMode}
          drawerOpened={drawerOpened}
          onToggleLike={onToggleLike}
          isUserTheDraftAuthor={isUserTheDraftAuthor}
          setIsEditMode={() => setIsEditMode(!isEditMode)}
          setDrawerOpened={() => setDrawerOpened(!drawerOpened)}
        />
      </div>

      {/* Fixed EditToolbar Top Bar */}
      {canEditDraft && editorRef.current?.editor &&
        <EditorToolbar editor={editorRef.current?.editor} documentId={documentId} />
      }

      <div ref={containerRef} className="w-full flex flex-col flex-1 gap-5 relative pb-16">
        <DraftDetails draft={document} />

        {/* <BlockEditor
          doc={doc}
          ref={editorRef}
          autoFocus={false}
          editable={isEditMode}
          containerRef={containerRef}
          debouncedUpdates={handleDebouncedUpdates}
        /> */}

        {/* <CustomDrawer
          open={drawerOpened}
          title={`Comments (${comments?.length || 0})`}
          placement={isLargeScreen ? "right" : "bottom" }
          heightPercent={isLargeScreen ? 0.30 : 0.5}
          onClose={() => setDrawerOpened(false)}
        >
          <div className="w-full flex flex-col flex-1 gap-2 p-4">
            {
              comments?.map((comment: CommentCardProps) => {
                return (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onUpdateCommentText={async (commentText) => {
                      await updateComment({
                        id: comment.id,
                        text: commentText
                      });
                      await mutateComments();
                    }}
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
          </div>
        </CustomDrawer> */}
      </div>

      {document?.private &&
        <MemoButton
          color="primary"
          title="Publish story"
          className="fixed bottom-5 right-5 z-20"
          onPress={onOpenChange}
        >
          {"Publish"}
        </MemoButton>
      }

      <ModalValidation
        size="xl"
        isOpen={isOpen}
        cancelText={"Cancel"}
        validateText={"Publish"}
        title={"Publish story"}
        validateLoading={loading}
        body={"Are you sure you want to publish this story ? By doing so, everyone will be able to read its content."}
        onCancel={onOpenChange}
        onOpenChange={onOpenChange}
        onValidate={onPublishDraft}
      />
    </div>
  )
}