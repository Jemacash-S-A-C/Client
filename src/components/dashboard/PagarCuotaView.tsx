import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './PagarCuotaView.module.css'
import { useLocaleFormat } from '../../utils/tz'
import { createPayment, mpPreference } from '../../services/payment.service'
import type { PaymentMethod } from '../../types/api.types'

const IS_MP_MOCK = !import.meta.env.VITE_MP_PUBLIC_KEY ||
  (import.meta.env.VITE_MP_PUBLIC_KEY as string).includes('REEMPLAZAR')

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
  nameKey: string
  descKey: string
  color: string
  icon: () => React.ReactElement
  soon?: boolean
}

const METHODS: MethodOption[] = [
  { id: 'mercadopago', nameKey: 'pagar.method.mercadopago.name', descKey: 'pagar.method.mercadopago.desc', color: '#009ee3', icon: IconCard },
  { id: 'bcp',         nameKey: 'pagar.method.bcp.name',         descKey: 'pagar.method.bcp.desc',         color: '#003082', icon: IconBank,  soon: true },
  { id: 'bbva',        nameKey: 'pagar.method.bbva.name',        descKey: 'pagar.method.bbva.desc',        color: '#004B91', icon: IconBank,  soon: true },
  { id: 'yape',        nameKey: 'pagar.method.yape.name',        descKey: 'pagar.method.yape.desc',        color: '#6B21A8', icon: IconPhone, soon: true },
  { id: 'plin',        nameKey: 'pagar.method.plin.name',        descKey: 'pagar.method.plin.desc',        color: '#059669', icon: IconPhone, soon: true },
  { id: 'efectivo',    nameKey: 'pagar.method.efectivo.name',    descKey: 'pagar.method.efectivo.desc',    color: '#92400e', icon: IconCash,  soon: true },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const DEFAULT_GRACE_DAYS = 45

/** Returns days overdue (positive) or days until due (negative/zero). */
function daysOverdue(dueDate: Date): number {
  const diffMs = Date.now() - dueDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// ── Overdue warning banner ─────────────────────────────────────────────────────

function OverdueBanner({ nextPaymentDate }: { nextPaymentDate: Date }) {
  const { t } = useTranslation()
  const overdue = daysOverdue(nextPaymentDate)
  if (overdue <= 0) return null

  const daysLeft = DEFAULT_GRACE_DAYS - overdue
  const isCritical = daysLeft <= 10

  return (
    <div className={`${styles.overdue_banner} ${isCritical ? styles.overdue_banner_critical : styles.overdue_banner_warn}`}>
      <svg className={styles.overdue_icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className={styles.overdue_body}>
        {daysLeft > 0 ? (
          <>
            <strong>{t('pagar.overdue.title', { days: overdue })}</strong>
            <span>{t('pagar.overdue.desc')}</span>
            <span className={styles.overdue_days_left}>
              {t('pagar.overdue.daysLeft', { days: daysLeft })}
            </span>
          </>
        ) : (
          <>
            <strong>{t('pagar.overdue.criticalTitle')}</strong>
            <span>{t('pagar.overdue.criticalDesc')}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Mock card form (used when no real MP key is configured) ────────────────────

interface MockFormProps {
  info: LoanPaymentInfo
  userEmail: string
  onSuccess: (ref: string) => void
  onError: (msg: string) => void
}

function MockCardForm({ info, userEmail, onSuccess, onError }: MockFormProps) {
  const { t } = useTranslation()
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
      const payment = await createPayment({
        application_id: info.applicationId,
        amount: info.cuota,
        payment_method: 'mercadopago' as PaymentMethod,
        cuota_number: info.cuotaNumber,
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
        <label className={styles.mock_label}>{t('pagar.mock.cardNumber')}</label>
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
          <label className={styles.mock_label}>{t('pagar.mock.expiry')}</label>
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
          <label className={styles.mock_label}>{t('pagar.mock.cvv')}</label>
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
        <label className={styles.mock_label}>{t('pagar.mock.name')}</label>
        <input
          className={styles.mock_input}
          type="text"
          placeholder={t('pagar.mock.namePlaceholder')}
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
        {loading ? t('pagar.mock.processing') : t('pagar.mock.submit', { amount: fmt(info.cuota) })}
      </button>
    </form>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = 'metodo' | 'confirmar' | 'mp-form' | 'exito'

export function PagarCuotaView({ info, userEmail, onBack, onSuccess }: Props) {
  const { t } = useTranslation()
  const { fmtLong } = useLocaleFormat()
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

  async function handleMpRedirect() {
    setLoading(true)
    setError(null)
    try {
      const { checkoutUrl, isMock } = await mpPreference({
        application_id: info.applicationId,
        amount: info.cuota,
        cuota_number: info.cuotaNumber,
        email: userEmail,
      })
      if (isMock) {
        // Mock mode: skip redirect, register payment directly
        const payment = await createPayment({
          application_id: info.applicationId,
          amount: info.cuota,
          payment_method: 'mercadopago' as PaymentMethod,
          cuota_number: info.cuotaNumber,
        })
        handleMpSuccess(payment.reference_number)
        return
      }
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear el link de pago.'
      handleMpError(msg)
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
            {t('pagar.back')}
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>{t('pagar.title')}</h1>
            <p className={styles.sub}>{t('pagar.subtitle')}</p>
          </div>

          <div className={styles.loan_summary}>
            <div className={styles.summary_row}>
              <span>{t('pagar.summary.loan')}</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.summary_divider} />
            <div className={styles.summary_row}>
              <span>{t('pagar.summary.quotaOf', { num: info.cuotaNumber, total: info.totalCuotas })}</span>
              <strong className={styles.summary_amount}>S/ {fmt(info.cuota)}</strong>
            </div>
            <div className={styles.summary_row}>
              <span>{t('pagar.summary.dueDate')}</span>
              <strong>{fmtLong(info.nextPaymentDate)}</strong>
            </div>
          </div>

          <OverdueBanner nextPaymentDate={info.nextPaymentDate} />

          <h2 className={styles.methods_title}>{t('pagar.methods.title')}</h2>
          <div className={styles.methods_grid}>
            {METHODS.map((m) => {
              const Icon = m.icon
              const selected = selectedMethod === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.method_card} ${selected ? styles.method_card_selected : ''} ${m.soon ? styles.method_card_soon : ''}`}
                  onClick={() => !m.soon && setSelectedMethod(m.id)}
                  disabled={m.soon}
                  style={selected ? { '--method-color': m.color } as React.CSSProperties : undefined}
                >
                  <span className={styles.method_icon} style={{ background: `${m.color}18`, color: m.color }}>
                    <Icon />
                  </span>
                  <div className={styles.method_info}>
                    <strong>{t(m.nameKey)}</strong>
                    <span>{t(m.descKey)}</span>
                  </div>
                  {m.soon
                    ? <span className={styles.method_soon_badge}>{t('pagar.method.comingSoon')}</span>
                    : selected && (
                        <span className={styles.method_check} style={{ background: m.color }}>
                          <IconCheck />
                        </span>
                      )
                  }
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
            {t('pagar.continue')}
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
            {t('pagar.changeMethod')}
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>{t('pagar.cardTitle')}</h1>
            <p className={styles.sub}>{t('pagar.cardSub', { num: info.cuotaNumber, total: info.totalCuotas, label: info.loanLabel })}</p>
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
            <div className={styles.mp_redirect_wrap}>
              <div className={styles.mp_redirect_info}>
                <svg className={styles.mp_redirect_icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#009ee3" strokeWidth="1.8" />
                  <path d="M8 12h8M14 9l3 3-3 3" stroke="#009ee3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>{t('pagar.mp.redirectDesc')}</p>
              </div>
              <div className={styles.mp_amount_row}>
                <span>{t('pagar.confirm.amount')}</span>
                <strong>S/ {fmt(info.cuota)}</strong>
              </div>
              <button
                type="button"
                className={styles.primary_btn}
                disabled={loading}
                onClick={handleMpRedirect}
              >
                {loading ? t('pagar.mp.redirecting') : t('pagar.mp.redirectBtn')}
              </button>
            </div>
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
            {t('pagar.changeMethod')}
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>{t('pagar.confirm.title')}</h1>
            <p className={styles.sub}>{t('pagar.confirm.subtitle')}</p>
          </div>

          <div className={styles.confirm_card}>
            <div className={styles.confirm_amount_block}>
              <span>{t('pagar.confirm.amount')}</span>
              <strong className={styles.confirm_amount}>S/ {fmt(info.cuota)}</strong>
            </div>
            <div className={styles.confirm_divider} />
            <div className={styles.confirm_row}>
              <span>{t('pagar.confirm.loan')}</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>{t('pagar.confirm.quota')}</span>
              <strong>{info.cuotaNumber} de {info.totalCuotas}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>{t('pagar.confirm.dueDate')}</span>
              <strong>{fmtLong(info.nextPaymentDate)}</strong>
            </div>
            <div className={styles.confirm_row}>
              <span>{t('pagar.confirm.method')}</span>
              <strong style={{ color: method?.color }}>{method ? t(method.nameKey) : ''}</strong>
            </div>
            <div className={styles.confirm_divider} />
            <p className={styles.confirm_disclaimer}>{t('pagar.confirm.disclaimer')}</p>
          </div>

          {error && <p className={styles.error_msg}>{error}</p>}

          <button
            type="button"
            className={styles.primary_btn}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? t('pagar.confirm.processing') : t('pagar.confirm.submit')}
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

          <h1 className={styles.success_title}>{t('pagar.success.title')}</h1>
          <p className={styles.success_sub}>{t('pagar.success.sub', { num: info.cuotaNumber })}</p>

          <div className={styles.receipt_card}>
            <div className={styles.receipt_row}>
              <span>{t('pagar.success.amount')}</span>
              <strong>S/ {fmt(info.cuota)}</strong>
            </div>
            <div className={styles.receipt_row}>
              <span>{t('pagar.success.method')}</span>
              <strong>{method ? t(method.nameKey) : ''}</strong>
            </div>
            <div className={styles.receipt_row}>
              <span>{t('pagar.success.loan')}</span>
              <strong>{info.loanLabel}</strong>
            </div>
            <div className={styles.receipt_divider} />
            <div className={styles.receipt_row}>
              <span>{t('pagar.success.ref')}</span>
              <strong className={styles.receipt_ref}>{referenceNumber}</strong>
            </div>
          </div>

          <button type="button" className={styles.primary_btn} onClick={onSuccess}>
            {t('pagar.success.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
