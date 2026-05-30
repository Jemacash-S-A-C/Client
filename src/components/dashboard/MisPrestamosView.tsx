import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from './Pagination'
import {
  IconCalendar,
  IconFilter,
  IconDownload,
  IconCheck,
  IconWarning,
} from './icons'
import styles from './MisPrestamosView.module.css'
import { useLocaleFormat } from '../../utils/tz'
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
  conceptKey: string
  conceptVars: Record<string, string | number>
  id: string
  date: string
  amount: number
  type: 'desembolso' | 'pago'
}

function buildLoanData(
  app: LoanApplication,
  evaluation: Evaluation | null,
  payments: Payment[],
  fmtShort: (d: Date | string) => string,
): LoanData {
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
    conceptKey: 'prestamos.movement.disbursement',
    conceptVars: { id: shortId(app.id) },
    id: `#DESEMBOLSO-${app.id.slice(0, 6).toUpperCase()}`,
    date: fmtShort(signedAt),
    amount: loanAmount,
    type: 'desembolso',
  })

  // One entry per actual payment, most recent first
  for (const p of [...sortedPayments].reverse()) {
    movements.push({
      conceptKey: 'prestamos.movement.cuota',
      conceptVars: { num: String(p.cuota_number).padStart(2, '0'), id: shortId(app.id) },
      id: `#TRX-${p.reference_number}`,
      date: fmtShort(new Date(p.created_at)),
      amount: Number(p.amount),
      type: 'pago',
    })
  }

  return { app, evaluation, loanAmount, cuota, totalCost, monthsElapsed, paidCount, paidAmount, remainingAmount, pct, nextPaymentDate, movements }
}

// ── Status display ─────────────────────────────────────────────────────────────

const STATUS_KEYS: Record<string, { labelKey: string; color: string; bg: string; icon: typeof IconClock }> = {
  submitted: { labelKey: 'prestamos.status.inReview',  color: '#2563eb', bg: '#dbeafe', icon: IconClock   },
  signed:    { labelKey: 'prestamos.status.inReview2', color: '#b45309', bg: '#fef3c7', icon: IconClock   },
  rejected:  { labelKey: 'prestamos.status.rejected',  color: '#dc2626', bg: '#fef2f2', icon: IconWarning },
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onPay?: (info: LoanPaymentInfo) => void
}

