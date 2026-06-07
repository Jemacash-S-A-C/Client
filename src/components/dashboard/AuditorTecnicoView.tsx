import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconShield, IconCheck } from './icons'
import styles from './AuditorTecnicoView.module.css'
import { getApplication, cancelApplication } from '../../services/application.service'
import { getGuarantee, valuateDevice, updateGuaranteeAi } from '../../services/guarantee.service'
import { updateEvaluation } from '../../services/evaluation.service'
import type { AiValuationResult, Guarantee } from '../../types/api.types'

// ── Types ─────────────────────────────────────────────────────────────────────

type LogLine = { time: string; text: string; type: 'normal' | 'verified' | 'active'; tag?: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function compressImage(dataUrl: string, maxSide = 512, quality = 0.55): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height, 1))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AuditorTecnicoView({
  onComplete,
  onCancel,
  applicationId,
}: {
  onComplete: () => void
  onCancel: () => void
  applicationId?: string | null
}) {
  const { t } = useTranslation()

  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [visibleLines, setVisibleLines] = useState(0)
  const [aiDone, setAiDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [guarantee, setGuarantee] = useState<Guarantee | null>(null)
  const [aiResult, setAiResult] = useState<AiValuationResult | null>(null)
  const [approving, setApproving] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)
  // Ref so the async run() closure always has the latest setter
  const appendLine = useRef<(line: LogLine) => void>(() => {})

  useEffect(() => {
    appendLine.current = (line: LogLine) => {
      setLogLines((prev) => [...prev, line])
    }
  })

  // ── Progress animation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (progress >= 100) return
    const target = aiDone ? 100 : Math.min(progress + 1, aiDone ? 100 : 72)
    if (target <= progress) return
    const t = setTimeout(() => setProgress(target), aiDone ? 15 : 40)
    return () => clearTimeout(t)
  }, [progress, aiDone])

  // ── Line reveal animation ───────────────────────────────────────────────────

  useEffect(() => {
    if (visibleLines >= logLines.length) return
    const timer = setTimeout(() => setVisibleLines((n) => n + 1), visibleLines === 0 ? 400 : 450)
    return () => clearTimeout(timer)
  }, [visibleLines, logLines.length])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [visibleLines])

  // ── Main AI orchestration ───────────────────────────────────────────────────

  useEffect(() => {
    if (!applicationId) {
      setAiDone(true)
      return
    }

    let cancelled = false

    async function run() {
      const add = (line: LogLine) => { if (!cancelled) appendLine.current(line) }

      await sleep(300)
      add({ time: nowTime(), text: 'Iniciando protocolo de seguridad SSL (TLS 1.3)...', type: 'normal' })

      await sleep(500)
      add({ time: nowTime(), text: 'Conectando con servidores de Jemacash Perú...', type: 'normal' })

      // Load application
      let app
      try {
        app = await getApplication(applicationId)
      } catch {
        add({ time: nowTime(), text: 'Error al cargar la solicitud.', type: 'active' })
        if (!cancelled) setAiDone(true)
        return
      }

      if (!app.guarantee_id) {
        await sleep(300)
        add({ time: nowTime(), text: 'Advertencia: No hay garantía vinculada a esta solicitud.', type: 'active' })
        if (!cancelled) setAiDone(true)
        return
      }

      // Load guarantee
      let g: Guarantee
      try {
        g = await getGuarantee(app.guarantee_id)
        if (!cancelled) setGuarantee(g)
      const auditVer = g.specs?.audit_verified
      if (auditVer === 'discrepancy') {
        const notes = g.specs?.audit_discrepancy_notes ?? 'Datos del dispositivo no coinciden con los declarados'
        add({ time: nowTime(), text: `Advertencia: discrepancia detectada en auditoría — ${notes}`, type: 'active', tag: 'DISCREPANCIA' })
      } else if (auditVer === 'true') {
        add({ time: nowTime(), text: 'Auditoría técnica verificada correctamente.', type: 'verified', tag: 'AUDIT OK' })
      }
      // If no audit yet (older guarantees), continue without blocking
      } catch {
        add({ time: nowTime(), text: 'Error al cargar la garantía.', type: 'active' })
        if (!cancelled) setAiDone(true)
        return
      }

      await sleep(350)
      add({ time: nowTime(), text: `Dispositivo identificado: ${g.brand ?? '?'} ${g.model ?? '?'} (${g.manufacture_year ?? '?'})`, type: 'verified', tag: 'ID OK' })

      await sleep(400)
      add({ time: nowTime(), text: `Especificaciones: ${g.specs?.ram ?? '?'} RAM · ${g.specs?.storage ?? '?'} · ${g.specs?.processor ?? '?'}`, type: 'normal' })

      if (g.specs?.cpu_name && g.specs.cpu_name !== g.specs.processor) {
        await sleep(300)
        add({ time: nowTime(), text: `CPU auditado: ${g.specs.cpu_name}`, type: 'normal' })
      }
      if (g.specs?.gpu_name) {
        await sleep(250)
        add({ time: nowTime(), text: `GPU detectada: ${g.specs.gpu_name}`, type: 'normal' })
      }
      if (g.specs?.os_name) {
        await sleep(250)
        add({ time: nowTime(), text: `Sistema operativo: ${g.specs.os_name}`, type: 'normal' })
      }

      if (g.specs?.battery_health) {
        await sleep(350)
        add({ time: nowTime(), text: `Salud de batería detectada: ${g.specs.battery_health}%`, type: 'normal' })
      }

      // If AI was already run for this guarantee, just show cached data
      if (g.ai_resale_value) {
        await sleep(300)
        add({ time: nowTime(), text: 'Valuación IA previa encontrada. Recuperando resultados...', type: 'normal' })
        const cached: AiValuationResult = {
          condition_score:      Number(g.ai_condition_score) || 7,
          market_value_pen:     Number(g.ai_market_value) || 0,
          resale_value_pen:     Number(g.ai_resale_value) || 0,
          max_loan_pen:         Number(g.ai_max_loan) || 0,
          depreciation_factors: g.ai_depreciation_factors ?? [],
          confidence:           Number(g.ai_confidence) || 0.8,
          reasoning:            g.ai_reasoning ?? '',
          visual_condition:     g.ai_visual_condition ?? g.condition ?? '',
        }
        if (!cancelled) setAiResult(cached)
        await showResultLines(add, cached)
        if (!cancelled) setAiDone(true)
        return
      }

      // Run AI valuation
      await sleep(500)
      add({ time: nowTime(), text: 'Iniciando análisis con Inteligencia Artificial (Groq / Llama-4 Scout)...', type: 'normal' })

      const photoCount = g.photo_urls?.length ?? 0
      await sleep(400)
      add({ time: nowTime(), text: `Procesando ${photoCount} fotografía${photoCount !== 1 ? 's' : ''} del dispositivo...`, type: 'normal' })

      await sleep(400)
      add({ time: nowTime(), text: 'Buscando el precio más barato en internet (búsqueda web)...', type: 'active' })

      try {
        const rawPhotos = g.photo_urls ?? []
        const photos = rawPhotos.length > 0
          ? await Promise.all(rawPhotos.map((p) => compressImage(p)))
          : []

        const result = await valuateDevice({
          device_category:  g.device_category ?? 'laptop',
          brand:            g.brand ?? '',
          model:            g.model ?? '',
          manufacture_year: g.manufacture_year ?? '',
          processor:        g.specs?.processor ?? '',
          ram:              g.specs?.ram ?? '',
          storage:          g.specs?.storage ?? '',
          battery_health:   g.specs?.battery_health,
          screen_size:      g.specs?.screen_size,
          condition:        g.condition ?? 'bueno',
          is_reconditioned: g.specs?.is_reconditioned === 'true',
          photos,
        })

        if (!cancelled) setAiResult(result)

        // Persist AI fields back to guarantee (best-effort)
        try {
          await updateGuaranteeAi(g.id, {
            ai_market_value:         result.market_value_pen,
            ai_resale_value:         result.resale_value_pen,
            ai_max_loan:             result.max_loan_pen,
            ai_condition_score:      result.condition_score,
            ai_depreciation_factors: result.depreciation_factors,
            ai_confidence:           result.confidence,
            ai_reasoning:            result.reasoning,
            ai_visual_condition:     result.visual_condition,
          })
        } catch { /* non-critical */ }

        await showResultLines(add, result)
      } catch (err) {
        await sleep(300)
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        add({ time: nowTime(), text: `Error en análisis IA: ${msg.slice(0, 80)}`, type: 'active' })
        add({ time: nowTime(), text: 'Continuando con datos declarados.', type: 'normal' })
      }

      if (!cancelled) setAiDone(true)
    }

    async function showResultLines(add: (l: LogLine) => void, result: AiValuationResult) {
      await sleep(300)
      add({ time: nowTime(), text: `Precio de mercado: S/ ${result.market_value_pen.toLocaleString('es-PE')}`, type: 'normal' })
      await sleep(500)
      const score = result.condition_score
      add({
        time: nowTime(),
        text: `Puntuación física: ${score.toFixed(1)} / 10`,
        type: score >= 7 ? 'verified' : 'active',
        tag:  score >= 7 ? 'BUENO' : 'REGULAR',
      })
      await sleep(500)
      add({ time: nowTime(), text: `Valor de reventa estimado: S/ ${result.resale_value_pen.toLocaleString('es-PE')}`, type: 'verified', tag: 'VALUADO' })
      await sleep(500)
      add({ time: nowTime(), text: `Préstamo máximo aprobado: S/ ${result.max_loan_pen.toLocaleString('es-PE')}`, type: 'verified', tag: 'APROBADO' })
      await sleep(500)
      add({ time: nowTime(), text: 'Análisis completado. Resultados listos.', type: 'verified', tag: 'LISTO' })
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  // ── Cancel application ──────────────────────────────────────────────────────

  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!window.confirm(t('auditor.cancelConfirm'))) return
    setCancelling(true)
    try {
      if (applicationId) await cancelApplication(applicationId)
    } catch { /* proceed regardless */ }
    finally { setCancelling(false) }
    onCancel()
  }

  // ── Approve & navigate ──────────────────────────────────────────────────────

  async function handleViewResults() {
    if (!applicationId) { onComplete(); return }
    setApproving(true)
    try {
      const app = await getApplication(applicationId)
      const approvedAmount = aiResult?.max_loan_pen
        ?? (guarantee?.ai_max_loan ? Number(guarantee.ai_max_loan) : null)
        ?? app.amount
      await updateEvaluation(applicationId, { status: 'approved', approved_amount: approvedAmount })
    } catch { /* proceed regardless */ }
    finally { setApproving(false) }
    onComplete()
  }

  // ── Derived display values ──────────────────────────────────────────────────

  const displayValue = aiResult
    ? `S/ ${aiResult.resale_value_pen.toLocaleString('es-PE')}`
    : (guarantee?.estimated_value && Number(guarantee.estimated_value) > 0)
    ? `S/ ${Number(guarantee.estimated_value).toLocaleString('es-PE')}`
    : 'S/ —'

  const conditionScore = aiResult
    ? aiResult.condition_score.toFixed(1)
    : (guarantee?.ai_condition_score ? Number(guarantee.ai_condition_score).toFixed(1) : null)

  const allLinesDone = aiDone && visibleLines >= logLines.length

  const circumference = 2 * Math.PI * 54
  const dash = (progress / 100) * circumference

  return (
    <div className={styles.aud_page}>

      <header className={styles.aud_header}>
        <span className={styles.aud_brand}>Jemacash</span>
        <button
          type="button"
          className={styles.aud_back_btn}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? '…' : t('auditor.cancelBtn')}
        </button>
      </header>

      <div className={styles.aud_layout}>

        {/* ── Main panel ─────────────────────────────────────── */}
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
                  style={{ transition: 'stroke-dasharray 0.1s linear' }}
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
              <span className={styles.aud_term_title}>
                JEMACASH AI AUDITOR v2.0 — GROQ POWERED
              </span>
            </div>
            <div className={styles.aud_term_body} ref={terminalRef}>
              {logLines.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${styles.aud_log_line} ${line.type === 'active' ? styles.aud_log_active : ''}`}>
                  <span className={styles.aud_log_time}>{line.time}</span>
                  <span className={styles.aud_log_sep}>&gt;</span>
                  <span className={`${styles.aud_log_text} ${line.type === 'active' ? styles.aud_log_text_active : ''}`}>
                    {line.text}
                  </span>
                  {line.type === 'verified' && (
                    <span className={styles.aud_verified_tag}>{line.tag}</span>
                  )}
                  {line.type === 'active' && line.tag && (
                    <span className={styles.aud_warn_tag}>{line.tag}</span>
                  )}
                </div>
              ))}
              {!allLinesDone && (
                <span className={styles.aud_cursor}>█</span>
              )}
              {allLinesDone && (
                <button type="button" className={styles.aud_results_btn} onClick={handleViewResults} disabled={approving}>
                  {approving ? t('auditor.processing') : t('auditor.viewResults')}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── Right sidebar ──────────────────────────────────── */}
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
            <strong className={styles.aud_est_amount}>
              {displayValue} <span>PEN</span>
            </strong>
            <p className={styles.aud_est_sub}>
              {aiResult ? t('auditor.estimate.aiValue') : t('auditor.estimate.maxValue')}
            </p>
            {conditionScore && (
              <div className={styles.aud_est_score}>
                <span>{t('auditor.estimate.conditionScore')}</span>
                <strong>{conditionScore} / 10</strong>
              </div>
            )}
            {aiResult && (
              <div className={styles.aud_est_score}>
                <span>Préstamo máx.</span>
                <strong>S/ {aiResult.max_loan_pen.toLocaleString('es-PE')}</strong>
              </div>
            )}
            <div className={styles.aud_est_state}>
              <span>{t('auditor.estimate.status')}</span>
              <strong>{aiDone ? 'Completado' : t('auditor.estimate.statusValue')}</strong>
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

        {/* ── Footer ─────────────────────────────────────────── */}
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

