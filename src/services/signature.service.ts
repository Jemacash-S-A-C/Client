import { api } from '../utils/api'
import type { Signature } from '../types/api.types'

export async function createSignature(
  applicationId: string,
  data: { signature_base64: string; document_urls?: string[] },
): Promise<Signature> {
  return api.post<Signature>(`/applications/${applicationId}/signature`, data)
}

export async function getSignature(applicationId: string): Promise<Signature> {
  return api.get<Signature>(`/applications/${applicationId}/signature`)
}
