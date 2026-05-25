import { api } from '../utils/api'
import type { UserProfile } from '../types/api.types'

export function updateProfile(payload: {
  full_name?: string
  phone?: string
}): Promise<UserProfile> {
  return api.patch<UserProfile>('/users/me', payload)
}

export function changePassword(
  current_password: string,
  new_password: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/users/change-password', {
    current_password,
    new_password,
  })
}
