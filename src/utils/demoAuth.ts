export type DemoSession = {
  displayName: string
  email: string
  identifier: string
  initials: string
  role: string
}

export type DemoAccount = {
  fullName: string
  email: string
  phone: string
  password: string
  role: string
}

export type LoginPayload = {
  identifier: string
  password: string
  remember: boolean
}

export type RegisterPayload = {
  fullName: string
  email: string
  phone: string
  password: string
  termsAccepted: boolean
}

const SESSION_KEY = 'jemacash.demo.session'
const REGISTERED_ACCOUNT_KEY = 'jemacash.demo.registered-account'

export const DEFAULT_ACCOUNT: DemoAccount = {
  fullName: 'Carlos Mendoza',
  email: 'carlos.mendoza@jemacash.pe',
  phone: '+51 987 654 321',
  password: 'Jemacash123',
  role: 'Miembro',
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function makeInitials(fullName: string) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'JM'
}

function toSession(account: DemoAccount): DemoSession {
  return {
    displayName: account.fullName,
    email: account.email,
    identifier: account.email,
    initials: makeInitials(account.fullName),
    role: account.role,
  }
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeKey(key: string) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(key)
}

export function loadStoredSession() {
  return readJson<DemoSession>(SESSION_KEY)
}

export function storeSession(session: DemoSession) {
  writeJson(SESSION_KEY, session)
}

export function clearStoredSession() {
  removeKey(SESSION_KEY)
}

export function loadRegisteredAccount() {
  return readJson<DemoAccount>(REGISTERED_ACCOUNT_KEY)
}

export function saveRegisteredAccount(account: DemoAccount) {
  writeJson(REGISTERED_ACCOUNT_KEY, account)
}

export function authenticateLogin({ identifier, password }: Omit<LoginPayload, 'remember'>) {
  const normalizedIdentifier = normalize(identifier)

  const accounts = [DEFAULT_ACCOUNT, loadRegisteredAccount()].filter(
    (account): account is DemoAccount => Boolean(account),
  )

  const matchingAccount = accounts.find((account) => {
    const matchesIdentifier =
      normalize(account.email) === normalizedIdentifier ||
      normalize(account.phone) === normalizedIdentifier

    return matchesIdentifier && account.password === password
  })

  if (!matchingAccount) {
    return {
      success: false,
      message: 'Las credenciales no coinciden con la cuenta demo disponible.',
    }
  }

  return {
    success: true,
    session: toSession(matchingAccount),
  }
}

export function createRegisteredAccount(payload: RegisterPayload): DemoAccount {
  return {
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    password: payload.password,
    role: 'Miembro',
  }
}

