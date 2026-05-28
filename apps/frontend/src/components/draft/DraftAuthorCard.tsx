'use client'

import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { Avatar, Button } from '@heroui/react'
import { useUserProfile } from '@/hooks/useUser'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { NextSessionContext } from '@/contexts/SessionContext'
import { errorToast, infoToast } from '@/actions/showToast'
import { BaseUser } from '@/lib/types'
import { useTranslations } from 'next-intl'

const DraftAuthorCard = ({ author }: { author: BaseUser }) => {
  const t = useTranslations('draftAuthorCard')
  const { session } = useContext(NextSessionContext)
  const { fetcher } = useAuthFetcher()
  const { profile, mutate } = useUserProfile(author.username ?? null)
  const [followLoading, setFollowLoading] = useState(false)

  const displayName =
    [author.firstname, author.lastname].filter(Boolean).join(' ') || author.username || '—'

  const handleFollowToggle = async () => {
    if (!profile?.id || !session?.user) return
    setFollowLoading(true)
    const wasFollowing = profile.isFollowing
    mutate(
      { ...profile, isFollowing: !wasFollowing, followers: (profile.followers ?? 0) + (wasFollowing ? -1 : 1) },
      false,
    )
    try {
      if (wasFollowing) {
        await fetcher('/api/relations/unfollow', {
          method: 'DELETE',
          body: { followerId: (session.user as any).id, followingId: profile.id },
        })
        infoToast(t('unfollowedToast'))
      } else {
        await fetcher('/api/relations/follow', {
          method: 'POST',
          body: { followerId: (session.user as any).id, followingId: profile.id },
        })
        infoToast(t('followedToast'))
      }
    } catch {
      mutate(
        { ...profile, isFollowing: wasFollowing, followers: (profile.followers ?? 0) + (wasFollowing ? 1 : -1) },
        false,
      )
      errorToast(t('followErrorToast'))
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border border-divider rounded-2xl">
      <div className="flex items-center gap-6 min-w-0">
        <Avatar color="accent" className="w-11 h-11 shrink-0">
          <Avatar.Image src={author.avatar ?? undefined} />
          <Avatar.Fallback>{displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          {author.username && (
            <Link
              href={`/app/users/${author.username}`}
              className="text-xs text-foreground-500 hover:text-foreground transition-colors truncate"
            >
              @{author.username}
            </Link>
          )}
          {profile && (
            <p className="text-xs text-foreground-400">
              {(profile.followers ?? 0).toLocaleString()} {t('followers')}
              {' · '}
              {(profile.publishedDrafts ?? 0).toLocaleString()} {t('drafts')}
            </p>
          )}
        </div>
      </div>

      {!profile?.isOwnProfile && profile && (
        <Button
          size="sm"
          variant={profile.isFollowing ? 'secondary' : 'primary'}
          isPending={followLoading}
          className="shrink-0"
          onClick={handleFollowToggle}
        >
          {profile.isFollowing ? t('unfollow') : t('follow')}
        </Button>
      )}
    </div>
  )
}

DraftAuthorCard.displayName = 'DraftAuthorCard'
export default DraftAuthorCard
