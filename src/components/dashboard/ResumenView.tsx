import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from './Pagination'
import officeImg    from '../../assets/representative_images/main_page.png'
import marketImg    from '../../assets/hero.png'
import valuationImg from '../../assets/valuacion_img/valuacion_card.png'
import {
  IconLoan,
  IconWallet,
  IconDocument,
  IconShield,
} from './icons'
import styles from './ResumenView.module.css'
import { useLocaleFormat } from '../../utils/tz'
import { getApplications } from '../../services/application.service'
import { getEvaluation }   from '../../services/evaluation.service'
import { getGuarantees }   from '../../services/guarantee.service'
import { getPayments }     from '../../services/payment.service'
import { getTwoFaStatus }  from '../../services/twofa.service'
import type { LoanApplication, Evaluation, Guarantee, Payment } from '../../types/api.types'

// ── Constants ─────────────────────────────────────────────────────────────────

const TASA_MENSUAL = 0.0125

function calcCuota(amount: number, months: number): number {
  const r = TASA_MENSUAL
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function shortId(id: string) { return `JM-${id.slice(0, 6).toUpperCase()}` }

// ── Activity feed types ───────────────────────────────────────────────────────

type ActivityTone = 'green' | 'indigo' | 'rose' | 'amber'

interface ActivityItem {
  key:    string
  title:  string
  meta:   string
  amount: string
  status: string
  tone:   ActivityTone
  icon:   () => JSX.Element
  date:   Date
}

// ── Derived helpers ───────────────────────────────────────────────────────────

const APP_STATUS_MAP: Record<string, { titleKey: string; tone: ActivityTone }> = {
  disbursed: { titleKey: 'activity.loanDisbursed',  tone: 'green'  },
  defaulted: { titleKey: 'activity.loanDefaulted',  tone: 'rose'   },
  approved:  { titleKey: 'activity.loanApproved',   tone: 'green'  },
  signed:    { titleKey: 'activity.loanSigned',     tone: 'amber'  },
  submitted: { titleKey: 'activity.loanSubmitted',  tone: 'indigo' },
  tasacion:  { titleKey: 'activity.loanTasacion',   tone: 'indigo' }, // virtual: submitted + AI done
  rejected:  { titleKey: 'activity.loanRejected',   tone: 'rose'   },
  draft:     { titleKey: 'activity.loanDraft',      tone: 'amber'  },
  // cancelled is intentionally omitted — abandoned applications don't show in the feed
}

function buildActivityFeed(
  apps:     LoanApplication[],
  payments: Payment[],
  t: (key: string) => string,
  fmtShort: (d: Date | string) => string,
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const app of apps) {
    // Submitted apps that already have AI data are in the tasación stage, not just "enviada"
    const effectiveStatus = (app.status === 'submitted' && app.guarantee?.ai_resale_value)
      ? 'tasacion'
      : app.status
    const info = APP_STATUS_MAP[effectiveStatus]
    if (!info) continue
    const statusText = app.status === 'disbursed'  ? t('activity.status.disbursed')
      : app.status === 'defaulted' ? t('activity.status.defaulted')
      : app.status === 'approved'  ? t('activity.status.approved')
      : effectiveStatus === 'tasacion' ? t('activity.status.tasacion')
      : app.status === 'submitted' ? t('activity.status.submitted')
      : app.status === 'signed'    ? t('activity.status.signed')
      : app.status === 'rejected'  ? t('activity.status.rejected')
      : ''
    items.push({
      key:    `app-${app.id}`,
      title:  t(info.titleKey),
      meta:   `${fmtShort(app.created_at)} • ${shortId(app.id)}`,
      amount: `S/ ${fmt(Number(app.amount))}`,
      status: statusText,
      tone:   info.tone,
      icon:   IconLoan,
      date:   new Date(app.created_at),
    })
  }

  for (const p of payments) {
    items.push({
      key:    `pay-${p.id}`,
      title:  t('activity.payment'),
      meta:   `${fmtShort(p.created_at)} • Cuota ${p.cuota_number} · ${p.payment_method.toUpperCase()}`,
      amount: `- S/ ${fmt(Number(p.amount))}`,
      status: t('activity.status.completed'),
      tone:   'indigo',
      icon:   IconWallet,
      date:   new Date(p.created_at),
    })
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime())
}

interface NextPayment {
  amount: number
  dueDate: Date
  loanLabel: string
}

