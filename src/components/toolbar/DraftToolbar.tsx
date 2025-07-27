import { Badge, Button, useDisclosure } from '@heroui/react'
import { HeartIcon } from 'lucide-react'
import React, { memo, useState } from 'react'
import Icon from '../ui/Icon'
import ModalValidation from '../pannels/ModalValidation'
import { errorToast, successToast } from '@/actions/showToast'
import { useRouter } from 'next/navigation'
import { deleteDocument } from '@/hooks/useDocument'

const DraftToolbar = ({
  likeCount,
  hasLiked,
  isEditMode,
  documentId,
  drawerOpened,
  isUserTheDraftAuthor,
  onToggleLike,
  setIsEditMode,
  setDrawerOpened,
}: {
  likeCount: number,
  hasLiked: boolean,
  documentId: string,
  isEditMode: boolean,
  drawerOpened: boolean,
  isUserTheDraftAuthor: boolean,
  onToggleLike: () => void,
  setIsEditMode: () => void,
  setDrawerOpened: () => void,
}) => {
  const MemoButton = memo(Button);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpenChange } = useDisclosure();

  const onDeleteDraft = async () => {
    setLoading(true);

    try {
      await deleteDocument(documentId).then(() => {
        successToast('Story deleted.');

        router.back();
      })
    } catch (error) {
      errorToast(`Error deleting document, ${error}`)
    } finally {
      setLoading(false);
      onOpenChange();
    }
  }

  return (
    <div className="w-full h-16 flex mx-auto px-6 py-2 items-center justify-between border-b border-divider z-[2] bg-content1">
      <div className="w-full flex items-center gap-3 flex-1">
        <Badge color="danger" isInvisible={!likeCount} content={likeCount} size="md" shape="circle">
          <Button isIconOnly size={"sm"} variant={"light"} onPress={onToggleLike}>
            <HeartIcon fill={hasLiked ? "#006FEE" : "none"} strokeWidth={hasLiked ? 0 : undefined} className="text-foreground-500 transition-all duration-500" />
          </Button>
        </Badge>

        <Button isIconOnly size={"sm"} variant={"light"} onPress={setDrawerOpened}>
          <Icon name="MessageCircleMore" className={drawerOpened ? 'text-primary-500' : "text-foreground-500"} />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {isUserTheDraftAuthor &&
          <MemoButton variant="light" size="sm" onPress={setIsEditMode} color="default" isIconOnly>
            <Icon name={isEditMode ? 'Eye' : 'Pencil'} className="text-foreground-500" />
          </MemoButton>
        }

        {/* <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
          <Icon name="Bookmark" className="text-foreground-500" />
        </MemoButton>

        <MemoButton variant="light" size="sm" onPress={() => {}} color="default" isIconOnly>
          <Icon name="Share" className="text-foreground-500" />
        </MemoButton> */}

        {isUserTheDraftAuthor &&
          <MemoButton variant="light" size="sm" onPress={onOpenChange} color="default" isIconOnly>
            <Icon name="Trash2" className="text-danger" />
          </MemoButton>
        }
      </div>

      <ModalValidation
        size="xs"
        isOpen={isOpen}
        cancelText={"Cancel"}
        title={"Delete draft"}
        validateText={"Delete"}
        validateLoading={loading}
        body={"Are you sure you want to delete this draft ? This action is permanent."}
        onCancel={onOpenChange}
        onOpenChange={onOpenChange}
        onValidate={onDeleteDraft}
      />
    </div>
  )
}

export default DraftToolbar