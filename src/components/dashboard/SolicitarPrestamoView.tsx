import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconChart,
  IconShield,
  IconDocument,
  IconPlus,
} from './icons'
import styles from './SolicitarPrestamoView.module.css'
import { useLocaleFormat } from '../../utils/tz'
import { createApplication, submitApplication } from '../../services/application.service'
import { getGuarantees } from '../../services/guarantee.service'
import type { Guarantee } from '../../types/api.types'

type Plazo = 12 | 24 | 36 | 48

const TASA_MENSUAL = 0.0125
const MIN_AMOUNT = 100
const PLAZO_MIN_AMOUNT: Record<number, number> = { 12: 0, 24: 4000, 36: 4000, 48: 4000 }
const MAX_AMOUNT = 50000
const SEGURO = 15

function calcCuota(monto: number, meses: Plazo): number {
  const r = TASA_MENSUAL
  const n = meses
  return (monto * r) / (1 - Math.pow(1 + r, -n))
}

function formatSoles(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M0 19h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 19l1-2h4l1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SolicitarPrestamoView({
  onBack,
  onContinue,
  onAddGuarantee,
}: {
  onBack: () => void
  onContinue: (applicationId: string) => void
  onAddGuarantee: () => void
}) {
  const { t } = useTranslation()
  const { fmtMonthShort } = useLocaleFormat()
  const [amount, setAmount] = useState(15000)
  const [plazo, setPlazo] = useState<Plazo>(12)
  const [selectedGuaranteeId, setSelectedGuaranteeId] = useState<string | null>(null)
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [loadingGuarantees, setLoadingGuarantees] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getGuarantees()
      .then((gs) => setGuarantees(gs.filter((g) => g.status === 'active')))
      .catch(() => {})
      .finally(() => setLoadingGuarantees(false))
  }, [])

  const selectedGuarantee = guarantees.find((g) => g.id === selectedGuaranteeId) ?? null

  const dynamicMax = selectedGuarantee
    ? Math.floor(Number(selectedGuarantee.ai_max_loan) || Number(selectedGuarantee.ai_resale_value) * 0.8 || Number(selectedGuarantee.estimated_value) * 0.8 || MAX_AMOUNT)
    : MAX_AMOUNT
  const dynamicMin = MIN_AMOUNT

  useEffect(() => {
    if (selectedGuarantee) {
      const max = Math.floor(Number(selectedGuarantee.ai_max_loan) || Number(selectedGuarantee.ai_resale_value) * 0.8 || Number(selectedGuarantee.estimated_value) * 0.8 || MAX_AMOUNT)
      if (amount > max) setAmount(max)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuaranteeId])

  useEffect(() => {
    if (plazo !== 12 && amount < 4000) setPlazo(12)
  }, [amount, plazo])

  const cuota = amount > 0 ? calcCuota(amount, plazo) : 0
  const pct = dynamicMax > dynamicMin
    ? ((amount - dynamicMin) / (dynamicMax - dynamicMin)) * 100
    : 0
  const dynamicStep = dynamicMax <= 1000 ? 10 : dynamicMax <= 5000 ? 50 : dynamicMax <= 20000 ? 100 : 500

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const app = await createApplication({
        amount,
        term_months: plazo,
        ...(selectedGuaranteeId ? { guarantee_id: selectedGuaranteeId } : {}),
      })
      await submitApplication(app.id)
      onContinue(app.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la solicitud.')
      setLoading(false)
    }
  }

  // Tentative schedule month labels
  const scheduleMonths = Array.from({ length: Math.min(2, plazo) }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() + i + 1)
    return fmtMonthShort(d)
  })

  return (
    <div className={styles.sol_layout}>

      {/* ── Left panel ─────────────────────────────────── */}
      <div className={styles.sol_main}>
        <div className={styles.sol_header}>
          <div>
            <h1 className={styles.sol_title}>{t('solicitar.title')}</h1>
            <p className={styles.view_sub}>{t('solicitar.subtitle')}</p>
          </div>
          <button type="button" className={styles.sol_back_btn} onClick={onBack} disabled={loading}>
            {t('solicitar.back')}
          </button>
        </div>

        {/* Simulador */}
        <div className={styles.sol_card}>
          <div className={styles.sol_card_head}>
            <div className={styles.sol_card_title}>
              <span className={styles.sec_card_icon}><IconChart /></span>
              <h2>{t('solicitar.simulator.title')}</h2>
            </div>
            <span className={styles.tasa_badge}>{t('solicitar.simulator.badge')}</span>
          </div>

          <div className={styles.sol_amount_row}>
            <span className={styles.sol_amount_label}>{t('solicitar.simulator.amountLabel')}</span>
            <strong className={styles.sol_amount_value}>S/ {amount.toLocaleString('es-PE')}</strong>
          </div>

          {selectedGuarantee && (
            <p style={{ fontSize: '0.78rem', color: '#4a7c59', marginBottom: '0.5rem' }}
              dangerouslySetInnerHTML={{ __html: t('solicitar.simulator.maxAvailable', { max: dynamicMax.toLocaleString('es-PE') }) }}
            />
          )}

          <div className={styles.sol_slider_wrap}>
            <input
              type="range"
              min={dynamicMin}
              max={dynamicMax}
              step={dynamicStep}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={styles.sol_slider}
              style={{ '--pct': `${pct}%` } as React.CSSProperties}
              disabled={loading}
            />
            <div className={styles.sol_slider_labels}>
              <span>S/ {dynamicMin.toLocaleString('es-PE')}</span>
              <span>S/ {dynamicMax.toLocaleString('es-PE')}</span>
            </div>
          </div>


          <div className={styles.sol_plazo_section}>
            <span className={styles.sol_plazo_label}>{t('solicitar.simulator.termLabel')}</span>
            <div className={styles.sol_plazo_pills}>
              {([12, 24, 36, 48] as Plazo[]).map((m) => {
                const minRequired = PLAZO_MIN_AMOUNT[m] ?? 0
                const plazoDisabled = loading || amount < minRequired
                return (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.sol_plazo_pill} ${plazo === m ? styles.sol_plazo_pill_active : ''} ${plazoDisabled && m !== 12 ? styles.sol_plazo_pill_disabled : ''}`}
                    onClick={() => !plazoDisabled && setPlazo(m)}
                    disabled={plazoDisabled}
                    title={plazoDisabled && m !== 12 ? `Disponible desde S/ 4,000` : undefined}
                  >
                    {t('solicitar.simulator.months', { m })}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gestión de Garantías */}
        <div className={styles.sol_card}>
          <div className={styles.sol_card_head}>
            <div className={styles.sol_card_title}>
              <span className={styles.sec_card_icon}><IconShield /></span>
              <h2>{t('solicitar.guarantees.title')}</h2>
            </div>
            <span className={styles.sol_card_hint}>{t('solicitar.guarantees.hint')}</span>
          </div>

          {loadingGuarantees ? (
            <p style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
              {t('solicitar.guarantees.loading')}
            </p>
          ) : guarantees.length === 0 ? (
            <div style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                {t('solicitar.guarantees.empty')}
              </p>
              <button
                type="button"
                className={styles.sol_garantia_new}
                onClick={onAddGuarantee}
                disabled={loading}
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <span className={styles.sol_garantia_new_icon}><IconPlus /></span>
                <strong>{t('solicitar.guarantees.registerTech')}</strong>
              </button>
            </div>
          ) : (
            <div className={styles.sol_garantias_grid}>
              {guarantees.map((g) => {
                const isSelected = selectedGuaranteeId === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`${styles.sol_garantia_card} ${isSelected ? styles.sol_garantia_selected : ''}`}
                    onClick={() => setSelectedGuaranteeId(isSelected ? null : g.id)}
                    disabled={loading}
                  >
                    {isSelected && (
                      <span className={styles.sol_garantia_check_badge} aria-label={t('solicitar.guarantees.selected')}>
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    <span className={`${styles.sol_garantia_icon} ${styles.sol_garantia_icon_blue}`}>
                      <IconLaptop />
                    </span>
                    <strong>{g.name}</strong>
                    <p>
                      {g.condition ? `${g.condition.charAt(0).toUpperCase() + g.condition.slice(1)} · ` : ''}
                      {(() => {
                        const v = Number(g.ai_resale_value) || Number(g.estimated_value) || 0
                        return v > 0 ? `S/ ${v.toLocaleString('es-PE')}` : 'Pendiente de valuación IA'
                      })()}
                    </p>
                    <span className={styles.sol_garantia_cta}>
                      {isSelected ? t('solicitar.guarantees.selected') : t('solicitar.guarantees.select')}
                    </span>
                  </button>
                )
              })}

              <button
                type="button"
                className={styles.sol_garantia_new}
                onClick={onAddGuarantee}
                disabled={loading}
              >
                <span className={styles.sol_garantia_new_icon}><IconPlus /></span>
                <strong>{t('solicitar.guarantees.addNew')}</strong>
              </button>
            </div>
          )}

        </div>

        {/* Advisory banner */}
        <div className={styles.sol_advisory}>
          <div className={styles.sol_advisory_copy}>
            <h3>{t('solicitar.advisory.title')}</h3>
            <p>{t('solicitar.advisory.desc')}</p>
          </div>
          <button type="button" className={styles.sol_advisory_btn}>{t('solicitar.advisory.btn')}</button>
        </div>
      </div>

      {/* ── Right sidebar ──────────────────────────────── */}
      <aside className={styles.sol_sidebar}>
        <div className={styles.sol_summary_card}>
          <div className={styles.sol_summary_head}>
            <span className={styles.sol_summary_icon}><IconDocument /></span>
            <div>
              <strong>{t('solicitar.summary.title')}</strong>
              <span>{t('solicitar.summary.preparation')}</span>
            </div>
          </div>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_summary_rows}>
            <div className={styles.sol_summary_row}>
              <span>{t('solicitar.summary.amountLabel')}</span>
              <strong>S/ {formatSoles(amount)}</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>{t('solicitar.summary.termLabel')}</span>
              <strong>{plazo} meses</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>{t('solicitar.summary.rateLabel')}</span>
              <strong>{(TASA_MENSUAL * 100).toFixed(2)}%</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>{t('solicitar.summary.insurance')}</span>
              <strong>S/ {formatSoles(SEGURO)}</strong>
            </div>
          </div>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_cuota_block}>
            <span>{t('solicitar.summary.monthlyQuota')}</span>
            <strong>S/{formatSoles(cuota)}</strong>
          </div>
          <p className={styles.sol_cuota_note}>{t('solicitar.summary.note')}</p>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_schedule}>
            <span className={styles.sol_schedule_label}>{t('solicitar.summary.schedule')}</span>
            {scheduleMonths.map((m, i) => (
              <div key={m} className={styles.sol_schedule_row}>
                <span className={`${styles.sol_dot} ${i === 0 ? styles.sol_dot_dark : styles.sol_dot_mid}`} />
                <span>{t('solicitar.summary.scheduleQuota', { i: i + 1, month: m })}</span>
                <strong>S/ {Math.round(cuota).toLocaleString('es-PE')}</strong>
              </div>
            ))}
            <div className={styles.sol_schedule_row}>
              <span className={styles.sol_dot_light} />
              <span className={styles.sol_schedule_rest}>{t('solicitar.summary.remaining', { count: plazo - 2 })}</span>
            </div>
          </div>

          {!selectedGuaranteeId && !loadingGuarantees && (
            <p style={{ fontSize: '0.8rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '0.55rem 0.75rem' }}>
              {t('solicitar.summary.selectGuarantee')}
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
          )}

          <button
            type="button"
            className={styles.sol_submit_btn}
            onClick={handleSubmit}
            disabled={loading || !selectedGuaranteeId}
          >
            {loading ? t('solicitar.submitting') : t('solicitar.submit')}
          </button>

          <p className={styles.sol_terms}>
            {t('solicitar.terms')}{' '}
            <button type="button" className={styles.sol_terms_link}>{t('solicitar.termsLink')}</button>
            {' '}{t('solicitar.andPrivacy')}{' '}
            <button type="button" className={styles.sol_terms_link}>{t('solicitar.privacyLink')}</button>
          </p>
        </div>

        <div className={styles.sol_sbs_badge}>
          <span className={styles.sol_sbs_icon}><IconShield /></span>
          <div>
            <span>{t('solicitar.sbs')}</span>
            <strong>SBS Perú</strong>
          </div>
        </div>
      </aside>
    </div>
  )
}
