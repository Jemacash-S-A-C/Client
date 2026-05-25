import { useState } from 'react'
import styles from './PagarCuotaView.module.css'
import { createPayment } from '../../services/payment.service'
import type { PaymentMethod } from '../../types/api.types'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LoanPaymentInfo {
  applicationId: string
  loanLabel: string      // e.g. "JM-A1B2C3"
  cuota: number
  cuotaNumber: number
  totalCuotas: number
  nextPaymentDate: Date
  loanAmount: number
}

interface Props {
  info: LoanPaymentInfo
  onBack: () => void
  onSuccess: () => void
}

// ── Payment methods config ─────────────────────────────────────────────────────

interface MethodOption {
  id: PaymentMethod
  name: string
  description: string
  color: string
  icon: () => JSX.Element
}

function IconBank() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10l9-7 9 7v1H3v-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="5" y="11" width="3" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="10.5" y="11" width="3" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="16" y="11" width="3" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 18h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function IconCash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const METHODS: MethodOption[] = [
  {
    id: 'bcp',
    name: 'BCP',
    description: 'Transferencia desde cuenta BCP',
    color: '#003082',
    icon: IconBank,
  },
  {
    id: 'bbva',
    name: 'BBVA',
    description: 'Transferencia desde cuenta BBVA',
    color: '#004B91',
    icon: IconBank,
  },
  {
    id: 'yape',
    name: 'Yape',
    description: 'Pago instantáneo con Yape',
    color: '#6B21A8',
    icon: IconPhone,
  },
  {
    id: 'plin',
    name: 'Plin',
    description: 'Pago instantáneo con Plin',
    color: '#059669',
    icon: IconPhone,
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    description: 'Pago en agencia o agente',
    color: '#92400e',
    icon: IconCash,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = 'metodo' | 'confirmar' | 'exito'

export function PagarCuotaView({ info, onBack, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('metodo')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')

  async function handleConfirm() {
    if (!selectedMethod) return
    setLoading(true)
    setError(null)
    try {
      const payment = await createPayment({
        application_id: info.applicationId,
        amount: info.cuota,
        payment_method: selectedMethod,
        cuota_number: info.cuotaNumber,
      })
      setReferenceNumber(payment.reference_number)
      setStep('exito')
    } catch {
      setError('No se pudo procesar el pago. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const method = METHODS.find((m) => m.id === selectedMethod)

  // ── Step: método ────────────────────────────────────────────────────────────

  if (step === 'metodo') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>

          <button type="button" className={styles.back_btn} onClick={onBack}>
            <IconArrowLeft />
            Volver
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Pagar Cuota</h1>
            <p className={styles.sub}>Elige cómo quieres realizar tu pago de este mes.</p>
          </div>

          {/* Loan summary card */}
          <div className={styles.loan_summary}>
            <div className={styles.summary_row}>
              <span>Préstamo</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.summary_divider} />
            <div className={styles.summary_row}>
              <span>Cuota {info.cuotaNumber} de {info.totalCuotas}</span>
              <strong className={styles.summary_amount}>S/ {fmt(info.cuota)}</strong>
            </div>
            <div className={styles.summary_row}>
              <span>Vencimiento</span>
              <strong>{fmtDate(info.nextPaymentDate)}</strong>
            </div>
          </div>

          <h2 className={styles.methods_title}>Método de pago</h2>
          <div className={styles.methods_grid}>
            {METHODS.map((m) => {
              const Icon = m.icon
              const selected = selectedMethod === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.method_card} ${selected ? styles.method_card_selected : ''}`}
                  onClick={() => setSelectedMethod(m.id)}
                  style={selected ? { '--method-color': m.color } as React.CSSProperties : undefined}
                >
                  <span className={styles.method_icon} style={{ background: `${m.color}18`, color: m.color }}>
                    <Icon />
                  </span>
                  <div className={styles.method_info}>
                    <strong>{m.name}</strong>
                    <span>{m.description}</span>
                  </div>
                  {selected && (
                    <span className={styles.method_check} style={{ background: m.color }}>
                      <IconCheck />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className={styles.primary_btn}
            disabled={!selectedMethod}
            onClick={() => setStep('confirmar')}
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  // ── Step: confirmar ─────────────────────────────────────────────────────────

  if (step === 'confirmar') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>

          <button type="button" className={styles.back_btn} onClick={() => setStep('metodo')}>
            <IconArrowLeft />
            Cambiar método
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Confirmar Pago</h1>
            <p className={styles.sub}>Revisa los detalles antes de procesar.</p>
          </div>

          <div className={styles.confirm_card}>
            <div className={styles.confirm_amount_block}>
              <span>Monto a pagar</span>
              <strong className={styles.confirm_amount}>S/ {fmt(info.cuota)}</strong>
            </div>

            <div className={styles.confirm_divider} />

            <div className={styles.confirm_row}>
              <span>Préstamo</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>Cuota</span>
              <strong>{info.cuotaNumber} de {info.totalCuotas}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>Vencimiento</span>
              <strong>{fmtDate(info.nextPaymentDate)}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>Método</span>
              <strong style={{ color: method?.color }}>{method?.name}</strong>
            </div>

            <div className={styles.confirm_divider} />

            <p className={styles.confirm_disclaimer}>
              Al confirmar autorizas el cargo a tu cuenta vinculada. La operación es irreversible.
            </p>
          </div>

          {error && <p className={styles.error_msg}>{error}</p>}

          <button
            type="button"
            className={styles.primary_btn}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? 'Procesando…' : 'Confirmar y Pagar'}
          </button>
        </div>
      </div>
    )
  }

  // ── Step: éxito ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.success_wrap}>

          <span className={styles.success_icon}>
            <IconCheck />
          </span>

          <h1 className={styles.success_title}>¡Pago Realizado!</h1>
          <p className={styles.success_sub}>
            Tu cuota {info.cuotaNumber} fue pagada exitosamente.
          </p>

          <div className={styles.receipt_card}>
            <div className={styles.receipt_row}>
              <span>Monto</span>
              <strong>S/ {fmt(info.cuota)}</strong>
            </div>
            <div className={styles.receipt_row}>
              <span>Método</span>
              <strong>{method?.name}</strong>
            </div>
            <div className={styles.receipt_row}>
              <span>Préstamo</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.receipt_divider} />
            <div className={styles.receipt_row}>
              <span>Referencia</span>
              <strong className={styles.receipt_ref}>{referenceNumber}</strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.primary_btn}
            onClick={onSuccess}
          >
            Volver a Mis Préstamos
          </button>
        </div>
      </div>
    </div>
  )
}
