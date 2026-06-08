import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconShield } from './icons'
import styles from './TasacionResultadosView.module.css'
import { getEvaluation } from '../../services/evaluation.service'
import { getGuarantee } from '../../services/guarantee.service'
import { getApplication, cancelApplication } from '../../services/application.service'
import type { Evaluation, Guarantee } from '../../types/api.types'

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconCpu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconMemory() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 7V5M10 7V5M13 7V5M17 7V5M7 17v2M10 17v2M13 17v2M17 17v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 11h2M11 11h2M16 11h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconStorage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="7" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5V7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconBattery() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="17" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 10v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 11v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#0f7d3f" />
      <path d="m8 12 3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TasacionResultadosView({
  onCancel,
  onAccept,
  applicationId,
}: {
  onCancel: () => void
  onAccept: (amount: number | null) => void
  applicationId?: string | null
}) {
  const { t } = useTranslation()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!window.confirm(t('tasacion.cancelConfirm'))) return
    setCancelling(true)
    try {
      if (applicationId) await cancelApplication(applicationId)
    } catch { /* proceed regardless */ }
    finally { setCancelling(false) }
    onCancel()
  }

  useEffect(() => {
    if (!applicationId) return
    getEvaluation(applicationId).then(setEvaluation).catch(() => {})
    getApplication(applicationId).then(async (app) => {
      if (app.guarantee_id) {
        try {
          const g = await getGuarantee(app.guarantee_id)
          setGuarantee(g)
        } catch { /* no-op */ }
      }
    }).catch(() => {})
  }, [applicationId])

  // ── Derived values ────────────────────────────────────────────────────────

  const approvedAmount = evaluation?.approved_amount != null
    ? Number(evaluation.approved_amount)
    : (guarantee?.ai_max_loan ? Number(guarantee.ai_max_loan) : null)

  const displayAmount = approvedAmount != null
    ? approvedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '—'

  const deviceName = guarantee
    ? `${guarantee.brand ?? ''} ${guarantee.model ?? ''} (${guarantee.manufacture_year ?? ''})`
    : 'MacBook Air M2 (2022)'

  const specs = guarantee?.specs ? [
    { icon: IconCpu,     labelKey: 'processor', value: guarantee.specs.processor ?? '—' },
    { icon: IconMemory,  labelKey: 'ram',        value: guarantee.specs.ram ?? '—' },
    { icon: IconStorage, labelKey: 'storage',    value: guarantee.specs.storage ?? '—' },
    { icon: IconBattery, labelKey: 'battery',    value: guarantee.specs.battery_health ? `Salud ${guarantee.specs.battery_health}%` : '—' },
  ] : [
    { icon: IconCpu,     labelKey: 'processor', value: 'Apple M2 Chip' },
    { icon: IconMemory,  labelKey: 'ram',        value: '16GB Unified' },
    { icon: IconStorage, labelKey: 'storage',    value: '512GB SSD' },
    { icon: IconBattery, labelKey: 'battery',    value: 'Salud 94%' },
  ]

  const aiScore = guarantee?.ai_condition_score ? Number(guarantee.ai_condition_score) : null
  const aiFactors: string[] = guarantee?.ai_depreciation_factors ?? []
  const aiReasoning = guarantee?.ai_reasoning ?? ''
  const aiConfidence = guarantee?.ai_confidence ? Math.round(Number(guarantee.ai_confidence) * 100) : null
  const aiMarket = guarantee?.ai_market_value ? Number(guarantee.ai_market_value) : null
  const aiResale = guarantee?.ai_resale_value ? Number(guarantee.ai_resale_value) : null
  const aiMaxLoan = guarantee?.ai_max_loan ? Number(guarantee.ai_max_loan) : null
  const aiVisualCondition = guarantee?.ai_visual_condition ?? null

  const visualConditionLabel: Record<string, string> = {
    excelente: 'Excelente', bueno: 'Bueno', regular: 'Regular', malo: 'Malo',
  }
  const visualConditionColor: Record<string, string> = {
    excelente: '#15803d', bueno: '#0f7d3f', regular: '#ca8a04', malo: '#dc2626',
  }
  const visualConditionBg: Record<string, string> = {
    excelente: '#dcfce7', bueno: '#f0fdf4', regular: '#fef9c3', malo: '#fee2e2',
  }

  return (
    <div className={styles.tas_page}>

      {/* ── Minimal header ─────────────────────────────── */}
      <header className={styles.tas_header}>
        <span className={styles.tas_brand}>Jemacash</span>
        <button
          type="button"
          className={styles.tas_back_btn}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? '…' : t('tasacion.cancelBtn')}
        </button>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className={styles.tas_main}>

        {/* Title */}
        <div className={styles.tas_title_row}>
          <div>
            <span className={styles.tas_scan_badge}>{t('tasacion.scanBadge')}</span>
            <h1 className={styles.tas_title}>
              {t('tasacion.title')} <span className={styles.tas_title_green}>{t('tasacion.titleGreen')}</span>.
            </h1>
            <p className={styles.tas_subtitle}>{t('tasacion.subtitle')}</p>
          </div>
          <div className={styles.tas_status_chips}>
            <div className={styles.tas_chip}>
              <small>Motor IA</small>
              <strong>Groq Llama-4</strong>
            </div>
            <div className={styles.tas_chip}>
              <small>Confianza</small>
              <strong>{aiConfidence !== null ? `${aiConfidence}%` : '—'}</strong>
            </div>
            <div className={`${styles.tas_chip} ${styles.tas_chip_ok}`}>
              <small>Estado</small>
              <strong>Aprobado</strong>
            </div>
          </div>
        </div>

        {/* ── Device identity row ── */}
        <div className={styles.tas_device_row}>
          <div className={styles.tas_device_row_icon}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M0 19h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.tas_device_row_body}>
            <span className={styles.tas_device_hero_tag}>{t('tasacion.device.label')}</span>
            <strong className={styles.tas_device_hero_name}>{deviceName}</strong>
          </div>
          {aiVisualCondition && (
            <span
              className={styles.tas_device_hero_condition}
              style={{
                color: visualConditionColor[aiVisualCondition] ?? '#0f7d3f',
                background: visualConditionBg[aiVisualCondition] ?? '#f0fdf4',
              }}
            >
              Estado físico: {visualConditionLabel[aiVisualCondition] ?? aiVisualCondition}
            </span>
          )}
          {aiScore !== null && (
            <div className={styles.tas_device_hero_score}>
              <div className={styles.tas_device_hero_bar}>
                <div
                  className={styles.tas_device_hero_bar_fill}
                  style={{
                    width: `${(aiScore / 10) * 100}%`,
                    background: aiScore >= 8 ? '#16a34a' : aiScore >= 5 ? '#ca8a04' : '#dc2626',
                  }}
                />
              </div>
              <span style={{ color: aiScore >= 8 ? '#15803d' : aiScore >= 5 ? '#854d0e' : '#991b1b', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                {aiScore.toFixed(1)} / 10
              </span>
            </div>
          )}
        </div>

        {/* ── Specs row ── */}
        <div className={styles.tas_specs_row}>
          {specs.map((spec) => {
            const SpecIcon = spec.icon
            return (
              <div key={spec.labelKey} className={styles.tas_spec_item}>
                <span className={styles.tas_spec_item_icon}><SpecIcon /></span>
                <div className={styles.tas_spec_item_body}>
                  <small>{t(`tasacion.spec.${spec.labelKey}`)}</small>
                  <strong>{spec.value}</strong>
                </div>
                <span className={styles.tas_spec_item_check}><IconCheckCircle /></span>
              </div>
            )
          })}
        </div>

        {/* ── Content grid ── */}
        <div className={styles.tas_content_grid}>

          {/* Left: AI analysis */}
          <div className={styles.tas_left}>
            {(aiMarket !== null || aiResale !== null || aiMaxLoan !== null || aiFactors.length > 0 || aiReasoning) && (
              <div className={styles.tas_ai_card}>

                <div className={styles.tas_ai_header}>
                  <span className={styles.tas_ai_badge}>Análisis de mercado</span>
                </div>

                {(aiMarket !== null || aiResale !== null || aiMaxLoan !== null) && (
                  <div className={styles.tas_ai_values}>
                    {aiMarket !== null && (
                      <div className={styles.tas_ai_value_item}>
                        <span>Valor de mercado</span>
                        <strong>S/ {aiMarket.toLocaleString('es-PE')}</strong>
                      </div>
                    )}
                    {aiResale !== null && (
                      <div className={styles.tas_ai_value_item}>
                        <span>Valor de tasación</span>
                        <strong>S/ {aiResale.toLocaleString('es-PE')}</strong>
                      </div>
                    )}
                    {aiMaxLoan !== null && (
                      <div className={styles.tas_ai_value_item} style={{ borderColor: '#86efac' }}>
                        <span>Préstamo máximo</span>
                        <strong style={{ color: '#0f7d3f' }}>S/ {aiMaxLoan.toLocaleString('es-PE')}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.tas_ai_source}>
                  <span className={styles.tas_ai_source_label}>Base del análisis</span>
                  <span className={styles.tas_ai_source_desc}>
                    Inteligencia de mercado · Segunda mano peruana<br />
                    <span className={styles.tas_ai_source_markets}>OLX Perú · Mercado Libre · Facebook Marketplace</span>
                  </span>
                </div>

                {aiFactors.length > 0 && (
                  <div className={styles.tas_ai_factors}>
                    <span className={styles.tas_ai_factors_label}>Observaciones del dispositivo</span>
                    <div className={styles.tas_ai_factors_list}>
                      {aiFactors.map((f, i) => (
                        <span key={i} className={styles.tas_ai_factor_tag}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {aiReasoning && (
                  <div className={styles.tas_ai_reasoning_wrap}>
                    <span className={styles.tas_ai_reasoning_label}>Conclusión del análisis</span>
                    <p className={styles.tas_ai_reasoning}><em>{aiReasoning}</em></p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: value + seals */}
          <div className={styles.tas_right}>

            <div className={styles.tas_value_card}>
              <div className={styles.tas_value_body}>
                <span className={styles.tas_value_badge}>Oferta aprobada</span>
                <span className={styles.tas_value_label}>{t('tasacion.valueLabel')}</span>
                <strong className={styles.tas_value_amount}>S/<span>{displayAmount}</span></strong>
                <p>{t('tasacion.offer.desc')}</p>
                <button type="button" className={styles.tas_accept_btn} onClick={() => onAccept(approvedAmount)}>
                  {t('tasacion.accept')}
                </button>
              </div>
            </div>

            <div className={styles.tas_seals_card}>
              <div className={styles.tas_seal}>
                <span className={styles.tas_seal_icon}><IconShield /></span>
                <div>
                  <strong>{t('tasacion.seal.regulated')}</strong>
                  <span>{t('tasacion.seal.regulatedSub')}</span>
                </div>
              </div>
              <div className={styles.tas_seal}>
                <span className={styles.tas_seal_icon}><IconShield /></span>
                <div>
                  <strong>{t('tasacion.seal.protection')}</strong>
                  <span>{t('tasacion.seal.protectionSub')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className={styles.tas_footer}>
        <div className={styles.tas_footer_left}>
          <strong>Jemacash</strong>
          <span>© 2024 Jemacash. Tasación editorial Instantánea.</span>
        </div>
        <nav className={styles.tas_footer_links}>
          <button type="button" className={styles.tas_footer_link}>{t('tasacion.footer.privacy')}</button>
          <button type="button" className={styles.tas_footer_link}>{t('tasacion.footer.terms')}</button>
          <button type="button" className={styles.tas_footer_link}>{t('tasacion.footer.regulation')}</button>
        </nav>
        <div className={styles.tas_footer_icons}>
          <span className={styles.tas_footer_icon}>⊙</span>
          <span className={styles.tas_footer_icon}>∞</span>
        </div>
      </footer>

    </div>
  )
}
