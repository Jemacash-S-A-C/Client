import { useState } from 'react'
import { IconShield, IconArrowRight, IconPlus } from './icons'
import styles from './CalendarioView.module.css'

type CalView = 'mes' | 'semana' | 'dia'

const DAY_HEADERS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

type CalEvent = { label: string; detail: string; tone: 'blue' | 'rose' | 'green' }
type CalDay = { day: number; outOfMonth?: boolean; today?: boolean; events?: CalEvent[] }

const CAL_WEEKS: CalDay[][] = [
  [
    { day: 25, outOfMonth: true }, { day: 26, outOfMonth: true }, { day: 27, outOfMonth: true },
    { day: 28, outOfMonth: true }, { day: 29, outOfMonth: true }, { day: 30, outOfMonth: true },
    { day: 1 },
  ],
  [
    { day: 2, events: [{ label: 'Pago', detail: 'S/ 1,250.00', tone: 'blue' }] },
    { day: 3 }, { day: 4, today: true },
    { day: 5, events: [{ label: 'Ven...', detail: 'Vencimiento', tone: 'rose' }] },
    { day: 6 }, { day: 7 }, { day: 8 },
  ],
  [
    { day: 9 },
    { day: 10, events: [{ label: 'Rec...', detail: 'Recordatorio', tone: 'green' }] },
    { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 },
    { day: 15, outOfMonth: true },
  ],
  [
    { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
    { day: 20 }, { day: 21 }, { day: 22 },
  ],
  [
    { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 },
    { day: 27 }, { day: 28 }, { day: 29 },
  ],
  [
    { day: 30 }, { day: 31 },
    { day: 1, outOfMonth: true }, { day: 2, outOfMonth: true },
    { day: 3, outOfMonth: true }, { day: 4, outOfMonth: true }, { day: 5, outOfMonth: true },
  ],
]

const UPCOMING_EVENTS = [
  { month: 'OCT', day: '05', title: 'Vencimiento de Solicitud', meta: 'Ref: #JMA-90210' },
  { month: 'OCT', day: '10', title: 'Recordatorio de Valuación', meta: 'Inmueble: San Isidro' },
  { month: 'OCT', day: '15', title: 'Pago de Cuota', meta: 'Monto: S/ 2,400.00' },
] as const

export function CalendarioView() {
  const [view, setView] = useState<CalView>('mes')

  return (
    <div className={styles.cal_layout}>

      {/* ── Calendar panel ─────────────────────────────── */}
      <div className={styles.cal_panel}>
        <div className={styles.cal_panel_head}>
          <div>
            <h1 className={styles.cal_title}>Octubre 2023</h1>
            <p className={styles.cal_subtitle}>Tienes 12 eventos financieros este mes</p>
          </div>
          <div className={styles.cal_view_tabs}>
            {(['mes', 'semana', 'dia'] as CalView[]).map((v) => (
              <button
                key={v}
                type="button"
                className={`${styles.cal_view_tab} ${view === v ? styles.cal_view_tab_active : ''}`}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.cal_grid}>
          {DAY_HEADERS.map((h) => (
            <div key={h} className={styles.cal_day_header}>{h}</div>
          ))}

          {CAL_WEEKS.flat().map((cell, i) => (
            <div
              key={i}
              className={`${styles.cal_cell} ${cell.outOfMonth ? styles.cal_cell_out : ''} ${cell.today ? styles.cal_cell_today : ''}`}
            >
              {cell.today && <span className={styles.cal_today_label}>HOY</span>}
              <span className={styles.cal_day_num}>{cell.day}</span>
              {cell.events?.map((ev) => (
                <div key={ev.label} className={`${styles.cal_event} ${styles[`cal_event_${ev.tone}`]}`}>
                  <strong>{ev.label}</strong>
                  <span>{ev.detail}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right sidebar ──────────────────────────────── */}
      <aside className={styles.cal_sidebar}>

        <div className={styles.cal_total_card}>
          <span className={styles.cal_total_label}>TOTAL POR PAGAR</span>
          <strong className={styles.cal_total_amount}>S/ 4,820.50</strong>
          <span className={styles.cal_total_trend}>↓ 12% menos que el mes pasado</span>
        </div>

        <div className={styles.cal_events_card}>
          <div className={styles.cal_events_head}>
            <h3>Próximos Eventos</h3>
            <button type="button" className={styles.link_button_green}>Ver todo</button>
          </div>
          <div className={styles.cal_events_list}>
            {UPCOMING_EVENTS.map((ev) => (
              <div key={ev.day} className={styles.cal_event_row}>
                <div className={styles.cal_event_date}>
                  <span>{ev.month}</span>
                  <strong>{ev.day}</strong>
                </div>
                <div className={styles.cal_event_info}>
                  <strong>{ev.title}</strong>
                  <span>{ev.meta}</span>
                </div>
                <span className={styles.cal_event_arrow}><IconArrowRight /></span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cal_promo_card}>
          <span className={styles.cal_promo_arrow}>↑</span>
          <strong>Optimiza tu flujo de caja con Jemacash</strong>
          <span>Descubre nuevas herramientas de gestión</span>
        </div>

      </aside>

      {/* ── Bottom security bar ───────────────────────── */}
      <div className={styles.cal_security_bar}>
        <div className={styles.cal_sec_left}>
          <span className={styles.cal_sec_shield}><IconShield /></span>
          <div>
            <strong>Tu cuenta está protegida</strong>
            <span>Encriptación de grado bancario y monitoreo 24/7.</span>
          </div>
        </div>
        <div className={styles.cal_sec_stats}>
          <div>
            <strong>99.9%</strong>
            <span>UPTIME DEL SISTEMA</span>
          </div>
          <div>
            <strong>2m</strong>
            <span>TIEMPO DE RESPUESTA</span>
          </div>
        </div>
        <button type="button" className={styles.cal_sec_btn}>Ver Seguridad</button>
      </div>

      {/* FAB */}
      <button type="button" className={styles.cal_fab} aria-label="Añadir evento">
        <IconPlus />
      </button>

    </div>
  )
}
