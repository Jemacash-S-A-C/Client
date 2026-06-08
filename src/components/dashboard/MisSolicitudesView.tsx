import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from './Pagination'
import { getApplications } from '../../services/application.service'
import type { LoanApplication } from '../../types/api.types'
import {
  IconDocument,
  IconWarning,
  IconArrowRight,
} from './icons'
import styles from './MisSolicitudesView.module.css'
import { useLocaleFormat } from '../../utils/tz'

// Status label keys — resolved via t() inside the component
const STATUS_LABEL_KEYS: Record<LoanApplication['status'], string> = {
  draft:      'solicitudes.status.draft',
  submitted:  'solicitudes.status.submitted',
  signed:     'solicitudes.status.signed',
  approved:   'solicitudes.status.approved',
  disbursed:  'solicitudes.status.disbursed',
  defaulted:  'solicitudes.status.defaulted',
  rejected:   'solicitudes.status.rejected',
  cancelled:  'solicitudes.status.cancelled',
}

const STATUS_TONES: Record<LoanApplication['status'], 'green' | 'red' | 'purple' | 'blue' | 'amber'> = {
  draft:      'purple',
  submitted:  'blue',
  signed:     'amber',
  approved:   'green',
  disbursed:  'blue',      // teal — distinct from approved green
  defaulted:  'red',
  rejected:   'red',
  cancelled:  'purple',
}

const STATUS_CFG = {
  draft:      { color: '#6d28d9', bg: '#ede9fe' },   // violet
  submitted:  { color: '#1d4ed8', bg: '#dbeafe' },   // blue
  signed:     { color: '#92400e', bg: '#fde68a' },   // amber
  approved:   { color: '#166534', bg: '#bbf7d0' },   // emerald green
  disbursed:  { color: '#0e7490', bg: '#cffafe' },   // teal/cyan — clearly ≠ approved
  defaulted:  { color: '#7f1d1d', bg: '#fecaca' },   // red
  rejected:   { color: '#991b1b', bg: '#fee2e2' },   // rose
  cancelled:  { color: '#4b5563', bg: '#f3f4f6' },   // slate gray
} as const

