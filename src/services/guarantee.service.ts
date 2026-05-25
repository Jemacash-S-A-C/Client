import { api } from '../utils/api'
import type { Guarantee, GuaranteeSpecs } from '../types/api.types'

export async function getGuarantees(): Promise<Guarantee[]> {
  return api.get<Guarantee[]>('/guarantees')
}

export async function getGuarantee(id: string): Promise<Guarantee> {
  return api.get<Guarantee>(`/guarantees/${id}`)
}

export async function createGuarantee(data: {
  type: string
  name: string
  description?: string
  estimated_value: number
  device_category?: string
  brand?: string
  model?: string
  manufacture_year?: string
  serial_number?: string
  condition?: string
  specs?: GuaranteeSpecs
  photo_urls?: string[]
}): Promise<Guarantee> {
  return api.post<Guarantee>('/guarantees', data)
}
