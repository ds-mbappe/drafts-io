'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { CloudUploadIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { errorToast } from '@/actions/showToast'

interface Props {
  onFileChange: (file: File | undefined) => void
}

export function DraftCoverField({ onFileChange }: Props) {
  const t = useTranslations('newDraftModal')
  const [cover, setCover] = useState('')

  useEffect(() => {
    return () => {
      if (cover.startsWith('blob:')) URL.revokeObjectURL(cover)
    }
  }, [cover])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0]
      if (!file) return
      setCover(URL.createObjectURL(file))
      onFileChange(file)
    },
    [onFileChange]
  )

  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop,
    onDropRejected() {
      errorToast(t('unsupportedFormat'))
    },
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/avif': ['.avif'],
      'image/webp': ['.webp'],
    },
  })

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{t('coverLabel')}</label>
      <Button
        onPress={openFilePicker}
        variant="ghost"
        className="w-full h-[350px] md:h-[450px] px-0"
      >
        <div
          {...getRootProps()}
          className="w-full flex justify-center items-center max-w-3xl mx-auto relative px-0"
        >
          <input {...getInputProps()} />

          {cover ? (
            <div
              className="bg-cover bg-center w-full h-[350px] md:h-[450px]"
              style={{ backgroundImage: `url(${cover})` }}
            />
          ) : (
            <div className="w-full h-[350px] md:h-[450px] rounded-[12px] gap-1 max-w-3xl flex flex-col justify-center items-center bg-cover bg-center overflow-hidden border border-divider">
              <CloudUploadIcon width={80} height={80} className="text-foreground" />
              <p className="text-foreground text-center">
                <span className="underline">{t('uploadFromDevice')}</span>
                {' '}{t('orDragAndDrop')}
              </p>
            </div>
          )}
        </div>
      </Button>
    </div>
  )
}