import type { Payment, PaymentMethod } from '../types/api.types'
import { api } from '../utils/api'

export interface CreatePaymentPayload {
  application_id: string
  amount: number
  payment_method: PaymentMethod
  cuota_number: number
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
