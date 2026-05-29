import type { Payment, PaymentMethod } from '../types/api.types'
import { api } from '../utils/api'

export interface CreatePaymentPayload {
  application_id: string
  amount: number
  payment_method: PaymentMethod
  cuota_number: number
}

export interface MpChargePayload {
  application_id: string
  amount: number
  cuota_number: number
  token: string
  installments: number
  payment_method_id: string
  email: string
  issuer_id?: string
}

export function mpCharge(payload: MpChargePayload): Promise<Payment> {
  return api.post<Payment>('/payments/mp-charge', payload)
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