function getNextPayment(
  apps:    LoanApplication[],
  evalMap: Map<string, Evaluation | null>,
): NextPayment | null {
  const msPerMonth = 30.44 * 24 * 3600 * 1000
  const now = new Date()
  let nearest: NextPayment | null = null

  for (const app of apps) {
    if (app.status !== 'disbursed') continue
    const evaluation = evalMap.get(app.id) ?? null
    const loanAmount = evaluation?.approved_amount != null
      ? Number(evaluation.approved_amount)
      : Number(app.amount)
    const cuota = calcCuota(loanAmount, app.term_months)
    const createdAt = new Date(app.created_at)
    const monthsElapsed = Math.min(
      Math.floor((now.getTime() - createdAt.getTime()) / msPerMonth),
      app.term_months,
    )
    if (monthsElapsed >= app.term_months) continue
    const dueDate = new Date(createdAt)
    dueDate.setMonth(dueDate.getMonth() + monthsElapsed + 1)

    if (!nearest || dueDate < nearest.dueDate) {
      nearest = { amount: cuota, dueDate, loanLabel: shortId(app.id) }
    }
  }

  return nearest
}

// ── Article cards (static educational content) ────────────────────────────────

const ARTICLES = [
  {
    tag:    'FINANZAS',
    title:  'Guía para dominar tus finanzas personales',
    source: 'SBS Perú',
    image:  officeImg,
    url:    'https://www.sbs.gob.pe/portals/3/educacion-financiera-pdf/GUIA_DOMINA_TUS_FINANZAS.pdf',
  },
  {
    tag:    'ESTRATEGIA',
    title:  'Dinero inteligente: organiza mejor tus finanzas',
    source: 'BBVA',
    image:  marketImg,
    url:    'https://www.bbva.com/es/mx/salud-financiera/dinero-inteligente-organiza-mejor-tus-finanzas/',
  },
  {
    tag:    'AHORRO',
    title:  'Finanzas personales: consejos para mejorar tu economía',
    source: 'IST San Pablo',
    image:  valuationImg,
    url:    'https://istsanpablo.edu.pe/finanzas-personales-consejos-para-mejorar-tu-economia/',
  },
]

// ── Resume card ───────────────────────────────────────────────────────────────

const RESUME_CFG: Record<string, { pct: number; stepKey: string }> = {
  draft:     { pct: 20, stepKey: 'resumen.resume.stepDraft'     },
  submitted: { pct: 40, stepKey: 'resumen.resume.stepSubmitted' },
  tasacion:  { pct: 65, stepKey: 'resumen.resume.stepTasacion'  },
  signed:    { pct: 90, stepKey: 'resumen.resume.stepSigned'    },
}

function CircleRing({ pct }: { pct: number }) {
  const R = 20
  const SIZE = 48
  const circ = 2 * Math.PI * R
  const filled = (pct / 100) * circ
  return (
    <svg
      className={styles.resume_ring}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
    >
      {/* track */}
      <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
        strokeWidth="4" className={styles.resume_ring_track} />
      {/* fill */}
      <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
        strokeWidth="4" strokeLinecap="round"
        className={styles.resume_ring_fill}
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ * 0.25}
      />
      <text x={SIZE / 2} y={SIZE / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        className={styles.resume_ring_text}>
        {pct}%
      </text>
    </svg>
  )
}

