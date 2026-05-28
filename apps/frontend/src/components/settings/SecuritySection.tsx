'use client'

import React, { useContext, useState } from 'react'
import { Button } from '@heroui/react'
import { ChangeEmailModal } from './ChangeEmailModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { NextSessionContext } from '@/contexts/SessionContext'
import { BaseUser } from '@/lib/types'
import { KeyedMutator } from 'swr'
import { useTranslations } from 'next-intl'

export const SecuritySection = ({
  me,
  mutateMe,
}: {
  me: BaseUser | undefined
  mutateMe: KeyedMutator<BaseUser>
}) => {
  const { session, setSession } = useContext(NextSessionContext)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const t = useTranslations('settings.security')

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
        <p className="text-sm text-foreground-500 mt-0.5">{t('description')}</p>
      </div>

      <div className="flex items-center justify-between py-3 border-b border-divider">
        <div>
          <p className="text-sm font-medium">{t('email')}</p>
          <p className="text-xs text-foreground-500 mt-0.5">{me?.email ?? '—'}</p>
        </div>
        <Button variant="ghost" size="sm" onPress={() => setEmailModalOpen(true)}>
          {t('change')}
        </Button>
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium">{me?.hasPassword ? t('password') : t('setPassword')}</p>
          <p className="text-xs text-foreground-500 mt-0.5">
            {me?.hasPassword ? t('passwordLastUpdated') : t('socialLoginDescription')}
          </p>
        </div>
        <Button variant="ghost" size="sm" onPress={() => setPasswordModalOpen(true)}>
          {me?.hasPassword ? t('change') : t('setPasswordButton')}
        </Button>
      </div>

      {me && (
        <>
          <ChangeEmailModal
            isOpen={emailModalOpen}
            currentEmail={me.email!}
            onClose={() => setEmailModalOpen(false)}
            onSuccess={(newEmail) => {
              mutateMe({ ...me, email: newEmail }, false)
              setSession((prev: typeof session) => prev ? { ...prev, user: { ...prev.user, email: newEmail } } : prev)
            }}
          />
          <ChangePasswordModal
            isOpen={passwordModalOpen}
            hasPassword={me.hasPassword!}
            onClose={() => setPasswordModalOpen(false)}
          />
        </>
      )}
    </section>
  )
}
