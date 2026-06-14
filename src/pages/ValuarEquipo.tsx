import { useState, useEffect, useRef } from 'react'
import styles from './ValuarEquipo.module.css'
import editorialVisual from '../assets/representative_images/istockphoto-1849172463-612x612.jpg'
import {
  DEVICE_CATALOG,
  buildYearOptions,
  type DeviceCategory,
} from '../components/dashboard/deviceCatalog'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconDevice() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="16" y="7" width="5" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.9" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconCar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5.5 13.2 7 8.8c.2-.7.86-1.2 1.6-1.2h6.8c.74 0 1.4.5 1.6 1.2l1.5 4.4" stroke="currentColor" strokeWidth="1.9" />
      <rect x="4" y="11" width="16" height="6.2" rx="1.6" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="7.5" cy="17.6" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="17.6" r="1.3" fill="currentColor" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 11.3 8-6 8 6v8.2H4v-8.2Z" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9.5 19.5v-5h5v5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M1 19h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
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
      <rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12.1 2.6 2.6L16 9.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 2.1 4.7L19 10l-4.9 2.3L12 17l-2.1-4.7L5 10l4.9-2.3L12 3Z" fill="currentColor" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

// ── Device type config ────────────────────────────────────────────────────────

const DEVICE_TYPES: { id: DeviceCategory; label: string; icon: () => React.ReactElement }[] = [
  { id: 'laptop',     label: 'Laptop',      icon: IconLaptop  },
  { id: 'smartphone', label: 'Smartphone',  icon: IconPhone   },
  { id: 'tablet',     label: 'Tablet',      icon: IconTablet  },
  { id: 'desktop',    label: 'Desktop',     icon: IconDesktop },
]

// ── Fake valuation helper ─────────────────────────────────────────────────────

function computeFakeRange(type: DeviceCategory, brand: string, year: string): [number, number] {
  const base: Record<DeviceCategory, number> = {
    laptop:     1400,
    smartphone:  900,
    tablet:      650,
    desktop:    1100,
  }
  const brandMult = /apple/i.test(brand)
    ? 2.05
    : /samsung|dell|hp|asus|lenovo/i.test(brand)
    ? 1.35
    : 1.0
  const age = Math.max(0, 2026 - (parseInt(year) || 2022))
  const ageMult = Math.max(0.35, 1 - age * 0.11)
  const mid = Math.round((base[type] * brandMult * ageMult) / 100) * 100
  const spread = Math.round((mid * 0.18) / 50) * 50
  return [Math.max(250, mid - spread), mid + spread]
}

function fmtSol(n: number) {
  return new Intl.NumberFormat('es-PE').format(n)
}

// ── Log lines ─────────────────────────────────────────────────────────────────

function buildLogLines(type: string, brand: string, model: string): string[] {
  return [
    '[INIT] Iniciando motor de valuación IA v2.0…',
    `[SCAN] Tipo de dispositivo: ${type}${brand ? ` · ${brand}` : ''}`,
    `[DB]   Buscando "${brand || 'dispositivo'} ${model || ''}".trim() en catálogo…`,
    '[NET]  Consultando precios: MercadoLibre · OLX · Ripley · Falabella…',
    '[CALC] Aplicando curva de depreciación por antigüedad…',
    '[AI]   Modelo entrenado con +50,000 transacciones locales…',
    '[VAL]  Calculando rango de confianza (87%)…',
    '[OK]   ✓ Valuación completada.',
  ]
}

// ── Main component ────────────────────────────────────────────────────────────

type ScanState = 'idle' | 'scanning' | 'done'

interface ValuarEquipoProps {
  onLogin?: () => void
  onRegister?: () => void
}

