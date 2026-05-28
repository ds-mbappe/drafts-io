'use client'

import React, { useContext, useEffect, useState } from 'react'
import { Avatar, Modal, Separator, Button } from '@heroui/react'
import { NextSessionContext } from '@/contexts/SessionContext'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { getMyProfile } from '@/actions/user'
import { BaseUser } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { BookTextIcon, UsersIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <p className="text-base font-semibold">{value.toLocaleString()}</p>
    <p className="text-xs text-foreground-500">{label}</p>
  </div>
)

const ProfileModal = ({
  changeDialogOpenState,
  dialogOpen,
}: {
  changeDialogOpenState: (isOpen: boolean) => void
  dialogOpen: boolean
}) => {
  const { session } = useContext(NextSessionContext)
  const { token } = useAuthFetcher()
  const router = useRouter()
  const [profile, setProfile] = useState<BaseUser | null>(null)
  const t = useTranslations('profile')

  useEffect(() => {
    if (!dialogOpen || !token) return
    getMyProfile(token).then(setProfile)
  }, [dialogOpen, token])

  const displayName = [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || session?.user?.name || '—'

  return (
    <Modal isOpen={dialogOpen} onOpenChange={changeDialogOpenState}>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t('title')}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-5 pb-2">
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <Avatar color="accent" className="w-20 h-20 text-2xl">
                  <Avatar.Image src={profile?.avatar ?? session?.user?.image ?? undefined} />
                  <Avatar.Fallback>{displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-base">{displayName}</p>
                  {profile?.username && (
                    <p className="text-sm text-foreground-500">@{profile.username}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 px-2">
                <StatItem value={profile?.followers ?? 0} label={t('followers')} />
                <StatItem value={profile?.following ?? 0} label={t('following')} />
                <StatItem value={profile?.publishedDrafts ?? 0} label={t('drafts')} />
                <StatItem value={profile?.totalLikes ?? 0} label={t('likes')} />
              </div>

              <Separator />

              {/* Quick links */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 text-foreground-500"
                  onClick={() => {
                    changeDialogOpenState(false)
                    router.push(`/app/users/${profile?.username}`)
                  }}
                >
                  <UsersIcon size={15} />
                  {t('viewPublicProfile')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 text-foreground-500"
                  onClick={() => {
                    changeDialogOpenState(false)
                    router.push('/app/settings')
                  }}
                >
                  <BookTextIcon size={15} />
                  {t('editProfileSettings')}
                </Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

ProfileModal.displayName = 'ProfileModal'
export default ProfileModal
