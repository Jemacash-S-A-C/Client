import type { Payment, PaymentMethod } from '../types/api.types'
import { api } from '../utils/api'

export interface CreatePaymentPayload {
  application_id: string
  amount: number
  payment_method: PaymentMethod
  cuota_number: number
}

export interface MpPreferencePayload {
  application_id: string
  amount: number
  cuota_number: number
  email: string
}

export interface MpPreferenceResult {
  checkoutUrl: string
  isMock: boolean
}

export interface MpConfirmPayload {
  application_id: string
  amount: number
  cuota_number: number
  mp_payment_id: string
}

/** Step 1 — get MP Checkout Pro redirect URL */
export function mpPreference(payload: MpPreferencePayload): Promise<MpPreferenceResult> {
  return api.post<MpPreferenceResult>('/payments/mp-preference', payload)
}

/** Step 2 — confirm payment after MP redirects back */
export function mpConfirm(payload: MpConfirmPayload): Promise<Payment> {
  return api.post<Payment>('/payments/mp-confirm', payload)
}

export interface MpCheckPayload {
  application_id: string
  cuota_number: number
}

/** Step 2 (alt) — verify & confirm by querying MP API directly */
export function mpCheck(payload: MpCheckPayload): Promise<Payment> {
  return api.post<Payment>('/payments/mp-check', payload)
}

export function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  return api.post<Payment>('/payments', payload)
}

export function getPayments(): Promise<Payment[]> {
  return api.get<Payment[]>('/payments')
}

export function getPaymentsByApplication(applicationId: string): Promise<Payment[]> {
  return api.get<Payment[]>(`/payments/application/${applicationId}`)
}
