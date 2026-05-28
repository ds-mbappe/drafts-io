'use client'

import React from 'react'
import { Separator } from '@heroui/react'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { BaseUser } from '@/lib/types'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { SecuritySection } from '@/components/settings/SecuritySection'
import { LanguageSection } from '@/components/settings/LanguageSection'
import { NotificationsSection } from '@/components/settings/NotificationsSection'
import { DangerZoneSection } from '@/components/settings/DangerZoneSection'

export default function SettingsPage() {
  const { fetcher } = useAuthFetcher()
  const { data: me, mutate: mutateMe } = useSWR<BaseUser>(
    '/api/settings/me',
    fetcher,
    { revalidateOnFocus: false },
  )
  const t = useTranslations('settings')

  return (
    <div className="flex flex-col gap-10 px-4 py-8 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <ProfileSection me={me} mutateMe={mutateMe} />
      <Separator />
      <SecuritySection me={me} mutateMe={mutateMe} />
      <Separator />
      <LanguageSection me={me} mutateMe={mutateMe} />
      <Separator />
      <NotificationsSection />
      <Separator />
      <DangerZoneSection me={me} />
    </div>
  )
}
