'use client'

import { TextArea } from '@heroui/react'
import { useTranslations } from 'next-intl'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function DraftIntroField({ value, onChange }: Props) {
  const t = useTranslations('newDraftModal')

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{t('introLabel')}</label>
      <TextArea
        value={value}
        variant="secondary"
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('introPlaceholder')}
      />
    </div>
  )
}