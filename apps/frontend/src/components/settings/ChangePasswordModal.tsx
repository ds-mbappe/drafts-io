'use client'

import React, { useState } from 'react'
import { Modal, Button, Input } from '@heroui/react'
import { confirmPasswordChange, requestPasswordChange } from '@/actions/settings'
import { errorToast, successToast } from '@/actions/showToast'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Step = 'form' | 'code'

export const ChangePasswordModal = ({
  isOpen,
  hasPassword,
  onClose,
}: {
  isOpen: boolean
  hasPassword: boolean
  onClose: () => void
}) => {
  const t = useTranslations('modals.changePassword')
  const { token } = useAuthFetcher()
  const [step, setStep] = useState<Step>('form')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClose = () => {
    setStep('form')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCode('')
    onClose()
  }

  const handleRequest = async () => {
    if (newPassword !== confirmPassword) {
      errorToast(t('passwordsDoNotMatch'))
      return
    }
    if (newPassword.length < 8) {
      errorToast(t('passwordTooShort'))
      return
    }
    setLoading(true)
    try {
      const { ok, data } = await requestPasswordChange(token!, {
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
        confirmPassword,
      })
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
      const { ok, data } = await confirmPasswordChange(token!, { code: code.trim(), newPassword })
      if (!ok) { errorToast((data as any)?.message ?? t('invalidCode')); return }
      successToast(t('passwordUpdated'))
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
                {step === 'form'
                  ? hasPassword ? t('title') : t('setTitle')
                  : t('verifyTitle')}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-4">
              {step === 'form' ? (
                <>
                  {!hasPassword && (
                    <p className="text-sm text-foreground-500">
                      {t('socialLoginDescription')}
                    </p>
                  )}

                  {hasPassword && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{t('currentPassword')}</label>
                      <div className="relative">
                        <Input
                          type={showCurrent ? 'text' : 'password'}
                          variant="secondary"
                          placeholder={t('currentPasswordPlaceholder')}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pr-10 data-[focused=true]:border-divider"
                        />
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          onPress={() => setShowCurrent((v) => !v)}
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                        >
                          {showCurrent ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">{t('newPassword')}</label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        variant="secondary"
                        placeholder={t('newPasswordPlaceholder')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10 data-[focused=true]:border-divider"
                      />
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowNew((v) => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                      >
                        {showNew ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">{t('confirmPassword')}</label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        variant="secondary"
                        placeholder={t('confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRequest() }}
                        className="pr-10 data-[focused=true]:border-divider"
                      />
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowConfirm((v) => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                      >
                        {showConfirm ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                      </Button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-danger mt-0.5">{t('passwordMismatch')}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground-500">
                    {t('codeSentDescription')}
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
                    onClick={() => setStep('form')}
                    className="w-fit text-xs text-foreground-400 hover:text-foreground text-left transition-colors cursor-pointer"
                  >
                    {t('goBack')}
                  </button>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" onPress={handleClose}>{t('cancel')}</Button>
              {step === 'form' ? (
                <Button
                  variant="primary"
                  isPending={loading}
                  onPress={handleRequest}
                  isDisabled={
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    (hasPassword && !currentPassword.trim())
                  }
                >
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
