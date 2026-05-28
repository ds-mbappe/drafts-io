'use client'

import React, { useState } from 'react'
import { Button } from '@heroui/react'
import { DeleteAccountModal } from './DeleteAccountModal'
import { BaseUser } from '@/lib/types'
import { useTranslations } from 'next-intl'

export const DangerZoneSection = ({ me }: { me: BaseUser | undefined }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const t = useTranslations('settings.dangerZone')

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-danger">{t('title')}</h2>
        <p className="text-sm text-foreground-500 mt-0.5">{t('description')}</p>
      </div>

      <div className="flex items-center justify-between py-3 border border-danger/20 px-4 rounded-lg">
        <div>
          <p className="text-sm font-medium">{t('deactivateOrDelete')}</p>
          <p className="text-xs text-foreground-500 mt-0.5">{t('deactivateOrDeleteDescription')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger border-danger/30 hover:bg-danger/10"
          onPress={() => setDeleteModalOpen(true)}
        >
          {t('manage')}
        </Button>
      </div>

      {me && (
        <DeleteAccountModal
          isOpen={deleteModalOpen}
          hasPassword={me.hasPassword!}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </section>
  )
}
