import { useState } from 'react'
import { createGuarantee } from '../../services/guarantee.service'
import { IconShield, IconCheck } from './icons'
import styles from './RegistrarGarantiaTecView.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M0 19h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 19l1-2h4l1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function IconDesktop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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

const DEVICE_CATEGORIES = [
  { id: 'laptop',     label: 'Laptop',     icon: IconLaptop  },
  { id: 'smartphone', label: 'Smartphone', icon: IconPhone   },
  { id: 'tablet',     label: 'Tablet',     icon: IconTablet  },
  { id: 'desktop',    label: 'Desktop',    icon: IconDesktop },
] as const

const CONDITION_OPTIONS = [
  {
    id: 'excelente',
    label: 'Excelente',
    stars: '★★★',
    desc: 'Sin rayones ni daños visibles. Funciona como nuevo.',
  },
  {
    id: 'bueno',
    label: 'Bueno',
    stars: '★★',
    desc: 'Desgaste mínimo por uso normal. Funcionalidad al 100%.',
  },
  {
    id: 'regular',
    label: 'Regular',
    stars: '★',
    desc: 'Rayones o golpes visibles. Funcional, sin daños graves.',
  },
] as const

const RAM_OPTIONS   = ['4 GB', '8 GB', '12 GB', '16 GB', '32 GB', '64 GB']
const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB']
const YEAR_OPTIONS  = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017']

const PHOTO_SLOTS = [
  { id: 'frontal',  label: 'Parte frontal',       desc: 'Pantalla encendida mostrando ajustes del sistema' },
  { id: 'trasero',  label: 'Parte trasera',        desc: 'Marca y modelo visibles, sin obstrucciones'       },
  { id: 'serial',   label: 'Número de serie',      desc: 'Etiqueta o pantalla "Acerca de" con S/N visible'  },
  { id: 'general',  label: 'Vista general',        desc: 'Dispositivo completo mostrando estado físico'     },
]

const STEPS = ['Dispositivo', 'Especificaciones', 'Fotografías', 'Valoración']

// ── Types ─────────────────────────────────────────────────────────────────────

type Step1 = {
  device_category: string
  brand: string
  model: string
  manufacture_year: string
  serial_number: string
  imei: string
}

type Step2 = {
  condition: string
  processor: string
  ram: string
  storage: string
  battery_health: string
  screen_size: string
}

type Step3 = {
  photos: Set<string>
}

