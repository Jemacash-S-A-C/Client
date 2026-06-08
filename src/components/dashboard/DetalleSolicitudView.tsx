import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoanApplication, Evaluation, Payment, LoanDocument } from '../../types/api.types'
import { getEvaluation } from '../../services/evaluation.service'
import { getPaymentsByApplication } from '../../services/payment.service'
import { getDocumentsByApplication } from '../../services/document.service'
import { disburseApplication } from '../../services/application.service'
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

function fmtDocSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

const DOC_LABELS: Record<string, string> = {
  dni:          'DNI / Documento de Identidad',
  pay_stub:     'Boleta de Pago',
  utility_bill: 'Recibo de Domicilio',
}

const DOC_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',   color: '#d97706', bg: '#fef3c7' },
  reviewing: { label: 'En revisión', color: '#2563eb', bg: '#dbeafe' },
  verified:  { label: 'Verificado',  color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { label: 'Rechazado',   color: '#dc2626', bg: '#fef2f2' },
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG_KEYS = {
  draft:      { labelKey: 'detalle.status.draft',      color: '#7c3aed', bg: '#ede9fe' },
  submitted:  { labelKey: 'detalle.status.submitted',  color: '#2563eb', bg: '#dbeafe' },
  signed:     { labelKey: 'detalle.status.signed',     color: '#b45309', bg: '#fef3c7' },
  approved:   { labelKey: 'detalle.status.approved',   color: '#0a6b34', bg: '#d9f0da' },
  disbursed:  { labelKey: 'detalle.status.disbursed',  color: '#0f7d3f', bg: '#d9f0da' },
  defaulted:  { labelKey: 'detalle.status.defaulted',  color: '#7f1d1d', bg: '#fee2e2' },
  rejected:   { labelKey: 'detalle.status.rejected',   color: '#dc2626', bg: '#fef2f2' },
  cancelled:  { labelKey: 'detalle.status.cancelled',  color: '#6b7280', bg: '#f3f4f6' },
} as const

// ── Timeline builder ──────────────────────────────────────────────────────────

interface TimelineStep {
  labelKey: string
  date:     string
  state:    'done' | 'active' | 'pending' | 'rejected'
}

function buildTimeline(
  app: LoanApplication,
  docsUploaded: boolean,
  tPending: string,
  tInProgress: string,
  fmtLong: (d: Date | string) => string,
): TimelineStep[] {
  const created = fmtLong(app.created_at)
  const updated = fmtLong(app.updated_at ?? app.created_at)

  // 5-step timeline — "Revisión" removed; signing auto-approves immediately
  // 0 Enviada            → done once submitted/beyond
  // 1 Documentos         → done once docs uploaded or beyond
  // 2 Valuación y firma  → done once signed/approved/disbursed/defaulted/rejected
  // 3 Aprobada           → active on approved; done on disbursed/defaulted
  // 4 Recogida y desembolso → done on disbursed/defaulted

  const postSign = (['signed','approved','disbursed','defaulted','rejected'] as LoanApplication['status'][])
  const docsDone = docsUploaded || postSign.includes(app.status)

  return [
    {
      labelKey: 'detalle.timeline.enviada',
      date:  created,
      state: (['submitted','signed','approved','disbursed','defaulted','rejected'] as LoanApplication['status'][]).includes(app.status)
        ? 'done'
        : 'active',
    },
    {
      labelKey: 'detalle.timeline.documentos',
      date:  docsDone
        ? (postSign.includes(app.status) ? updated : created)
        : app.status === 'submitted' ? tInProgress : tPending,
      state: postSign.includes(app.status)
        ? 'done'
        : docsUploaded
        ? 'done'
        : app.status === 'submitted'
        ? 'active'
        : 'pending',
    },
    {
      labelKey: 'detalle.timeline.valuacion',
      date:  postSign.includes(app.status)
        ? updated
        : docsDone && app.status === 'submitted' ? tInProgress : tPending,
      state: postSign.includes(app.status)
        ? 'done'
        : docsDone && app.status === 'submitted'
        ? 'active'
        : 'pending',
    },
    {
      labelKey: 'detalle.timeline.aprobada',
      date:  (['signed','approved','disbursed','defaulted'] as LoanApplication['status'][]).includes(app.status)
        ? updated
        : tPending,
      state: app.status === 'rejected'
        ? 'rejected'
        : (['disbursed','defaulted'] as LoanApplication['status'][]).includes(app.status)
        ? 'done'
        : (['signed','approved'] as LoanApplication['status'][]).includes(app.status)
        ? 'active'
        : 'pending',
    },
    {
      labelKey: 'detalle.timeline.desembolso',
      date:  (['disbursed','defaulted'] as LoanApplication['status'][]).includes(app.status)
        ? updated
        : tPending,
      state: (['disbursed','defaulted'] as LoanApplication['status'][]).includes(app.status)
        ? 'done'
        : 'pending',
    },
  ]
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

function IconFileDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

type ConfirmAction = 'disburse'

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
  const [evaluation,    setEvaluation]    = useState<Evaluation | null>(null)
  const [payments,      setPayments]      = useState<Payment[]>([])
  const [appDocs,       setAppDocs]       = useState<LoanDocument[]>([])
  const [loading,       setLoading]       = useState(true)
  const [disbursing,    setDisbursing]    = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const REQUIRED_DOC_TYPES = ['dni', 'pay_stub', 'utility_bill']

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getEvaluation(app.id).catch(() => null),
      getPaymentsByApplication(app.id).catch(() => [] as Payment[]),
      getDocumentsByApplication(app.id).catch(() => [] as LoanDocument[]),
    ]).then(([ev, pays, docs]) => {
      if (cancelled) return
      setEvaluation(ev)
      setPayments(pays)
      setAppDocs(docs)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [app.id])

  const docsUploaded = REQUIRED_DOC_TYPES.every(type => appDocs.some(d => d.document_type === type))

  const statusCfgKey = STATUS_CFG_KEYS[app.status] ?? STATUS_CFG_KEYS.submitted
  const timeline     = buildTimeline(app, docsUploaded, t('detalle.timeline.pending'), t('detalle.timeline.inProgress'), fmtLong)
  const guarantee    = app.guarantee ?? null

  const loanAmount  = evaluation?.approved_amount != null
    ? Number(evaluation.approved_amount)
    : Number(app.amount)

  const cuota      = calcCuota(loanAmount, app.term_months)
  const totalCost  = cuota * app.term_months
  const hasFinance = ['signed','approved','disbursed','defaulted'].includes(app.status)

  async function handleConfirmAction() {
    if (confirmAction === 'disburse') {
      setConfirmAction(null)
      setDisbursing(true)
      try {
        await disburseApplication(app.id)
        onBack()
      } catch {
        setDisbursing(false)
      }
    }
  }

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

          {/* ── Documents ── */}
          <div className={styles.section}>
            <h2 className={styles.section_title}>Documentos de la solicitud</h2>
            {loading ? (
              <div className={styles.docs_skeleton} />
            ) : (
              <div className={styles.docs_card}>
                {REQUIRED_DOC_TYPES.map((type, idx) => {
                  const uploaded = appDocs.filter(d => d.document_type === type)
                  const isDone = uploaded.length > 0
                  return (
                    <div
                      key={type}
                      className={`${styles.doc_block} ${idx < REQUIRED_DOC_TYPES.length - 1 ? styles.doc_block_sep : ''}`}
                    >
                      {/* Header row */}
                      <div className={styles.doc_block_head}>
                        <div className={`${styles.doc_block_icon} ${isDone ? styles.doc_block_icon_done : ''}`}>
                          <IconFileDoc />
                        </div>
                        <div className={styles.doc_block_info}>
                          <strong>{DOC_LABELS[type] ?? type}</strong>
                          <span>
                            {isDone
                              ? `${uploaded.length} archivo${uploaded.length !== 1 ? 's' : ''} subido${uploaded.length !== 1 ? 's' : ''}`
                              : 'Sin subir'}
                          </span>
                        </div>
                        {isDone && (
                          <span
                            className={styles.doc_block_overall}
                            style={{
                              color:       DOC_STATUS_CFG[uploaded[0].status]?.color  ?? '#d97706',
                              background:  DOC_STATUS_CFG[uploaded[0].status]?.bg     ?? '#fef3c7',
                            }}
                          >
                            {DOC_STATUS_CFG[uploaded[0].status]?.label ?? uploaded[0].status}
                          </span>
                        )}
                      </div>

                      {/* File chips — one per uploaded file */}
                      {uploaded.length > 0 && (
                        <div className={styles.doc_file_chips}>
                          {uploaded.map(doc => (
                            <div key={doc.id} className={styles.doc_file_chip}>
                              <span className={styles.doc_file_chip_name}>{doc.original_name}</span>
                              <span className={styles.doc_file_chip_size}>{fmtDocSize(doc.file_size)}</span>
                              <span
                                className={styles.doc_file_chip_status}
                                style={{
                                  color:      DOC_STATUS_CFG[doc.status]?.color  ?? '#d97706',
                                  background: DOC_STATUS_CFG[doc.status]?.bg     ?? '#fef3c7',
                                }}
                              >
                                {DOC_STATUS_CFG[doc.status]?.label ?? doc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

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
            {app.status === 'submitted' && onContinue && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.submittedHint')}</p>
                <button
                  type="button"
                  className={styles.action_btn_primary}
                  onClick={() => onContinue(app.id)}
                >
                  {t('detalle.action.submittedBtn')}
                </button>
              </>
            )}
            {app.status === 'signed' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.approvedHint')}</p>
                <button type="button" className={styles.action_btn_success} disabled>
                  <IconCheck /> {t('detalle.action.approvedBtn')}
                </button>
              </>
            )}
            {app.status === 'approved' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.approvedHint')}</p>
                <button type="button" className={styles.action_btn_success} disabled>
                  <IconCheck /> {t('detalle.action.approvedBtn')}
                </button>
                <div className={styles.bypass_divider} />
                <p className={styles.bypass_notice}>
                  ⚠️ Solo disponible mientras el panel de agente no está implementado
                </p>
                <button
                  type="button"
                  className={styles.action_btn_bypass}
                  disabled={disbursing}
                  onClick={() => setConfirmAction('disburse')}
                >
                  {disbursing ? 'Desembolsando…' : '📦 Confirmar recogida y desembolsar (provisional)'}
                </button>
              </>
            )}
            {app.status === 'disbursed' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.disbursedHint')}</p>
                <button type="button" className={styles.action_btn_success} disabled>
                  <IconCheck /> {t('detalle.action.disbursedBtn')}
                </button>
              </>
            )}
            {app.status === 'defaulted' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.defaultedHint')}</p>
                <button type="button" className={styles.action_btn_danger} disabled>
                  <IconWarning /> {t('detalle.action.defaultedBtn')}
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
            {app.status === 'cancelled' && (
              <>
                <p className={styles.action_hint}>{t('detalle.action.cancelledHint')}</p>
                <button type="button" className={styles.action_btn_muted} disabled>
                  {t('detalle.action.cancelledBtn')}
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

      {confirmAction && (
        <div className={styles.confirm_overlay} role="presentation">
          <div
            className={styles.confirm_modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="detalle-confirm-title"
            aria-describedby="detalle-confirm-message"
          >
            <div className={styles.confirm_badge}>
              <IconWarning />
            </div>
            <h3 id="detalle-confirm-title" className={styles.confirm_title}>
              Confirmar acción
            </h3>
            <p id="detalle-confirm-message" className={styles.confirm_message}>
              ¿Confirmar recogida física y desembolsar? Esta acción marcará la solicitud como desembolsada.
            </p>
            <div className={styles.confirm_actions}>
              <button type="button" className={styles.confirm_btn_secondary} onClick={() => setConfirmAction(null)}>
                Cancelar
              </button>
              <button type="button" className={styles.confirm_btn_primary} onClick={handleConfirmAction}>
                Confirmar y desembolsar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

