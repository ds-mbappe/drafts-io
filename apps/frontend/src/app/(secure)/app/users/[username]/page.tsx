'use client'

import React, { useContext, useState } from 'react'
import { useParams } from 'next/navigation'
import { Avatar, Button, Separator } from '@heroui/react'
import { useUserProfile, useInfiniteUserDrafts } from '@/hooks/useUser'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { DraftProps } from '@/lib/types'
import FeedCards from '@/components/feed/FeedCards'
import { InfiniteScrollTrigger } from '@/components/feed/InfiniteScrollTrigger'
import { NextSessionContext } from '@/contexts/SessionContext'
import { errorToast, infoToast } from '@/actions/showToast'

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <p className="text-base font-semibold">{value.toLocaleString()}</p>
    <p className="text-xs text-foreground-500">{label}</p>
  </div>
)

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { session } = useContext(NextSessionContext)
  const { fetcher } = useAuthFetcher()

  const { profile, mutate: mutateProfile } = useUserProfile(username)
  const { items: drafts, hasMore, loadMore, isLoading: draftsLoading, isValidating, mutate: mutateDrafts } = useInfiniteUserDrafts(username)

  const [followLoading, setFollowLoading] = useState(false)

  const displayName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || username

  const handleFollowToggle = async () => {
    if (!profile?.id || !session?.user) return
    setFollowLoading(true)
    const wasFollowing = profile.isFollowing
    mutateProfile(
      { ...profile, isFollowing: !wasFollowing, followers: (profile.followers ?? 0) + (wasFollowing ? -1 : 1) },
      false,
    )
    try {
      if (wasFollowing) {
        await fetcher('/api/relations/unfollow', {
          method: 'DELETE',
          body: { followerId: (session.user as any).id, followingId: profile.id },
        })
        infoToast('Unfollowed successfully.')
      } else {
        await fetcher('/api/relations/follow', {
          method: 'POST',
          body: { followerId: (session.user as any).id, followingId: profile.id },
        })
        infoToast('Following!')
      }
    } catch {
      mutateProfile(
        { ...profile, isFollowing: wasFollowing, followers: (profile.followers ?? 0) + (wasFollowing ? 1 : -1) },
        false,
      )
      errorToast('Could not update follow status.')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleLikeToggled = (draftId: string) => {
    mutateDrafts(
      (pages) =>
        pages?.map((page) => ({
          ...page,
          items: (page.items ?? []).map((d: DraftProps) =>
            d.id === draftId ? { ...d, hasLiked: !d.hasLiked } : d,
          ),
        })),
      false,
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <Avatar color="accent" className="w-24 h-24 text-3xl">
          <Avatar.Image src={profile?.avatar ?? undefined} />
          <Avatar.Fallback>{displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>

        <div className="text-center">
          <p className="font-semibold text-xl">{displayName}</p>
          {profile?.username && (
            <p className="text-sm text-foreground-500">@{profile.username}</p>
          )}
        </div>

        {!profile?.isOwnProfile && profile && (
          <Button
            size="sm"
            variant={profile.isFollowing ? 'secondary' : 'primary'}
            isPending={followLoading}
            onClick={handleFollowToggle}
          >
            {profile.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-2">
        <StatItem value={profile?.followers ?? 0} label="Followers" />
        <StatItem value={profile?.following ?? 0} label="Following" />
        <StatItem value={profile?.publishedDrafts ?? 0} label="Drafts" />
        <StatItem value={profile?.totalLikes ?? 0} label="Likes" />
      </div>

      <Separator />

      {/* Drafts */}
      <div className="flex flex-col gap-4">
        <p className="text-base font-semibold">Published drafts</p>
        <FeedCards
          drafts={draftsLoading && drafts.length === 0 ? undefined : drafts}
          emptyStateTitle="No published drafts yet."
          likeToggled={handleLikeToggled}
        />
        <InfiniteScrollTrigger
          hasMore={hasMore}
          isLoading={isValidating}
          onIntersect={loadMore}
        />
      </div>
    </div>
  )
}
