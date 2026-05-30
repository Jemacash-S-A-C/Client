import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoanApplication, Evaluation, Payment } from '../../types/api.types'
import { getEvaluation } from '../../services/evaluation.service'
import { getPaymentsByApplication } from '../../services/payment.service'
import { IconCheck, IconWarning, IconWallet, IconDocument, IconShield } from './icons'
import styles from './DetalleSolicitudView.module.css'
import { useLocaleFormat } from '../../utils/tz'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TASA_MENSUAL = 0.0125
const TEA = ((1 + TASA_MENSUAL) ** 12 - 1) * 100   // ≈ 16.08 %

function calcCuota(amount: number, months: number) {
  const r = TASA_MENSUAL
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function shortId(id: string) { return `JM-${id.slice(0, 6).toUpperCase()}` }

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG_KEYS = {
  draft:     { labelKey: 'detalle.status.draft',     color: '#7c3aed', bg: '#ede9fe' },
  submitted: { labelKey: 'detalle.status.submitted', color: '#2563eb', bg: '#dbeafe' },
  approved:  { labelKey: 'detalle.status.approved',  color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { labelKey: 'detalle.status.rejected',  color: '#dc2626', bg: '#fef2f2' },
  signed:    { labelKey: 'detalle.status.signed',    color: '#0f7d3f', bg: '#d9f0da' },
} as const

// ── Timeline builder ──────────────────────────────────────────────────────────

interface TimelineStep {
  labelKey: string
  date:     string
  state:    'done' | 'active' | 'pending' | 'rejected'
}

function buildTimeline(
  app: LoanApplication,
  tPending: string,
  tInProgress: string,
  fmtLong: (d: Date | string) => string,
): TimelineStep[] {
  const created = fmtLong(app.created_at)
  const updated = fmtLong(app.updated_at ?? app.created_at)

  const STEPS: { labelKey: string; doneOn: LoanApplication['status'][] }[] = [
    { labelKey: 'detalle.timeline.registro',      doneOn: ['submitted','approved','rejected','signed'] },
    { labelKey: 'detalle.timeline.enEvaluacion',  doneOn: ['approved','rejected','signed']             },
    { labelKey: 'detalle.timeline.ofertaFinal',   doneOn: ['signed']                                  },
    { labelKey: 'detalle.timeline.firmado',        doneOn: ['signed']                                  },
  ]

  return STEPS.map((s, i) => {
    const done     = s.doneOn.includes(app.status)
    const isActive = !done && (
      (i === 0 && app.status === 'draft') ||
      (i === 1 && app.status === 'submitted') ||
      (i === 2 && app.status === 'approved')
    )
    const isRejected = app.status === 'rejected' && i === 1

    let date = tPending
    if (i === 0)                                   date = created
    if (i === 1 && app.status !== 'draft')         date = created
    if (i === 2 && (app.status === 'approved' || app.status === 'signed')) date = updated
    if (i === 3 && app.status === 'signed')        date = updated
    if (isActive)                                  date = tInProgress
    if (isRejected)                                date = updated

    return {
      labelKey: s.labelKey,
      date,
      state: isRejected ? 'rejected' : done ? 'done' : isActive ? 'active' : 'pending',
    }
  })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l1.5-4.5A2 2 0 017.4 5h9.2a2 2 0 011.9 1.5L20 11"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="2" y="11" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M0 19h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  app:         LoanApplication
  onBack:      () => void
  onContinue?: (appId: string) => void   // navigate to signing flow
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DetalleSolicitudView({ app, onBack, onContinue }: Props) {
  const { t } = useTranslation()
  const { fmtLong, fmtShort } = useLocaleFormat()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [payments,   setPayments]   = useState<Payment[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getEvaluation(app.id).catch(() => null),
      getPaymentsByApplication(app.id).catch(() => [] as Payment[]),
    ]).then(([ev, pays]) => {
      if (cancelled) return
      setEvaluation(ev)
      setPayments(pays)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [app.id])

  const statusCfgKey = STATUS_CFG_KEYS[app.status]
  const timeline     = buildTimeline(app, t('detalle.timeline.pending'), t('detalle.timeline.inProgress'), fmtLong)
  const guarantee    = app.guarantee ?? null

  const loanAmount  = evaluation?.approved_amount != null
    ? Number(evaluation.approved_amount)
    : Number(app.amount)

  const cuota      = calcCuota(loanAmount, app.term_months)
  const totalCost  = cuota * app.term_months
  const hasFinance = app.status === 'approved' || app.status === 'signed'

  return (
    <div className={styles.page}>

      {/* ── Back + status header ── */}
      <div className={styles.page_header}>
        <button type="button" className={styles.back_btn} onClick={onBack}>
          <IconArrowLeft />
          {t('detalle.backBtn')}
        </button>
        <span className={styles.status_badge} style={{ color: statusCfgKey.color, background: statusCfgKey.bg }}>
          {t(statusCfgKey.labelKey)}
        </span>
      </div>

      <div className={styles.layout}>

        {/* ══ Left column ══════════════════════════════════════════════════ */}
        <div className={styles.col_main}>

          {/* ── Loan summary card ── */}
          <div className={styles.summary_card}>
            <div className={styles.summary_top}>
              <div className={styles.summary_icon_wrap}>
                <IconDocument />
              </div>
              <div className={styles.summary_identity}>
                <strong>{t('detalle.loanPersonal')}</strong>
                <span>{shortId(app.id)}</span>
              </div>
              <div className={styles.summary_amount_block}>
                <span>{t('detalle.requestedAmount')}</span>
                <strong>S/ {fmt(Number(app.amount))}</strong>
              </div>
            </div>

            <div className={styles.summary_meta}>
              <div><span>{t('detalle.term')}</span><strong>{t('detalle.months', { n: app.term_months })}</strong></div>
              <div><span>{t('detalle.created')}</span><strong>{fmtShort(app.created_at)}</strong></div>
              <div><span>{t('detalle.fullId')}</span><strong className={styles.mono}>{app.id.slice(0, 16).toUpperCase()}…</strong></div>
            </div>
          </div>

          {/* ── Timeline ── */}
          <div className={styles.section}>
            <h2 className={styles.section_title}>{t('detalle.progress')}</h2>
            <div className={styles.timeline_card}>
              <div className={styles.timeline}>
                {timeline.map((step, i) => (
                  <div key={step.labelKey} className={styles.tl_step}>
                    <div className={styles.tl_connector}>
                      <div className={`${styles.tl_node} ${styles[`tl_node_${step.state}`]}`}>
                        {step.state === 'done'     && <IconCheck />}
                        {step.state === 'rejected' && <IconWarning />}
                        {(step.state === 'active' || step.state === 'pending') && <span>{i + 1}</span>}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`${styles.tl_line} ${step.state === 'done' ? styles.tl_line_done : styles.tl_line_pending}`} />
                      )}
                    </div>
                    <div className={styles.tl_label}>
                      <strong className={styles[`tl_text_${step.state}`]}>{t(step.labelKey)}</strong>
                      <span>{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Guarantee ── */}
          {guarantee && (
            <div className={styles.section}>
              <h2 className={styles.section_title}>{t('detalle.guarantee.title')}</h2>
              <div className={styles.guarantee_card}>
                <div className={styles.guarantee_icon_wrap}>
                  {guarantee.type === 'vehiculo' ? <IconCar /> : <IconLaptop />}
                </div>
                <div className={styles.guarantee_body}>
                  <div className={styles.guarantee_row}>
                    <strong>{guarantee.name}</strong>
                    <span className={styles.guarantee_type_badge}>{guarantee.type}</span>
                  </div>
                  <div className={styles.guarantee_meta}>
                    {guarantee.type === 'vehiculo'
                      ? guarantee.serial_number && <span>{t('detalle.guarantee.plate')}: <strong>{guarantee.serial_number}</strong></span>
                      : guarantee.serial_number && <span>{t('detalle.guarantee.sn')}: <strong>{guarantee.serial_number}</strong></span>
                    }
                    {guarantee.condition && <span>{t('detalle.guarantee.condition')}: <strong>{guarantee.condition}</strong></span>}
                    {guarantee.manufacture_year && <span>{t('detalle.guarantee.year')}: <strong>{guarantee.manufacture_year}</strong></span>}
                  </div>
                </div>
                <div className={styles.guarantee_value}>
                  <span>{t('detalle.guarantee.estimatedValue')}</span>
                  {Number(guarantee.estimated_value) > 0
                    ? <strong>S/ {fmt(Number(guarantee.estimated_value))}</strong>
                    : <span className={styles.guarantee_pending}>{t('garantias.card.pendingValuation')}</span>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── Payment history ── */}
          {payments.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.section_title}>{t('detalle.payments.title')}</h2>
              <div className={styles.payments_list}>
                {payments.map(p => (
                  <div key={p.id} className={styles.payment_row}>
                    <span className={styles.payment_dot} />
                    <div className={styles.payment_info}>
                      <strong>Cuota {p.cuota_number} · {p.payment_method.toUpperCase()}</strong>
                      <span>{fmtShort(p.created_at)}</span>
                    </div>
                    <div className={styles.payment_right}>
                      <strong>S/ {fmt(Number(p.amount))}</strong>
                      <span className={styles.payment_ref}>{p.reference_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ══ Right column ═════════════════════════════════════════════════ */}
        <aside className={styles.col_aside}>

          {/* ── Financial details ── */}
          <div className={styles.finance_card}>
            <div className={styles.finance_header}>
              <span className={styles.finance_icon}><IconWallet /></span>
              <h3>{t('detalle.finance.title')}</h3>
            </div>

            {loading ? (
              <div className={styles.finance_skeleton} />
            ) : (
              <div className={styles.finance_rows}>
                <div className={styles.finance_row}>
                  <span>{hasFinance ? t('detalle.finance.amountApproved') : t('detalle.finance.amountRequested')}</span>
                  <strong>S/ {fmt(loanAmount)}</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>{t('detalle.finance.term')}</span>
                  <strong>{t('detalle.months', { n: app.term_months })}</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>{t('detalle.finance.monthlyQuota')}</span>
                  <strong>S/ {fmt(cuota)}</strong>
                </div>
                <div className={styles.finance_divider} />
                <div className={styles.finance_row}>
                  <span>{t('detalle.finance.tea')}</span>
                  <strong>{TEA.toFixed(2)}%</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>{t('detalle.finance.totalCost')}</span>
                  <strong>S/ {fmt(totalCost)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* ── Action button ── */}
          <div className={styles.action_card}>
            {app.status === 'approved' && onContinue && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.approvedHint')}</p>
                <button
                  type="button"
                  className={styles.action_btn_primary}
                  onClick={() => onContinue(app.id)}
                >
                  {t('detalle.action.signContract')}
                </button>
              </>
            )}
            {app.status === 'signed' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.signedHint')}</p>
                <button type="button" className={styles.action_btn_success} disabled>
                  <IconCheck /> {t('detalle.action.signedBtn')}
                </button>
              </>
            )}
            {app.status === 'submitted' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.submittedHint')}</p>
                <button type="button" className={styles.action_btn_muted} disabled>
                  {t('detalle.action.submittedBtn')}
                </button>
              </>
            )}
            {app.status === 'rejected' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.rejectedHint')}</p>
                <button type="button" className={styles.action_btn_muted} disabled>
                  <IconWarning /> {t('detalle.action.rejectedBtn')}
                </button>
              </>
            )}
          </div>

          {/* ── Security seal ── */}
          <div className={styles.security_seal}>
            <span className={styles.seal_icon}><IconShield /></span>
            <div>
              <strong>{t('detalle.security.title')}</strong>
              <span>{t('detalle.security.desc')}</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
