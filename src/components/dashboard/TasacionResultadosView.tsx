import { useEffect, useState } from 'react'
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
  { icon: IconCpu,     label: 'PROCESADOR',        value: 'Apple M2 Chip' },
  { icon: IconMemory,  label: 'MEMORIA RAM',        value: '16GB Unified' },
  { icon: IconStorage, label: 'ALMACENAMIENTO',     value: '512GB SSD' },
  { icon: IconBattery, label: 'ESTADO DE BATERÍA',  value: 'Salud 94%' },
] as const

export function TasacionResultadosView({
  onBack,
  onAccept,
  applicationId,
}: {
  onBack: () => void
  onAccept: () => void
  applicationId?: string | null
}) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

  useEffect(() => {
    if (!applicationId) return
    getEvaluation(applicationId).then(setEvaluation).catch(() => {/* fallback to static display */})
  }, [applicationId])

  const displayAmount = evaluation?.approved_amount
    ? Number(evaluation.approved_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '4,850.00'
  return (
    <div className={styles.tas_page}>

      {/* ── Minimal header ─────────────────────────────── */}
      <header className={styles.tas_header}>
        <span className={styles.tas_brand}>Jemacash</span>
        <button type="button" className={styles.tas_back_btn} onClick={onBack}>← Volver</button>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className={styles.tas_main}>
        <span className={styles.tas_scan_badge}>Escaneo Completado</span>

        <h1 className={styles.tas_title}>
          Resultados de tu <span className={styles.tas_title_green}>Tasación Editorial</span>.
        </h1>
        <p className={styles.tas_subtitle}>
          Nuestro sistema ha verificado los componentes de tu dispositivo con precisión quirúrgica.
          Aquí están los detalles técnicos para tu respaldo financiero.
        </p>

        <div className={styles.tas_content_grid}>

          {/* Left */}
          <div className={styles.tas_left}>
            <div className={styles.tas_specs_grid}>
              {DEVICE_SPECS.map((spec) => {
                const SpecIcon = spec.icon
                return (
                  <div key={spec.label} className={styles.tas_spec_card}>
                    <div className={styles.tas_spec_top}>
                      <span className={styles.tas_spec_icon}><SpecIcon /></span>
                      <span className={styles.tas_spec_check}><IconCheckCircle /></span>
                    </div>
                    <span className={styles.tas_spec_label}>{spec.label}</span>
                    <strong className={styles.tas_spec_value}>{spec.value}</strong>
                  </div>
                )
              })}
            </div>

            <div className={styles.tas_device_card}>
              <img src={officeImg} alt="MacBook Air M2" className={styles.tas_device_img} />
              <div className={styles.tas_device_overlay}>
                <span>DISPOSITIVO IDENTIFICADO</span>
                <strong>MacBook Air M2 (2022)</strong>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className={styles.tas_right}>

            {/* Value card */}
            <div className={styles.tas_value_card}>
              <div className={styles.tas_value_bg_icon} aria-hidden="true">⬡</div>
              <span className={styles.tas_value_label}>VALOR DE RESPALDO FINAL</span>
              <strong className={styles.tas_value_amount}>S/<span>{displayAmount}</span></strong>
              <p>Oferta garantizada por 24 horas basada en el estado actual y valor de mercado editorial.</p>
              <button type="button" className={styles.tas_accept_btn} onClick={onAccept}>
                Aceptar Oferta y Firmar Contrato
              </button>
              <div className={styles.tas_value_perks}>
                <span>⚡ Desembolso en 15 min</span>
                <span>🔒 Trámite 100% Seguro</span>
              </div>
            </div>

            {/* Security seals */}
            <div className={styles.tas_seals_card}>
              <h3>Sellos de Seguridad &amp; Confianza</h3>
              <div className={styles.tas_seals_grid}>
                <div className={styles.tas_seal}>
                  <span className={styles.tas_seal_icon}><IconShield /></span>
                  <div>
                    <strong>REGULADO</strong>
                    <span>SBS Perú</span>
                  </div>
                </div>
                <div className={styles.tas_seal}>
                  <span className={styles.tas_seal_icon}><IconShield /></span>
                  <div>
                    <strong>PROTECCIÓN</strong>
                    <span>SSL 256-bit</span>
                  </div>
                </div>
              </div>
              <p>Jemacash es una marca de servicios financieros registrados ante la SBS. Operamos bajo las más estrictas normas de transparencia y seguridad editorial.</p>
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
          <button type="button" className={styles.tas_footer_link}>PRIVACIDAD</button>
          <button type="button" className={styles.tas_footer_link}>TÉRMINOS</button>
          <button type="button" className={styles.tas_footer_link}>REGULACIONES SBS</button>
        </nav>
        <div className={styles.tas_footer_icons}>
          <span className={styles.tas_footer_icon}>⊙</span>
          <span className={styles.tas_footer_icon}>∞</span>
        </div>
      </footer>

    </div>
  )
}
