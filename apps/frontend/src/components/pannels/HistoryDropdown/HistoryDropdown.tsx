import React, { memo, useCallback, useEffect, useState } from 'react'
import { Dropdown, Button, Tooltip, Modal } from "@heroui/react";
import { FileClock } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import ExtensionKit from '@/components/editor/extensions/extension-kit';

const HistoryDropdown = memo(({ historyData, provider }: { historyData: any, provider: any }) => {
  const [activeContent, setActiveContent] = useState<any>();
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onOpenChange = () => setIsOpen(v => !v);

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
        class: 'min-h-full pt-0! pr-0! pb-0! pl-0! overflow-y-auto',
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

  if (!editor) return null

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Button isIconOnly size={"sm"} variant={"ghost"} aria-label="History">
            <FileClock />
          </Button>
        </Dropdown.Trigger>

        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label="Menu history"
            className="w-[300px]"
          >
            <Dropdown.Section>
              {/* Version history */}
              {
                historyData?.versions?.sort(function(a: any, b: any) {
                  return b?.version - a?.version
                })?.slice(0, 20)?.map((version: any) =>
                  <Dropdown.Item
                    key={version.date}
                    id={String(version.date)}
                    textValue={`Version ${version?.version}`}
                    onAction={() => selectVersionAndOpenModal(version)}
                  >
                    <span>{`Version ${version?.version}`}</span>
                    <span className="text-xs text-foreground-500">{renderDate(version?.date)}</span>
                  </Dropdown.Item>
                )
              }
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
        <button aria-hidden="true" className="hidden" />
        <Modal.Backdrop>
          <Modal.Container size="lg" placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{`Preview of Version ${activeContent?.version}`}</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <EditorContent editor={editor} />
              </Modal.Body>

              <Modal.Footer>
                <Button variant="danger-soft" onPress={onClose}>
                  {`Close`}
                </Button>
                <Button variant="primary" onPress={onClose}>
                  {`Revert to this version`}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
});

HistoryDropdown.displayName = 'HistoryDropdown'

export default HistoryDropdown
