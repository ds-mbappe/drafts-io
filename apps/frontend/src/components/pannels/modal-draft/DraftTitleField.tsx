'use client'

import { Input } from '@heroui/react'
import { useTranslations } from 'next-intl'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function DraftTitleField({ value, onChange }: Props) {
  const t = useTranslations('newDraftModal')

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {t('titleLabel')} <span className="text-danger">*</span>
      </label>
      <Input
        required
        value={value}
        variant="secondary"
        placeholder={t('titlePlaceholder')}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}