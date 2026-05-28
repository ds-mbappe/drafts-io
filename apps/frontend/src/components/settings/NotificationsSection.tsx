'use client'

import { useCallback, useEffect, useState } from 'react'
import { Switch } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/hooks/useNotifications'
import { successToast, errorToast } from '@/actions/showToast'
import type { NotificationPreferences } from '@/lib/types'

export const NotificationsSection = () => {
  const t = useTranslations('notifications')
  const { getPreferences, updatePreferences } = useNotifications()
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPreferences().then(setPrefs).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!prefs) return
      const updated = { ...prefs, [key]: value }
      setPrefs(updated)
      setSaving(true)
      try {
        await updatePreferences({ [key]: value })
        successToast(t('preferencesSaved'))
      } catch {
        setPrefs(prefs)
        errorToast('Something went wrong.')
      } finally {
        setSaving(false)
      }
    },
    [prefs, updatePreferences, t],
  )

  const rows: { key: keyof NotificationPreferences; label: string; description: string }[] = [
    { key: 'notifyOnFollow',  label: t('notifyOnFollow'),  description: t('notifyOnFollowDescription') },
    { key: 'notifyOnLike',    label: t('notifyOnLike'),    description: t('notifyOnLikeDescription') },
    { key: 'notifyOnComment', label: t('notifyOnComment'), description: t('notifyOnCommentDescription') },
  ]

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('preferencesTitle')}</h2>
        <p className="text-sm text-foreground-500 mt-0.5">{t('preferencesDescription')}</p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-foreground-500 mt-0.5">{description}</p>
            </div>
            <Switch
              isSelected={prefs?.[key] ?? true}
              isDisabled={!prefs || saving}
              onChange={(checked: boolean) => handleChange(key, checked)}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>
    </section>
  )
}
