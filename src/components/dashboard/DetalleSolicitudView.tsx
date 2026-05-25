import { useEffect, useState } from 'react'
import type { LoanApplication, Evaluation, Payment } from '../../types/api.types'
import { getEvaluation } from '../../services/evaluation.service'
import { getPaymentsByApplication } from '../../services/payment.service'
import { IconCheck, IconWarning, IconWallet, IconDocument, IconShield } from './icons'
import styles from './DetalleSolicitudView.module.css'

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

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtShort(d: Date | string) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function shortId(id: string) { return `JM-${id.slice(0, 6).toUpperCase()}` }

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  draft:     { label: 'Borrador',       color: '#7c3aed', bg: '#ede9fe' },
  submitted: { label: 'En Evaluación',  color: '#2563eb', bg: '#dbeafe' },
  approved:  { label: 'Aprobado',       color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { label: 'Rechazado',      color: '#dc2626', bg: '#fef2f2' },
  signed:    { label: 'Firmado',        color: '#0f7d3f', bg: '#d9f0da' },
} as const

// ── Timeline builder ──────────────────────────────────────────────────────────

interface TimelineStep {
  label:  string
  date:   string
  state:  'done' | 'active' | 'pending' | 'rejected'
}

function buildTimeline(app: LoanApplication): TimelineStep[] {
  const created = fmtDate(app.created_at)
  const updated = fmtDate(app.updated_at ?? app.created_at)

  const STEPS: { label: string; doneOn: LoanApplication['status'][] }[] = [
    { label: 'Registro',      doneOn: ['submitted','approved','rejected','signed'] },
    { label: 'En Evaluación', doneOn: ['approved','rejected','signed']             },
    { label: 'Oferta Final',  doneOn: ['signed']                                  },
    { label: 'Firmado',       doneOn: ['signed']                                  },
  ]

  return STEPS.map((s, i) => {
    const done     = s.doneOn.includes(app.status)
    const isActive = !done && (
      (i === 0 && app.status === 'draft') ||
      (i === 1 && app.status === 'submitted') ||
      (i === 2 && app.status === 'approved')
    )
    const isRejected = app.status === 'rejected' && i === 1

    let date = 'Pendiente'
    if (i === 0)                                   date = created
    if (i === 1 && app.status !== 'draft')         date = created
    if (i === 2 && (app.status === 'approved' || app.status === 'signed')) date = updated
    if (i === 3 && app.status === 'signed')        date = updated
    if (isActive)                                  date = 'En curso'
    if (isRejected)                                date = updated

    return {
      label: s.label,
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

  const statusCfg   = STATUS_CFG[app.status]
  const timeline    = buildTimeline(app)
  const guarantee   = app.guarantee ?? null

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
          Mis Solicitudes
        </button>
        <span className={styles.status_badge} style={{ color: statusCfg.color, background: statusCfg.bg }}>
          {statusCfg.label}
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
                <strong>Préstamo Personal</strong>
                <span>{shortId(app.id)}</span>
              </div>
              <div className={styles.summary_amount_block}>
                <span>MONTO SOLICITADO</span>
                <strong>S/ {fmt(Number(app.amount))}</strong>
              </div>
            </div>

            <div className={styles.summary_meta}>
              <div><span>Plazo</span><strong>{app.term_months} meses</strong></div>
              <div><span>Creado</span><strong>{fmtShort(app.created_at)}</strong></div>
              <div><span>ID completo</span><strong className={styles.mono}>{app.id.slice(0, 16).toUpperCase()}…</strong></div>
            </div>
          </div>

          {/* ── Timeline ── */}
          <div className={styles.section}>
            <h2 className={styles.section_title}>Progreso de la Solicitud</h2>
            <div className={styles.timeline_card}>
              <div className={styles.timeline}>
                {timeline.map((step, i) => (
                  <div key={step.label} className={styles.tl_step}>
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
                      <strong className={styles[`tl_text_${step.state}`]}>{step.label}</strong>
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
              <h2 className={styles.section_title}>Garantía Vinculada</h2>
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
                      ? guarantee.serial_number && <span>Placa: <strong>{guarantee.serial_number}</strong></span>
                      : guarantee.serial_number && <span>S/N: <strong>{guarantee.serial_number}</strong></span>
                    }
                    {guarantee.condition && <span>Condición: <strong>{guarantee.condition}</strong></span>}
                    {guarantee.manufacture_year && <span>Año: <strong>{guarantee.manufacture_year}</strong></span>}
                  </div>
                </div>
                <div className={styles.guarantee_value}>
                  <span>Valor estimado</span>
                  <strong>S/ {fmt(Number(guarantee.estimated_value))}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ── Payment history ── */}
          {payments.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.section_title}>Pagos Realizados</h2>
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
              <h3>Detalles Financieros</h3>
            </div>

            {loading ? (
              <div className={styles.finance_skeleton} />
            ) : (
              <div className={styles.finance_rows}>
                <div className={styles.finance_row}>
                  <span>Monto {hasFinance ? 'aprobado' : 'solicitado'}</span>
                  <strong>S/ {fmt(loanAmount)}</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>Plazo</span>
                  <strong>{app.term_months} meses</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>Cuota mensual</span>
                  <strong>S/ {fmt(cuota)}</strong>
                </div>
                <div className={styles.finance_divider} />
                <div className={styles.finance_row}>
                  <span>TEA</span>
                  <strong>{TEA.toFixed(2)}%</strong>
                </div>
                <div className={styles.finance_row}>
                  <span>Costo total</span>
                  <strong>S/ {fmt(totalCost)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* ── Action button ── */}
          <div className={styles.action_card}>
            {app.status === 'approved' && onContinue && (
              <>
                <p className={styles.action_hint}>Tu oferta está lista. Revisa los términos y firma el contrato.</p>
                <button
                  type="button"
                  className={styles.action_btn_primary}
                  onClick={() => onContinue(app.id)}
                >
                  Firmar Contrato →
                </button>
              </>
            )}
            {app.status === 'signed' && (
              <>
                <p className={styles.action_hint}>Préstamo activo. Revisa tus cuotas en Mis Préstamos.</p>
                <button type="button" className={styles.action_btn_success} disabled>
                  <IconCheck /> Contrato Firmado
                </button>
              </>
            )}
            {app.status === 'submitted' && (
              <>
                <p className={styles.action_hint}>Tu solicitud está siendo evaluada por nuestro equipo.</p>
                <button type="button" className={styles.action_btn_muted} disabled>
                  En Evaluación…
                </button>
              </>
            )}
            {app.status === 'rejected' && (
              <>
                <p className={styles.action_hint}>Esta solicitud fue rechazada. Puedes presentar una nueva.</p>
                <button type="button" className={styles.action_btn_muted} disabled>
                  <IconWarning /> Solicitud Rechazada
                </button>
              </>
            )}
          </div>

          {/* ── Security seal ── */}
          <div className={styles.security_seal}>
            <span className={styles.seal_icon}><IconShield /></span>
            <div>
              <strong>Información protegida</strong>
              <span>Datos encriptados bajo normativa SBS Perú</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
