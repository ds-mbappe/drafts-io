'use client'

import { useEffect, useState } from 'react'
import type { Key } from '@heroui/react'
import {
  Autocomplete,
  EmptyState,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from '@heroui/react'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { useTranslations } from 'next-intl'

interface Props {
  value: string[]
  onChange: (topics: string[]) => void
  isOpen: boolean
}

export function DraftTopicsField({ value, onChange, isOpen }: Props) {
  const t = useTranslations('newDraftModal')
  const { fetcher } = useAuthFetcher()
  const { contains } = useFilter({ sensitivity: 'base' })

  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [newTopicInput, setNewTopicInput] = useState('')

  useEffect(() => {
    if (!isOpen) return
    fetcher('/api/drafts/topics')
      .then((data: { name: string; count: number }[]) =>
        setAvailableTopics(data.map((d) => d.name))
      )
      .catch(() => {})
  }, [isOpen])

  const showCreateOption =
    newTopicInput.trim().length > 0 &&
    !availableTopics.some((t) => t.toLowerCase() === newTopicInput.trim().toLowerCase()) &&
    !value.includes(newTopicInput.trim())

  const handleChange = (keys: Set<Key>) => {
    const keyArray = [...keys].map(String)
    const createKey = keyArray.find((k) => k.startsWith('__new:'))

    if (createKey) {
      const topicName = newTopicInput.trim()
      if (!topicName) return
      const realKeys = keyArray.filter((k) => !k.startsWith('__new:'))
      setAvailableTopics((prev) =>
        prev.includes(topicName) ? prev : [...prev, topicName].sort()
      )
      onChange([...realKeys, topicName])
      setNewTopicInput('')
    } else {
      onChange(keyArray)
    }
  }

  const onRemoveTag = (keys: Set<Key>) => {
    onChange(value.filter((t) => !keys.has(t)))
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{t('topicsLabel')}</label>
      <Autocomplete
        selectionMode="multiple"
        shouldCloseOnSelect={false}
        allowsEmptyCollection
        value={value}
        onChange={(keys) => handleChange(new Set(keys as Key[]))}
        onClear={() => onChange([])}
        variant="secondary"
      >
        <Autocomplete.Trigger>
          <Autocomplete.Value>
            {({ isPlaceholder, state: selectState }: any) => {
              if (isPlaceholder || selectState.selectedItems.length === 0) {
                return (
                  <span className="text-foreground-400 text-sm">
                    {t('topicsPlaceholder')}
                  </span>
                )
              }
              return (
                <TagGroup size="sm" onRemove={onRemoveTag}>
                  <TagGroup.List>
                    {selectState.selectedItems.map((item: any) => (
                      <Tag key={String(item.key)} id={String(item.key)}>
                        {item.textValue || String(item.key)}
                      </Tag>
                    ))}
                  </TagGroup.List>
                </TagGroup>
              )
            }}
          </Autocomplete.Value>
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>

        <Autocomplete.Popover>
          <Autocomplete.Filter
            filter={contains}
            inputValue={newTopicInput}
            onInputChange={setNewTopicInput}
          >
            <SearchField autoFocus={false} variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={t('topicsSearchPlaceholder')} />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <ListBox
              selectionMode="multiple"
              items={[
                ...availableTopics.map((topic) => ({ id: topic, label: topic, isCreate: false })),
                ...(showCreateOption
                  ? [{ id: `__new:${newTopicInput}`, label: t('createTopic', { topic: newTopicInput.trim() }), isCreate: true }]
                  : []),
              ]}
            >
              {(item) => (
                <ListBox.Item
                  key={item.id}
                  id={item.id}
                  textValue={item.label}
                  className={item.isCreate ? 'text-accent' : ''}
                >
                  {item.label}
                  {!item.isCreate && <ListBox.ItemIndicator />}
                </ListBox.Item>
              )}
            </ListBox>

            {!showCreateOption && availableTopics.length === 0 && (
              <EmptyState>{t('noTopicsYet')}</EmptyState>
            )}
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </div>
  )
}