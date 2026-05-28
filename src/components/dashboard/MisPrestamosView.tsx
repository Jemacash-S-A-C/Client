import { useEffect, useState } from 'react'
import {
  IconCalendar,
  IconFilter,
  IconDownload,
  IconCheck,
  IconWarning,
} from './icons'
import styles from './MisPrestamosView.module.css'
import { getApplications } from '../../services/application.service'
import { getEvaluation } from '../../services/evaluation.service'
import type { LoanApplication, Evaluation } from '../../types/api.types'
import type { LoanPaymentInfo } from './PagarCuotaView'

// ── Constants ─────────────────────────────────────────────────────────────────

const TASA_MENSUAL = 0.0125

function calcCuota(amount: number, months: number): number {
  const r = TASA_MENSUAL
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtShortDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function shortId(id: string): string {
  return `JM-${id.slice(0, 6).toUpperCase()}`
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Derived data helpers ───────────────────────────────────────────────────────

interface LoanData {
  app: LoanApplication
  evaluation: Evaluation | null
  loanAmount: number       // approved_amount ?? app.amount
  cuota: number
  totalCost: number
  monthsElapsed: number
  paidAmount: number
  remainingAmount: number
  pct: number
  nextPaymentDate: Date
  movements: Movement[]
}

interface Movement {
  concept: string
  id: string
  date: string
  amount: number
  status: 'pagado' | 'pendiente'
  paymentInfo: LoanPaymentInfo | null
}

function buildLoanData(app: LoanApplication, evaluation: Evaluation | null): LoanData {
  const loanAmount = evaluation?.approved_amount != null
    ? Number(evaluation.approved_amount)
    : Number(app.amount)

  const cuota = calcCuota(loanAmount, app.term_months)
  const totalCost = cuota * app.term_months

  const createdAt = new Date(app.created_at)
  const now = new Date()
  const msPerMonth = 30.44 * 24 * 3600 * 1000
  const monthsElapsed = Math.min(
    Math.floor((now.getTime() - createdAt.getTime()) / msPerMonth),
    app.term_months,
  )

  const paidAmount = Math.min(monthsElapsed * cuota, totalCost)
  const remainingAmount = Math.max(totalCost - paidAmount, 0)
  const pct = totalCost > 0 ? Math.round((paidAmount / totalCost) * 100) : 0

  // Next payment = start date + (monthsElapsed + 1) months
  const nextPaymentDate = new Date(createdAt)
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsElapsed + 1)

  // Generate movement history (past cuotas)
  const movements: Movement[] = []
  for (let i = 1; i <= monthsElapsed; i++) {
    const d = new Date(createdAt)
    d.setMonth(d.getMonth() + i)
    movements.push({
      concept: `Cuota ${String(i).padStart(2, '0')} — ${shortId(app.id)}`,
      id: `#TRX-${app.id.slice(0, 4).toUpperCase()}-${String(i).padStart(2, '0')}`,
      date: fmtShortDate(d),
      amount: cuota,
      status: 'pagado',
      paymentInfo: null,
    })
  }
  // If there's a pending cuota (next payment is in future but we're past a period)
  if (monthsElapsed < app.term_months) {
    movements.push({
      concept: `Cuota ${String(monthsElapsed + 1).padStart(2, '0')} — ${shortId(app.id)}`,
      id: `#TRX-${app.id.slice(0, 4).toUpperCase()}-${String(monthsElapsed + 1).padStart(2, '0')}`,
      date: fmtShortDate(nextPaymentDate),
      amount: cuota,
      status: 'pendiente',
      paymentInfo: {
        applicationId: app.id,
        loanLabel: shortId(app.id),
        cuota,
        cuotaNumber: monthsElapsed + 1,
        totalCuotas: app.term_months,
        nextPaymentDate,
        loanAmount,
      },
    })
  }
  movements.reverse() // Most recent first

  return { app, evaluation, loanAmount, cuota, totalCost, monthsElapsed, paidAmount, remainingAmount, pct, nextPaymentDate, movements }
}

// ── Status display ─────────────────────────────────────────────────────────────

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; icon: typeof IconClock }> = {
  submitted: { label: 'En Evaluación',   color: '#2563eb', bg: '#dbeafe', icon: IconClock    },
  approved:  { label: 'Aprobado',         color: '#0f7d3f', bg: '#d9f0da', icon: IconCheck    },
  rejected:  { label: 'Rechazado',        color: '#dc2626', bg: '#fef2f2', icon: IconWarning  },
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onPay?: (info: LoanPaymentInfo) => void
}

