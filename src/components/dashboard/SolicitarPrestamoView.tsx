import { useState } from 'react'
import {
  IconChart,
  IconShield,
  IconDocument,
  IconCar,
  IconPlus,
} from './icons'
import styles from './SolicitarPrestamoView.module.css'
import { createApplication, submitApplication } from '../../services/application.service'

type Plazo = 12 | 24 | 36 | 48
type GarantiaId = 'tecnologia' | 'vehiculos' | null

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

const GARANTIAS = [
  {
    id: 'tecnologia' as const,
    label: 'Tecnología',
    desc: 'Laptops, Smartphones de alta gama y equipos IT.',
    icon: IconDocument,
    color: 'blue',
  },
  {
    id: 'vehiculos' as const,
    label: 'Vehículos',
    desc: 'Autos, motos y camionetas de fabricación reciente.',
    icon: IconCar,
    color: 'green',
  },
]

export function SolicitarPrestamoView({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: (applicationId: string) => void
}) {
  const [amount, setAmount] = useState(15000)
  const [plazo, setPlazo] = useState<Plazo>(12)
  const [garantia, setGarantia] = useState<GarantiaId>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cuota = calcCuota(amount, plazo)
  const pct = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      // 1. Create draft application
      const app = await createApplication({ amount, term_months: plazo })
      // 2. Submit → backend auto-creates evaluation (pending)
      await submitApplication(app.id)
      // 3. Advance to audit view with real application id
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

          <div className={styles.sol_garantias_grid}>
            {GARANTIAS.map((g) => {
              const GIcon = g.icon
              const selected = garantia === g.id
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`${styles.sol_garantia_card} ${selected ? styles.sol_garantia_selected : ''}`}
                  onClick={() => setGarantia(selected ? null : g.id)}
                  disabled={loading}
                >
                  <span className={`${styles.sol_garantia_icon} ${styles[`sol_garantia_icon_${g.color}`]}`}>
                    <GIcon />
                  </span>
                  <strong>{g.label}</strong>
                  <p>{g.desc}</p>
                  <span className={styles.sol_garantia_cta}>
                    {selected ? '✓ Seleccionado' : 'Seleccionar →'}
                  </span>
                </button>
              )
            })}

            <div className={styles.sol_garantia_new}>
              <span className={styles.sol_garantia_new_icon}><IconPlus /></span>
              <strong>Agregar Nueva Garantía</strong>
            </div>
          </div>
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
