import { useState } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import type { ICardPaymentFormData, ICardPaymentBrickPayer } from '@mercadopago/sdk-react/esm/bricks/cardPayment/type'
import styles from './PagarCuotaView.module.css'
import { createPayment, mpCharge } from '../../services/payment.service'
import type { PaymentMethod } from '../../types/api.types'

// ── Mercado Pago init ──────────────────────────────────────────────────────────

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? ''
const IS_MP_MOCK = !MP_PUBLIC_KEY || MP_PUBLIC_KEY.includes('REEMPLAZAR')

if (!IS_MP_MOCK) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' })
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LoanPaymentInfo {
  applicationId: string
  loanLabel: string
  cuota: number
  cuotaNumber: number
  totalCuotas: number
  nextPaymentDate: Date
  loanAmount: number
}

interface Props {
  info: LoanPaymentInfo
  userEmail: string
  onBack: () => void
  onSuccess: () => void
}

// ── Icons ──────────────────────────────────────────────────────────────────────

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

function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
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

// ── Payment methods ────────────────────────────────────────────────────────────

interface MethodOption {
  id: PaymentMethod
  name: string
  description: string
  color: string
  icon: () => JSX.Element
}

const METHODS: MethodOption[] = [
  { id: 'mercadopago', name: 'Mercado Pago',  description: 'Visa, Mastercard, Amex y más',    color: '#009ee3', icon: IconCard },
  { id: 'bcp',         name: 'BCP',           description: 'Transferencia desde cuenta BCP',  color: '#003082', icon: IconBank },
  { id: 'bbva',        name: 'BBVA',          description: 'Transferencia desde cuenta BBVA', color: '#004B91', icon: IconBank },
  { id: 'yape',        name: 'Yape',          description: 'Pago instantáneo con Yape',       color: '#6B21A8', icon: IconPhone },
  { id: 'plin',        name: 'Plin',          description: 'Pago instantáneo con Plin',       color: '#059669', icon: IconPhone },
  { id: 'efectivo',    name: 'Efectivo',      description: 'Pago en agencia o agente',        color: '#92400e', icon: IconCash },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Mock card form (used when no real MP key is configured) ────────────────────

interface MockFormProps {
  info: LoanPaymentInfo
  userEmail: string
  onSuccess: (ref: string) => void
  onError: (msg: string) => void
}

function MockCardForm({ info, userEmail, onSuccess, onError }: MockFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payment = await mpCharge({
        application_id: info.applicationId,
        amount: info.cuota,
        cuota_number: info.cuotaNumber,
        token: `mock-${Date.now()}`,
        installments: 1,
        payment_method_id: 'visa',
        email: userEmail,
      })
      onSuccess(payment.reference_number)
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'No se pudo procesar el pago.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 2

  return (
    <form onSubmit={handleSubmit} className={styles.mock_form}>
      <div className={styles.mock_field}>
        <label className={styles.mock_label}>Número de tarjeta</label>
        <input
          className={styles.mock_input}
          type="text"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
          autoComplete="cc-number"
        />
      </div>

      <div className={styles.mock_row}>
        <div className={styles.mock_field}>
          <label className={styles.mock_label}>Vencimiento</label>
          <input
            className={styles.mock_input}
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            autoComplete="cc-exp"
          />
        </div>
        <div className={styles.mock_field}>
          <label className={styles.mock_label}>CVV</label>
          <input
            className={styles.mock_input}
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            autoComplete="cc-csc"
          />
        </div>
      </div>

      <div className={styles.mock_field}>
        <label className={styles.mock_label}>Nombre en la tarjeta</label>
        <input
          className={styles.mock_input}
          type="text"
          placeholder="Como aparece en la tarjeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="cc-name"
        />
      </div>

      <button
        type="submit"
        className={styles.primary_btn}
        disabled={!isValid || loading}
      >
        {loading ? 'Procesando…' : `Pagar S/ ${fmt(info.cuota)}`}
      </button>
    </form>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = 'metodo' | 'confirmar' | 'mp-form' | 'exito'

export function PagarCuotaView({ info, userEmail, onBack, onSuccess }: Props) {
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

  function handleContinue() {
    if (selectedMethod === 'mercadopago') {
      setStep('mp-form')
    } else {
      setStep('confirmar')
    }
  }

  function handleMpSuccess(ref: string) {
    setReferenceNumber(ref)
    setStep('exito')
  }

  function handleMpError(msg: string) {
    setError(msg)
  }

  async function handleMpBrickSubmit(formData: ICardPaymentFormData<ICardPaymentBrickPayer>) {
    setError(null)
    try {
      const payment = await mpCharge({
        application_id: info.applicationId,
        amount: info.cuota,
        cuota_number: info.cuotaNumber,
        token: formData.token,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        email: formData.payer.email ?? userEmail,
      })
      setReferenceNumber(payment.reference_number)
      setStep('exito')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo procesar el pago. Inténtalo de nuevo.'
      setError(msg)
      throw err
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
            onClick={handleContinue}
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  // ── Step: mp-form ────────────────────────────────────────────────────────────

  if (step === 'mp-form') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <button type="button" className={styles.back_btn} onClick={() => { setStep('metodo'); setError(null) }}>
            <IconArrowLeft />
            Cambiar método
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Pago con tarjeta</h1>
            <p className={styles.sub}>Cuota {info.cuotaNumber} de {info.totalCuotas} — {info.loanLabel}</p>
          </div>

          {error && <p className={styles.error_msg}>{error}</p>}

          {IS_MP_MOCK ? (
            <MockCardForm
              info={info}
              userEmail={userEmail}
              onSuccess={handleMpSuccess}
              onError={handleMpError}
            />
          ) : (
            <CardPayment
              initialization={{ amount: info.cuota, payer: { email: userEmail } }}
              onSubmit={handleMpBrickSubmit}
              onError={(err) => setError(err.message ?? 'Error en el formulario de pago.')}
              customization={{
                paymentMethods: { minInstallments: 1, maxInstallments: 1 },
                visual: { style: { theme: 'default' } },
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // ── Step: confirmar (métodos manuales) ───────────────────────────────────────

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

          <button type="button" className={styles.primary_btn} onClick={onSuccess}>
            Volver a Mis Préstamos
          </button>
        </div>
      </div>
    </div>
  )
}