export function MisPrestamosView({ onPay }: Props) {
  const [apps, setApps] = useState<LoanApplication[]>([])
  const [loans, setLoans] = useState<LoanData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllMovements, setShowAllMovements] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const all = await getApplications()
        if (cancelled) return
        setApps(all)

        // Fetch evaluations for signed + approved apps in parallel
        const needsEval = all.filter((a) => a.status === 'signed' || a.status === 'approved')
        const evals = await Promise.all(
          needsEval.map((a) => getEvaluation(a.id).catch(() => null))
        )
        if (cancelled) return

        const evalMap = new Map<string, Evaluation | null>(
          needsEval.map((a, i) => [a.id, evals[i]])
        )

        const loanData = all
          .filter((a) => a.status === 'signed')
          .map((a) => buildLoanData(a, evalMap.get(a.id) ?? null))

        setLoans(loanData)

      } catch {
        // Network error — show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const activeLoans = loans
  const inProcess   = apps.filter((a) => a.status === 'submitted' || a.status === 'approved')
  // Aggregate all movements from all loans, most recent first
  const allMovements = loans
    .flatMap((l) => l.movements)
    .sort((a, b) => (a.status === 'pendiente' ? -1 : b.status === 'pendiente' ? 1 : 0))

  const visibleMovements = showAllMovements ? allMovements : allMovements.slice(0, 5)

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.view_grid}>
        <div className={styles.view_header}>
          <div>
            <h1 className={styles.view_title}>Estado de mis Créditos</h1>
            <p className={styles.view_sub}>Cargando información de tus préstamos…</p>
          </div>
        </div>
        <div className={styles.prest_loading}>
          {[1, 2].map((i) => <div key={i} className={styles.prest_skeleton} />)}
        </div>
      </div>
    )
  }

  // ── Empty state (no signed loans yet) ─────────────────────────────────────

  // No early return for empty loans — fall through to main render so guarantees section always shows

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className={styles.view_grid}>

      {/* ── Header ── */}
      <div className={styles.view_header}>
        <div>
          <h1 className={styles.view_title}>Estado de mis Créditos</h1>
          <p className={styles.view_sub}>Monitorea el progreso de tus préstamos activos en tiempo real.</p>
        </div>
        {activeLoans.length > 0 && (
          <span className={styles.badge_active}>
            {activeLoans.length} {activeLoans.length === 1 ? 'Préstamo Activo' : 'Préstamos Activos'}
          </span>
        )}
      </div>

      {/* ── Empty loans notice ── */}
      {activeLoans.length === 0 && inProcess.length === 0 && (
        <div className={styles.prest_empty}>
          <span className={styles.prest_empty_icon}><IconCreditCard /></span>
          <strong>No tienes préstamos activos</strong>
          <p>Solicita tu primer crédito y úsalo para lo que necesites.</p>
        </div>
      )}

      {/* ── Active loans ── */}
      {activeLoans.length > 0 && (
        <div className={styles.loans_grid}>
          {activeLoans.map((l) => (
            <article key={l.app.id} className={styles.loan_card}>
              <div className={styles.loan_top}>
                <span className={styles.loan_icon_wrap}>
                  <IconCreditCard />
                </span>
                <div className={styles.loan_identity}>
                  <strong>Préstamo Personal</strong>
                  <span>{shortId(l.app.id)}</span>
                </div>
                <div className={styles.loan_total_block}>
                  <span className={styles.loan_total_label}>MONTO TOTAL</span>
                  <strong className={styles.loan_total}>S/ {fmt(l.loanAmount)}</strong>
                </div>
              </div>

              <div className={styles.loan_amounts}>
                <span className={styles.amount_paid}>Pagado: S/ {fmt(l.paidAmount)}</span>
                <span className={styles.amount_remaining}>Restante: S/ {fmt(l.remainingAmount)}</span>
              </div>

              <div className={styles.progress_bar}>
                <div className={styles.progress_fill} style={{ width: `${l.pct}%` }} />
              </div>

              <div className={styles.loan_footer}>
                <div className={styles.next_payment}>
                  <IconCalendar />
                  <div>
                    <span>Próximo Pago</span>
                    <strong>{fmtDate(l.nextPaymentDate)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.pay_btn}
                  onClick={() => onPay?.({
                    applicationId: l.app.id,
                    loanLabel: shortId(l.app.id),
                    cuota: l.cuota,
                    cuotaNumber: l.monthsElapsed + 1,
                    totalCuotas: l.app.term_months,
                    nextPaymentDate: l.nextPaymentDate,
                    loanAmount: l.loanAmount,
                  })}
                >
                  Pagar Ahora
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── In-process applications ── */}
      {inProcess.length > 0 && (
        <section className={styles.prest_process_section}>
          <h2 className={styles.section_title}>Solicitudes en Proceso</h2>
          <div className={styles.prest_process_list}>
            {inProcess.map((app) => {
              const info = STATUS_INFO[app.status]
              const StatusIcon = info?.icon ?? IconClock
              return (
                <div key={app.id} className={styles.prest_process_card}>
                  <span className={styles.prest_process_icon} style={{ background: info?.bg, color: info?.color }}>
                    <StatusIcon />
                  </span>
                  <div className={styles.prest_process_body}>
                    <strong>Solicitud {shortId(app.id)}</strong>
                    <span>S/ {fmt(Number(app.amount))} · {app.term_months} meses</span>
                  </div>
                  <span className={styles.prest_process_badge} style={{ background: info?.bg, color: info?.color }}>
                    {info?.label ?? app.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Movement history ── */}
      {allMovements.length > 0 && (
        <section className={styles.movements_section}>
          <div className={styles.movements_head}>
            <h2 className={styles.section_title}>Historial de Movimientos</h2>
            <div className={styles.movements_actions}>
              <button type="button" className={styles.outline_btn}>
                <IconFilter /> Filtrar
              </button>
              <button type="button" className={styles.outline_btn}>
                <IconDownload /> Exportar
              </button>
            </div>
          </div>

          <div className={styles.movements_table}>
            <div className={styles.table_header}>
              <span>CONCEPTO / ID</span>
              <span>FECHA</span>
              <span>IMPORTE</span>
              <span>ESTADO</span>
              <span>ACCIÓN</span>
            </div>

            {visibleMovements.map((m) => (
              <div key={m.id} className={styles.table_row}>
                <div className={styles.table_concept}>
                  <span className={`${styles.concept_dot} ${m.status === 'pagado' ? styles.dot_green : styles.dot_purple}`}>
                    {m.status === 'pagado' ? <IconCheck /> : <span />}
                  </span>
                  <div>
                    <strong>{m.concept}</strong>
                    <span>{m.id}</span>
                  </div>
                </div>
                <span className={styles.table_date}>{m.date}</span>
                <span className={styles.table_amount}>S/ {fmt(m.amount)}</span>
                <span className={`${styles.status_badge} ${m.status === 'pagado' ? styles.status_paid : styles.status_pending}`}>
                  {m.status === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
                </span>
                <button
                  type="button"
                  className={`${styles.action_link} ${m.status === 'pendiente' ? styles.action_link_pay : ''}`}
                  onClick={() => m.paymentInfo && onPay?.(m.paymentInfo)}
                  disabled={m.status === 'pagado'}
                >
                  {m.status === 'pagado' ? 'Detalles' : 'Pagar'}
                </button>
              </div>
            ))}

            {allMovements.length > 5 && (
              <div className={styles.load_more}>
                <button
                  type="button"
                  className={styles.load_more_btn}
                  onClick={() => setShowAllMovements((v) => !v)}
                >
                  {showAllMovements
                    ? 'Mostrar menos ↑'
                    : `Cargar ${allMovements.length - 5} movimientos más ↓`}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  )
}
