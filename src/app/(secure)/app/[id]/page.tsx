"use client"

import React, { memo, useCallback, useContext, useMemo, useState } from 'react';
import { useParams } from 'next/navigation'
import { Avatar, Badge, Button, Image } from '@heroui/react';
import { toggleDocumentLike, updateDocument, useDocument, useDocumentLikes } from '@/hooks/useDocument';
import { CloudUploadIcon, HeartIcon, MessageCircleMoreIcon } from 'lucide-react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { useDebouncedCallback } from 'use-debounce';
import { errorToast } from '@/actions/showToast';
import BlockEditor from '@/components/editor';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { Icon } from '@/components/ui/Icon'
import { Editor, getMarkType } from '@tiptap/react';
import { useComments } from '@/hooks/useComments';
import { createComment } from '@/actions/comment';
import CommentHighlight from '@/components/editor/extensions/CommentHighlight';
import CommentCard from '@/components/card/CommentCard';
import { CommentCardProps } from '@/lib/types';
// import ModalValidation from '@/components/pannels/ModalValidation';

export default function Page() {
  const params = useParams();
  const { id } = params;
  const documentId = id?.toString() || '';
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id;

  const MemoButton = memo(Button);
  
  const { document, mutate: mutateDoc } = useDocument(documentId);
  const { comments, mutate: mutateComments } = useComments(documentId);
  const { likeCount, hasLiked, mutate } = useDocumentLikes(documentId, userID);

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
      const localUrl = URL.createObjectURL(file);

      setDoc((prev: any) => {
        return {
          ...prev,
          cover: localUrl,
        }
      })
    }
  }, []);

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
    <div className="w-full h-full flex z-50 bg-background relative">
      <div className="w-full flex flex-col gap-5 pb-10">
        <div className="w-full h-16 flex mx-auto px-5 md:!px-20 py-2 items-center justify-between border-y border-divider sticky top-0 z-10 bg-background">
          <div className="w-full flex items-center gap-3 flex-1">
            <Badge color="danger" isInvisible={!likeCount} content={likeCount} size="md" shape="circle">
              <Button isIconOnly size={"sm"} variant={"light"} onClick={onToggleLike}>
                <HeartIcon fill={hasLiked ? "#006FEE" : "none"} strokeWidth={hasLiked ? 0 : undefined} className="text-foreground-500 transition-all duration-500" />
              </Button>
            </Badge>

            <Button isIconOnly size={"sm"} variant={"light"}>
              <MessageCircleMoreIcon className="text-foreground-500" />
            </Button>
          </div>

          {isUserTheDraftAuthor &&
            <div className="flex items-center gap-1">
              <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
                <Icon name="Eye" className="text-foreground-500" />
              </MemoButton>

              <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
                <Icon name="Bookmark" className="text-foreground-500" />
              </MemoButton>

              <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
                <Icon name="Share" className="text-foreground-500" />
              </MemoButton>

              <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
                <Icon name="Trash2" className="text-danger" />
              </MemoButton>
            </div>
          }
        </div>

        <div className="w-full flex flex-col gap-5 max-w-[768px] 2xl:max-w-[1024px] mx-auto px-4 md:px-0">
          <div className="w-full flex items-center gap-3 mx-auto">
            <Avatar
              isBordered
              as="button"
              color="primary"
              showFallback
              name={doc?.author?.firstname?.split("")?.[0]?.toUpperCase()}
              size="sm"
              src={doc?.author?.avatar}
            />

            <div className="flex flex-col items-start">
              <p className="text-default-500 text-lg text-center font-semibold">
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
            onPress={isUserTheDraftAuthor ? open : () => {}}
            variant="light"
            className="w-full h-[350px] md:h-[450px] px-0"
          >
            <div
              {...getRootProps()}
              className="w-full flex justify-center items-center max-w-3xl mx-auto relative px-0"
            >
              <input {...getInputProps()} />

              {doc?.cover &&
                <Image
                  src={doc?.cover}
                  height={350}
                  alt="cover"
                  className="w-full border border-divider"
                />
              }

              {!doc?.cover &&
                <div className="w-full h-[350px] md:h-[450px] rounded-[12px] gap-1 max-w-3xl flex flex-col justify-center items-center bg-cover bg-center overflow-hidden border border-divider">
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
          editable
          doc={doc}
          autoFocus={false}
          debouncedUpdates={handleDebouncedUpdates}
          onAddComment={async (editor: Editor, commentValue: string) => {
            const { state } = editor;
            const { from, to } = state.selection;
            const tmpID = `tmp-${crypto.randomUUID()}`

            try {
              if (from !== to) {
                editor.commands.addComment(tmpID)
              }
              
              const hasFakeMark = editor.state.doc.rangeHasMark(from, to, editor.schema.marks['comment-highlight']);

              if (hasFakeMark) {
                const { comment } = await createComment({
                  documentId,
                  userId: userID,
                  text: commentValue,
                  from: from,
                  to: to,
                });

                editor
                  .chain()
                  .focus()
                  .unsetMark('comment-highlight')
                  .setMark('comment-highlight', { commentId: comment?.id })
                  .run();
              }
            } catch (error) {
              errorToast('Error adding comment.')
            } finally {
              editor.commands.setTextSelection(to)
            }
          }}
          commentList={
            comments?.map((comment: CommentCardProps) => {
              return (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onRemoveComment={() => {}}
                />
              )
            })
          }
        />
      </div>

      {/* <ModalValidation
        title={"Delete draft"}
        body={"Are you sure you want to delete this draft ? If you choose to proceed, other users will no longer be able to access it"}
        cancelText={"Cancel"}
        validateText={"Delete"}
        isOpen={isOpen}
        validateLoading={false}
        onOpenChange={onOpenChange}
        onCancel={onOpenChange}
        onValidate={onDelete}
      /> */}
    </div>
  )
}