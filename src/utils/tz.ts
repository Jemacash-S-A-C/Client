import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// ── Timezone map ──────────────────────────────────────────────────────────────

export const TZ_MAP: Record<string, string> = {
  lima:   'America/Lima',
  madrid: 'Europe/Madrid',
  miami:  'America/New_York',
}

// ── Module-level state + subscription pattern ─────────────────────────────────
// Allows any mounted component to re-render when the user changes their timezone.

let _tz = 'America/Lima'
const _listeners = new Set<() => void>()

export function setAppTimezone(pref: string): void {
  _tz = TZ_MAP[pref] ?? 'America/Lima'
  _listeners.forEach(fn => fn())
}

export function getAppTimezone(): string { return _tz }

// ── useAppTimezone hook ───────────────────────────────────────────────────────

export function useAppTimezone(): string {
  const [tz, setTz] = useState(getAppTimezone)
  useEffect(() => {
    const update = () => setTz(getAppTimezone())
    _listeners.add(update)
    return () => { _listeners.delete(update) }
  }, [])
  return tz
}

// ── useLocaleFormat hook ──────────────────────────────────────────────────────
// Returns locale-aware, timezone-aware date formatters.
// Automatically re-renders when language or timezone changes.

export function useLocaleFormat() {
  const { i18n } = useTranslation()
  const timezone = useAppTimezone()
  const locale = i18n.language === 'en' ? 'en-US' : 'es-PE'

  function fmt(d: Date | string, options: Intl.DateTimeFormatOptions): string {
    const date = typeof d === 'string' ? new Date(d) : d
    return date.toLocaleDateString(locale, { timeZone: timezone, ...options })
  }

  return {
    locale,
    timezone,
    /** e.g. "15 de enero de 2026" / "January 15, 2026" */
    fmtLong:       (d: Date | string) => fmt(d, { day: 'numeric',  month: 'long',  year: 'numeric' }),
    /** e.g. "15 ene 2026" / "Jan 15, 2026" */
    fmtShort:      (d: Date | string) => fmt(d, { day: '2-digit',  month: 'short', year: 'numeric' }),
    /** e.g. "enero de 2026" / "January 2026" */
    fmtMonthYear:  (d: Date | string) => fmt(d, { month: 'long',   year: 'numeric' }),
    /** e.g. "ene 2026" / "Jan 2026" */
    fmtMonthShort: (d: Date | string) => fmt(d, { month: 'short',  year: 'numeric' }),
    /** e.g. "15 de enero" / "January 15" */
    fmtDayMonth:   (d: Date | string) => fmt(d, { day: 'numeric',  month: 'long' }),
  }
}
