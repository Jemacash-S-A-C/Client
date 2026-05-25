import { useState, useEffect } from 'react'
import {
  IconChart,
  IconShield,
  IconDocument,
  IconCheck,
  IconPlus,
} from './icons'
import styles from './SolicitarPrestamoView.module.css'
import { createApplication, submitApplication } from '../../services/application.service'
import { getGuarantees } from '../../services/guarantee.service'
import type { Guarantee } from '../../types/api.types'

type Plazo = 12 | 24 | 36 | 48

const TASA_MENSUAL = 0.0125
const MIN_AMOUNT = 1000
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

  const cuota = calcCuota(amount, plazo)
  const pct = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100

  const selectedGuarantee = guarantees.find((g) => g.id === selectedGuaranteeId) ?? null

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
    return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
  })

  return (
    <div className={styles.sol_layout}>

      {/* ── Left panel ─────────────────────────────────── */}
      <div className={styles.sol_main}>
        <div className={styles.sol_header}>
          <div>
            <h1 className={styles.sol_title}>Solicita tu Préstamo</h1>
            <p className={styles.view_sub}>Configura tu crédito ideal con las tasas más competitivas del mercado.</p>
          </div>
          <button type="button" className={styles.sol_back_btn} onClick={onBack} disabled={loading}>
            ← Volver
          </button>
        </div>

        {/* Simulador */}
        <div className={styles.sol_card}>
          <div className={styles.sol_card_head}>
            <div className={styles.sol_card_title}>
              <span className={styles.sec_card_icon}><IconChart /></span>
              <h2>Simulador de Préstamo</h2>
            </div>
            <span className={styles.tasa_badge}>TASA PREFERENCIAL</span>
          </div>

          <div className={styles.sol_amount_row}>
            <span className={styles.sol_amount_label}>MONTO A SOLICITAR</span>
            <strong className={styles.sol_amount_value}>S/ {amount.toLocaleString('es-PE')}</strong>
          </div>

          <div className={styles.sol_slider_wrap}>
            <input
              type="range"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={styles.sol_slider}
              style={{ '--pct': `${pct}%` } as React.CSSProperties}
              disabled={loading}
            />
            <div className={styles.sol_slider_labels}>
              <span>S/ {MIN_AMOUNT.toLocaleString('es-PE')}</span>
              <span>S/ {MAX_AMOUNT.toLocaleString('es-PE')}</span>
            </div>
          </div>

          <div className={styles.sol_plazo_section}>
            <span className={styles.sol_plazo_label}>PLAZO DE PAGO (MESES)</span>
            <div className={styles.sol_plazo_pills}>
              {([12, 24, 36, 48] as Plazo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.sol_plazo_pill} ${plazo === m ? styles.sol_plazo_pill_active : ''}`}
                  onClick={() => setPlazo(m)}
                  disabled={loading}
                >
                  {m} Meses
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gestión de Garantías */}
        <div className={styles.sol_card}>
          <div className={styles.sol_card_head}>
            <div className={styles.sol_card_title}>
              <span className={styles.sec_card_icon}><IconShield /></span>
              <h2>Gestión de Garantías</h2>
            </div>
            <span className={styles.sol_card_hint}>Selecciona el respaldo para tu solicitud</span>
          </div>

          {loadingGuarantees ? (
            <p style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Cargando garantías…
            </p>
          ) : guarantees.length === 0 ? (
            <div style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                No tienes garantías registradas. Registra un dispositivo de tecnología para usarlo como respaldo.
              </p>
              <button
                type="button"
                className={styles.sol_garantia_new}
                onClick={onAddGuarantee}
                disabled={loading}
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <span className={styles.sol_garantia_new_icon}><IconPlus /></span>
                <strong>Registrar Garantía de Tecnología</strong>
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
                    <span className={`${styles.sol_garantia_icon} ${styles.sol_garantia_icon_blue}`}>
                      <IconLaptop />
                    </span>
                    <strong>{g.name}</strong>
                    <p>
                      {g.condition ? `${g.condition.charAt(0).toUpperCase() + g.condition.slice(1)} · ` : ''}
                      Valor: S/ {Number(g.estimated_value).toLocaleString('es-PE')}
                    </p>
                    <span className={styles.sol_garantia_cta}>
                      {isSelected ? <><IconCheck /> Seleccionado</> : 'Seleccionar →'}
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
                <strong>Agregar Nueva Garantía</strong>
              </button>
            </div>
          )}

          {selectedGuarantee && (
            <div style={{
              margin: '0 0 0.5rem',
              padding: '0.6rem 1rem',
              background: '#f0f9f2',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#0f7d3f',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <IconCheck />
              Garantía seleccionada: <strong>{selectedGuarantee.name}</strong>
            </div>
          )}
        </div>

        {/* Advisory banner */}
        <div className={styles.sol_advisory}>
          <div className={styles.sol_advisory_copy}>
            <h3>¿Necesitas asesoría personalizada?</h3>
            <p>Nuestros asesores expertos están listos para ayudarte a elegir el plan que mejor se adapte a tus necesidades financieras.</p>
          </div>
          <button type="button" className={styles.sol_advisory_btn}>Hablar con un Experto</button>
        </div>
      </div>

      {/* ── Right sidebar ──────────────────────────────── */}
      <aside className={styles.sol_sidebar}>
        <div className={styles.sol_summary_card}>
          <div className={styles.sol_summary_head}>
            <span className={styles.sol_summary_icon}><IconDocument /></span>
            <div>
              <strong>Resumen de Solicitud</strong>
              <span>En preparación</span>
            </div>
          </div>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_summary_rows}>
            <div className={styles.sol_summary_row}>
              <span>Monto solicitado</span>
              <strong>S/ {formatSoles(amount)}</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>Plazo</span>
              <strong>{plazo} meses</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>Tasa Mensual (TEA)</span>
              <strong>{(TASA_MENSUAL * 100).toFixed(2)}%</strong>
            </div>
            <div className={styles.sol_summary_row}>
              <span>Seguro de desgravamen</span>
              <strong>S/ {formatSoles(SEGURO)}</strong>
            </div>
          </div>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_cuota_block}>
            <span>CUOTA MENSUAL</span>
            <strong>S/{formatSoles(cuota)}</strong>
          </div>
          <p className={styles.sol_cuota_note}>*Monto aproximado sujeto a evaluación crediticia</p>

          <div className={styles.sol_summary_sep} />

          <div className={styles.sol_schedule}>
            <span className={styles.sol_schedule_label}>CRONOGRAMA TENTATIVO</span>
            {scheduleMonths.map((m, i) => (
              <div key={m} className={styles.sol_schedule_row}>
                <span className={`${styles.sol_dot} ${i === 0 ? styles.sol_dot_dark : styles.sol_dot_mid}`} />
                <span>Cuota 0{i + 1} - {m}</span>
                <strong>S/ {Math.round(cuota).toLocaleString('es-PE')}</strong>
              </div>
            ))}
            <div className={styles.sol_schedule_row}>
              <span className={styles.sol_dot_light} />
              <span className={styles.sol_schedule_rest}>... {plazo - 2} cuotas restantes</span>
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
          )}

          <button
            type="button"
            className={styles.sol_submit_btn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Procesando…' : 'Continuar con la Solicitud'}
          </button>

          <p className={styles.sol_terms}>
            Al hacer clic en continuar, aceptas nuestros{' '}
            <button type="button" className={styles.sol_terms_link}>Términos y Condiciones</button>
            {' '}y{' '}
            <button type="button" className={styles.sol_terms_link}>Políticas de Privacidad.</button>
          </p>
        </div>

        <div className={styles.sol_sbs_badge}>
          <span className={styles.sol_sbs_icon}><IconShield /></span>
          <div>
            <span>CERTIFICADO POR</span>
            <strong>SBS Perú</strong>
          </div>
        </div>
      </aside>
    </div>
  )
}
