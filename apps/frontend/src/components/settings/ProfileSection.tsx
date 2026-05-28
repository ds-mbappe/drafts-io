'use client'

import React, { useContext, useEffect, useRef, useState } from 'react'
import { Avatar, Button, Input } from '@heroui/react'
import { updateProfile, checkUsername } from '@/actions/settings'
import { errorToast, successToast } from '@/actions/showToast'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { useFileUpload } from '@/hooks/useFileUpload'
import { NextSessionContext } from '@/contexts/SessionContext'
import { useSession } from 'next-auth/react'
import { CameraIcon } from 'lucide-react'
import { BaseUser } from '@/lib/types'
import { KeyedMutator } from 'swr'
import { useTranslations } from 'next-intl'

export const ProfileSection = ({
  me,
  mutateMe,
}: {
  me: BaseUser | undefined
  mutateMe: KeyedMutator<BaseUser>
}) => {
  const { token } = useAuthFetcher()
  const { uploadFile } = useFileUpload()
  const { session, setSession } = useContext(NextSessionContext)
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const t = useTranslations('settings.profile')

  useEffect(() => {
    if (!me) return
    setFirstname(me.firstname ?? '')
    setLastname(me.lastname ?? '')
    setUsername(me.username ?? '')
  }, [me])

  useEffect(() => {
    const trimmed = username.trim()
    if (!trimmed || !token || trimmed === (me?.username ?? '')) {
      setUsernameAvailable(null)
      setUsernameChecking(false)
      return
    }
    setUsernameChecking(true)
    const timer = setTimeout(async () => {
      const { available } = await checkUsername(token, trimmed)
      setUsernameAvailable(available)
      setUsernameChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [username, token, me?.username])

  const handleSaveProfile = async () => {
    if (!token) return
    setProfileLoading(true)
    try {
      const { ok, data } = await updateProfile(token, { firstname, lastname, username })
      if (!ok) { errorToast((data as any)?.message ?? t('failedToUpdateProfile')); return }
      mutateMe({ ...me!, firstname, lastname, username }, false)
      const updated = await update({ ...session, user: { ...session?.user, firstname, lastname, username } })
      setSession(updated)
      successToast(t('profileUpdated'))
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setAvatarLoading(true)
    try {
      const { url } = await uploadFile(file, 'profile_pictures')
      const { ok: avatarOk, data: avatarData } = await updateProfile(token, { avatar: url })
      if (!avatarOk) { errorToast((avatarData as any)?.message ?? t('failedToUpdateAvatar')); return }
      mutateMe({ ...me!, avatar: url }, false)
      const updated = await update({ ...session, user: { ...session?.user, avatar: url } })
      setSession(updated)
      successToast(t('avatarUpdated'))
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  const profileDirty =
    firstname !== (me?.firstname ?? '') ||
    lastname !== (me?.lastname ?? '') ||
    username !== (me?.username ?? '')

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold">{t('title')}</h2>
        <p className="text-sm text-foreground-500 mt-0.5">{t('description')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar color="accent" size="lg" className="w-16 h-16">
            <Avatar.Image src={me?.avatar ?? undefined} />
            <Avatar.Fallback>{firstname?.charAt(0)?.toUpperCase()}</Avatar.Fallback>
          </Avatar>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
          >
            <CameraIcon size={16} className="text-white" />
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div>
          <p className="text-sm font-medium">
            {[firstname, lastname].filter(Boolean).join(' ') || 'No name set'}
          </p>
          <p className="text-xs text-foreground-500">@{me?.username}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium">{t('firstName')}</label>
          <Input variant="secondary" placeholder={t('firstName')} value={firstname} onChange={(e) => setFirstname(e.target.value)} className="data-[focused=true]:border-divider" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium">{t('lastName')}</label>
          <Input variant="secondary" placeholder={t('lastName')} value={lastname} onChange={(e) => setLastname(e.target.value)} className="data-[focused=true]:border-divider" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{t('username')}</label>
        <Input variant="secondary" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="data-[focused=true]:border-divider" />
        {usernameChecking && <p className="text-xs text-foreground-400 mt-0.5">{t('checkingAvailability')}</p>}
        {!usernameChecking && usernameAvailable === true && <p className="text-xs text-success mt-0.5">{t('usernameAvailable')}</p>}
        {!usernameChecking && usernameAvailable === false && <p className="text-xs text-danger mt-0.5">{t('usernameTaken')}</p>}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          isPending={profileLoading}
          isDisabled={!profileDirty || usernameAvailable === false || usernameChecking}
          onPress={handleSaveProfile}
        >
          {t('saveChanges')}
        </Button>
      </div>
    </section>
  )
}
