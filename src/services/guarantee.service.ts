import { api } from '../utils/api'
import type { Guarantee } from '../types/api.types'

export async function getGuarantees(): Promise<Guarantee[]> {
  return api.get<Guarantee[]>('/guarantees')
}

export async function createGuarantee(data: {
  type: string
  name: string
  description?: string
  estimated_value: number
}): Promise<Guarantee> {
  return api.post<Guarantee>('/guarantees', data)
}
