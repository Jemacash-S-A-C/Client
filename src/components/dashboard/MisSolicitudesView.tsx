import { useEffect, useState } from 'react'
import { getApplications } from '../../services/application.service'
import type { LoanApplication } from '../../types/api.types'
import {
  IconCar,
  IconHome,
  IconBriefcase,
  IconCheck,
  IconDocument,
  IconWarning,
  IconDownload,
  IconCalendar,
  IconArrowRight,
  IconPlus,
} from './icons'
import styles from './MisSolicitudesView.module.css'

const timelineSteps = [
  { label: 'Registro', date: '12 Mar, 2024', done: true },
  { label: 'Inspección', date: '14 Mar, 2024', done: true },
  { label: 'Oferta Final', date: 'En Curso', done: false, active: true },
  { label: 'Desembolso', date: 'Pendiente', done: false, active: false },
] as const

const tramitesActivos = [
  {
    name: 'Hipotecario Depto. Miraflores',
    amount: 'S/ 280,000.00',
    meta: 'Creado hace 5 días',
    badge: 'ANÁLISIS DE RIESGO',
    badgeTone: 'purple',
    icon: IconHome,
  },
  {
    name: 'Capital de Trabajo Editorial',
    amount: 'S/ 15,000.00',
    meta: 'Creado el 10 Mar',
    badge: 'APROBADO',
    badgeTone: 'green',
    icon: IconBriefcase,
  },
] as const

const historialSolicitudes = [
  {
    month: 'ENE 2024',
    status: 'FINALIZADO',
    statusTone: 'green',
    name: 'Préstamo Personal',
    amount: 'S/ 5,000.00',
    note: 'Desembolsado con éxito',
  },
  {
    month: 'DIC 2023',
    status: 'CANCELADO',
    statusTone: 'red',
    name: 'Línea de Crédito',
    amount: 'S/ 2,500.00',
    note: 'Cancelado por el usuario',
  },
  {
    month: 'NOV 2023',
    status: 'FINALIZADO',
    statusTone: 'green',
    name: 'Valuación Kia Rio',
    amount: 'S/ 32,000.00',
    note: 'Crédito otorgado',
  },
] as const

const STATUS_LABELS: Record<LoanApplication['status'], string> = {
  draft:     'BORRADOR',
  submitted: 'EN REVISIÓN',
  approved:  'APROBADO',
  rejected:  'RECHAZADO',
  signed:    'FIRMADO',
}

const STATUS_TONES: Record<LoanApplication['status'], string> = {
  draft:     'purple',
  submitted: 'purple',
  approved:  'green',
  rejected:  'red',
  signed:    'green',
}

