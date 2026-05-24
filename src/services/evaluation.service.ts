import { api } from '../utils/api'
import type { Evaluation } from '../types/api.types'

export async function getEvaluation(applicationId: string): Promise<Evaluation> {
  return api.get<Evaluation>(`/applications/${applicationId}/evaluation`)
}
