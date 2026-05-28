import { Modal, Separator, Input, Tabs, Button } from '@heroui/react'
import { SearchIcon, InfoIcon, XIcon } from 'lucide-react'
import { InfiniteScrollTrigger } from '../feed/InfiniteScrollTrigger'
import React, { useContext, useEffect, useState } from 'react'
import DraftItemInList from '../ui/DraftItemInList'
import UserItemInList from '../ui/UserItemInList'
import { search } from '@/actions/globalSearch'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/navigation'
import { NextSessionContext } from '@/contexts/SessionContext'
import { BaseUser, DraftProps } from '@/lib/types'
import { useTranslations } from 'next-intl'

type Tab = 'people' | 'drafts'
const SKELETON_COUNT = 4

const ModalSearch = ({
  isOpenSearch,
  onOpenChangeSearch,
}: {
  isOpenSearch: boolean
  onOpenChangeSearch: () => void
}) => {
  const [isTyping, setIsTyping] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isUsername, setIsUsername] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('people')

  const [users, setUsers] = useState<BaseUser[]>([])
  const [drafts, setDrafts] = useState<DraftProps[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [draftsTotal, setDraftsTotal] = useState(0)
  const [hasMoreUsers, setHasMoreUsers] = useState(false)
  const [hasMoreDrafts, setHasMoreDrafts] = useState(false)
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false)
  const [isLoadingMoreDrafts, setIsLoadingMoreDrafts] = useState(false)

  const router = useRouter()
  const { session } = useContext(NextSessionContext)
  const token = session?.accessToken
  const t = useTranslations('search')

  const resetResults = () => {
    setUsers([])
    setDrafts([])
    setUsersTotal(0)
    setDraftsTotal(0)
    setHasMoreUsers(false)
    setHasMoreDrafts(false)
  }

  const updateSearch = (value: string) => {
    setIsTyping(true)
    setSearchText(value)
    searchFunction(value)
  }

  const clearSearch = () => {
    setSearchText('')
    setIsTyping(false)
    resetResults()
  }

  const closeModalAndClearResults = () => {
    setSearchText('')
    setActiveTab('people')
    resetResults()
    onOpenChangeSearch()
  }

  const goToSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') router.push(`/app/search?query=${searchText}`)
  }

  const searchFunction = useDebouncedCallback(async (value: string) => {
    if (!value.trim()) { resetResults(); setIsTyping(false); return; }
    const res = await search(value, token)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users ?? [])
      setDrafts(data.drafts ?? [])
      setUsersTotal(data.usersTotal ?? data.users?.length ?? 0)
      setDraftsTotal(data.draftsTotal ?? data.drafts?.length ?? 0)
      setHasMoreUsers(data.hasMoreUsers ?? false)
      setHasMoreDrafts(data.hasMoreDrafts ?? false)
    }
    setIsTyping(false)
  }, 300)

  const loadMoreUsers = async () => {
    if (!searchText.trim() || isLoadingMoreUsers) return
    setIsLoadingMoreUsers(true)
    const res = await search(searchText, token, 'users', users.length)
    if (res.ok) {
      const data = await res.json()
      setUsers(prev => [...prev, ...(data.users ?? [])])
      setHasMoreUsers(data.hasMoreUsers ?? false)
    }
    setIsLoadingMoreUsers(false)
  }

  const loadMoreDrafts = async () => {
    if (!searchText.trim() || isLoadingMoreDrafts) return
    setIsLoadingMoreDrafts(true)
    const res = await search(searchText, token, 'drafts', drafts.length)
    if (res.ok) {
      const data = await res.json()
      setDrafts(prev => [...prev, ...(data.drafts ?? [])])
      setHasMoreDrafts(data.hasMoreDrafts ?? false)
    }
    setIsLoadingMoreDrafts(false)
  }

  useEffect(() => { setIsUsername(searchText.startsWith('@')) }, [searchText])

  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChangeSearch()
      }
    }
    window.addEventListener('keydown', handleKeyEvent)
    return () => window.removeEventListener('keydown', handleKeyEvent)
  })

  const renderResults = () => {
    if (!searchText) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
          <InfoIcon size={36} className="text-foreground-500" />
          <p className="font-medium">{t('title')}</p>
          <div className="flex flex-col items-center">
            <p className="text-foreground-500 text-sm text-center">{t('startTyping')}</p>
            <p className="text-foreground-500 text-sm text-center">{t('searchHint')}</p>
          </div>
        </div>
      )
    }

    return (
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as Tab)}
        className="flex flex-col flex-1"
      >
        <Tabs.ListContainer>
          <Tabs.List>
            <Tabs.Tab id="people">
              {t('people')}{usersTotal > 0 ? ` (${usersTotal})` : ''}
            </Tabs.Tab>
            <Tabs.Tab id="drafts">
              {t('drafts')}{draftsTotal > 0 ? ` (${draftsTotal})` : ''}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="people" className="flex flex-col gap-1 px-1 pt-2 overflow-y-auto">
          {isTyping
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <UserItemInList key={i} avatar="" username="" firstname="" lastname="" loading />
              ))
            : users.length > 0
              ? <>
                  {users.map((u, i) => (
                    <UserItemInList
                      key={i}
                      loading={false}
                      avatar={u.avatar ?? undefined}
                      username={u.username ?? undefined}
                      firstname={u.firstname ?? undefined}
                      lastname={u.lastname ?? undefined}
                    />
                  ))}
                  <InfiniteScrollTrigger onIntersect={loadMoreUsers} hasMore={hasMoreUsers} isLoading={isLoadingMoreUsers} />
                </>
              : <p className="px-3 py-4 text-sm text-foreground-500">{t('noPeopleFound')}</p>
          }
        </Tabs.Panel>

        <Tabs.Panel id="drafts" className="flex flex-col gap-1 px-1 pt-2 overflow-y-auto">
          {isTyping
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <UserItemInList key={i} avatar="" username="" firstname="" lastname="" loading />
              ))
            : drafts.length > 0
              ? <>
                  {drafts.map((d, i) => (
                    <DraftItemInList
                      key={i}
                      cover={d.cover}
                      loading={false}
                      id={d.id}
                      title={d.title}
                      updatedAt={d.updatedAt}
                      onCloseModal={closeModalAndClearResults}
                    />
                  ))}
                  <InfiniteScrollTrigger onIntersect={loadMoreDrafts} hasMore={hasMoreDrafts} isLoading={isLoadingMoreDrafts} />
                </>
              : <p className="px-3 py-4 text-sm text-foreground-500">{t('noDraftsFound')}</p>
          }
        </Tabs.Panel>
      </Tabs>
    )
  }

  return (
    <Modal
      isOpen={isOpenSearch}
      onOpenChange={(v) => { if (!v) closeModalAndClearResults() }}
    >
      <button aria-hidden="true" className="hidden" />
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon className="text-foreground-400" size={16} />
                </span>
                <Input
                  value={searchText}
                  autoFocus
                  className={`pl-9 w-full${searchText ? ' pr-8' : ''}${isUsername ? ' text-primary' : ''}`}
                  variant="secondary"
                  placeholder={t('placeholder')}
                  onKeyUp={goToSearch}
                  onChange={(e) => updateSearch(e.target.value)}
                />
                {searchText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <XIcon size={14} />
                  </Button>
                )}
              </div>
              <Separator />
            </Modal.Header>

            <Modal.Body className="flex flex-col px-0 pt-0 gap-0 min-h-[300px]">
              {renderResults()}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

export default ModalSearch
