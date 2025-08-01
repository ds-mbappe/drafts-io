import { Modal, ModalBody, ModalContent, ModalHeader, Image, ModalFooter, Button } from "@heroui/react"
import { Editor, EditorContent } from '@tiptap/react'
import React from 'react'

const ModalPreviewDraft = ({ doc, isOpen, previewEditor, onOpenChange }: {
  doc: any,
  isOpen: boolean | undefined,
  previewEditor: Editor | null,
  onOpenChange: () => void | undefined,
}) => {
  return (
    <Modal hideCloseButton scrollBehavior="inside" isOpen={isOpen} placement="center" size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClosePreviewDoc) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {"Preview of "} {doc?.title}
            </ModalHeader>

            <ModalBody className="w-full flex flex-col gap-8 px-4! py-0! overflow-y-auto">
              {doc?.cover &&
                <div className="w-full mx-auto flex justify-center pt-8">                    
                  <Image
                    isBlurred
                    height={350}
                    src={doc?.cover}
                    alt="Story Cover Image"
                  />
                </div>
              }

              <EditorContent editor={previewEditor} />
            </ModalBody>

            <ModalFooter>
              <Button color="default" variant="light" onPress={onClosePreviewDoc}>
                {'Close'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

ModalPreviewDraft.displayName = 'ModalPreviewDraft'

export default ModalPreviewDraft