import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import officeImg from '../../assets/representative_images/main_page.png'
import { IconShield } from './icons'
import styles from './TasacionResultadosView.module.css'
import { getEvaluation } from '../../services/evaluation.service'
import type { Evaluation } from '../../types/api.types'

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

const DEVICE_SPECS = [
  { icon: IconCpu,     labelKey: 'processor', value: 'Apple M2 Chip' },
  { icon: IconMemory,  labelKey: 'ram',        value: '16GB Unified' },
  { icon: IconStorage, labelKey: 'storage',    value: '512GB SSD' },
  { icon: IconBattery, labelKey: 'battery',    value: 'Salud 94%' },
] as const

export function TasacionResultadosView({
  onBack,
  onAccept,
  applicationId,
}: {
  onBack: () => void
  onAccept: (amount: number | null) => void
  applicationId?: string | null
}) {
  const { t } = useTranslation()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

  useEffect(() => {
    if (!applicationId) return
    getEvaluation(applicationId).then(setEvaluation).catch(() => {/* no-op */})
  }, [applicationId])

  const displayAmount = evaluation?.approved_amount != null
    ? Number(evaluation.approved_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '—'
  return (
    <div className={styles.tas_page}>

      {/* ── Minimal header ─────────────────────────────── */}
      <header className={styles.tas_header}>
        <span className={styles.tas_brand}>Jemacash</span>
        <button type="button" className={styles.tas_back_btn} onClick={onBack}>{t('tasacion.back')}</button>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className={styles.tas_main}>
        <span className={styles.tas_scan_badge}>{t('tasacion.scanBadge')}</span>

        <h1 className={styles.tas_title}>
          {t('tasacion.title')} <span className={styles.tas_title_green}>{t('tasacion.titleGreen')}</span>.
        </h1>
        <p className={styles.tas_subtitle}>{t('tasacion.subtitle')}</p>

        <div className={styles.tas_content_grid}>

          {/* Left */}
          <div className={styles.tas_left}>
            <div className={styles.tas_specs_grid}>
              {DEVICE_SPECS.map((spec) => {
                const SpecIcon = spec.icon
                return (
                  <div key={spec.labelKey} className={styles.tas_spec_card}>
                    <div className={styles.tas_spec_top}>
                      <span className={styles.tas_spec_icon}><SpecIcon /></span>
                      <span className={styles.tas_spec_check}><IconCheckCircle /></span>
                    </div>
                    <span className={styles.tas_spec_label}>{t(`tasacion.spec.${spec.labelKey}`)}</span>
                    <strong className={styles.tas_spec_value}>{spec.value}</strong>
                  </div>
                )
              })}
            </div>

            <div className={styles.tas_device_card}>
              <img src={officeImg} alt="MacBook Air M2" className={styles.tas_device_img} />
              <div className={styles.tas_device_overlay}>
                <span>{t('tasacion.device.label')}</span>
                <strong>MacBook Air M2 (2022)</strong>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className={styles.tas_right}>

            {/* Value card */}
            <div className={styles.tas_value_card}>
              <div className={styles.tas_value_bg_icon} aria-hidden="true">⬡</div>
              <span className={styles.tas_value_label}>{t('tasacion.valueLabel')}</span>
              <strong className={styles.tas_value_amount}>S/<span>{displayAmount}</span></strong>
              <p>{t('tasacion.offer.desc')}</p>
              <button type="button" className={styles.tas_accept_btn} onClick={() => onAccept(evaluation?.approved_amount ?? null)}>
                {t('tasacion.accept')}
              </button>
              <div className={styles.tas_value_perks}>
                <span>⚡ Desembolso en 15 min</span>
                <span>🔒 Trámite 100% Seguro</span>
              </div>
            </div>

            {/* Security seals */}
            <div className={styles.tas_seals_card}>
              <h3>{t('tasacion.seals.title')}</h3>
              <div className={styles.tas_seals_grid}>
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
              <p>{t('tasacion.seal.desc')}</p>
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