type Step4 = {
  purchase_price: string
  estimated_value: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldRow({
  label, required, children,
}: {
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

export function RegistrarGarantiaTecView({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Per-step state
  const [s1, setS1] = useState<Step1>({
    device_category: '',
    brand: '',
    model: '',
    manufacture_year: '',
    serial_number: '',
    imei: '',
  })

  const [s2, setS2] = useState<Step2>({
    condition: '',
    processor: '',
    ram: '',
    storage: '',
    battery_health: '85',
    screen_size: '',
  })

  const [s3, setS3] = useState<Step3>({ photos: new Set() })

  const [s4, setS4] = useState<Step4>({
    purchase_price: '',
    estimated_value: '',
  })

  // ── Validation ──────────────────────────────────────────────────────────────

  function canAdvance() {
    if (step === 0) return s1.device_category !== '' && s1.brand.trim() !== '' && s1.model.trim() !== '' && s1.manufacture_year !== '' && s1.serial_number.trim() !== ''
    if (step === 1) return s2.condition !== '' && s2.processor.trim() !== '' && s2.ram !== '' && s2.storage !== ''
    if (step === 2) return s3.photos.size >= 4
    if (step === 3) return s4.estimated_value.trim() !== '' && Number(s4.estimated_value) > 0
    return false
  }

  function togglePhoto(id: string) {
    setS3((prev) => {
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
      const name = `${s1.brand} ${s1.model}`.trim()
      const specs: Record<string, string> = {
        processor:      s2.processor,
        ram:            s2.ram,
        storage:        s2.storage,
        battery_health: s2.battery_health,
      }
      if (s2.screen_size) specs.screen_size = s2.screen_size
      if (s1.imei)        specs.imei        = s1.imei

      await createGuarantee({
        type:             'tecnologia',
        name,
        description:      `Condición: ${s2.condition}. ${s1.device_category} ${s1.manufacture_year}.`,
        estimated_value:  Number(s4.estimated_value),
        device_category:  s1.device_category,
        brand:            s1.brand,
        model:            s1.model,
        manufacture_year: s1.manufacture_year,
        serial_number:    s1.serial_number,
        condition:        s2.condition,
        specs,
        photo_urls:       PHOTO_SLOTS.filter((p) => s3.photos.has(p.id)).map((p) => `mock://${p.id}`),
      })
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al registrar la garantía.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render steps ────────────────────────────────────────────────────────────

  function renderStep0() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Selecciona el tipo de dispositivo e ingresa sus datos de identificación.
          El número de serie es esencial para verificar autenticidad.
        </p>

        {/* Category selector */}
        <FieldRow label="Tipo de dispositivo" required>
          <div className={styles.reg_category_grid}>
            {DEVICE_CATEGORIES.map(({ id, label, icon: CatIcon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.reg_category_btn} ${s1.device_category === id ? styles.reg_category_active : ''}`}
                onClick={() => setS1((p) => ({ ...p, device_category: id }))}
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
              placeholder="Ej: Apple, Samsung, Lenovo…"
              value={s1.brand}
              onChange={(e) => setS1((p) => ({ ...p, brand: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Modelo" required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: MacBook Pro 14, iPhone 15 Pro…"
              value={s1.model}
              onChange={(e) => setS1((p) => ({ ...p, model: e.target.value }))}
            />
          </FieldRow>
        </div>

        <div className={styles.reg_two_col}>
          <FieldRow label="Año de fabricación" required>
            <select
              className={styles.reg_select}
              value={s1.manufacture_year}
              onChange={(e) => setS1((p) => ({ ...p, manufacture_year: e.target.value }))}
            >
              <option value="">Seleccionar año…</option>
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Número de serie (S/N)" required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Ej: C02YM2EQJG5H"
              value={s1.serial_number}
              onChange={(e) => setS1((p) => ({ ...p, serial_number: e.target.value }))}
            />
          </FieldRow>
        </div>

        {s1.device_category === 'smartphone' && (
          <FieldRow label="IMEI">
            <input
              type="text"
              className={styles.reg_input}
              placeholder="Marca *#06# para obtenerlo"
              value={s1.imei}
              onChange={(e) => setS1((p) => ({ ...p, imei: e.target.value }))}
            />
          </FieldRow>
        )}

        <div className={styles.reg_info_box}>
          <IconShield />
          <p>El número de serie identifica unívocamente tu dispositivo y permite verificar que no esté reportado como robado.</p>
        </div>
      </div>
    )
  }

  function renderStep1() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Evalúa el estado físico y detalla las especificaciones técnicas.
          Estos datos determinan el valor de respaldo del dispositivo.
        </p>

        {/* Condition */}
        <FieldRow label="Condición física" required>
          <div className={styles.reg_condition_grid}>
            {CONDITION_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.reg_condition_btn} ${s2.condition === c.id ? styles.reg_condition_active : ''}`}
                onClick={() => setS2((p) => ({ ...p, condition: c.id }))}
              >
                <span className={styles.reg_cond_stars}>{c.stars}</span>
                <strong>{c.label}</strong>
                <p>{c.desc}</p>
              </button>
            ))}
          </div>
        </FieldRow>

        {/* Processor */}
        <FieldRow label="Procesador" required>
          <input
            type="text"
            className={styles.reg_input}
            placeholder="Ej: Apple M2, Intel Core i7-12th Gen, Snapdragon 8 Gen 2…"
            value={s2.processor}
            onChange={(e) => setS2((p) => ({ ...p, processor: e.target.value }))}
          />
        </FieldRow>

        <div className={styles.reg_two_col}>
          <FieldRow label="Memoria RAM" required>
            <div className={styles.reg_pills}>
              {RAM_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.reg_pill} ${s2.ram === r ? styles.reg_pill_active : ''}`}
                  onClick={() => setS2((p) => ({ ...p, ram: r }))}
                >
                  {r}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Almacenamiento" required>
            <div className={styles.reg_pills}>
              {STORAGE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.reg_pill} ${s2.storage === s ? styles.reg_pill_active : ''}`}
                  onClick={() => setS2((p) => ({ ...p, storage: s }))}
                >
                  {s}
                </button>
              ))}
            </div>
          </FieldRow>
        </div>

        <div className={styles.reg_two_col}>
          <FieldRow label={`Salud de batería: ${s2.battery_health}%`}>
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={s2.battery_health}
              onChange={(e) => setS2((p) => ({ ...p, battery_health: e.target.value }))}
              className={styles.reg_slider}
              style={{ '--pct': `${((Number(s2.battery_health) - 30) / 70) * 100}%` } as React.CSSProperties}
            />
            <div className={styles.reg_slider_labels}>
              <span>30%</span><span>100%</span>
            </div>
          </FieldRow>
          <FieldRow label="Tamaño de pantalla">
            <input
              type="text"
              className={styles.reg_input}
              placeholder='Ej: 14", 6.1"'
              value={s2.screen_size}
              onChange={(e) => setS2((p) => ({ ...p, screen_size: e.target.value }))}
            />
          </FieldRow>
        </div>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Adjunta fotos claras del dispositivo. Las imágenes son necesarias para
          verificar el estado físico y la autenticidad antes de aprobar la garantía.
        </p>

        <div className={styles.reg_photos_grid}>
          {PHOTO_SLOTS.map((slot) => {
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
          <p>Fotos nítidas y bien iluminadas aceleran el proceso de verificación. Evita reflejos y asegúrate de que el número de serie sea legible.</p>
        </div>
      </div>
    )
  }

  function renderStep3() {
    const catLabel = DEVICE_CATEGORIES.find((c) => c.id === s1.device_category)?.label ?? s1.device_category
    const condLabel = CONDITION_OPTIONS.find((c) => c.id === s2.condition)?.label ?? s2.condition

    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>
          Indica el valor de mercado estimado de tu dispositivo en su estado actual.
          Este valor sirve de base para calcular el monto máximo de crédito disponible.
        </p>

        <div className={styles.reg_two_col}>
          <FieldRow label="Precio de compra original (S/)">
            <input
              type="number"
              className={styles.reg_input}
              placeholder="0.00"
              min={0}
              value={s4.purchase_price}
              onChange={(e) => setS4((p) => ({ ...p, purchase_price: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Valor estimado actual (S/)" required>
            <input
              type="number"
              className={styles.reg_input}
              placeholder="0.00"
              min={0}
              value={s4.estimated_value}
              onChange={(e) => setS4((p) => ({ ...p, estimated_value: e.target.value }))}
            />
          </FieldRow>
        </div>

        {/* Summary card */}
        <div className={styles.reg_summary}>
          <h3>Resumen de la garantía</h3>
          <div className={styles.reg_summary_grid}>
            <div><span>Dispositivo</span><strong>{catLabel}</strong></div>
            <div><span>Marca / Modelo</span><strong>{s1.brand} {s1.model}</strong></div>
            <div><span>Año</span><strong>{s1.manufacture_year}</strong></div>
            <div><span>Número de serie</span><strong>{s1.serial_number}</strong></div>
            <div><span>Condición</span><strong>{condLabel}</strong></div>
            <div><span>Procesador</span><strong>{s2.processor}</strong></div>
            <div><span>RAM</span><strong>{s2.ram}</strong></div>
            <div><span>Almacenamiento</span><strong>{s2.storage}</strong></div>
            <div><span>Salud batería</span><strong>{s2.battery_health}%</strong></div>
            <div><span>Fotos adjuntas</span><strong>{s3.photos.size} / 4</strong></div>
          </div>
        </div>

        <div className={styles.reg_legal}>
          <IconShield />
          <p>
            Al registrar esta garantía confirmas que eres el propietario legítimo del dispositivo,
            que la información proporcionada es verídica y que autorizas a Jemacash a retenerlo
            como respaldo crediticio en caso de incumplimiento, conforme a la normativa SBS Perú.
          </p>
        </div>

        {submitError && (
          <p role="alert" className={styles.reg_error}>{submitError}</p>
        )}
      </div>
    )
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3]

  return (
    <div className={styles.reg_page}>

      {/* ── Header ── */}
      <header className={styles.reg_header}>
        <span className={styles.reg_brand}>Jemacash</span>
        <button type="button" className={styles.reg_back_btn} onClick={onBack}>
          ← Volver
        </button>
      </header>

      {/* ── Stepper ── */}
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

      {/* ── Content ── */}
      <main className={styles.reg_main}>
        <div className={styles.reg_card}>
          <div className={styles.reg_card_head}>
            <div className={styles.reg_card_icon}>
              <IconLaptop />
            </div>
            <div>
              <h2 className={styles.reg_card_title}>
                {step === 0 && 'Identificación del Dispositivo'}
                {step === 1 && 'Estado y Especificaciones Técnicas'}
                {step === 2 && 'Fotografías del Dispositivo'}
                {step === 3 && 'Valoración y Confirmación'}
              </h2>
              <p className={styles.reg_card_subtitle}>Paso {step + 1} de {STEPS.length}</p>
            </div>
          </div>

          {stepRenderers[step]()}
        </div>
      </main>

      {/* ── Navigation bar ── */}
      <div className={styles.reg_nav_bar}>
        <button
          type="button"
          className={styles.reg_nav_back}
          onClick={() => step === 0 ? onBack() : setStep((s) => s - 1)}
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
            onClick={() => setStep((s) => s + 1)}
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
