import { api } from '../utils/api'
import type { LoanDocument, DocumentType } from '../types/api.types'

export interface UploadDocumentPayload {
  document_type: DocumentType
  original_name: string
  file_size: number
  mime_type: string
  content_base64: string
  application_id?: string
}

export function uploadDocument(payload: UploadDocumentPayload): Promise<LoanDocument> {
  return api.post<LoanDocument>('/documents', payload)
}

export function getDocuments(): Promise<LoanDocument[]> {
  return api.get<LoanDocument[]>('/documents')
}

export function getDocumentsByApplication(applicationId: string): Promise<LoanDocument[]> {
  return api.get<LoanDocument[]>(`/documents/application/${applicationId}`)
}

export function deleteDocument(id: string): Promise<void> {
  return api.delete<void>(`/documents/${id}`)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // strip the data:…;base64, prefix
      resolve(result.split(',')[1] ?? result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
