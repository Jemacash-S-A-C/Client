import { api } from '../utils/api'
import type { AiValuationResult, Guarantee, GuaranteeSpecs } from '../types/api.types'

export async function getGuarantees(): Promise<Guarantee[]> {
  return api.get<Guarantee[]>('/guarantees')
}

export async function getGuarantee(id: string): Promise<Guarantee> {
  return api.get<Guarantee>(`/guarantees/${id}`)
}

export async function updateGuaranteeAi(id: string, data: {
  ai_market_value?: number
  ai_resale_value?: number
  ai_max_loan?: number
  ai_condition_score?: number
  ai_depreciation_factors?: string[]
  ai_confidence?: number
  ai_reasoning?: string
  ai_visual_condition?: string
}): Promise<Guarantee> {
  return api.patch<Guarantee>(`/guarantees/${id}/ai`, data)
}

export async function createGuarantee(data: {
  type: string
  name: string
  description?: string
  estimated_value?: number
  device_category?: string
  brand?: string
  model?: string
  manufacture_year?: string
  serial_number?: string
  condition?: string
  specs?: GuaranteeSpecs
  photo_urls?: string[]
  ai_market_value?: number
  ai_resale_value?: number
  ai_max_loan?: number
  ai_condition_score?: number
  ai_depreciation_factors?: string[]
  ai_confidence?: number
  ai_reasoning?: string
  ai_visual_condition?: string
}): Promise<Guarantee> {
  return api.post<Guarantee>('/guarantees', data)
}

export async function valuateDevice(data: {
  device_category: string
  brand: string
  model: string
  manufacture_year: string
  processor: string
  ram: string
  storage: string
  battery_health?: string
  screen_size?: string
  condition: string
  is_reconditioned: boolean
  photos: string[]
}): Promise<AiValuationResult> {
  return api.post<AiValuationResult>('/guarantees/ai-valuate', data)
}

export async function reportGuaranteeAudit(id: string, data: {
  serial_number: string
  brand?: string
  model?: string
  manufacture_year?: string
  specs: GuaranteeSpecs
}): Promise<Guarantee> {
  return api.patch<Guarantee>(`/guarantees/${id}/audit-report`, data)
}
