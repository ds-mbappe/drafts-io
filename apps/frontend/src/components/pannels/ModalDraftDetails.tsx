"use client"

import { useContext, useRef, useState } from 'react'
import { Modal, Button } from '@heroui/react'
import { errorToast, infoToast, successToast } from '@/actions/showToast'
import { NextSessionContext } from '@/contexts/SessionContext'
import { useBlockEditor } from '../editor/hooks/useBlockEditor'
import { createDraft } from '@/actions/document'
import { useRouter } from 'next/navigation'
import { useMobile } from '@/hooks/useMobile'
import { useDebouncedCallback } from 'use-debounce'
import { DraftProps } from '@/lib/types'
import { useFileUpload } from '@/hooks/useFileUpload'
import { TiptopEditorHandle } from 'tiptop-editor'
import { useNewDraftStore } from '@/stores/newDraftStore'
import { useTranslations } from 'next-intl'
import { DraftTitleField } from './modal-draft/DraftTitleField'
import { DraftTopicsField } from './modal-draft/DraftTopicsField'
import { DraftIntroField } from './modal-draft/DraftIntroField'
import { DraftCoverField } from './modal-draft/DraftCoverField'
import { DraftContentField } from './modal-draft/DraftContentField'

const ModalDraftDetails = () => {
  const t = useTranslations('newDraftModal')
  const router = useRouter()
  const isLargeScreen = useMobile()
  const { uploadFile } = useFileUpload()
  const { session } = useContext(NextSessionContext)
  const user = session?.user

  const { isOpen, close } = useNewDraftStore()

  // Form values
  const [titleValue, setTitleValue] = useState('')
  const [intro, setIntro] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [coverFile, setCoverFile] = useState<File | undefined>()
  const [loading, setLoading] = useState(false)

  // Editor state (needed for submission)
  const contentEditorRef = useRef<TiptopEditorHandle>(null)
  const [draft, setDraft] = useState<DraftProps | undefined>()
  const [characterCount, setCharacterCount] = useState({ words: 0, characters: 0 })

  const { editorOptions: contentEditorOptions } = useBlockEditor({
    doc: draft,
    editorRef: contentEditorRef,
    editable: true,
    autoFocus: false,
    debouncedUpdates: ({ updatedDoc, characterCount: cc }: { updatedDoc: DraftProps; characterCount: any }) => {
      setDraft(updatedDoc)
      setCharacterCount(cc)
    },
  })

  // Incremented on close to force-remount children that have internal state
  const [resetKey, setResetKey] = useState(0)

  const closeAndReset = () => {
    close()
    setTitleValue('')
    setIntro('')
    setSelectedTopics([])
    setCoverFile(undefined)
    setDraft(undefined)
    setCharacterCount({ words: 0, characters: 0 })
    setResetKey((k) => k + 1)
  }

  const oncreateDraft = useDebouncedCallback(async () => {
    setLoading(true)
    try {
      let coverUrl = ''
      if (coverFile) {
        const uploaded = await uploadFile(coverFile, 'cover_urls')
        coverUrl = uploaded.url
      }

      const content = contentEditorRef.current?.getEditor()?.getJSON() ?? draft?.content

      const response = await createDraft({
        intro,
        topics: selectedTopics,
        title: titleValue,
        authorId: user?.id,
        content,
        cover: coverUrl,
        word_count: characterCount?.words,
        character_count: characterCount?.characters,
      })

      if (!response.success) {
        if (response.error.properties?.title?.errors?.length) {
          infoToast(response.error.properties.title.errors[0])
        } else {
          errorToast(t('failedToCreate'))
        }
        return
      }

      successToast(t('draftCreated'))
      closeAndReset()
      router.push(`/app/drafts/${response.data.id}`)
    } catch {
      errorToast(t('failedToCreate'))
    } finally {
      setLoading(false)
    }
  }, 300)

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(v) => { if (!v) closeAndReset() }}
    >
      <Modal.Backdrop>
        <Modal.Container size={isLargeScreen ? 'lg' : 'full'} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t('heading')}</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="w-full flex flex-col gap-5">
              <DraftTitleField value={titleValue} onChange={setTitleValue} />
              <DraftTopicsField
                key={`topics-${resetKey}`}
                value={selectedTopics}
                onChange={setSelectedTopics}
                isOpen={isOpen}
              />
              <DraftIntroField value={intro} onChange={setIntro} />
              <DraftCoverField key={`cover-${resetKey}`} onFileChange={setCoverFile} />
              <DraftContentField editorRef={contentEditorRef} editorOptions={contentEditorOptions} />
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" onPress={closeAndReset}>{t('cancel')}</Button>
              <Button variant="primary" isPending={loading} onPress={oncreateDraft}>
                {t('createDraft')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

ModalDraftDetails.displayName = 'ModalDraftDetails'

export default ModalDraftDetails