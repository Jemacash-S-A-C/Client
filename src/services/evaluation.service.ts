import { api } from '../utils/api'
import type { Evaluation } from '../types/api.types'

export async function getEvaluation(applicationId: string): Promise<Evaluation> {
  return api.get<Evaluation>(`/applications/${applicationId}/evaluation`)
}

export async function updateEvaluation(
  applicationId: string,
  data: { status: string; approved_amount?: number; risk_score?: number; notes?: string },
): Promise<Evaluation> {
  return api.patch<Evaluation>(`/applications/${applicationId}/evaluation`, data)
}
