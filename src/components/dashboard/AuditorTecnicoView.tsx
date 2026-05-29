import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconShield, IconCheck } from './icons'
import styles from './AuditorTecnicoView.module.css'
import { getApplication } from '../../services/application.service'
import { updateEvaluation } from '../../services/evaluation.service'

const ALL_LOG_LINES = [
  { time: '14:22:01', text: 'Iniciando protocolo de seguridad SSL (TLS 1.3)...', type: 'normal' as const },
  { time: '14:22:03', text: 'Validando kernel del sistema operativo: Linux/Darwin compatible...', type: 'verified' as const, tag: 'VERIFICADO' },
  { time: '14:22:05', text: 'Escaneando hardware certificado por OEM... S/N: JM-9928-X', type: 'normal' as const },
  { time: '14:22:08', text: 'Verificando integridad de memoria flash: 4096MB analizados', type: 'normal' as const },
  { time: '14:22:12', text: 'Calculando valor residual de mercado dinámico (S/)...', type: 'active' as const },
  { time: '14:22:12', text: 'Conectando con servidores de Jemacash Perú... Latencia 12ns', type: 'normal' as const },
  { time: '14:22:14', text: 'Descargando bloques del auditor: 89% completado...', type: 'normal' as const },
]

export function AuditorTecnicoView({
  onBack,
  onComplete,
  applicationId,
}: {
  onBack: () => void
  onComplete: () => void
  applicationId?: string | null
}) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [approving, setApproving] = useState(false)

  async function handleViewResults() {
    if (!applicationId) { onComplete(); return }
    setApproving(true)
    try {
      const app = await getApplication(applicationId)
      await updateEvaluation(applicationId, { status: 'approved', approved_amount: app.amount })
    } catch {
      // evaluation may already be approved — proceed regardless
    } finally {
      setApproving(false)
    }
    onComplete()
  }

  useEffect(() => {
    const target = 65
    let current = 0
    const step = () => {
      current += 1
      setProgress(current)
      if (current < target) setTimeout(step, 28)
    }
    setTimeout(step, 300)
  }, [])

  useEffect(() => {
    if (visibleLines >= ALL_LOG_LINES.length) return
    const t = setTimeout(() => setVisibleLines((n) => n + 1), visibleLines === 0 ? 400 : 500)
    return () => clearTimeout(t)
  }, [visibleLines])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [visibleLines])

  const circumference = 2 * Math.PI * 54
  const dash = (progress / 100) * circumference

  return (
    <div className={styles.aud_page}>

      <header className={styles.aud_header}>
        <span className={styles.aud_brand}>Jemacash</span>
        <button type="button" className={styles.aud_back_btn} onClick={onBack}>{t('auditor.back')}</button>
      </header>

      <div className={styles.aud_layout}>

        {/* ── Main panel ─────────────────────────────────── */}
        <div className={styles.aud_main}>

          {/* Ring + title */}
          <div className={styles.aud_hero_card}>
            <div className={styles.aud_ring_wrap} aria-label={`Progreso: ${progress}%`}>
              <svg className={styles.aud_ring_svg} viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#d9f0da" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r="54"
                  fill="none"
                  stroke="#0f7d3f"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  transform="rotate(-90 64 64)"
                  style={{ transition: 'stroke-dasharray 0.08s linear' }}
                />
              </svg>
              <div className={styles.aud_ring_label}>
                <strong>{progress}%</strong>
                <span>{t('auditor.syncing')}</span>
              </div>
            </div>

            <div className={styles.aud_hero_copy}>
              <h1>{t('auditor.title')}</h1>
              <p>{t('auditor.desc')}</p>
            </div>
          </div>

          {/* Terminal */}
          <div className={styles.aud_terminal}>
            <div className={styles.aud_term_header}>
              <div className={styles.aud_term_dots}>
                <span className={styles.dot_red} />
                <span className={styles.dot_yellow} />
                <span className={styles.dot_green_dot} />
              </div>
              <span className={styles.aud_term_title}>LIVE KERNEL DIAGNOSTIC • v4.2.0-STABLE</span>
            </div>
            <div className={styles.aud_term_body} ref={terminalRef}>
              {ALL_LOG_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${styles.aud_log_line} ${line.type === 'active' ? styles.aud_log_active : ''}`}>
                  <span className={styles.aud_log_time}>{line.time}</span>
                  <span className={styles.aud_log_sep}>&gt;</span>
                  <span className={`${styles.aud_log_text} ${line.type === 'active' ? styles.aud_log_text_active : ''}`}>
                    {line.text}
                  </span>
                  {line.type === 'verified' && (
                    <span className={styles.aud_verified_tag}>{line.tag}</span>
                  )}
                </div>
              ))}
              {visibleLines < ALL_LOG_LINES.length && (
                <span className={styles.aud_cursor}>█</span>
              )}
              {visibleLines >= ALL_LOG_LINES.length && (
                <button type="button" className={styles.aud_results_btn} onClick={handleViewResults} disabled={approving}>
                  {approving ? t('auditor.processing') : t('auditor.viewResults')}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── Right sidebar ──────────────────────────────── */}
        <aside className={styles.aud_sidebar}>

          {/* Software 100% Seguro */}
          <div className={styles.aud_secure_card}>
            <span className={styles.aud_secure_icon}><IconShield /></span>
            <h3>{t('auditor.secure.title')}</h3>
            <p>{t('auditor.secure.desc')}</p>
            <ul className={styles.aud_secure_list}>
              {([
                t('auditor.secure.noPhotos'),
                t('auditor.secure.encryption'),
                t('auditor.secure.autoDestroy'),
              ]).map((item) => (
                <li key={item}>
                  <span className={styles.aud_check}><IconCheck /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Estimación */}
          <div className={styles.aud_estimate_card}>
            <div className={styles.aud_est_head}>
              <span className={styles.aud_est_label}>{t('auditor.estimate.label')}</span>
              <span className={styles.tasa_badge}>{t('auditor.estimate.preferential')}</span>
            </div>
            <strong className={styles.aud_est_amount}>S/ 4,250 <span>PEN</span></strong>
            <p className={styles.aud_est_sub}>{t('auditor.estimate.maxValue')}</p>
            <div className={styles.aud_est_state}>
              <span>{t('auditor.estimate.status')}</span>
              <strong>{t('auditor.estimate.statusValue')}</strong>
            </div>
          </div>

          {/* Shield promo */}
          <div className={styles.aud_shield_card}>
            <div className={styles.aud_shield_visual} aria-hidden="true">
              <span>⊙</span>
            </div>
            <span className={styles.aud_shield_label}>{t('auditor.shield')}</span>
          </div>

        </aside>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className={styles.aud_footer}>
          <strong className={styles.aud_footer_brand}>Jemacash</strong>
          <span>{t('auditor.footer')}</span>
          <div className={styles.aud_footer_links}>
            <button type="button" className={styles.aud_footer_link}>{t('footer.privacy')}</button>
            <button type="button" className={styles.aud_footer_link}>{t('footer.terms')}</button>
            <button type="button" className={styles.aud_footer_link}>Legal</button>
          </div>
        </footer>

      </div>
    </div>
  )
}
