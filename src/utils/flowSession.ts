/**
 * Flow session persistence
 *
 * Saves the user's active loan-flow step to localStorage so that F5 (hard
 * refresh) or navigating away and returning restores them to the exact view
 * they were on.
 *
 * Covered views: solicitar · auditoria · tasacion · firma · registrar-garantia-tec
 *
 * The session is ONLY cleared when the user explicitly exits the flow (cancel,
 * finalize, or voluntary back-to-start navigation).  "Guardar y salir" must NOT
 * clear the session — it leaves it intact so "Reanudar" works.
 */

export type FlowSession = {
  view: string
  appId: string | null
  postGuaranteeView?: 'garantias' | 'solicitar'
}

const FLOW_SESSION_KEY = 'jemacash_flow_session_v1'

export const FLOW_VIEWS = new Set([
  'solicitar',
  'auditoria',
  'tasacion',
  'firma',
  'registrar-garantia-tec',
])

export function saveFlowSession(session: FlowSession): void {
  try { localStorage.setItem(FLOW_SESSION_KEY, JSON.stringify(session)) } catch { /* quota / private */ }
}

export function clearFlowSession(): void {
  try { localStorage.removeItem(FLOW_SESSION_KEY) } catch { /* ignore */ }
}

export function loadFlowSession(): FlowSession | null {
  try {
    const raw = localStorage.getItem(FLOW_SESSION_KEY)
    return raw ? (JSON.parse(raw) as FlowSession) : null
  } catch { return null }
}

// ── Firma save-point flag ─────────────────────────────────────────────────────
// A separate per-application flag that records whether the user has reached the
// firma view for that application.  Used by handleResume to route them back there
// instead of starting over from auditoria.

function firmaKey(appId: string) { return `jemacash_firma_${appId}` }

export function markFirmaStep(appId: string | null): void {
  if (!appId) return
  try { localStorage.setItem(firmaKey(appId), '1') } catch { /* quota / private */ }
}

export function clearFirmaStep(appId: string | null): void {
  if (!appId) return
  try { localStorage.removeItem(firmaKey(appId)) } catch { /* ignore */ }
}

export function hasFirmaStep(appId: string): boolean {
  try { return localStorage.getItem(firmaKey(appId)) === '1' } catch { return false }
}
