import { api, clearTokens, getRefreshToken, setTokens } from '../utils/api'
import type { AuthResponse, UserProfile } from '../types/api.types'

export async function registerUser(payload: {
  full_name: string
  email: string
  password: string
  phone?: string
}): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>('/auth/register', payload)
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function loginUser(
  identifier: string,
  password: string,
): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>('/auth/login', { identifier, password })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try { await api.post('/auth/logout', { refresh_token: refreshToken }) } catch { /* best-effort */ }
  }
  clearTokens()
}

export async function getMe(): Promise<UserProfile> {
  return api.get<UserProfile>('/auth/me')
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, new_password: newPassword })
}
