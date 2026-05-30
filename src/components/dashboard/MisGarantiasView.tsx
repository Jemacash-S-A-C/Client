import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from './Pagination'
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

// Labels are resolved at render-time via t() inside components that use useTranslation()

function DeviceIcon({ type, category }: { type: string; category?: string | null }) {
  if (type === 'vehiculo') return <IconCar />
  if (category === 'smartphone') return <IconPhone />
  return <IconLaptop />
}

type StatusInfo = { label: string; color: string; bg: string }
type CondInfo   = { label: string; color: string }

function GuaranteeCard({ g }: { g: Guarantee }) {
  const { t } = useTranslation()

  const STATUS_LABELS: Record<string, StatusInfo> = {
    active:   { label: t('garantias.status.active'),   color: '#0f7d3f', bg: '#d9f0da' },
    pledged:  { label: t('garantias.status.pledged'),  color: '#2563eb', bg: '#dbeafe' },
    released: { label: t('garantias.status.released'), color: '#64748b', bg: '#f1f5f9' },
  }
  const CONDITION_LABELS: Record<string, CondInfo> = {
    excelente: { label: t('garantias.condition.excelente'), color: '#0f7d3f' },
    bueno:     { label: t('garantias.condition.bueno'),     color: '#2563eb' },
    regular:   { label: t('garantias.condition.regular'),   color: '#d97706' },
  }

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
              {g.serial_number && <span>{t('garantias.card.plate')}: <strong>{g.serial_number}</strong></span>}
              {g.specs?.mileage && <span>{t('garantias.card.km')}: <strong>{Number(g.specs.mileage).toLocaleString('es-PE')}</strong></span>}
              {g.specs?.fuel && <span><strong>{g.specs.fuel}</strong></span>}
            </>
          ) : (
            <>
              {g.serial_number && <span>{t('garantias.card.sn')}: <strong>{g.serial_number}</strong></span>}
              {g.specs?.ram     && <span>{t('garantias.card.ram')}: <strong>{g.specs.ram}</strong></span>}
              {g.specs?.storage && <span>{t('garantias.card.storage')}: <strong>{g.specs.storage}</strong></span>}
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
            <span className={styles.gar_spec_chip}><IconCheck /> {t('garantias.card.photos', { count: g.photo_urls.length })}</span>
          )}
        </div>
      </div>

      <div className={styles.gar_card_value}>
        <span>{t('garantias.card.estimatedValue')}</span>
        {Number(g.estimated_value) > 0
          ? <strong>S/ {Number(g.estimated_value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
          : <span className={styles.gar_pending_badge}>{t('garantias.card.pendingValuation')}</span>
        }
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
  const { t } = useTranslation()
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [loading, setLoading] = useState(true)
  const [techPage, setTechPage] = useState(0)
  const [vehPage,  setVehPage]  = useState(0)

  useEffect(() => {
    getGuarantees()
      .then(setGuarantees)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const GAR_PER_PAGE   = 5
  const techGuarantees = guarantees.filter(g => g.type === 'tecnologia')
  const vehGuarantees  = guarantees.filter(g => g.type === 'vehiculo')

  const techTotal       = Math.ceil(techGuarantees.length / GAR_PER_PAGE)
  const visibleTech     = techGuarantees.slice(techPage * GAR_PER_PAGE, (techPage + 1) * GAR_PER_PAGE)
  const vehTotal        = Math.ceil(vehGuarantees.length / GAR_PER_PAGE)
  const visibleVeh      = vehGuarantees.slice(vehPage * GAR_PER_PAGE, (vehPage + 1) * GAR_PER_PAGE)

  return (
    <div className={styles.gar_page}>

      {/* ── Page header ── */}
      <div className={styles.gar_header}>
        <div>
          <h1 className={styles.gar_title}>{t('garantias.title')}</h1>
          <p className={styles.gar_sub}>{t('garantias.subtitle')}</p>
        </div>
        <button type="button" className={styles.gar_add_btn} onClick={onRegisterTec}>
          <IconPlus /> {t('garantias.registerBtn')}
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.gar_stats}>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconShield /></span>
          <div>
            <strong>{guarantees.length}</strong>
            <span>{t('garantias.stat.total')}</span>
          </div>
        </div>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconLaptop /></span>
          <div>
            <strong>{techGuarantees.length}</strong>
            <span>{t('garantias.stat.tech')}</span>
          </div>
        </div>
        <div className={`${styles.gar_stat_card} ${styles.gar_stat_card_disabled}`}>
          <span className={styles.gar_stat_icon}><IconCar /></span>
          <div>
            <strong>—</strong>
            <span>{t('garantias.stat.vehicles')}</span>
          </div>
        </div>
        <div className={styles.gar_stat_card}>
          <span className={styles.gar_stat_icon}><IconCheck /></span>
          <div>
            <strong>{guarantees.filter(g => g.status === 'active').length}</strong>
            <span>{t('garantias.stat.available')}</span>
          </div>
        </div>
      </div>

      {/* ── Tecnología section ── */}
      <section className={styles.gar_section}>
        <div className={styles.gar_section_head}>
          <div className={styles.gar_section_label}>
            <span className={styles.gar_section_icon}><IconLaptop /></span>
            <h2>{t('garantias.section.tech')}</h2>
            <span className={styles.gar_count_badge}>{techGuarantees.length}</span>
          </div>
          <button type="button" className={styles.gar_section_add} onClick={onRegisterTec}>
            <IconPlus /> {t('garantias.section.add')}
          </button>
        </div>

        {loading ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconClock /></span>
            <p>{t('garantias.loading')}</p>
          </div>
        ) : techGuarantees.length === 0 ? (
          <div className={styles.gar_empty}>
            <span className={styles.gar_empty_icon}><IconLaptop /></span>
            <strong>{t('garantias.empty.title')}</strong>
            <p>{t('garantias.empty.desc')}</p>
            <button type="button" className={styles.gar_empty_cta} onClick={onRegisterTec}>
              <IconPlus /> {t('garantias.empty.cta')}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.gar_list}>
              {visibleTech.map((g) => (
                <GuaranteeCard key={g.id} g={g} />
              ))}
            </div>
            <Pagination page={techPage} total={techTotal} onChange={setTechPage} />
          </>
        )}
      </section>

      {/* ── Vehículos section — deshabilitada ── */}
      <section className={`${styles.gar_section} ${styles.gar_section_disabled}`}>
        <div className={styles.gar_section_head}>
          <div className={styles.gar_section_label}>
            <span className={styles.gar_section_icon}><IconCar /></span>
            <h2>{t('garantias.vehicles.title')}</h2>
            <span className={styles.gar_soon_badge}>{t('garantias.vehicles.comingSoon')}</span>
          </div>
        </div>
        <div className={styles.gar_soon_body}>
          <span className={styles.gar_soon_icon}><IconCar /></span>
          <strong>{t('garantias.vehicles.body')}</strong>
          <p>{t('garantias.vehicles.desc')}</p>
        </div>
      </section>

      {/* ── Info banner ── */}
      <div className={styles.gar_info_banner}>
        <span><IconShield /></span>
        <div>
          <strong>{t('garantias.info.title')}</strong>
          <p>{t('garantias.info.desc')}</p>
        </div>
      </div>

    </div>
  )
}
