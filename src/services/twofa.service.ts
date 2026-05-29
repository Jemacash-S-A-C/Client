import { api } from '../utils/api'

export interface TwoFaStatus {
  totp_enabled: boolean
  email_2fa_enabled: boolean
  email_2fa_address: string | null
}

export interface TotpSetupResponse {
  qrDataUrl: string
  secret: string
}

export function getTwoFaStatus(): Promise<TwoFaStatus> {
  return api.get<TwoFaStatus>('/auth/2fa/status')
}

// TOTP
export function totpSetup(): Promise<TotpSetupResponse> {
  return api.post<TotpSetupResponse>('/auth/2fa/totp/setup')
}
export function totpVerify(token: string): Promise<void> {
  return api.post<void>('/auth/2fa/totp/verify', { token })
}
export function totpDisable(): Promise<void> {
  return api.delete<void>('/auth/2fa/totp')
}

// Email OTP
export function emailOtpSend(email: string): Promise<void> {
  return api.post<void>('/auth/2fa/email/send', { email })
}
export function emailOtpVerify(email: string, code: string): Promise<void> {
  return api.post<void>('/auth/2fa/email/verify', { email, code })
}
export function emailOtpDisable(): Promise<void> {
  return api.delete<void>('/auth/2fa/email')
}