export function MisPrestamosView({ onPay }: Props) {
  const { t } = useTranslation()
  const { fmtLong, fmtShort } = useLocaleFormat()
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

        const approvedApps = all.filter((a) => a.status === 'approved')

        // Fetch evaluations and payments in parallel — only for approved loans
        const [evals, paymentLists] = await Promise.all([
          Promise.all(approvedApps.map((a) => getEvaluation(a.id).catch(() => null))),
          Promise.all(approvedApps.map((a) => getPaymentsByApplication(a.id).catch(() => [] as Payment[]))),
        ])
        if (cancelled) return

        const evalMap = new Map<string, Evaluation | null>(
          approvedApps.map((a, i) => [a.id, evals[i]])
        )
        const paymentsMap = new Map<string, Payment[]>(
          approvedApps.map((a, i) => [a.id, paymentLists[i]])
        )

        const loanData = approvedApps
          .map((a) => buildLoanData(a, evalMap.get(a.id) ?? null, paymentsMap.get(a.id) ?? [], fmtShort))

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
  const inProcess   = apps.filter((a) => a.status === 'submitted' || a.status === 'signed')

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
            <h1 className={styles.view_title}>{t('prestamos.title')}</h1>
            <p className={styles.view_sub}>{t('prestamos.loading')}</p>
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
          <h1 className={styles.view_title}>{t('prestamos.title')}</h1>
          <p className={styles.view_sub}>{t('prestamos.subtitle')}</p>
        </div>
        {activeLoans.length > 0 && (
          <span className={styles.badge_active}>
            {activeLoans.length === 1
              ? t('prestamos.active.badge.one', { count: activeLoans.length })
              : t('prestamos.active.badge.many', { count: activeLoans.length })}
          </span>
        )}
      </div>

      {/* ── Empty loans notice ── */}
      {activeLoans.length === 0 && inProcess.length === 0 && (
        <div className={styles.prest_empty}>
          <span className={styles.prest_empty_icon}><IconCreditCard /></span>
          <strong>{t('prestamos.empty.title')}</strong>
          <p>{t('prestamos.empty.desc')}</p>
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
                  <strong>{t('prestamos.loan.personal')}</strong>
                  <span>{shortId(l.app.id)}</span>
                </div>
                <div className={styles.loan_total_block}>
                  <span className={styles.loan_total_label}>{t('prestamos.loan.totalLabel')}</span>
                  <strong className={styles.loan_total}>S/ {fmt(l.loanAmount)}</strong>
                </div>
              </div>

              <div className={styles.loan_amounts}>
                <span className={styles.amount_paid}>{t('prestamos.loan.paid', { amount: fmt(l.paidAmount) })}</span>
                <span className={styles.amount_remaining}>{t('prestamos.loan.remaining', { amount: fmt(l.remainingAmount) })}</span>
              </div>

              <div className={styles.progress_bar}>
                <div className={styles.progress_fill} style={{ width: `${l.pct}%` }} />
              </div>

              <div className={styles.loan_footer}>
                <div className={styles.next_payment}>
                  <IconCalendar />
                  <div>
                    <span>{t('prestamos.loan.nextPayment')}</span>
                    <strong>{fmtLong(l.nextPaymentDate)}</strong>
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
                    {t('prestamos.loan.payNow')}
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
            {t('prestamos.prev')}
          </button>
          <div className={styles.prest_page_dots}>
            {Array.from({ length: totalLoanPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.prest_page_dot} ${i === loanPage ? styles.prest_page_dot_active : ''}`}
                onClick={() => setLoanPage(i)}
                aria-label={`${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.prest_page_btn}
            onClick={() => setLoanPage((p) => p + 1)}
            disabled={loanPage === totalLoanPages - 1}
          >
            {t('prestamos.next')}
          </button>
        </div>
      )}

      {/* ── In-process applications ── */}
      {inProcess.length > 0 && (
        <section className={styles.prest_process_section}>
          <h2 className={styles.section_title}>{t('prestamos.inProcess.title')}</h2>
          <div className={styles.prest_process_list}>
            {visibleInProcess.map((app) => {
              const info = STATUS_KEYS[app.status]
              const StatusIcon = info?.icon ?? IconClock
              return (
                <div key={app.id} className={styles.prest_process_card}>
                  <span className={styles.prest_process_icon} style={{ background: info?.bg, color: info?.color }}>
                    <StatusIcon />
                  </span>
                  <div className={styles.prest_process_body}>
                    <strong>{shortId(app.id)}</strong>
                    <span>S/ {fmt(Number(app.amount))} · {app.term_months} meses</span>
                  </div>
                  <span className={styles.prest_process_badge} style={{ background: info?.bg, color: info?.color }}>
                    {info ? t(info.labelKey) : app.status}
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
            <h2 className={styles.section_title}>{t('prestamos.movement.title')}</h2>
            <div className={styles.movements_actions}>
              <button type="button" className={styles.outline_btn}>
                <IconFilter /> {t('prestamos.movement.filter')}
              </button>
              <button type="button" className={styles.outline_btn}>
                <IconDownload /> {t('prestamos.movement.export')}
              </button>
            </div>
          </div>

          <div className={styles.movements_table}>
            <div className={styles.table_header}>
              <span>{t('prestamos.movement.concept')}</span>
              <span>{t('prestamos.movement.date')}</span>
              <span>{t('prestamos.movement.amount')}</span>
              <span>{t('prestamos.movement.type')}</span>
            </div>

            {visibleMovements.map((m) => (
              <div key={m.id} className={styles.table_row}>
                <div className={styles.table_concept}>
                  <span className={`${styles.concept_dot} ${m.type === 'pago' ? styles.dot_green : styles.dot_purple}`}>
                    {m.type === 'pago' ? <IconCheck /> : <span />}
                  </span>
                  <div>
                    <strong>{t(m.conceptKey, m.conceptVars)}</strong>
                    <span>{m.id}</span>
                  </div>
                </div>
                <span className={styles.table_date}>{m.date}</span>
                <span className={styles.table_amount}>
                  {m.type === 'pago' ? `- S/ ${fmt(m.amount)}` : `+ S/ ${fmt(m.amount)}`}
                </span>
                <span className={`${styles.status_badge} ${m.type === 'pago' ? styles.status_paid : styles.status_disbursed}`}>
                  {m.type === 'pago' ? t('prestamos.movement.typePago') : t('prestamos.movement.typeDesembolso')}
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
