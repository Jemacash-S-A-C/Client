import { useEffect, useMemo, useState } from 'react'
import { IconShield, IconArrowRight } from './icons'
import styles from './CalendarioView.module.css'
import { getApplications } from '../../services/application.service'
import { getEvaluation } from '../../services/evaluation.service'
import type { LoanApplication, Evaluation } from '../../types/api.types'

// ── Constants & helpers ────────────────────────────────────────────────────────

const TASA_MENSUAL = 0.0125
const DAY_HEADERS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MONTH_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

function calcCuota(amount: number, months: number): number {
  const r = TASA_MENSUAL
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Parse a YYYY-MM-DD key as local midnight (not UTC) to avoid day-shift in negative-offset timezones
function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function shortId(id: string) { return `JM-${id.slice(0, 6).toUpperCase()}` }

// Returns Monday=0 … Sunday=6 index for a Date
function isoWeekday(d: Date): number { return (d.getDay() + 6) % 7 }

// ── Event model ────────────────────────────────────────────────────────────────

type EventTone = 'blue' | 'rose' | 'green'

interface CalEvent {
  label: string
  detail: string
  tone: EventTone
  amount: number
  isoDate: string   // YYYY-MM-DD, used for sorting / lookup
}

// ── Build events from loans ────────────────────────────────────────────────────

function buildEvents(
  apps: LoanApplication[],
  evalMap: Map<string, Evaluation | null>,
): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>()
  const now = new Date()
  const msPerMonth = 30.44 * 24 * 3600 * 1000

  for (const app of apps) {
    if (app.status !== 'signed') continue

    const evaluation = evalMap.get(app.id) ?? null
    const loanAmount = evaluation?.approved_amount != null
      ? Number(evaluation.approved_amount)
      : Number(app.amount)

    const cuota = calcCuota(loanAmount, app.term_months)
    const createdAt = new Date(app.created_at)
    const monthsElapsed = Math.min(
      Math.floor((now.getTime() - createdAt.getTime()) / msPerMonth),
      app.term_months,
    )

    for (let i = 1; i <= app.term_months; i++) {
      const due = new Date(createdAt)
      due.setMonth(due.getMonth() + i)

      let tone: EventTone
      let label: string
      if (i <= monthsElapsed) {
        tone = 'green'
        label = 'Pagado'
      } else if (i === monthsElapsed + 1) {
        tone = 'blue'
        label = 'Próximo pago'
      } else {
        tone = 'rose'
        label = 'Cuota'
      }

      const key = dateKey(due)
      const event: CalEvent = {
        label,
        detail: `S/ ${fmt(cuota)} · ${shortId(app.id)}`,
        tone,
        amount: cuota,
        isoDate: key,
      }

      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(event)
    }
  }

  return map
}

// ── Calendar grid builder ──────────────────────────────────────────────────────

interface CalCell {
  date: Date
  outOfMonth: boolean
  isToday: boolean
  events: CalEvent[]
}

function buildMonthGrid(year: number, month: number, eventMap: Map<string, CalEvent[]>): CalCell[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startOffset = isoWeekday(firstDay)   // 0=Mon … 6=Sun

  const cells: CalCell[] = []
  const today = new Date()
  const todayKey = dateKey(today)

  // Days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, outOfMonth: true, isToday: false, events: [] })
  }

  // Days in month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const key  = dateKey(date)
    cells.push({
      date,
      outOfMonth: false,
      isToday: key === todayKey,
      events: eventMap.get(key) ?? [],
    })
  }

  // Days from next month (fill to complete 6 rows = 42 cells)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    cells.push({ date, outOfMonth: true, isToday: false, events: [] })
  }

  // Chunk into weeks
  const weeks: CalCell[][] = []
  for (let i = 0; i < 6; i++) weeks.push(cells.slice(i * 7, i * 7 + 7))
  return weeks
}

function buildWeekGrid(anchor: Date, eventMap: Map<string, CalEvent[]>): CalCell[] {
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - isoWeekday(anchor))
  const todayKey = dateKey(new Date())

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const key = dateKey(date)
    return { date, outOfMonth: false, isToday: key === todayKey, events: eventMap.get(key) ?? [] }
  })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function CalSkeleton() {
  return (
    <div className={styles.cal_layout}>
      <div className={styles.cal_panel}>
        <div className={styles.cal_skeleton_head} />
        <div className={styles.cal_skeleton_grid}>
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className={styles.cal_skeleton_cell} />
          ))}
        </div>
      </div>
      <aside className={styles.cal_sidebar}>
        <div className={styles.cal_skeleton_card} />
        <div className={styles.cal_skeleton_card} />
      </aside>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

type CalView = 'mes' | 'semana' | 'dia'

