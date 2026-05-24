// ── Backend response shapes ───────────────────────────────────────────────────

export type UserProfile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  initials: string
  created_at: string
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  user: UserProfile
}

export type LoanApplication = {
  id: string
  user_id: string
  guarantee_id: string | null
  amount: number
  term_months: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'signed'
  created_at: string
  updated_at: string
}

export type Evaluation = {
  id: string
  application_id: string
  status: 'pending' | 'approved' | 'rejected'
  approved_amount: number | null
  risk_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Guarantee = {
  id: string
  user_id: string
  type: string
  name: string
  description: string | null
  estimated_value: number
  status: 'active' | 'pledged' | 'released'
  created_at: string
}

export type Signature = {
  id: string
  application_id: string
  signature_base64: string
  document_urls: string[] | null
  created_at: string
}

// ── Frontend session shape (mirrors DemoSession for minimal diff) ─────────────

export type UserSession = {
  id: string
  displayName: string   // = full_name
  email: string
  phone: string | null
  initials: string
  role: string          // always 'Miembro'
  identifier: string    // = email
}

export function profileToSession(profile: UserProfile): UserSession {
  return {
    id: profile.id,
    displayName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    initials: profile.initials,
    role: 'Miembro',
    identifier: profile.email,
  }
}