export function MisSolicitudesView() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(() => { /* keep empty */ })
      .finally(() => setLoadingApps(false))
  }, [])
  return (
    <div className={styles.view_grid}>
      <div className={styles.view_header}>
        <div>
          <h1 className={styles.view_title}>Estado de mis Solicitudes</h1>
          <p className={styles.view_sub}>Gestiona y supervisa el progreso de tus trámites financieros en tiempo real.</p>
        </div>
      </div>

      <article className={styles.featured_solicitud}>
        <div className={styles.featured_left}>
          <div className={styles.featured_icon_wrap}>
            <IconCar />
          </div>
          <div className={styles.featured_info}>
            <strong>Valuación de Camioneta Toyota</strong>
            <span>Solicitud ID: #EP-2024-9981 · S/ 45,000.00</span>
          </div>
        </div>
        <div className={styles.featured_actions}>
          <button type="button" className={styles.outline_btn_dark}>Ver Detalle</button>
          <button type="button" className={styles.pay_btn}>Continuar Proceso</button>
        </div>

        <div className={styles.timeline}>
          {timelineSteps.map((step, i) => (
            <div key={step.label} className={styles.timeline_step}>
              <div className={`${styles.timeline_node} ${step.done ? styles.node_done : step.active ? styles.node_active : styles.node_pending}`}>
                {step.done ? <IconCheck /> : <IconDocument />}
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={`${styles.timeline_line} ${step.done ? styles.line_done : styles.line_pending}`} />
              )}
              <div className={styles.timeline_label}>
                <span className={step.done ? styles.tl_done : step.active ? styles.tl_active : styles.tl_pending}>
                  {step.label}
                </span>
                <span className={styles.tl_date}>{step.date}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className={styles.tramites_layout}>
        <section className={styles.tramites_section}>
          <div className={styles.tramites_head}>
            <h2 className={styles.section_title}>Trámites Activos</h2>
            <button type="button" className={styles.link_button_green}>Ver todos</button>
          </div>
          <div className={styles.tramites_list}>
            {tramitesActivos.map((t) => {
              const TIcon = t.icon
              return (
                <div key={t.name} className={styles.tramite_row}>
                  <span className={styles.tramite_icon_wrap}>
                    <TIcon />
                  </span>
                  <div className={styles.tramite_info}>
                    <strong>{t.name}</strong>
                    <span>{t.amount} · {t.meta}</span>
                  </div>
                  <span className={`${styles.tramite_badge} ${t.badgeTone === 'green' ? styles.badge_green : styles.badge_purple_text}`}>
                    {t.badge}
                  </span>
                  <button type="button" className={styles.tramite_arrow} aria-label="Ver detalle">
                    <IconArrowRight />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <aside className={styles.action_required_card}>
          <div className={styles.ar_header}>
            <span className={styles.ar_icon}><IconWarning /></span>
            <h3>Acción Requerida</h3>
          </div>
          <p>Tienes 3 documentos pendientes que están retrasando tus solicitudes.</p>
          <ul className={styles.ar_docs}>
            <li>
              <span className={styles.ar_doc_icon}><IconDocument /></span>
              SOAT Vigente (Toyota)
              <button type="button" className={styles.ar_download} aria-label="Subir SOAT"><IconDownload /></button>
            </li>
            <li>
              <span className={styles.ar_doc_icon}><IconCalendar /></span>
              Copia DNI (Cónyuge)
              <button type="button" className={styles.ar_download} aria-label="Subir DNI"><IconDownload /></button>
            </li>
          </ul>
          <button type="button" className={styles.ar_cta}>Subir Documentos Ahora</button>
        </aside>
      </div>

      {/* ── Real applications from backend ─────────────── */}
      <section className={styles.historial_section}>
        <h2 className={styles.section_title}>Mis Solicitudes</h2>
        {loadingApps ? (
          <p style={{ fontSize: '0.85rem', color: '#666', padding: '1rem 0' }}>Cargando solicitudes…</p>
        ) : applications.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#666', padding: '1rem 0' }}>
            No tienes solicitudes aún. ¡Solicita tu primer préstamo!
          </p>
        ) : (
          <div className={styles.historial_grid}>
            {applications.map((app) => {
              const dateLabel = new Date(app.created_at).toLocaleDateString('es-PE', {
                month: 'short', year: 'numeric',
              }).toUpperCase()
              const tone = STATUS_TONES[app.status]
              return (
                <article key={app.id} className={styles.historial_card}>
                  <div className={styles.historial_card_top}>
                    <span className={styles.historial_month}>{dateLabel}</span>
                    <span
                      className={`${styles.historial_status} ${tone === 'green' ? styles.hs_green : styles.hs_red}`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>
                  <strong className={styles.historial_name}>Préstamo Personal</strong>
                  <span className={styles.historial_amount}>
                    S/ {Number(app.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={styles.historial_note}>
                    {app.term_months} meses · #{app.id.slice(0, 8).toUpperCase()}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className={styles.historial_section}>
        <h2 className={styles.section_title}>Historial de Solicitudes</h2>
        <div className={styles.historial_grid}>
          {historialSolicitudes.map((h) => (
            <article key={h.name + h.month} className={styles.historial_card}>
              <div className={styles.historial_card_top}>
                <span className={styles.historial_month}>{h.month}</span>
                <span className={`${styles.historial_status} ${h.statusTone === 'green' ? styles.hs_green : styles.hs_red}`}>
                  {h.status}
                </span>
              </div>
              <strong className={styles.historial_name}>{h.name}</strong>
              <span className={styles.historial_amount}>{h.amount}</span>
              <span className={styles.historial_note}>✓ {h.note}</span>
            </article>
          ))}

          <article className={styles.historial_card_cta}>
            <strong>¿NECESITAS MÁS?</strong>
            <p>Aumenta tu capacidad de crédito ahora.</p>
            <button type="button" className={styles.historial_plus_btn} aria-label="Solicitar más crédito">
              <IconPlus />
            </button>
          </article>
        </div>
      </section>
    </div>
  )
}
