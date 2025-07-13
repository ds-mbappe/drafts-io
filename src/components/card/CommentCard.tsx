import { CommentCardProps } from '@/lib/types'
import { Avatar, Link } from '@heroui/react'
import moment from 'moment'
import React from 'react'

const CommentCard = ({ comment }: { comment: CommentCardProps }) => {
  const scrollToComment = () => {
    const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
    
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <Link onClick={scrollToComment} className="cursor-pointer">
      <div className="flex flex-col gap-2 p-2 border border-divider hover:translate-x-1.5 hover:bg-default-100 transition-all shadow rounded-xl">
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

          <div className="flex flex-col">
            <p className="font-semibold line-clamp-1 text-foreground">
              {`${comment.user?.firstname} ${comment.user?.lastname}`}
            </p>

            <p className="font-medium text-default-500 text-xs">
              {moment(comment.updatedAt).fromNow()}
            </p>
          </div>
        </div>

        <div>
          <p className="text-default-500 text-sm break-all">
            {comment.text}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default CommentCard