function fmtAmount(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function shortId(id: string) { return `JM-${id.slice(0, 6).toUpperCase()}` }

interface Props {
  onDetalle: (app: LoanApplication) => void
}

export function MisSolicitudesView({ onDetalle }: Props) {
  const { t } = useTranslation()
  const { fmtMonthShort } = useLocaleFormat()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState(0)
  const [histPage,   setHistPage]   = useState(0)

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active   = applications.filter(a => ['submitted','signed','approved','disbursed'].includes(a.status))
  const others   = applications.filter(a => ['draft','rejected','defaulted'].includes(a.status))

  const ACTIVE_PER_PAGE  = 6
  const activeTotal      = Math.ceil(active.length / ACTIVE_PER_PAGE)
  const visibleActive    = active.slice(activePage * ACTIVE_PER_PAGE, (activePage + 1) * ACTIVE_PER_PAGE)

  // Historial: todos (others primero, luego activos al fondo)
  const histAll          = [...others, ...active]
  const HIST_PER_PAGE    = 10
  const histTotal        = Math.ceil(histAll.length / HIST_PER_PAGE)
  const visibleHist      = histAll.slice(histPage * HIST_PER_PAGE, (histPage + 1) * HIST_PER_PAGE)

  return (
    <div className={styles.view_grid}>
      <div className={styles.view_header}>
        <div>
          <h1 className={styles.view_title}>{t('solicitudes.title')}</h1>
          <p className={styles.view_sub}>{t('solicitudes.subtitle')}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.sol_stats}>
        <div className={styles.sol_stat}>
          <strong>{applications.length}</strong>
          <span>{t('solicitudes.stat.total')}</span>
        </div>
        <div className={styles.sol_stat}>
          <strong>{applications.filter(a => ['submitted','signed'].includes(a.status)).length}</strong>
          <span>{t('solicitudes.stat.active')}</span>
        </div>
        <div className={styles.sol_stat}>
          <strong>{applications.filter(a => a.status === 'approved').length}</strong>
          <span>{t('solicitudes.stat.approved')}</span>
        </div>
        <div className={styles.sol_stat}>
          <strong>{applications.filter(a => a.status === 'disbursed').length}</strong>
          <span>{t('solicitudes.stat.disbursed')}</span>
        </div>
      </div>

      {/* ── Active applications ── */}
      {loading ? (
        <div className={styles.sol_skeleton}>
          <div className={styles.sol_skel_card} />
          <div className={styles.sol_skel_card} />
        </div>
      ) : active.length > 0 && (
        <section className={styles.sol_section}>
          <h2 className={styles.section_title}>{t('solicitudes.active.title')}</h2>
          <div className={styles.historial_grid}>
            {visibleActive.map(app => {
              const tone = STATUS_TONES[app.status]
              const cfg  = STATUS_CFG[app.status]
              const dateLabel = fmtMonthShort(app.created_at).toUpperCase()
              return (
                <article
                  key={app.id}
                  className={styles.historial_card}
                  onClick={() => onDetalle(app)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onDetalle(app)}
                >
                  <div className={styles.historial_card_top}>
                    <span className={styles.historial_month}>{dateLabel}</span>
                    <span
                      className={`${styles.historial_status} ${
                        tone === 'green'  ? styles.hs_green  :
                        tone === 'red'    ? styles.hs_red    :
                        tone === 'blue'   ? styles.hs_blue   :
                        tone === 'amber'  ? styles.hs_amber  :
                                           styles.hs_purple
                      }`}
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {t(STATUS_LABEL_KEYS[app.status])}
                    </span>
                  </div>
                  <strong className={styles.historial_name}>{t('solicitudes.loan.personal')}</strong>
                  <span className={styles.historial_amount}>S/ {fmtAmount(Number(app.amount))}</span>
                  <span className={styles.historial_note}>{app.term_months} meses · {shortId(app.id)}</span>
                  <div className={styles.historial_card_footer}>
                    <span>{t('solicitudes.viewDetail')}</span>
                  </div>
                </article>
              )
            })}
          </div>
          <Pagination page={activePage} total={activeTotal} onChange={setActivePage} />
        </section>
      )}

      {/* ── All applications ── */}
      <section className={styles.sol_section}>
        <h2 className={styles.section_title}>{active.length > 0 ? t('solicitudes.history') : t('solicitudes.mySolicitudes')}</h2>

        {loading ? (
          <p className={styles.sol_loading}>{t('solicitudes.loading')}</p>
        ) : applications.length === 0 ? (
          <div className={styles.sol_empty}>
            <span className={styles.sol_empty_icon}><IconDocument /></span>
            <strong>{t('solicitudes.empty.title')}</strong>
            <p>{t('solicitudes.empty.desc')}</p>
          </div>
        ) : (
          <>
            <div className={styles.sol_list}>
              {visibleHist.map(app => {
                const cfg = STATUS_CFG[app.status]
                return (
                  <div key={app.id} className={styles.sol_row} onClick={() => onDetalle(app)}>
                    <span className={styles.sol_row_icon_wrap}>
                      <IconDocument />
                    </span>
                    <div className={styles.sol_row_info}>
                      <strong>{t('solicitudes.loan.personal')}</strong>
                      <span>S/ {fmtAmount(Number(app.amount))} · {app.term_months} meses · {shortId(app.id)}</span>
                    </div>
                    <span
                      className={styles.sol_status_badge}
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {t(STATUS_LABEL_KEYS[app.status])}
                    </span>
                    <button
                      type="button"
                      className={styles.sol_arrow}
                      aria-label={t('solicitudes.viewDetailAria')}
                      onClick={e => { e.stopPropagation(); onDetalle(app) }}
                    >
                      <IconArrowRight />
                    </button>
                  </div>
                )
              })}
            </div>
            <Pagination page={histPage} total={histTotal} onChange={setHistPage} />
          </>
        )}
      </section>

      {/* ── Info notice ── */}
      <div className={styles.sol_notice}>
        <span><IconWarning /></span>
        <div>
          <strong>{t('solicitudes.notice.title')}</strong>
          <p>{t('solicitudes.notice.desc')}</p>
        </div>
      </div>
    </div>
  )
}
