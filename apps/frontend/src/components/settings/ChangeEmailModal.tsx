'use client'

import React, { useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { confirmEmailChange, requestEmailChange } from '@/actions/settings'
import { errorToast, successToast } from '@/actions/showToast'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { useTranslations } from 'next-intl'

type Step = 'email' | 'code'

export const ChangeEmailModal = ({
  isOpen,
  currentEmail,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  currentEmail: string
  onClose: () => void
  onSuccess: (newEmail: string) => void
}) => {
  const t = useTranslations('modals.changeEmail')
  const { token } = useAuthFetcher()
  const [step, setStep] = useState<Step>('email')
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(true)

  const handleClose = () => {
    setStep('email')
    setNewEmail('')
    setCode('')
    onClose()
  }

  const handleRequestChange = async () => {
    if (!newEmail.trim()) return
    if (newEmail === currentEmail) {
      errorToast(t('emailMustBeDifferent'))
      return
    }
    setLoading(true)
    try {
      const { ok, data } = await requestEmailChange(token!, newEmail.trim())
      if (!ok) { errorToast((data as any)?.message ?? 'Something went wrong.'); return }
      successToast(t('codeSent'))
      setStep('code')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (code.length < 6) return
    setLoading(true)
    try {
      const { ok, data } = await confirmEmailChange(token!, code.trim())
      if (!ok) { errorToast((data as any)?.message ?? t('invalidCode')); return }
      successToast(t('emailUpdated'))
      onSuccess(newEmail.trim())
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {step === 'email' ? t('title') : t('verifyTitle')}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-4">
              {step === 'email' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-foreground-500">{t('currentEmail')}</label>
                    <p className="text-sm font-medium">{currentEmail}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">{t('newEmail')}</label>
                    <Input
                      type="email"
                      variant="secondary"
                      placeholder={t('newEmailPlaceholder')}
                      value={newEmail}
                      onChange={(e) => { setNewEmail(e.target.value); setEmailValid(e.target.checkValidity()) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRequestChange() }}
                      className="data-[focused=true]:border-divider"
                    />
                    {newEmail && !emailValid && (
                      <p className="text-xs text-danger mt-0.5">{t('invalidEmail')}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground-500">
                    {t('codeSentTo', { email: newEmail })}
                  </p>
                  <Input
                    variant="secondary"
                    placeholder={t('codePlaceholder')}
                    value={code}
                    maxLength={6}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
                    className="text-center tracking-widest text-lg font-mono data-[focused=true]:border-divider"
                  />
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-fit text-xs text-foreground-400 hover:text-foreground text-left transition-colors cursor-pointer"
                  >
                    {t('wrongEmail')}
                  </button>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" onPress={handleClose}>{t('cancel')}</Button>
              {step === 'email' ? (
                <Button variant="primary" isPending={loading} onPress={handleRequestChange} isDisabled={!newEmail.trim() || !emailValid}>
                  {t('sendCode')}
                </Button>
              ) : (
                <Button variant="primary" isPending={loading} onPress={handleConfirm} isDisabled={code.length < 6}>
                  {t('confirmChange')}
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