function ResumeCard({
  app,
  onResume,
}: {
  app: LoanApplication
  onResume?: (app: LoanApplication) => void
}) {
  const { t } = useTranslation()
  // Pick the right progress config for each save point
  const aiDone = app.status === 'submitted' && !!app.guarantee?.ai_resale_value
  const cfg = app.status === 'signed'
    ? RESUME_CFG.signed
    : aiDone
    ? RESUME_CFG.tasacion
    : (RESUME_CFG[app.status] ?? RESUME_CFG.submitted)
  const shortAmt = `S/ ${Number(app.amount).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`

  return (
    <div className={styles.resume_card} role="region" aria-label={t('resumen.resume.aria')}>
      <div className={styles.resume_left}>
        <CircleRing pct={cfg.pct} />
      </div>

      <div className={styles.resume_body}>
        <span className={styles.resume_pill}>{t('resumen.resume.pill')}</span>
        <strong className={styles.resume_title}>{t('resumen.resume.title')}</strong>
        <p className={styles.resume_step}>{t(cfg.stepKey)}</p>
        <span className={styles.resume_meta}>
          {shortAmt} · {app.term_months} {t('resumen.resume.months')}
        </span>
      </div>

      <button
        type="button"
        className={styles.resume_btn}
        onClick={() => onResume?.(app)}
      >
        {t('resumen.resume.cta')}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <>
      <div className={styles.hero}>
        <div className={styles.res_skel_text} />
        <div className={styles.res_skel_badge} />
      </div>
      <div className={styles.stats_row}>
        {[1,2,3,4].map(i => <div key={i} className={styles.res_skel_stat} />)}
      </div>
      <div className={styles.res_skel_section} />
    </>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  firstName:          string
  onSolicitar?:       () => void
  onGarantias?:       () => void
  onPay?:             () => void
  onResume?:          (app: LoanApplication) => void
  onResumableChange?: (app: LoanApplication | null) => void
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResumenView({ firstName, onSolicitar, onGarantias, onPay, onResume, onResumableChange }: Props) {
  const { t } = useTranslation()
  const { fmtDayMonth, fmtShort } = useLocaleFormat()
  const [apps,        setApps]       = useState<LoanApplication[]>([])
  const [evalMap,     setEvalMap]    = useState<Map<string, Evaluation | null>>(new Map())
  const [guarantees,  setGuarantees] = useState<Guarantee[]>([])
  const [payments,    setPayments]   = useState<Payment[]>([])
  const [loading,     setLoading]    = useState(true)
  const [actPage,     setActPage]    = useState(0)
  const [isVerified,  setIsVerified] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [allApps, allGs, allPays, twoFa] = await Promise.all([
          getApplications(),
          getGuarantees().catch(() => [] as Guarantee[]),
          getPayments().catch(() => [] as Payment[]),
          getTwoFaStatus().catch(() => null),
        ])
        if (cancelled) return

        if (twoFa) setIsVerified(twoFa.email_2fa_enabled && twoFa.totp_enabled)

        const approved = allApps.filter(a => a.status === 'disbursed')
        const evals    = await Promise.all(approved.map(a => getEvaluation(a.id).catch(() => null)))
        if (cancelled) return

        const m = new Map<string, Evaluation | null>(approved.map((a, i) => [a.id, evals[i]]))
        setApps(allApps)
        setEvalMap(m)
        setGuarantees(allGs)
        setPayments(allPays)
      } catch { /* show with empty data */ }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Derived data ────────────────────────────────────────────────────────────

  const activeLoans = useMemo(() => apps.filter(a => a.status === 'disbursed'), [apps])
  const pendingApps = useMemo(() => apps.filter(a => ['submitted', 'signed', 'approved'].includes(a.status)), [apps])

  // Most recent app the user hasn't finished processing (can resume).
  // signed/approved/disbursed are terminal — no resume button shown.
  const resumableApp = useMemo(
    () => apps.find(a => a.status === 'draft' || a.status === 'submitted') ?? null,
    [apps],
  )

  // Notify parent shell so it can update the sidebar badge.
  // Guard: skip while loading so we don't flash null before the fetch completes.
  useEffect(() => {
    if (loading) return
    onResumableChange?.(resumableApp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumableApp, loading])
  const activeGs    = useMemo(() => guarantees.filter(g => g.status !== 'released'), [guarantees])

  const totalCredit = useMemo(() => {
    return activeLoans.reduce((sum, app) => {
      const evaluation = evalMap.get(app.id) ?? null
      const amount = evaluation?.approved_amount != null
        ? Number(evaluation.approved_amount)
        : Number(app.amount)
      return sum + amount
    }, 0)
  }, [activeLoans, evalMap])

  const nextPayment = useMemo(() => getNextPayment(apps, evalMap), [apps, evalMap])

  const activityFeed    = useMemo(() => buildActivityFeed(apps, payments, t, fmtShort), [apps, payments, t, fmtShort])
  const ACT_PER_PAGE    = 5
  const actTotalPages   = Math.ceil(activityFeed.length / ACT_PER_PAGE)
  const visibleActivity = activityFeed.slice(actPage * ACT_PER_PAGE, (actPage + 1) * ACT_PER_PAGE)

  // ── Hero subtitle ───────────────────────────────────────────────────────────

  const heroSubtitle = useMemo(() => {
    if (activeLoans.length === 0 && pendingApps.length === 0) {
      return <p className={styles.subtitle}>{t('resumen.subtitleNoLoans')}</p>
    }
    if (activeLoans.length > 0) {
      const key = activeLoans.length === 1 ? 'resumen.subtitleActiveOne' : 'resumen.subtitleActiveMany'
      return (
        <p className={styles.subtitle} dangerouslySetInnerHTML={{ __html: t(key, { count: activeLoans.length }) }} />
      )
    }
    const key = pendingApps.length === 1 ? 'resumen.subtitlePendingOne' : 'resumen.subtitlePendingMany'
    return (
      <p className={styles.subtitle} dangerouslySetInnerHTML={{ __html: t(key, { count: pendingApps.length }) }} />
    )
  }, [activeLoans, pendingApps, t])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div>
          <p className={styles.greeting}>{t('resumen.greeting', { name: firstName })}</p>
          {heroSubtitle}
        </div>
        {isVerified && (
          <div className={styles.verified_badge}>
            <span aria-hidden="true">◌</span>
            {t('resumen.verified')}
          </div>
        )}
      </section>

      {/* ── Stats row ── */}
      <div className={styles.stats_row}>
        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_green}`}><IconLoan /></span>
          <div className={styles.stat_body}>
            <span>{t('resumen.stat.credit')}</span>
            <strong>{totalCredit > 0 ? `S/ ${fmt(totalCredit)}` : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_blue}`}><IconWallet /></span>
          <div className={styles.stat_body}>
            <span>{t('resumen.stat.nextPayment')}</span>
            <strong>{nextPayment ? `S/ ${fmt(nextPayment.amount)}` : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_violet}`}><IconShield /></span>
          <div className={styles.stat_body}>
            <span>{t('resumen.stat.guarantees')}</span>
            <strong>{activeGs.length > 0 ? activeGs.length : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_amber}`}><IconDocument /></span>
          <div className={styles.stat_body}>
            <span>{t('resumen.stat.applications')}</span>
            <strong>{apps.length > 0 ? apps.length : '—'}</strong>
          </div>
        </div>
      </div>

      {/* ── Resume in-progress application ── */}
      {resumableApp && (
        <ResumeCard app={resumableApp} onResume={onResume} />
      )}

      {/* ── Activity + Next payment ── */}
      <section className={styles.activity_grid}>
        <article className={styles.activity_card} aria-labelledby="activity-title">
          <div className={styles.section_head}>
            <h2 id="activity-title">{t('resumen.activity.title')}</h2>
          </div>
          <div className={styles.activity_list}>
            {activityFeed.length === 0 ? (
              <p className={styles.activity_empty}>{t('resumen.activity.empty')}</p>
            ) : (
              visibleActivity.map(item => {
                const Icon = item.icon
                return (
                  <div key={item.key} className={styles.activity_row}>
                    <span className={`${styles.activity_icon} ${styles[`activity_icon_${item.tone}`]}`}>
                      <Icon />
                    </span>
                    <div className={styles.activity_copy}>
                      <strong>{item.title}</strong>
                      <span>{item.meta}</span>
                    </div>
                    <div className={styles.activity_amount}>
                      <strong>{item.amount}</strong>
                      {item.status && <span>{item.status}</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <Pagination page={actPage} total={actTotalPages} onChange={setActPage} />
        </article>

        <aside className={styles.payment_card} aria-labelledby="next-payment-title">
          <div className={styles.payment_head}>
            <span className={styles.payment_icon}><IconWallet /></span>
            <span className={styles.payment_label}>{t('resumen.payment.label')}</span>
          </div>

          {nextPayment ? (
            <>
              <div className={styles.payment_body}>
                <strong id="next-payment-title">S/ {fmt(nextPayment.amount)}</strong>
                <p>{t('resumen.payment.dueOn', { date: fmtDayMonth(nextPayment.dueDate) })}</p>
                <span className={styles.payment_loan_label}>{nextPayment.loanLabel}</span>
              </div>
              <div className={styles.payment_separator} />
              <button type="button" className={styles.primary_link} onClick={onPay}>
                {t('resumen.payment.payNow')}
              </button>
            </>
          ) : (
            <>
              <div className={styles.payment_body}>
                <strong id="next-payment-title" className={styles.payment_none}>{t('resumen.payment.none')}</strong>
                <p>{t('resumen.payment.noPending')}</p>
              </div>
              <div className={styles.payment_separator} />
              <button type="button" className={styles.primary_link} onClick={onSolicitar}>
                {t('resumen.payment.requestCredit')}
              </button>
            </>
          )}
        </aside>
      </section>

      {/* ── Articles (static) ── */}
      <section className={styles.inspire_section} aria-labelledby="inspire-title">
        <div className={styles.section_head}>
          <h2 id="inspire-title">{t('resumen.inspire.title')}</h2>
          <span className={styles.section_hint}>{t('resumen.inspire.hint')}</span>
        </div>
        <div className={styles.article_grid}>
          {ARTICLES.map(card => (
            <a
              key={card.title}
              className={styles.article_card}
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${card.title} — ${card.source}`}
            >
              <div className={styles.article_visual}>
                <img src={card.image} alt="" aria-hidden="true" />
                <span>{card.tag}</span>
              </div>
              <div className={styles.article_copy}>
                <h3>{card.title}</h3>
                <div className={styles.article_footer}>
                  <span className={styles.article_source}>{card.source}</span>
                  <span className={styles.article_read}>{t('resumen.inspire.read')}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer banner ── */}
      <section className={styles.footer_banner} aria-label="Ventajas de la plataforma">
        <div className={styles.footer_copy}>
          <h2>{t('resumen.footer.title')}</h2>
          <p>{t('resumen.footer.desc')}</p>
        </div>
        <div className={styles.footer_stats}>
          <div><strong>99.8%</strong><span>{t('resumen.footer.uptime')}</span></div>
          <div><strong>24/7</strong><span>{t('resumen.footer.support')}</span></div>
          <div><strong>S/ 2M+</strong><span>{t('resumen.footer.disbursed')}</span></div>
        </div>
      </section>
    </>
  )
}
