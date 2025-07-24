"use client"

import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation'
import { Avatar, Button, cn, useDisclosure } from '@heroui/react';
import { toggleDocumentLike, updateDocument, useDocument, useDocumentLikes } from '@/hooks/useDocument';
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
// import DrawerComments from '@/components/pannels/DrawerComments';
import { CustomDrawer } from '@/components/pannels/CustomDrawer';
import { useMobile } from '@/hooks/useMobile';
import { useComments } from '@/hooks/useComments';
import CommentCard from '@/components/card/CommentCard';
import { CommentCardProps } from '@/lib/types';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import DraftToolbar from '@/components/toolbar/DraftToolbar';

export default function Page() {
  const params = useParams();
  const { id } = params;
  const documentId = id?.toString() || '';
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id;

  const editorRef = useRef<{
    editor: Editor | null,
  }>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLargeScreen = useMobile();
  const { isOpen, onOpenChange } = useDisclosure();

  const MemoButton = memo(Button);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const { document, mutate: mutateDoc } = useDocument(documentId);
  const { likeCount, hasLiked, mutate } = useDocumentLikes(documentId, userID);
  const { comments, mutate: mutateComments } = useComments(documentId);

  useEscapeKey(() => setDrawerOpened(false)), drawerOpened;

  const [doc, setDoc] = useState(() => {
    return {
      id: document?.id,
      content: document?.content,
      cover: document?.cover,
      title: document?.title,
      author: document?.author,
      private: document?.private,
      createdAt: document?.createdAt,
      topic: document?.topic,
    };
  });

  const onDrop = useCallback(async(acceptedFiles: any) => {
    const file = acceptedFiles?.[0];

    if (file) {
      try {
        const localUrl = URL.createObjectURL(file);
        const uploadedFileUrl = await uploadFileToCloudinary(file);
  
        setDoc((prev: any) => {
          return {
            ...prev,
            cover: localUrl,
          }
        })
  
        await mutateDoc(
          async (currentData: any) => {
          const formData = {
            cover: uploadedFileUrl,
          }
  
            await updateDocument(documentId, formData);
    
            return { ...currentData, cover: uploadedFileUrl };
          },
          {
            optimisticData: { ...document, cover: localUrl },
            rollbackOnError: true,
            revalidate: false,
          }
        );

        successToast('Draft cover updated !');
      } catch (error) {
        errorToast('There was an error while updating your draft cover, please try again.');
      }
    }
  }, []);

  const onPublishDraft = async () => {
    setLoading(true);
    await mutateDoc(
      async (currentData: any) => {
        const formData = {
          private: false,
        }

        await updateDocument(documentId, formData);

        return { ...currentData, private: false };
      },
      {
        optimisticData: { ...document, private: false },
        rollbackOnError: true,
        revalidate: false,
      }
    );
    setLoading(false);
    successToast('Draft published, it is now visible in the discovery tab.')
    onOpenChange();
  }

  const onToggleLike = useDebouncedCallback(async () => {
    try {
      await mutate((prev: any) => {
        return {
          ...prev,
          likeCount: hasLiked ? prev.likeCount - 1 : prev.likeCount + 1,
          hasLiked: !hasLiked
        };
      }, false);

      await toggleDocumentLike(documentId, userID, hasLiked);
    } catch (e) {
      errorToast("Something went wrong, please try again.");
    } finally {
      mutate()
    }
  }, 300);

  const onDebouncedUpdates = useDebouncedCallback(async (updatedContent: string, characterCount: any) => {
    await mutateDoc(
      async (currentData: any) => {
        const formData = {
          content: updatedContent,
          word_count: characterCount?.words(),
          character_count: characterCount?.characters(),
        }

        await updateDocument(documentId, formData);

        return { ...currentData, content: updatedContent };
      },
      {
        optimisticData: { ...document, content: updatedContent },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }, 1000);

  const handleDebouncedUpdates = useCallback(
    ({ updatedDoc, characterCount }: { updatedDoc: any; characterCount: any }) => {
      setDoc((oldValue: any) => ({
        ...oldValue,
        content: updatedDoc?.content
      }));

      onDebouncedUpdates(updatedDoc?.content, characterCount);
    },
    [onDebouncedUpdates]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop,
    onDropRejected() {
      errorToast(`File format not supported, accepted formats are ".png, .jpg, .jpeg, .gif, .avif, .webp"`)
    },
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp']
    }
  });

  const isUserTheDraftAuthor = useMemo(() => {
    return doc?.author?.id === userID;
  }, [doc.author?.id, userID]);

  return (
    <div className="w-full flex flex-col bg-content1 relative overflow-visible">
      <div className="sticky top-0 z-10">
        <DraftToolbar
          hasLiked={hasLiked}
          likeCount={likeCount}
          documentId={documentId}
          isEditMode={isEditMode}
          drawerOpened={drawerOpened}
          onToggleLike={onToggleLike}
          isUserTheDraftAuthor={isUserTheDraftAuthor}
          setIsEditMode={() => setIsEditMode(!isEditMode)}
          setDrawerOpened={() => setDrawerOpened(!drawerOpened)}
        />
      </div>

      <div ref={containerRef} className={cn("w-full flex flex-col flex-1 gap-5 relative", isEditMode ? "pb-[84px]" : "pb-10")}>
        <div className="w-full flex flex-col gap-5 mx-auto px-4 pt-10 md:px-0">
          <div className="w-full flex items-center gap-3 mx-auto">
            <Avatar
              // isBordered
              as="button"
              color="primary"
              showFallback
              name={doc?.author?.firstname?.split("")?.[0]?.toUpperCase()}
              size="sm"
              src={doc?.author?.avatar}
            />

            <div className="flex flex-col items-start">
              <p className="text-foreground text-lg text-center font-semibold">
                { `${doc?.author?.firstname} ${doc?.author?.lastname}` }
              </p>

              <p className="text-default-500 text-sm text-center">
                { moment(doc?.createdAt).format("MMMM D, YYYY, h:mm a") }
              </p>
            </div>
          </div>

          <p className="text-3xl font-semibold text-foreground">
            { doc?.title }
          </p>

          <Button
            variant="light"
            className={cn("w-full h-[350px] md:h-[450px] px-0 border border-divider", isEditMode ? "cursor-pointer" : "cursor-default")}
            onPress={(isUserTheDraftAuthor && isEditMode) ? open : () => {}}
          >
            <div
              {...getRootProps()}
              className="w-full flex justify-center items-center mx-auto relative px-0"
            >
              <input {...getInputProps()} />

              {doc?.cover &&
                <div
                  className="bg-cover bg-center w-full h-[350px] md:h-[450px]"
                  style={{
                    backgroundImage: `url(${doc?.cover})`
                  }}
                />
              }

              {!doc?.cover &&
                <div className="w-full h-[350px] md:h-[450px] rounded-[12px] gap-1 flex flex-col justify-center items-center bg-cover bg-center overflow-hidden border border-divider">
                  <CloudUploadIcon
                    width={80}
                    height={80}
                    className="text-foreground"
                  />

                  <p className="text-foreground text-center">
                    <span className="underline">{ "Click to upload" }</span>
                    { " or drag and drop" }
                  </p>
                </div>
              }
            </div>
          </Button>
        </div>

        <BlockEditor
          doc={doc}
          ref={editorRef}
          autoFocus={false}
          editable={isEditMode}
          containerRef={containerRef}
          debouncedUpdates={handleDebouncedUpdates}
        />

        <CustomDrawer
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
        </CustomDrawer>

        {/* <DrawerComments
          editorRef={editorRef}
          documentId={documentId}
          isOpen={isOpenComments}
          onOpenChange={onOpenChangeComments}
        /> */}
      </div>

      {document?.private &&
        <MemoButton
          color="primary"
          title="Publish draft"
          className="fixed bottom-10 right-10 z-20"
          onPress={onOpenChange}
        >
          {"Publish"}
        </MemoButton>
      }

      <ModalValidation
        size="xs"
        isOpen={isOpen}
        cancelText={"Cancel"}
        validateText={"Publish"}
        title={"Publish draft"}
        validateLoading={loading}
        body={"Are you sure you want to publish this draft ? By doing so, everyone will be able to read its content."}
        onCancel={onOpenChange}
        onOpenChange={onOpenChange}
        onValidate={onPublishDraft}
      />
    </div>
  )
}