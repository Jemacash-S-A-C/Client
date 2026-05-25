import { useState } from 'react'
import { createGuarantee } from '../../services/guarantee.service'
import { IconShield, IconCheck } from './icons'
// Reuse the same form styles — structure is identical to the tech flow
import styles from './RegistrarGarantiaTecView.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l1.5-4.5A2 2 0 017.4 5h9.2a2 2 0 011.9 1.5L20 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="2" y="11" width="20" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="6" width="15" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10h4l3 4v3h-7V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconMoto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="19" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 17h3l3-6h4l2 3h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11l2-4h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconVan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="7" width="22" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M1 12h22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="6" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  { id: 'auto',      label: 'Auto',      icon: IconCar   },
  { id: 'camioneta', label: 'Camioneta', icon: IconCar   },
  { id: 'moto',      label: 'Moto',      icon: IconMoto  },
  { id: 'camion',    label: 'Camión',    icon: IconTruck },
  { id: 'minivan',   label: 'Minivan',   icon: IconVan   },
] as const

const CONDITION_OPTIONS = [
  { id: 'excelente', label: 'Excelente', stars: '★★★', desc: 'Sin abolladuras ni daños. Pintura original impecable.' },
  { id: 'bueno',     label: 'Bueno',     stars: '★★',  desc: 'Desgaste mínimo por uso normal. Mecánica al 100%.'   },
  { id: 'regular',   label: 'Regular',   stars: '★',   desc: 'Golpes o rayones visibles. Funcional sin fallas graves.' },
] as const

const TRANSMISSION_OPTIONS = ['Manual', 'Automático', 'CVT', 'Semi-automático'] as const
const FUEL_OPTIONS          = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'GNV'] as const
const YEAR_OPTIONS          = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))

const PHOTO_SLOTS = [
  { id: 'frontal',    label: 'Vista frontal',        desc: 'Frente completo del vehículo con placa visible'       },
  { id: 'trasero',    label: 'Vista trasera',         desc: 'Parte trasera con placa y estado de carrocería'       },
  { id: 'interior',   label: 'Interior / tablero',    desc: 'Panel de instrumentos y kilometraje en pantalla'      },
  { id: 'tarjeta',    label: 'Tarjeta de propiedad',  desc: 'Documento de propiedad vigente, todos los datos visibles' },
] as const

const STEPS = ['Vehículo', 'Características', 'Fotografías', 'Valoración']

// ── Types ─────────────────────────────────────────────────────────────────────

type Step1 = {
  vehicle_category: string
  brand: string
  model: string
  manufacture_year: string
  plate: string
  color: string
}

type Step2 = {
  condition: string
  mileage: string
  transmission: string
  fuel: string
  engine: string
}

type Step3 = { photos: Set<string> }

