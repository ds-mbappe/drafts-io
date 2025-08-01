import { CommentCardProps } from '@/lib/types'
import { Avatar, Button, Textarea, useDisclosure } from '@heroui/react'
import moment from 'moment'
import React, { memo, useContext, useEffect, useState } from 'react'
import Icon from '../ui/Icon'
import ModalValidation from '../pannels/ModalValidation'
import { deleteComment } from '@/actions/comment'
import { errorToast, successToast } from '@/actions/showToast'
import { NextSessionContext } from '@/contexts/SessionContext'
import { useDebouncedCallback } from 'use-debounce'

const CommentCard = ({ comment, onRemoveComment, onUpdateCommentText }: {
  comment: CommentCardProps,
  onRemoveComment?: Function,
  onUpdateCommentText: (text: string | undefined) => void,
}) => {
  const { session } = useContext(NextSessionContext);
  const userID = session?.user?.id;

  const MemoButton = memo(Button);
  const { isOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string | undefined>('');

  const scrollToComment = () => {
    const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
    
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const resetComment = () => {
    setIsEditing(false);
    setCommentText(comment.text);
  };

  const updateComment = useDebouncedCallback(async () => {
    try {
      setLoading(true);

      onUpdateCommentText(commentText);

      successToast('Comment updated successfully.')
    } catch (error) {
      errorToast('Error while updating comment.')
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  }, 300);

  const onDeleteComment = async () => {
    try {
      setLoading(true);

      await deleteComment(comment.id).then(() => {
        if (onRemoveComment) {
          onRemoveComment(comment);
        }
      });

      successToast('Comment deleted successfully.')
    } catch (error) {
      errorToast('Error while deleting comment.')
    } finally {
      onOpenChange();
      setLoading(false);
    }
  }

  useEffect(() => {
    if (comment) {
      setCommentText(comment.text)
    }
  }, [comment])
  

  return (
    <>
      <div onClick={scrollToComment} className="flex flex-col gap-2 p-2 border border-divider md:hover:-translate-x-1.5 transition-all shadow-sm rounded-xl cursor-pointer">
        <div className="flex items-center gap-2">
          <div>
            <Avatar
              color="primary"
              src={comment.user?.avatar}
              classNames={{
                base: "w-8 h-8",
              }}
              name={comment.user?.firstname?.split('')?.[0]}
            />
          </div>

          <div className="w-full flex flex-1 items-start gap-2">
            <div className="w-full flex flex-col">
              <p className="font-semibold line-clamp-1 text-foreground">
                {`${comment.user?.firstname} ${comment.user?.lastname}`}
              </p>

              <p className="font-medium text-default-500 text-xs">
                {moment(comment.updatedAt).fromNow()}
              </p>
            </div>

            {comment?.user?.id === userID &&
              <div className="flex items-center gap-1">
                {isEditing ?
                  <MemoButton variant="light" size="sm" onPress={resetComment} color="danger" isIconOnly>
                    <Icon name={"X"} className="text-foreground-500" />
                  </MemoButton> :
                  <MemoButton variant="light" size="sm" onPress={() => setIsEditing(true)} color="default" isIconOnly>
                    <Icon name={"SquarePen"} className="text-foreground-500" />
                  </MemoButton>
                }

                {isEditing ?
                  <MemoButton variant="light" size="sm" onPress={updateComment} color="primary" isIconOnly isDisabled={!commentText}>
                    <Icon name={"Check"} className="text-foreground-500" />
                  </MemoButton> :
                  <MemoButton variant="light" size="sm" onPress={onOpenChange} color="default" isIconOnly>
                    <Icon name="Trash2" className="text-danger" />
                  </MemoButton>
                }
              </div>
            }
          </div>
        </div>

        <div>
          {isEditing ?
            <Textarea
              isRequired
              isClearable
              variant="bordered"
              value={commentText}
              isReadOnly={loading}
              validationBehavior="aria"
              onValueChange={setCommentText}
              errorMessage="Please enter a text"
            /> :
            <p className="text-default-500 text-sm break-words">
              {commentText}
            </p>
          }
        </div>
      </div>

      <ModalValidation
        size="md"
        isOpen={isOpen}
        cancelText={"Cancel"}
        validateText={"Delete"}
        validateLoading={loading}
        title={"Delete comment"}
        body={"Are you sure you want to delete this comment ?"}
        onCancel={onOpenChange}
        onOpenChange={onOpenChange}
        onValidate={onDeleteComment}
      />
    </>
  )
}

export default CommentCard