'use client'

import { useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import useSWR from 'swr'
import { BaseUser } from '@/lib/types'
import messages from '@/messages'

const RTL_LOCALES = new Set(['ar'])

export function TranslationsProvider({ children }: { children: React.ReactNode }) {
  const { fetcher } = useAuthFetcher()
  const { data: me } = useSWR<BaseUser>('/api/settings/me', fetcher, { revalidateOnFocus: false })

  const locale = me?.language ?? 'en'
  const localeMessages = messages[locale] ?? messages['en']

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={localeMessages}>
      {children}
    </NextIntlClientProvider>
  )
}
