import { CommentCardProps } from '@/lib/types'
import { Avatar, Button, useDisclosure } from '@heroui/react'
import moment from 'moment'
import React, { memo, useState } from 'react'
import Icon from '../ui/Icon'
import ModalValidation from '../pannels/ModalValidation'
import { deleteComment } from '@/actions/comment'
import { errorToast, successToast } from '@/actions/showToast'

const CommentCard = ({ comment, onRemoveComment }: {
  comment: CommentCardProps,
  onRemoveComment?: Function,
}) => {
  const MemoButton = memo(Button);
  const [loading, setLoading] = useState<boolean>(false)
  const { isOpen, onOpenChange } = useDisclosure();

  const scrollToComment = () => {
    const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
    
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

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

  return (
    <>
      <div onClick={scrollToComment} className="flex flex-col gap-2 p-2 border border-divider hover:translate-x-1.5 transition-all shadow rounded-xl cursor-pointer">
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

            <div className="flex items-center gap-1">
              <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
                <Icon name="SquarePen" className="text-foreground-500" />
              </MemoButton>

              <MemoButton variant="light" size="sm" onPress={onOpenChange} color="default" isIconOnly>
                <Icon name="Trash2" className="text-danger" />
              </MemoButton>
            </div>
          </div>
        </div>

        <div>
          <p className="text-default-500 text-sm break-words">
            {comment.text}
          </p>
        </div>
      </div>

      <ModalValidation
        size="xs"
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