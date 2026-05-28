'use server'

import { backendUrl } from '@/lib/backend'

type ActionResult = { ok: boolean; data: unknown }

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

const toResult = async (res: Response): Promise<ActionResult> => {
  const data = await res.json()
  return { ok: res.ok, data }
}

export const checkUsername = async (token: string, username: string): Promise<{ available: boolean }> => {
  const res = await fetch(backendUrl(`/api/settings/username/check?username=${encodeURIComponent(username)}`), {
    headers: headers(token),
  })
  const data = await res.json()
  return data as { available: boolean }
}

export const getMe = async (token: string): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/me'), { headers: headers(token) }))

export const updateProfile = async (
  token: string,
  body: { firstname?: string; lastname?: string; username?: string; avatar?: string; language?: string },
): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/profile'), {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(body),
  }))

export const requestEmailChange = async (token: string, newEmail: string): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/email/request'), {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ newEmail }),
  }))

export const confirmEmailChange = async (token: string, code: string): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/email/confirm'), {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ code }),
  }))

export const requestPasswordChange = async (
  token: string,
  body: { currentPassword?: string; newPassword: string; confirmPassword: string },
): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/password/request'), {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  }))

export const confirmPasswordChange = async (
  token: string,
  body: { code: string; newPassword: string },
): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/password/confirm'), {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  }))

export const deleteAccount = async (
  token: string,
  body: { password?: string; type: 'deactivate' | 'delete' },
): Promise<ActionResult> =>
  toResult(await fetch(backendUrl('/api/settings/account'), {
    method: 'DELETE',
    headers: headers(token),
    body: JSON.stringify(body),
  }))
