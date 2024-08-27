import React, { memo, useCallback, useEffect, useState } from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button, Tooltip } from "@nextui-org/react";
import { FileClock } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import ExtensionKit from '@/components/editor/extensions/extension-kit';
import { watchPreviewContent } from '@tiptap-pro/extension-collaboration-history';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

const HistoryDropdown = memo(({ historyData, provider }: { historyData: any, provider: TiptapCollabProvider }) => {
  const motionProps = {
    variants: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        }
      },
      enter: {
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        }
      },
    },
  }
  const [activeContent, setActiveContent] = useState<any>();
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const handleVersionChange = useCallback((newVersion: any) => {
    const updateVersions = () => {
      setCurrentVersionId(newVersion?.version)
  
      provider.sendStateless(JSON.stringify({
        action: 'version.preview',
        version: newVersion?.version,
      }))
    }

    updateVersions();
  }, [provider])

  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: '',
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full !pt-0 !pr-0 !pb-0 !pl-0 overflow-y-auto',
      },
    },
  });

  const renderDate = (date: string | number | Date) => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
  
    return `${day}-${month}-${year}, at ${hours}:${minutes}`
  }

  const setContent = (version: any) => {
    setActiveContent(version)
    handleVersionChange(version)
  }

  const selectVersionAndOpenModal = (version: any) => {
    setContent(version)
    onOpen()
  }

  useEffect(() => {
    const unbindContentWatcher = watchPreviewContent(provider, content => {
      if (editor) {
        editor.commands.setContent(content)
      }
    })

    return () => {
      unbindContentWatcher()
    }
  }, [provider, editor])

  if (!editor) return null

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size={"sm"} variant={"light"}>
            <Tooltip
              content={"History"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
              <FileClock />
            </Tooltip>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Menu history"
          className="w-[300px]"
          emptyContent={
            <p className="text-sm text-muted-foreground px-2 py-1.5">
              {`There are no previous versions of your document. Start editing to automatically create a version.`}
            </p>
          }
        >
          <DropdownSection title={"Version history"}>
            {
              historyData?.versions?.sort(function(a: any, b: any) {
                return b?.version - a?.version
              })?.slice(0, 20)?.map((version: any) =>
                <DropdownItem key={version.date} description={renderDate(version?.date)} onClick={() => selectVersionAndOpenModal(version)}>
                  {`Version ${version?.version}`}
                </DropdownItem>
              )
            }
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange} scrollBehavior="inside" size='xl' hideCloseButton>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              {`Preview of Version ${activeContent?.version}`}
            </ModalHeader>

            <ModalBody>
              <EditorContent editor={editor} />
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {`Close`}
              </Button>
              <Button color="primary" onPress={onClose}>
                {`Revert to this version`}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  )
});

HistoryDropdown.displayName = 'HistoryDropdown'

export default HistoryDropdown