export function CalendarioView() {
  const [calView, setCalView]   = useState<CalView>('mes')
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d
  })
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date())

  const [apps,    setApps]    = useState<LoanApplication[]>([])
  const [evalMap, setEvalMap] = useState<Map<string, Evaluation | null>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const all = await getApplications()
        if (cancelled) return

        const signed = all.filter(a => a.status === 'signed')
        const evals  = await Promise.all(signed.map(a => getEvaluation(a.id).catch(() => null)))
        if (cancelled) return

        const m = new Map<string, Evaluation | null>(signed.map((a, i) => [a.id, evals[i]]))
        setApps(all)
        setEvalMap(m)
      } catch { /* show empty state */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const eventMap = useMemo(() => buildEvents(apps, evalMap), [apps, evalMap])

  const monthGrid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth(), eventMap),
    [viewDate, eventMap],
  )
  const weekCells = useMemo(() => buildWeekGrid(selectedDay, eventMap), [selectedDay, eventMap])
  const dayCells  = useMemo(() => eventMap.get(dateKey(selectedDay)) ?? [], [selectedDay, eventMap])

  // ── Sidebar derived data ────────────────────────────────────────────────────

  const totalThisMonth = useMemo(() => {
    let sum = 0
    const now = new Date()
    monthGrid.flat().forEach(cell => {
      if (!cell.outOfMonth) {
        cell.events.forEach(ev => {
          if (ev.tone !== 'green' && cell.date >= now) sum += ev.amount
        })
      }
    })
    return sum
  }, [monthGrid])

  const upcomingEvents = useMemo(() => {
    const todayKey = dateKey(new Date())
    const future: { date: Date; event: CalEvent }[] = []
    eventMap.forEach((evs, key) => {
      if (key >= todayKey) {
        evs.forEach(ev => {
          if (ev.tone !== 'green') future.push({ date: keyToDate(key), event: ev })
        })
      }
    })
    return future
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }, [eventMap])

  const monthEventCount = useMemo(
    () => monthGrid.flat().reduce((n, c) => n + (c.outOfMonth ? 0 : c.events.length), 0),
    [monthGrid],
  )

  // ── Navigation helpers ──────────────────────────────────────────────────────

  function prevPeriod() {
    if (calView === 'mes') {
      setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })
    } else {
      setSelectedDay(d => { const n = new Date(d); n.setDate(n.getDate() - (calView === 'semana' ? 7 : 1)); return n })
    }
  }

  function nextPeriod() {
    if (calView === 'mes') {
      setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })
    } else {
      setSelectedDay(d => { const n = new Date(d); n.setDate(n.getDate() + (calView === 'semana' ? 7 : 1)); return n })
    }
  }

  function goToday() {
    const now = new Date()
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDay(now)
  }

  function selectDay(cell: CalCell) {
    setSelectedDay(cell.date)
    if (calView === 'mes') setCalView('dia')
  }

  // ── Period label ────────────────────────────────────────────────────────────

  function periodLabel(): string {
    if (calView === 'mes') {
      return `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`
    }
    if (calView === 'semana') {
      const monday = new Date(selectedDay)
      monday.setDate(selectedDay.getDate() - isoWeekday(selectedDay))
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
      return `${monday.getDate()} – ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()]} ${sunday.getFullYear()}`
    }
    return selectedDay.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <CalSkeleton />

  return (
    <div className={styles.cal_layout}>

      {/* ── Calendar panel ──────────────────────────────────────────────── */}
      <div className={styles.cal_panel}>

        {/* Header row */}
        <div className={styles.cal_panel_head}>
          <div className={styles.cal_nav}>
            <button type="button" className={styles.cal_nav_btn} onClick={prevPeriod} aria-label="Período anterior">
              <IconChevronLeft />
            </button>
            <div>
              <h1 className={styles.cal_title}>{periodLabel()}</h1>
              {calView === 'mes' && (
                <p className={styles.cal_subtitle}>
                  {monthEventCount > 0
                    ? `${monthEventCount} evento${monthEventCount !== 1 ? 's' : ''} financiero${monthEventCount !== 1 ? 's' : ''} este mes`
                    : 'Sin eventos este mes'}
                </p>
              )}
            </div>
            <button type="button" className={styles.cal_nav_btn} onClick={nextPeriod} aria-label="Período siguiente">
              <IconChevronRight />
            </button>
          </div>

          <div className={styles.cal_head_right}>
            <button type="button" className={styles.cal_today_btn} onClick={goToday}>Hoy</button>
            <div className={styles.cal_view_tabs}>
              {(['mes', 'semana', 'dia'] as CalView[]).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.cal_view_tab} ${calView === v ? styles.cal_view_tab_active : ''}`}
                  onClick={() => setCalView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Month view ──────────────────────────────────────────────── */}
        {calView === 'mes' && (
          <div className={styles.cal_grid}>
            {DAY_HEADERS.map(h => (
              <div key={h} className={styles.cal_day_header}>{h}</div>
            ))}
            {monthGrid.flat().map((cell, i) => (
              <div
                key={i}
                className={`${styles.cal_cell} ${cell.outOfMonth ? styles.cal_cell_out : ''} ${cell.isToday ? styles.cal_cell_today : ''} ${!cell.outOfMonth ? styles.cal_cell_clickable : ''}`}
                onClick={() => !cell.outOfMonth && selectDay(cell)}
              >
                {cell.isToday && <span className={styles.cal_today_label}>HOY</span>}
                <span className={styles.cal_day_num}>{cell.date.getDate()}</span>
                {cell.events.map((ev, j) => (
                  <div key={j} className={`${styles.cal_event} ${styles[`cal_event_${ev.tone}`]}`}>
                    <strong>{ev.label}</strong>
                    <span>{ev.detail}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Week view ───────────────────────────────────────────────── */}
        {calView === 'semana' && (
          <div className={styles.cal_week_grid}>
            {DAY_HEADERS.map(h => (
              <div key={h} className={styles.cal_day_header}>{h}</div>
            ))}
            {weekCells.map((cell, i) => (
              <div
                key={i}
                className={`${styles.cal_week_cell} ${cell.isToday ? styles.cal_cell_today : ''} ${styles.cal_cell_clickable}`}
                onClick={() => selectDay(cell)}
              >
                {cell.isToday && <span className={styles.cal_today_label}>HOY</span>}
                <span className={styles.cal_day_num}>{cell.date.getDate()}</span>
                {cell.events.length === 0 && (
                  <span className={styles.cal_no_events}>Sin eventos</span>
                )}
                {cell.events.map((ev, j) => (
                  <div key={j} className={`${styles.cal_event} ${styles[`cal_event_${ev.tone}`]}`}>
                    <strong>{ev.label}</strong>
                    <span>{ev.detail}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Day view ────────────────────────────────────────────────── */}
        {calView === 'dia' && (
          <div className={styles.cal_day_view}>
            {dayCells.length === 0 ? (
              <div className={styles.cal_day_empty}>
                <span className={styles.cal_day_empty_icon}>📅</span>
                <strong>Sin eventos este día</strong>
                <span>No hay cuotas ni vencimientos para esta fecha.</span>
              </div>
            ) : (
              dayCells.map((ev, i) => (
                <div key={i} className={`${styles.cal_day_event_card} ${styles[`cal_day_event_${ev.tone}`]}`}>
                  <div className={styles.cal_day_event_dot} />
                  <div className={styles.cal_day_event_body}>
                    <strong>{ev.label}</strong>
                    <span>{ev.detail}</span>
                  </div>
                  <span className={styles.cal_day_event_amount}>S/ {fmt(ev.amount)}</span>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ── Right sidebar ───────────────────────────────────────────────── */}
      <aside className={styles.cal_sidebar}>

        <div className={styles.cal_total_card}>
          <span className={styles.cal_total_label}>
            {calView === 'mes'
              ? `PENDIENTE — ${MONTH_NAMES[viewDate.getMonth()].toUpperCase()}`
              : 'PRÓXIMOS PAGOS'}
          </span>
          <strong className={styles.cal_total_amount}>
            {totalThisMonth > 0 ? `S/ ${fmt(totalThisMonth)}` : 'S/ 0.00'}
          </strong>
          <span className={styles.cal_total_trend}>
            {totalThisMonth > 0 ? 'Cuotas pendientes por pagar' : 'Sin cuotas pendientes este mes ✓'}
          </span>
        </div>

        <div className={styles.cal_events_card}>
          <div className={styles.cal_events_head}>
            <h3>Próximos Eventos</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className={styles.cal_events_empty}>No hay cuotas próximas.</p>
          ) : (
            <div className={styles.cal_events_list}>
              {upcomingEvents.map(({ date, event }, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.cal_event_row}
                  onClick={() => { setSelectedDay(date); setCalView('dia') }}
                >
                  <div className={styles.cal_event_date}>
                    <span>{MONTH_SHORT[date.getMonth()]}</span>
                    <strong>{String(date.getDate()).padStart(2, '0')}</strong>
                  </div>
                  <div className={styles.cal_event_info}>
                    <strong>{event.label}</strong>
                    <span>{event.detail}</span>
                  </div>
                  <span className={styles.cal_event_arrow}><IconArrowRight /></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.cal_promo_card}>
          <span className={styles.cal_promo_arrow}>↑</span>
          <strong>Optimiza tu flujo de caja con Jemacash</strong>
          <span>Activa alertas antes del vencimiento de cada cuota.</span>
        </div>

      </aside>

      {/* ── Security bar ────────────────────────────────────────────────── */}
      <div className={styles.cal_security_bar}>
        <div className={styles.cal_sec_left}>
          <span className={styles.cal_sec_shield}><IconShield /></span>
          <div>
            <strong>Tu cuenta está protegida</strong>
            <span>Encriptación de grado bancario y monitoreo 24/7.</span>
          </div>
        </div>
        <div className={styles.cal_sec_stats}>
          <div><strong>99.9%</strong><span>UPTIME DEL SISTEMA</span></div>
          <div><strong>2m</strong><span>TIEMPO DE RESPUESTA</span></div>
        </div>
        <button type="button" className={styles.cal_sec_btn}>Ver Seguridad</button>
      </div>

    </div>
  )
}
