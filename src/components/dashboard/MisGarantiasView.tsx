import { useEffect, useState } from 'react'
import type { Guarantee } from '../../types/api.types'
import { getGuarantees } from '../../services/guarantee.service'
import { IconShield, IconCheck, IconPlus } from './icons'
import styles from './MisGarantiasView.module.css'

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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  excelente: { label: 'Excelente', color: '#0f7d3f' },
  bueno:     { label: 'Bueno',     color: '#2563eb' },
  regular:   { label: 'Regular',   color: '#d97706' },
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Activa',      color: '#0f7d3f', bg: '#d9f0da' },
  pledged:  { label: 'En garantía', color: '#2563eb', bg: '#dbeafe' },
  released: { label: 'Liberada',    color: '#64748b', bg: '#f1f5f9' },
}

function DeviceIcon({ type, category }: { type: string; category?: string | null }) {
  if (type === 'vehiculo') return <IconCar />
  if (category === 'smartphone') return <IconPhone />
  return <IconLaptop />
}

function GuaranteeCard({ g }: { g: Guarantee }) {
  const status = STATUS_LABELS[g.status] ?? STATUS_LABELS.active
  const cond   = g.condition ? CONDITION_LABELS[g.condition] : null
  const isVeh  = g.type === 'vehiculo'

  return (
    <div className={styles.gar_card}>
      <div className={styles.gar_card_icon}>
        <DeviceIcon type={g.type} category={g.device_category} />
      </div>

      <div className={styles.gar_card_body}>
        <div className={styles.gar_card_top}>
          <div>
            <strong className={styles.gar_card_name}>{g.name}</strong>
            {g.manufacture_year && (
              <span className={styles.gar_card_year}>· {g.manufacture_year}</span>
            )}
          </div>
          <span className={styles.gar_status_badge} style={{ color: status.color, background: status.bg }}>
            {status.label}
          </span>
        </div>

        <div className={styles.gar_card_meta}>
          {isVeh ? (
            <>
              {g.serial_number && <span>Placa: <strong>{g.serial_number}</strong></span>}
              {g.specs?.mileage && <span>Km: <strong>{Number(g.specs.mileage).toLocaleString('es-PE')}</strong></span>}
              {g.specs?.fuel && <span><strong>{g.specs.fuel}</strong></span>}
            </>
          ) : (
            <>
              {g.serial_number && <span>S/N: <strong>{g.serial_number}</strong></span>}
              {g.specs?.ram     && <span>RAM: <strong>{g.specs.ram}</strong></span>}
              {g.specs?.storage && <span>Almac.: <strong>{g.specs.storage}</strong></span>}
            </>
          )}
          {cond && <span style={{ color: cond.color }}>● {cond.label}</span>}
        </div>

        <div className={styles.gar_card_specs}>
          {isVeh ? (
            <>
              {g.specs?.transmission && <span className={styles.gar_spec_chip}>{g.specs.transmission}</span>}
              {g.specs?.engine       && <span className={styles.gar_spec_chip}>{g.specs.engine}</span>}
              {g.specs?.color        && <span className={styles.gar_spec_chip}>{g.specs.color}</span>}
            </>
          ) : (
            <>
              {g.specs?.processor    && <span className={styles.gar_spec_chip}>{g.specs.processor}</span>}
              {g.specs?.battery_health && <span className={styles.gar_spec_chip}>🔋 {g.specs.battery_health}%</span>}
            </>
          )}
          {g.photo_urls && g.photo_urls.length > 0 && (
            <span className={styles.gar_spec_chip}><IconCheck /> {g.photo_urls.length} fotos</span>
          )}
        </div>
      </div>

      <div className={styles.gar_card_value}>
        <span>Valor estimado</span>
        <strong>S/ {Number(g.estimated_value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
      </div>
    </div>
  )
}

export function MisGarantiasView({
  onRegisterTec,
  onRegisterVeh,
}: {
  onRegisterTec: () => void
  onRegisterVeh: () => void
}) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGuarantees()
      .then(setGuarantees)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const techGuarantees = guarantees.filter(g => g.type === 'tecnologia')
  const vehGuarantees  = guarantees.filter(g => g.type === 'vehiculo')

  return (
    <div className={styles.gar_page}>

      {/* ── Page header ── */}
      <div className={styles.gar_header}>
        <div>
          <h1 className={styles.gar_title}>Mis Garantías</h1>
          <p className={styles.gar_sub}>
            Administra los activos que respaldan tus solicitudes de crédito.
          </p>
        </div>
        <button type="button" className={styles.gar_add_btn} onClick={onRegisterTec}>
          <IconPlus /> Registrar Garantía
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.gar_stats}>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconShield /></span>
          <div>
            <strong>{guarantees.length}</strong>
            <span>Total garantías</span>
          </div>
        </div>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconLaptop /></span>
          <div>
            <strong>{techGuarantees.length}</strong>
            <span>Tecnología</span>
          </div>
        </div>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconCar /></span>
          <div>
            <strong>{vehGuarantees.length}</strong>
            <span>Vehículos</span>
          </div>
        </div>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconCheck /></span>
          <div>
            <strong>{guarantees.filter(g => g.status === 'active').length}</strong>
            <span>Disponibles</span>
          </div>
        </div>
      </div>

      {/* ── Tecnología section ── */}
      <section className={styles.gar_section}>
        <div className={styles.gar_section_head}>
          <div className={styles.gar_section_label}>
            <span className={styles.gar_section_icon}><IconLaptop /></span>
            <h2>Tecnología</h2>
            <span className={styles.gar_count_badge}>{techGuarantees.length}</span>
          </div>
          <button type="button" className={styles.gar_section_add} onClick={onRegisterTec}>
            <IconPlus /> Agregar
          </button>
        </div>

        {loading ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconClock /></span>
            <p>Cargando garantías…</p>
          </div>
        ) : techGuarantees.length === 0 ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconLaptop /></span>
            <strong>No tienes garantías de tecnología registradas</strong>
            <p>Registra tu laptop, smartphone u otro equipo para usarlo como respaldo en tu solicitud de crédito.</p>
            <button type="button" className={styles.gar_empty_cta} onClick={onRegisterTec}>
              <IconPlus /> Registrar ahora
            </button>
          </div>
        ) : (
          <div className={styles.gar_list}>
            {techGuarantees.map((g) => (
              <GuaranteeCard key={g.id} g={g} />
            ))}
          </div>
        )}
      </section>

      {/* ── Vehículos section ── */}
      <section className={styles.gar_section}>
        <div className={styles.gar_section_head}>
          <div className={styles.gar_section_label}>
            <span className={styles.gar_section_icon}><IconCar /></span>
            <h2>Vehículos</h2>
            <span className={styles.gar_count_badge}>{vehGuarantees.length}</span>
          </div>
          <button type="button" className={styles.gar_section_add} onClick={onRegisterVeh}>
            <IconPlus /> Agregar
          </button>
        </div>

        {loading ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconClock /></span>
            <p>Cargando garantías…</p>
          </div>
        ) : vehGuarantees.length === 0 ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconCar /></span>
            <strong>No tienes garantías vehiculares registradas</strong>
            <p>Registra tu auto, camioneta o moto para usarlo como respaldo en tu solicitud de crédito.</p>
            <button type="button" className={styles.gar_empty_cta} onClick={onRegisterVeh}>
              <IconPlus /> Registrar ahora
            </button>
          </div>
        ) : (
          <div className={styles.gar_list}>
            {vehGuarantees.map(g => (
              <GuaranteeCard key={g.id} g={g} />
            ))}
          </div>
        )}
      </section>

      {/* ── Info banner ── */}
      <div className={styles.gar_info_banner}>
        <span><IconShield /></span>
        <div>
          <strong>Tus garantías están protegidas</strong>
          <p>Todos los activos registrados son verificados y custodiados bajo regulación SBS Perú. Solo se activan si incurres en mora.</p>
        </div>
      </div>

    </div>
  )
}
