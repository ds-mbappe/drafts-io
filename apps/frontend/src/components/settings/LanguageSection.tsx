'use client'

import React from 'react'
import { ListBox, ListBoxItem, Select } from '@heroui/react'
import { updateProfile } from '@/actions/settings'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { languages } from '@/app/constants'
import { BaseUser } from '@/lib/types'
import { KeyedMutator } from 'swr'
import { CheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export const LanguageSection = ({
  me,
  mutateMe,
}: {
  me: BaseUser | undefined
  mutateMe: KeyedMutator<BaseUser>
}) => {
  const { token } = useAuthFetcher()
  const t = useTranslations('settings.language')
  const selectedKey = me?.language ?? 'en'
  const selectedLang = languages.find((l) => l.key === selectedKey) ?? languages[0]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
        <p className="text-sm text-foreground-500 mt-0.5">{t('description')}</p>
      </div>

      <Select
        variant="secondary"
        value={selectedKey}
        onChange={async (key) => {
          const language = key as string
          mutateMe({ ...me!, language }, false)
          await updateProfile(token!, { language })
        }}
        className="max-w-xs"
      >
        <Select.Trigger>
          <Select.Value>
            <span className="flex items-center gap-2">
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.title}</span>
            </span>
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {languages.map((lang) => (
              <ListBoxItem key={lang.key} id={lang.key}>
                <span className="flex items-center justify-between gap-3 w-full">
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.title}</span>
                  </span>
                  {lang.key === selectedKey && (
                    <CheckIcon size={14} className="text-primary shrink-0" />
                  )}
                </span>
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </section>
  )
}
