'use client'

import { RefObject } from 'react'
import { TiptopEditor, TiptopEditorHandle } from 'tiptop-editor'
import { useTranslations } from 'next-intl'

interface Props {
  editorRef: RefObject<TiptopEditorHandle>
  editorOptions: any
}

export function DraftContentField({ editorRef, editorOptions }: Props) {
  const t = useTranslations('newDraftModal')

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{t('contentLabel')}</label>
      <div className="min-h-[300px] px-4">
        <TiptopEditor ref={editorRef} editorOptions={editorOptions} />
      </div>
    </div>
  )
}