import { api } from '../utils/api'
import type { LoanApplication } from '../types/api.types'

export async function getApplications(): Promise<LoanApplication[]> {
  return api.get<LoanApplication[]>('/applications')
}

export async function getApplication(id: string): Promise<LoanApplication> {
  return api.get<LoanApplication>(`/applications/${id}`)
}

export async function createApplication(data: {
  amount: number
  term_months: number
  guarantee_id?: string
}): Promise<LoanApplication> {
  return api.post<LoanApplication>('/applications', data)
}

export async function submitApplication(id: string): Promise<LoanApplication> {
  return api.post<LoanApplication>(`/applications/${id}/submit`)
}
