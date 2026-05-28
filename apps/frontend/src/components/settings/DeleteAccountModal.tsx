'use client'

import React, { useState } from 'react'
import { Modal, Button, Input, Card } from '@heroui/react'
import { deleteAccount } from '@/actions/settings'
import { errorToast } from '@/actions/showToast'
import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { signOut } from 'next-auth/react'
import { EyeIcon, EyeOffIcon, TriangleAlertIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

type AccountAction = 'deactivate' | 'delete'
type Step = 'choose' | 'confirm'

export const DeleteAccountModal = ({
  isOpen,
  hasPassword,
  onClose,
}: {
  isOpen: boolean
  hasPassword: boolean
  onClose: () => void
}) => {
  const t = useTranslations('modals.deleteAccount')
  const { token } = useAuthFetcher()
  const [step, setStep] = useState<Step>('choose')
  const [action, setAction] = useState<AccountAction>('deactivate')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setStep('choose')
    setAction('deactivate')
    setPassword('')
    setShowPassword(false)
    onClose()
  }

  const handleChoose = (chosen: AccountAction) => {
    setAction(chosen)
    setStep('confirm')
  }

  const handleGoBack = () => {
    setPassword('')
    setShowPassword(false)
    setStep('choose')
  }

  const handleConfirm = async () => {
    if (hasPassword && !password.trim()) {
      errorToast(t('enterPasswordError'))
      return
    }
    setLoading(true)
    try {
      const { ok, data } = await deleteAccount(token!, {
        password: hasPassword ? password : undefined,
        type: action,
      })
      if (!ok) { errorToast((data as any)?.message ?? 'Something went wrong.'); return }
      await signOut({ callbackUrl: '/account/sign-in' })
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
                {step === 'choose' ? t('chooseTitle') : action === 'deactivate' ? t('deactivateTitle') : t('deleteTitle')}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-4">
              {step === 'choose' ? (
                <>
                  <p className="text-sm text-foreground-500">
                    {t('chooseDescription')}
                  </p>

                  <Card onClick={() => handleChoose('deactivate')} className="w-full text-left p-4 border border-divider shadow-none cursor-pointer">
                    <p className="font-medium text-sm">{t('deactivateLabel')}</p>
                    <p className="text-xs text-foreground-500 mt-0.5">
                      {t('deactivateCardDescription')}
                    </p>
                  </Card>

                  <Card onClick={() => handleChoose('delete')} className="w-full text-left p-4 border border-danger/40 shadow-none cursor-pointer">
                    <p className="font-medium text-sm text-danger">{t('deletePermanently')}</p>
                    <p className="text-xs text-foreground-500 mt-0.5">
                      {t('deleteCardDescription')}
                    </p>
                  </Card>
                </>
              ) : (
                <>
                  {action === 'delete' && (
                    <div className="flex items-start gap-2 p-3 rounded-medium bg-danger/10 border border-danger/20 rounded-lg">
                      <TriangleAlertIcon size={15} className="text-danger mt-0.5 shrink-0" />
                      <p className="text-xs text-danger">
                        {t('deleteWarning')}
                      </p>
                    </div>
                  )}

                  {action === 'deactivate' && (
                    <p className="text-sm text-foreground-500">
                      {t('deactivateConfirmation')}
                    </p>
                  )}

                  {hasPassword && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">
                        {t('confirmWithPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          variant="secondary"
                          placeholder={t('enterPassword')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
                          className="pr-10 data-[focused=true]:border-divider"
                        />
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          onPress={() => setShowPassword((v) => !v)}
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-xs text-foreground-400 hover:text-foreground text-left transition-colors"
                  >
                    {t('goBack')}
                  </button>
                </>
              )}
            </Modal.Body>

            {step === 'confirm' && (
              <Modal.Footer>
                <Button variant="ghost" onPress={handleClose}>{t('cancel')}</Button>
                <Button
                  variant="primary"
                  isPending={loading}
                  onPress={handleConfirm}
                  isDisabled={hasPassword && !password.trim()}
                  className={action === 'delete' ? 'bg-danger text-white hover:bg-danger/90' : ''}
                >
                  {action === 'deactivate' ? t('deactivateButton') : t('deleteButton')}
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
