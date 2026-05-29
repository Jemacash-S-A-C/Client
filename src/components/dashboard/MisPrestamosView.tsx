import { useEffect, useState } from 'react'
import { Pagination } from './Pagination'
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
import { getPaymentsByApplication } from '../../services/payment.service'
import type { LoanApplication, Evaluation, Payment } from '../../types/api.types'
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
  paidCount: number
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
  type: 'desembolso' | 'pago'
}

function buildLoanData(app: LoanApplication, evaluation: Evaluation | null, payments: Payment[]): LoanData {
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

  // Use actual payments to compute progress
  const sortedPayments = [...payments].sort((a, b) => a.cuota_number - b.cuota_number)
  const paidCount = sortedPayments.length
  const paidAmount = Math.min(paidCount * cuota, totalCost)
  const remainingAmount = Math.max(totalCost - paidAmount, 0)
  const pct = totalCost > 0 ? Math.round((paidAmount / totalCost) * 100) : 0

  // Next payment date based on actual paid cuotas
  const nextPaymentDate = new Date(createdAt)
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + paidCount + 1)

  // Build movements: paid cuotas + disbursement event
  const movements: Movement[] = []

  // Disbursement event (oldest entry)
  const signedAt = app.updated_at ? new Date(app.updated_at) : createdAt
  movements.push({
    concept: `Desembolso — ${shortId(app.id)}`,
    id: `#DESEMBOLSO-${app.id.slice(0, 6).toUpperCase()}`,
    date: fmtShortDate(signedAt),
    amount: loanAmount,
    type: 'desembolso',
  })

  // One entry per actual payment, most recent first
  for (const p of [...sortedPayments].reverse()) {
    movements.push({
      concept: `Cuota ${String(p.cuota_number).padStart(2, '0')} — ${shortId(app.id)}`,
      id: `#TRX-${p.reference_number}`,
      date: fmtShortDate(new Date(p.created_at)),
      amount: Number(p.amount),
      type: 'pago',
    })
  }

  return { app, evaluation, loanAmount, cuota, totalCost, monthsElapsed, paidCount, paidAmount, remainingAmount, pct, nextPaymentDate, movements }
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
  const [procesPage, setProcesPage] = useState(0)
  const [movPage,    setMovPage]    = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const all = await getApplications()
        if (cancelled) return
        setApps(all)

        const signedApps  = all.filter((a) => a.status === 'signed')
        const needsEval   = all.filter((a) => a.status === 'signed' || a.status === 'approved')

        // Fetch evaluations and payments in parallel
        const [evals, paymentLists] = await Promise.all([
          Promise.all(needsEval.map((a) => getEvaluation(a.id).catch(() => null))),
          Promise.all(signedApps.map((a) => getPaymentsByApplication(a.id).catch(() => [] as Payment[]))),
        ])
        if (cancelled) return

        const evalMap = new Map<string, Evaluation | null>(
          needsEval.map((a, i) => [a.id, evals[i]])
        )
        const paymentsMap = new Map<string, Payment[]>(
          signedApps.map((a, i) => [a.id, paymentLists[i]])
        )

        const loanData = signedApps
          .map((a) => buildLoanData(a, evalMap.get(a.id) ?? null, paymentsMap.get(a.id) ?? []))

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

  // Pagination
  const LOANS_PER_PAGE = 4
  const [loanPage, setLoanPage] = useState(0)
  const totalLoanPages = Math.ceil(activeLoans.length / LOANS_PER_PAGE)
  const pagedLoans = activeLoans.slice(loanPage * LOANS_PER_PAGE, (loanPage + 1) * LOANS_PER_PAGE)

  // Solicitudes en proceso — paginación de 4
  const PROCES_PER_PAGE  = 4
  const procesTotal      = Math.ceil(inProcess.length / PROCES_PER_PAGE)
  const visibleInProcess = inProcess.slice(procesPage * PROCES_PER_PAGE, (procesPage + 1) * PROCES_PER_PAGE)

  // Aggregate all movements from all loans, most recent first
  // Payments first, then disbursements — preserves per-loan ordering
  const allMovements = loans
    .flatMap((l) => l.movements)
    .sort((a, b) => (a.type === 'pago' ? -1 : b.type === 'pago' ? 1 : 0))

  const MOV_PER_PAGE    = 5
  const movTotal        = Math.ceil(allMovements.length / MOV_PER_PAGE)
  const visibleMovements = allMovements.slice(movPage * MOV_PER_PAGE, (movPage + 1) * MOV_PER_PAGE)

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
          {pagedLoans.map((l) => (
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
                {l.paidCount < l.app.term_months && (
                  <button
                    type="button"
                    className={styles.pay_btn}
                    onClick={() => onPay?.({
                      applicationId: l.app.id,
                      loanLabel: shortId(l.app.id),
                      cuota: l.cuota,
                      cuotaNumber: l.paidCount + 1,
                      totalCuotas: l.app.term_months,
                      nextPaymentDate: l.nextPaymentDate,
                      loanAmount: l.loanAmount,
                    })}
                  >
                    Pagar Ahora
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Loan pagination ── */}
      {totalLoanPages > 1 && (
        <div className={styles.prest_pagination}>
          <button
            type="button"
            className={styles.prest_page_btn}
            onClick={() => setLoanPage((p) => p - 1)}
            disabled={loanPage === 0}
          >
            ← Anterior
          </button>
          <div className={styles.prest_page_dots}>
            {Array.from({ length: totalLoanPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.prest_page_dot} ${i === loanPage ? styles.prest_page_dot_active : ''}`}
                onClick={() => setLoanPage(i)}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.prest_page_btn}
            onClick={() => setLoanPage((p) => p + 1)}
            disabled={loanPage === totalLoanPages - 1}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* ── In-process applications ── */}
      {inProcess.length > 0 && (
        <section className={styles.prest_process_section}>
          <h2 className={styles.section_title}>Solicitudes en Proceso</h2>
          <div className={styles.prest_process_list}>
            {visibleInProcess.map((app) => {
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
          <Pagination page={procesPage} total={procesTotal} onChange={setProcesPage} />
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
              <span>TIPO</span>
            </div>

            {visibleMovements.map((m) => (
              <div key={m.id} className={styles.table_row}>
                <div className={styles.table_concept}>
                  <span className={`${styles.concept_dot} ${m.type === 'pago' ? styles.dot_green : styles.dot_purple}`}>
                    {m.type === 'pago' ? <IconCheck /> : <span />}
                  </span>
                  <div>
                    <strong>{m.concept}</strong>
                    <span>{m.id}</span>
                  </div>
                </div>
                <span className={styles.table_date}>{m.date}</span>
                <span className={styles.table_amount}>
                  {m.type === 'pago' ? `- S/ ${fmt(m.amount)}` : `+ S/ ${fmt(m.amount)}`}
                </span>
                <span className={`${styles.status_badge} ${m.type === 'pago' ? styles.status_paid : styles.status_disbursed}`}>
                  {m.type === 'pago' ? 'PAGO' : 'DESEMBOLSO'}
                </span>
              </div>
            ))}

            {movTotal > 1 && (
              <div className={styles.load_more}>
                <Pagination page={movPage} total={movTotal} onChange={setMovPage} />
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  )
}
