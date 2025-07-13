import React from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button } from "@heroui/react";

const ModalValidation = ({title, body, cancelText, validateText, validateLoading, isOpen, size, onOpenChange, onCancel, onValidate }: {
  title: string | undefined,
  body: string | undefined,
  cancelText: string | undefined,
  validateText: string | undefined,
  validateLoading: boolean,
  isOpen: boolean | undefined,
  size?: "2xl" | "xs" | "sm" | "md" | "lg" | "xl" | "3xl" | "4xl" | "5xl" | "full" | undefined,
  onOpenChange: () => void | undefined,
  onCancel: () => void,
  onValidate: () => void,
}) => {
  return (
    <Modal hideCloseButton scrollBehavior="inside" isOpen={isOpen} placement="center" size={size ?? "2xl"} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              {title}
            </ModalHeader>

            <ModalBody>
              <p className="text-foreground-500">
                {body}
              </p>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onCancel}>
                {cancelText || "Cancel"}
              </Button>

              <Button color="primary" isLoading={validateLoading} onPress={onValidate}>
                {validateText || "Continue"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

ModalValidation.displayName = 'ModalValidation'

export default ModalValidation