type Step4 = {
  purchase_price: string
  estimated_value: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldRow({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className={styles.reg_field}>
      <label className={styles.reg_label}>
        {label}{required && <span className={styles.reg_required}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RegistrarGarantiaVehView({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [s1, setS1] = useState<Step1>({
    vehicle_category: '',
    brand: '', model: '', manufacture_year: '', plate: '', color: '',
  })
  const [s2, setS2] = useState<Step2>({
    condition: '', mileage: '', transmission: '', fuel: '', engine: '',
  })
  const [s3, setS3] = useState<Step3>({ photos: new Set() })
  const [s4, setS4] = useState<Step4>({ purchase_price: '', estimated_value: '' })

  // ── Validation ──────────────────────────────────────────────────────────────

  function canAdvance() {
    if (step === 0) return s1.vehicle_category !== '' && s1.brand.trim() !== '' && s1.model.trim() !== '' && s1.manufacture_year !== '' && s1.plate.trim() !== ''
    if (step === 1) return s2.condition !== '' && s2.mileage.trim() !== '' && Number(s2.mileage) >= 0 && s2.transmission !== '' && s2.fuel !== ''
    if (step === 2) return s3.photos.size >= 4
    if (step === 3) return s4.estimated_value.trim() !== '' && Number(s4.estimated_value) > 0
    return false
  }

  function togglePhoto(id: string) {
    setS3(prev => {
      const next = new Set(prev.photos)
      next.has(id) ? next.delete(id) : next.add(id)
      return { photos: next }
    })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const specs: Record<string, string> = {
        mileage:      s2.mileage,
        transmission: s2.transmission,
        fuel:         s2.fuel,
      }
      if (s2.engine) specs.engine = s2.engine
      if (s1.color)  specs.color  = s1.color

      await createGuarantee({
        type:             'vehiculo',
        name:             `${s1.brand} ${s1.model} ${s1.manufacture_year}`.trim(),
        description:      `Placa ${s1.plate}. ${s2.fuel}, ${s2.transmission}. ${s2.mileage} km.`,
        estimated_value:  Number(s4.estimated_value),
        device_category:  s1.vehicle_category,
        brand:            s1.brand,
        model:            s1.model,
        manufacture_year: s1.manufacture_year,
        serial_number:    s1.plate.toUpperCase(),   // plate stored as serial_number
        condition:        s2.condition,
        specs,
        photo_urls: PHOTO_SLOTS
          .filter(p => s3.photos.has(p.id))
          .map(p => `mock://${p.id}`),
      })
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al registrar la garantía.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step renderers ───────────────────────────────────────────────────────────

  function renderStep0() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Selecciona el tipo de vehículo e ingresa los datos de identificación.
          La placa es el dato clave para verificar la titularidad.
        </p>

        <FieldRow label="Tipo de vehículo" required>
          <div className={styles.reg_category_grid}>
            {VEHICLE_CATEGORIES.map(({ id, label, icon: CatIcon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.reg_category_btn} ${s1.vehicle_category === id ? styles.reg_category_active : ''}`}
                onClick={() => setS1(p => ({ ...p, vehicle_category: id }))}
              >
                <span className={styles.reg_cat_icon}><CatIcon /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </FieldRow>

        <div className={styles.reg_two_col}>
          <FieldRow label="Marca" required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: Toyota, Hyundai, Kia…"
              value={s1.brand}
              onChange={e => setS1(p => ({ ...p, brand: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Modelo" required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: Hilux, Tucson, Sportage…"
              value={s1.model}
              onChange={e => setS1(p => ({ ...p, model: e.target.value }))}
            />
          </FieldRow>
        </div>

        <div className={styles.reg_two_col}>
          <FieldRow label="Año de fabricación" required>
            <select
              className={styles.reg_select}
              value={s1.manufacture_year}
              onChange={e => setS1(p => ({ ...p, manufacture_year: e.target.value }))}
            >
              <option value="">Seleccionar año…</option>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Placa de rodaje" required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: ABC-123"
              value={s1.plate}
              onChange={e => setS1(p => ({ ...p, plate: e.target.value.toUpperCase() }))}
              maxLength={8}
            />
          </FieldRow>
        </div>

        <FieldRow label="Color">
          <input
            type="text"
            className={styles.reg_input}
            placeholder="Ej: Blanco, Plata, Rojo…"
            value={s1.color}
            onChange={e => setS1(p => ({ ...p, color: e.target.value }))}
          />
        </FieldRow>

        <div className={styles.reg_info_box}>
          <IconShield />
          <p>La placa de rodaje permite verificar que el vehículo no tenga deudas de tránsito ni esté reportado como robado ante la PNP.</p>
        </div>
      </div>
    )
  }

  function renderStep1() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Describe el estado físico y mecánico del vehículo.
          El kilometraje y el combustible influyen directamente en la tasación.
        </p>

        <FieldRow label="Condición general" required>
          <div className={styles.reg_condition_grid}>
            {CONDITION_OPTIONS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.reg_condition_btn} ${s2.condition === c.id ? styles.reg_condition_active : ''}`}
                onClick={() => setS2(p => ({ ...p, condition: c.id }))}
              >
                <span className={styles.reg_cond_stars}>{c.stars}</span>
                <strong>{c.label}</strong>
                <p>{c.desc}</p>
              </button>
            ))}
          </div>
        </FieldRow>

        <div className={styles.reg_two_col}>
          <FieldRow label="Kilometraje (km)" required>
            <input
              type="number"
              className={styles.reg_input}
              placeholder="Ej: 45000"
              min={0}
              value={s2.mileage}
              onChange={e => setS2(p => ({ ...p, mileage: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Motor (cilindrada)">
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: 2.5L, 1.6L Turbo…"
              value={s2.engine}
              onChange={e => setS2(p => ({ ...p, engine: e.target.value }))}
            />
          </FieldRow>
        </div>

        <FieldRow label="Transmisión" required>
          <div className={styles.reg_pills}>
            {TRANSMISSION_OPTIONS.map(t => (
              <button
                key={t}
                type="button"
                className={`${styles.reg_pill} ${s2.transmission === t ? styles.reg_pill_active : ''}`}
                onClick={() => setS2(p => ({ ...p, transmission: t }))}
              >
                {t}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Combustible" required>
          <div className={styles.reg_pills}>
            {FUEL_OPTIONS.map(f => (
              <button
                key={f}
                type="button"
                className={`${styles.reg_pill} ${s2.fuel === f ? styles.reg_pill_active : ''}`}
                onClick={() => setS2(p => ({ ...p, fuel: f }))}
              >
                {f}
              </button>
            ))}
          </div>
        </FieldRow>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Adjunta fotos claras del vehículo y del documento de propiedad.
          Las imágenes son requeridas para verificar identidad y estado físico.
        </p>

        <div className={styles.reg_photos_grid}>
          {PHOTO_SLOTS.map(slot => {
            const done = s3.photos.has(slot.id)
            return (
              <button
                key={slot.id}
                type="button"
                className={`${styles.reg_photo_card} ${done ? styles.reg_photo_done : ''}`}
                onClick={() => togglePhoto(slot.id)}
              >
                <span className={`${styles.reg_photo_icon} ${done ? styles.reg_photo_icon_done : ''}`}>
                  {done ? <IconCheck /> : <IconCamera />}
                </span>
                <strong>{slot.label}</strong>
                <p>{slot.desc}</p>
                <span className={done ? styles.reg_photo_cargada : styles.reg_photo_pendiente}>
                  {done ? '✓ Foto cargada' : 'Toca para cargar'}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.reg_photos_count}>
          <span className={s3.photos.size >= 4 ? styles.reg_photos_ok : styles.reg_photos_warn}>
            {s3.photos.size} de 4 fotos requeridas
          </span>
        </div>

        <div className={styles.reg_info_box}>
          <IconCamera />
          <p>La tarjeta de propiedad debe estar vigente a nombre del solicitante. Fotos borrosas o parciales pueden retrasar la verificación.</p>
        </div>
      </div>
    )
  }

  function renderStep3() {
    const catLabel = VEHICLE_CATEGORIES.find(c => c.id === s1.vehicle_category)?.label ?? s1.vehicle_category
    const condLabel = CONDITION_OPTIONS.find(c => c.id === s2.condition)?.label ?? s2.condition

    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Indica el valor de mercado estimado del vehículo en su estado actual.
          Este valor determina el monto máximo de crédito disponible.
        </p>

        <div className={styles.reg_two_col}>
          <FieldRow label="Precio de compra original (S/)">
            <input
              type="number"
              className={styles.reg_input}
              placeholder="0.00"
              min={0}
              value={s4.purchase_price}
              onChange={e => setS4(p => ({ ...p, purchase_price: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Valor estimado actual (S/)" required>
            <input
              type="number"
              className={styles.reg_input}
              placeholder="0.00"
              min={0}
              value={s4.estimated_value}
              onChange={e => setS4(p => ({ ...p, estimated_value: e.target.value }))}
            />
          </FieldRow>
        </div>

        <div className={styles.reg_summary}>
          <h3>Resumen de la garantía</h3>
          <div className={styles.reg_summary_grid}>
            <div><span>Tipo</span><strong>{catLabel}</strong></div>
            <div><span>Marca / Modelo</span><strong>{s1.brand} {s1.model}</strong></div>
            <div><span>Año</span><strong>{s1.manufacture_year}</strong></div>
            <div><span>Placa</span><strong>{s1.plate}</strong></div>
            {s1.color && <div><span>Color</span><strong>{s1.color}</strong></div>}
            <div><span>Condición</span><strong>{condLabel}</strong></div>
            <div><span>Kilometraje</span><strong>{Number(s2.mileage).toLocaleString('es-PE')} km</strong></div>
            <div><span>Transmisión</span><strong>{s2.transmission}</strong></div>
            <div><span>Combustible</span><strong>{s2.fuel}</strong></div>
            {s2.engine && <div><span>Motor</span><strong>{s2.engine}</strong></div>}
            <div><span>Fotos adjuntas</span><strong>{s3.photos.size} / 4</strong></div>
          </div>
        </div>

        <div className={styles.reg_legal}>
          <IconShield />
          <p>
            Al registrar esta garantía confirmas que eres el propietario legítimo del vehículo,
            que la información es verídica y autorizas a Jemacash a retenerlo como respaldo
            crediticio en caso de incumplimiento, conforme a la normativa SBS Perú.
          </p>
        </div>

        {submitError && <p role="alert" className={styles.reg_error}>{submitError}</p>}
      </div>
    )
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3]

  return (
    <div className={styles.reg_page}>

      <header className={styles.reg_header}>
        <span className={styles.reg_brand}>Jemacash</span>
        <button type="button" className={styles.reg_back_btn} onClick={onBack}>
          ← Volver
        </button>
      </header>

      <div className={styles.reg_stepper}>
        {STEPS.map((label, i) => (
          <div key={label} className={styles.reg_step_item}>
            <div className={`${styles.reg_step_dot} ${i < step ? styles.reg_step_done : i === step ? styles.reg_step_active : styles.reg_step_pending}`}>
              {i < step ? <IconCheck /> : <span>{i + 1}</span>}
            </div>
            <span className={`${styles.reg_step_lbl} ${i === step ? styles.reg_step_lbl_active : ''}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`${styles.reg_step_line} ${i < step ? styles.reg_step_line_done : ''}`} />
            )}
          </div>
        ))}
      </div>

      <main className={styles.reg_main}>
        <div className={styles.reg_card}>
          <div className={styles.reg_card_head}>
            <div className={styles.reg_card_icon}><IconCar /></div>
            <div>
              <h2 className={styles.reg_card_title}>
                {step === 0 && 'Identificación del Vehículo'}
                {step === 1 && 'Estado y Características'}
                {step === 2 && 'Fotografías del Vehículo'}
                {step === 3 && 'Valoración y Confirmación'}
              </h2>
              <p className={styles.reg_card_subtitle}>Paso {step + 1} de {STEPS.length}</p>
            </div>
          </div>
          {stepRenderers[step]()}
        </div>
      </main>

      <div className={styles.reg_nav_bar}>
        <button
          type="button"
          className={styles.reg_nav_back}
          onClick={() => step === 0 ? onBack() : setStep(s => s - 1)}
        >
          ← {step === 0 ? 'Cancelar' : 'Anterior'}
        </button>

        <div className={styles.reg_nav_dots}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.reg_nav_dot} ${i === step ? styles.reg_nav_dot_active : i < step ? styles.reg_nav_dot_done : ''}`} />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className={styles.reg_nav_next}
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
          >
            Siguiente <IconChevron />
          </button>
        ) : (
          <button
            type="button"
            className={styles.reg_nav_submit}
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
          >
            {submitting ? 'Registrando…' : 'Registrar Garantía ✓'}
          </button>
        )}
      </div>

    </div>
  )
}
