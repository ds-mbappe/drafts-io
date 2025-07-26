import { Modal, ModalContent, ModalHeader, Divider, ModalBody, useDisclosure, Input } from '@heroui/react'
import { SearchIcon, InfoIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import DocumentItemInList from '../ui/DocumentItemInList'
import UserItemInList from '../ui/UserItemInList'
import { search } from '@/actions/globalSearch'
import { useDebouncedCallback } from 'use-debounce'

const ModalSearch = ({
  isOpenSearch,
  onOpenChangeSearch
}: {
  isOpenSearch: boolean,
  onOpenChangeSearch: () => void
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isUsername, setIsUsername] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({});

  const updateSearch = (value: string) => {
    setIsTyping(true)
    setSearchText(value)
    searchFunction(value)
  }

  const closeModalAndClearResults = () => {
    setSearchText("")
    setSearchResults({})
    onOpenChangeSearch()
  }

  const searchFunction = useDebouncedCallback(async (value: string) => {
    if (value) {
      const res = await search(value)

      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } else {
      setSearchResults({})
    }
    setIsTyping(false)
  }, 300)

  useEffect(() => {
    if (searchText.startsWith('@')) {
      if (!isUsername) {
        setIsUsername(true)
      }
    } else {
      setIsUsername(false)
    }
  }, [searchText]);

  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChangeSearch()
      }
    }

    window.addEventListener('keydown', handleKeyEvent)

    return () => {
      window.removeEventListener('keydown', handleKeyEvent)
    }
  })
  
  return (
    <Modal
      size="xl"
      hideCloseButton
      placement="center"
      isOpen={isOpenSearch}
      scrollBehavior="inside"
      onOpenChange={onOpenChangeSearch}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-3 p-3">
          <Input
            value={searchText}
            autoFocus={true}
            startContent={<SearchIcon />}
            classNames={{
              input: isUsername ? '!text-primary' : '',
            }}
            placeholder="Search"
            variant="flat"
            isClearable
            className="!bg-transparent"
            onValueChange={updateSearch}
          />

          <Divider></Divider>
        </ModalHeader>

        <ModalBody className="flex flex-col px-0 pt-0 gap-0">
          <div className="flex flex-col h-[300px] gap-4">
            {
              isTyping ?
                <div className="flex flex-col gap-4 px-3">
                  {
                    Array.from({ length: 10 }).map((_, index) =>
                      <UserItemInList
                        key={index}
                        avatar={""}
                        username={""}
                        firstname={""}
                        lastname={""}
                        loading={true}
                      />
                    )
                  }
                </div>
              :
              searchText ?
                <>
                  <div className="flex flex-col flex-1 gap-1.5">
                    <p className="text-foreground-500 text-xs px-3">{"People"}</p>

                    <div className={`flex h-full flex-col ${isTyping ? 'gap-4' : 'gap-1'}`}>
                      {
                        searchResults?.users?.length ?
                          searchResults?.users?.map((result: any, index: number) =>
                            <UserItemInList
                              key={index}
                              avatar={result?.avatar}
                              username={result?.username}
                              firstname={result?.firstname}
                              lastname={result?.lastname}
                              loading={false}
                            />
                          )
                        :
                        <p className="px-3">No results</p>
                      }
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 gap-1.5">
                    <p className="text-foreground-500 text-xs px-3">{"Documents"}</p>

                    <div className={`flex h-full flex-col ${isTyping ? 'gap-4' : 'gap-1'}`}>
                      {
                        searchResults?.documents?.length ?
                          searchResults?.documents?.map((result: any, index: number) =>
                            <DocumentItemInList
                              key={index}
                              loading={false}
                              id={result?.id}
                              title={result?.title}
                              updatedAt={result?.updatedAt}
                              onCloseModal={closeModalAndClearResults}
                            />
                          )
                        :
                        <p className="px-3">No results</p>
                      }
                    </div>
                  </div>
                </>
              :
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
                <InfoIcon size={36} className="text-foreground-500" />

                <p className="font-medium">{"Search"}</p>

                <div className="flex flex-col items-center">
                  <p className="text-foreground-500 text-sm">{"Start typing something to see the results."}</p>
                  <p className="text-foreground-500 text-sm text-center">{"You can search for a document, a user or a username by typing '@username'."}</p>
                </div>
              </div>
            }
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ModalSearch