export default function ValuarEquipo({ onLogin, onRegister }: ValuarEquipoProps) {
  const [deviceType, setDeviceType] = useState<DeviceCategory>('laptop')
  const [brand,      setBrand]      = useState('')
  const [model,      setModel]      = useState('')
  const [year,       setYear]       = useState('')
  const [serial,     setSerial]     = useState('')
  const [refurb,     setRefurb]     = useState(false)

  const [scanState,  setScanState]  = useState<ScanState>('idle')
  const [progress,   setProgress]   = useState(0)
  const [visibleLog, setVisibleLog] = useState(0)
  const [fakeRange,  setFakeRange]  = useState<[number, number]>([0, 0])
  const logRef = useRef<HTMLDivElement>(null)

  const brands  = DEVICE_CATALOG[deviceType] ?? []
  const models  = brands.find(b => b.brand === brand)?.models.map(m => m.model) ?? []
  const years   = buildYearOptions(deviceType, brand, model)

  // Reset brand/model when device type changes
  function handleTypeChange(t: DeviceCategory) {
    setDeviceType(t)
    setBrand('')
    setModel('')
    setYear('')
  }

  // Reset model when brand changes
  function handleBrandChange(b: string) {
    setBrand(b)
    setModel('')
    setYear('')
  }

  // ── Progress animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (scanState !== 'scanning') return
    if (progress >= 100) { setScanState('done'); return }
    const t = setTimeout(() => setProgress(p => Math.min(p + 2, 100)), 55)
    return () => clearTimeout(t)
  }, [scanState, progress])

  // ── Log line reveals ────────────────────────────────────────────────────────
  const allLines = buildLogLines(deviceType, brand, model)
  useEffect(() => {
    if (scanState !== 'scanning') return
    const next = Math.min(Math.floor((progress / 100) * allLines.length) + 1, allLines.length)
    if (next > visibleLog) {
      setVisibleLog(next)
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [progress, scanState, visibleLog, allLines.length])

  function handleScan() {
    setFakeRange(computeFakeRange(deviceType, brand, year))
    setProgress(0)
    setVisibleLog(0)
    setScanState('scanning')
  }

  function closeScan() { setScanState('idle') }

  // ── Ring SVG ────────────────────────────────────────────────────────────────
  const R = 50, circ = 2 * Math.PI * R
  const dash = (progress / 100) * circ

  const deviceLabel = DEVICE_TYPES.find(d => d.id === deviceType)?.label ?? deviceType
  const confidence  = 82 + Math.floor(Math.random() * 10)   // 82–91%, looks legit

  return (
    <div className={styles.valuar_page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.hero_inner}>
          <span className={styles.hero_tag}><IconSpark /> Motor de Valuación IA</span>
          <h1>Descubre el valor real<br />de tus <em>activos</em></h1>
          <p>
            Pre-valuación inmediata respaldada por datos del mercado peruano en tiempo real.
            Sin trámites, sin esperas.
          </p>
        </div>
      </section>

      {/* ── Pre-val form ── */}
      <section className={styles.preval}>
        <div className={styles.preval_left}>

          {/* Step 1 — Category */}
          <article className={styles.box}>
            <div className={styles.step_header}>
              <span className={styles.step_num}>01</span>
              <h2>Selecciona categoría</h2>
            </div>
            <div className={styles.categories}>
              {/* Tecnología — active */}
              <button type="button" className={`${styles.category} ${styles.active}`}>
                <IconDevice />
                <span>Tecnología</span>
              </button>
              {/* Vehículos — soon */}
              <button type="button" className={`${styles.category} ${styles.category_soon}`} disabled>
                <IconCar />
                <span>Vehículos</span>
                <span className={styles.soon_badge}>Próximamente</span>
              </button>
              {/* Inmuebles — soon */}
              <button type="button" className={`${styles.category} ${styles.category_soon}`} disabled>
                <IconHome />
                <span>Inmuebles</span>
                <span className={styles.soon_badge}>Próximamente</span>
              </button>
            </div>
          </article>

          {/* Step 2 — Asset details */}
          <article className={styles.box}>
            <div className={styles.step_header}>
              <span className={styles.step_num}>02</span>
              <h2>Detalles del activo</h2>
            </div>

            {/* Device type selector */}
            <div className={styles.device_types}>
              {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.device_type_btn} ${deviceType === id ? styles.device_type_active : ''}`}
                  onClick={() => handleTypeChange(id)}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className={styles.form_grid}>
              {/* Brand */}
              <label>
                Marca <span className={styles.req}>*</span>
                <select value={brand} onChange={e => handleBrandChange(e.target.value)}>
                  <option value="">Seleccionar marca…</option>
                  {brands.map(b => (
                    <option key={b.brand} value={b.brand}>{b.brand}</option>
                  ))}
                  <option value="Otra marca">Otra marca</option>
                </select>
              </label>

              {/* Model */}
              <label>
                Modelo <span className={styles.req}>*</span>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  disabled={!brand || brand === 'Otra marca'}
                >
                  <option value="">
                    {!brand ? 'Primero selecciona una marca' : 'Seleccionar modelo…'}
                  </option>
                  {models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Otro modelo">Otro modelo</option>
                </select>
              </label>

              {/* Year */}
              <label>
                Año de fabricación <span className={styles.req}>*</span>
                <select value={year} onChange={e => setYear(e.target.value)}>
                  <option value="">Seleccionar año…</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>

              {/* Serial number */}
              <label>
                Número de serie (S/N) <span className={styles.req}>*</span>
                <input
                  type="text"
                  value={serial}
                  onChange={e => setSerial(e.target.value)}
                  placeholder="Ej: C02YM2EQJG5H"
                />
              </label>
            </div>

            {/* Refurbished checkbox */}
            <label className={styles.checkbox_row}>
              <input
                type="checkbox"
                checked={refurb}
                onChange={e => setRefurb(e.target.checked)}
              />
              Dispositivo reacondicionado / refurbished
            </label>

            {/* Serial hint */}
            <p className={styles.serial_hint}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="14" height="14">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z"
                  stroke="#0f7d3f" strokeWidth="1.8"/>
                <path d="M12 11v6M12 8v1" stroke="#0f7d3f" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              El número de serie identifica unívocamente tu dispositivo y permite verificar que no esté reportado como robado.
            </p>

            <button
              type="button"
              className={styles.recalc}
              onClick={handleScan}
            >
              Calcular valuación
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </article>
        </div>

        {/* ── Sidebar result teaser ── */}
        <aside className={styles.preval_side}>
          <article className={styles.result}>
            <div className={styles.result_top}>
              <span className={styles.result_kicker}><IconSpark /> PRE-VALUACIÓN</span>
              <span className={styles.result_lock}><IconLock /></span>
            </div>
            <p className={styles.result_meta}>Completa los datos y presiona calcular</p>
            <div className={styles.result_main}>
              <p className={styles.result_label}>Rango Estimado</p>
              <p className={styles.result_currency}>S/</p>
              <p className={styles.result_value}>— — —</p>
            </div>
            <div className={styles.result_footer}>
              <div>
                <span className={styles.meta_icon}>
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="m12 12 4-3" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </span>
                <small>CONFIANZA</small>
                <strong>—</strong>
              </div>
              <div>
                <span className={`${styles.meta_icon} ${styles.meta_icon_green}`}>
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </span>
                <small>VIGENCIA</small>
                <strong>15 Días</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>

      {/* ── Sobre Nosotros ── */}
      <section className={styles.editorial}>
        <div className={styles.editorial_copy}>
          <span className={styles.editorial_eyebrow}>Sobre Nosotros</span>
          <h2>Tecnología peruana<br />al servicio de tu<br /><em>patrimonio</em></h2>
          <div className={styles.editorial_stats}>
            <div className={styles.editorial_stat}>
              <strong>+100k</strong>
              <span>Familias atendidas</span>
            </div>
            <div className={styles.editorial_stat}>
              <strong>100%</strong>
              <span>Digital</span>
            </div>
            <div className={styles.editorial_stat}>
              <strong>24/7</strong>
              <span>Disponible</span>
            </div>
          </div>
          <p>
            En Jemacash, orgullosamente peruana, nos dedicamos a brindar préstamos inmediatos
            basándonos en los valores de confianza y cercanía que caracterizan a nuestra cultura.
            Condiciones claras, seguras y sin trámites eternos.
          </p>
          <p className={styles.editorial_p2}>
            Nuestra plataforma digital es el único canal autorizado para subir documentos,
            monitorear tu solicitud y recibir respuestas claras — garantizando siempre la
            protección de tu información.
          </p>
        </div>
        <div className={styles.editorial_visual}>
          <img src={editorialVisual} alt="Familia peruana en la playa" />
          <div className={styles.editorial_overlay} aria-hidden="true" />
        </div>
      </section>

      {/* ── Scan overlay ── */}
      {scanState !== 'idle' && (
        <div className={styles.scan_overlay} onClick={scanState === 'done' ? closeScan : undefined}>
          <div className={styles.scan_modal} onClick={e => e.stopPropagation()}>

            {/* ── Scanning state ── */}
            {scanState === 'scanning' && (
              <>
                <div className={styles.scan_header}>
                  <span className={styles.scan_brand}>JEMACASH AI AUDITOR v2.0</span>
                  <span className={styles.scan_badge}>● EN VIVO</span>
                </div>

                {/* Ring */}
                <div className={styles.scan_ring_wrap}>
                  <svg viewBox="0 0 120 120" className={styles.scan_ring_svg}>
                    <circle cx="60" cy="60" r={R} fill="none" stroke="#1a3020" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r={R}
                      fill="none" stroke="#0f7d3f" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${circ}`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 0.06s linear' }}
                    />
                  </svg>
                  <div className={styles.scan_ring_label}>
                    <strong>{progress}%</strong>
                    <span>Analizando</span>
                  </div>
                </div>

                {/* Terminal log */}
                <div className={styles.scan_terminal} ref={logRef}>
                  {allLines.slice(0, visibleLog).map((line, i) => (
                    <div
                      key={i}
                      className={`${styles.scan_line} ${line.startsWith('[OK]') ? styles.scan_line_ok : ''}`}
                    >
                      {line}
                    </div>
                  ))}
                  <span className={styles.scan_cursor}>▌</span>
                </div>
              </>
            )}

            {/* ── Done / result state ── */}
            {scanState === 'done' && (
              <>
                <button
                  type="button"
                  className={styles.scan_close}
                  onClick={closeScan}
                  aria-label="Cerrar"
                >✕</button>

                <div className={styles.result_header}>
                  <span className={styles.scan_brand}>RESULTADO DE VALUACIÓN</span>
                  <span className={styles.result_done_badge}>✓ Completado</span>
                </div>

                {/* Device summary */}
                <div className={styles.result_device_row}>
                  {(() => { const D = DEVICE_TYPES.find(d => d.id === deviceType); return D ? <D.icon /> : null })()}
                  <div>
                    <strong>{brand || deviceLabel} {model ? `· ${model}` : ''}</strong>
                    <span>{year || '—'} {refurb ? '· Reacondicionado' : ''}</span>
                  </div>
                </div>

                {/* Blurred amount */}
                <div className={styles.result_amount_wrap}>
                  <p className={styles.result_amount_label}>Rango Estimado de Reventa (S/)</p>
                  <div className={styles.result_amount_blur_wrap}>
                    <p className={styles.result_amount_blurred}>
                      {fmtSol(fakeRange[0])} — {fmtSol(fakeRange[1])}
                    </p>
                    <div className={styles.result_blur_overlay}>
                      <span className={styles.result_lock_icon}><IconLock /></span>
                      <p>Inicia sesión para ver el resultado completo</p>
                    </div>
                  </div>

                  {/* Teaser stats */}
                  <div className={styles.result_teaser_stats}>
                    <div>
                      <small>CONFIANZA</small>
                      <strong>{confidence}%</strong>
                    </div>
                    <div>
                      <small>VIGENCIA</small>
                      <strong>15 días</strong>
                    </div>
                    <div>
                      <small>FUENTES</small>
                      <strong>MercadoLibre · OLX</strong>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className={styles.result_cta_group}>
                  <button type="button" className={styles.result_cta_primary} onClick={onLogin}>
                    Iniciar sesión para ver resultados →
                  </button>
                  <button type="button" className={styles.result_cta_secondary} onClick={onRegister}>
                    Crear cuenta gratis
                  </button>
                </div>

                <p className={styles.result_disclaimer}>
                  Pre-valuación orientativa basada en datos de mercado. El valor real puede variar según
                  condición física, accesorios y demanda al momento de tasación.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
