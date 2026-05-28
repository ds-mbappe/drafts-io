import React from 'react';
import { Modal, Button } from "@heroui/react";

const ModalValidation = ({title, body, cancelText, validateText, validateLoading, isOpen, size, onOpenChange, onCancel, onValidate }: {
  title: string | undefined,
  body: string | undefined,
  cancelText: string | undefined,
  validateText: string | undefined,
  validateLoading: boolean,
  isOpen: boolean | undefined,
  size?: "xs" | "sm" | "md" | "lg" | "full" | undefined,
  onOpenChange: () => void | undefined,
  onCancel: () => void,
  onValidate: () => void,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={(v) => { if (!v) onOpenChange(); }}>
      <button aria-hidden="true" className="hidden" />
      <Modal.Backdrop>
        <Modal.Container size={size ?? "lg"} placement="center" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-foreground-500">
                {body}
              </p>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="danger-soft" onPress={onCancel}>
                {cancelText || "Cancel"}
              </Button>

              <Button variant="primary" isPending={validateLoading} onPress={onValidate}>
                {validateText || "Continue"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

ModalValidation.displayName = 'ModalValidation'

export default ModalValidation
