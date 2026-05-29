import { useEffect, useMemo, useState } from 'react'
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
import { getApplications } from '../../services/application.service'
import { getEvaluation }   from '../../services/evaluation.service'
import { getGuarantees }   from '../../services/guarantee.service'
import { getPayments }     from '../../services/payment.service'
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

function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
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

const APP_STATUS_MAP: Record<string, { title: string; tone: ActivityTone }> = {
  signed:    { title: 'Préstamo firmado',        tone: 'green'  },
  approved:  { title: 'Solicitud aprobada',      tone: 'green'  },
  submitted: { title: 'Solicitud enviada',       tone: 'indigo' },
  rejected:  { title: 'Solicitud rechazada',     tone: 'rose'   },
  draft:     { title: 'Solicitud en borrador',   tone: 'amber'  },
}

function buildActivityFeed(
  apps:     LoanApplication[],
  payments: Payment[],
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const app of apps) {
    const info = APP_STATUS_MAP[app.status]
    if (!info) continue
    items.push({
      key:    `app-${app.id}`,
      title:  info.title,
      meta:   `${fmtShort(new Date(app.created_at))} • ${shortId(app.id)}`,
      amount: `S/ ${fmt(Number(app.amount))}`,
      status: app.status === 'submitted' ? 'En evaluación' : app.status === 'approved' ? 'Aprobado' : app.status === 'signed' ? 'Activo' : app.status === 'rejected' ? 'Rechazado' : '',
      tone:   info.tone,
      icon:   IconLoan,
      date:   new Date(app.created_at),
    })
  }

  for (const p of payments) {
    items.push({
      key:    `pay-${p.id}`,
      title:  'Pago de cuota',
      meta:   `${fmtShort(new Date(p.created_at))} • Cuota ${p.cuota_number} · ${p.payment_method.toUpperCase()}`,
      amount: `- S/ ${fmt(Number(p.amount))}`,
      status: 'Completado',
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
    if (app.status !== 'signed') continue
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
  firstName:    string
  onSolicitar?: () => void
  onGarantias?: () => void
  onPay?:       () => void
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResumenView({ firstName, onSolicitar, onGarantias, onPay }: Props) {
  const [apps,       setApps]       = useState<LoanApplication[]>([])
  const [evalMap,    setEvalMap]    = useState<Map<string, Evaluation | null>>(new Map())
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [payments,   setPayments]   = useState<Payment[]>([])
  const [loading,    setLoading]    = useState(true)
  const [actPage,    setActPage]    = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [allApps, allGs, allPays] = await Promise.all([
          getApplications(),
          getGuarantees().catch(() => [] as Guarantee[]),
          getPayments().catch(() => [] as Payment[]),
        ])
        if (cancelled) return

        const signed = allApps.filter(a => a.status === 'signed')
        const evals  = await Promise.all(signed.map(a => getEvaluation(a.id).catch(() => null)))
        if (cancelled) return

        const m = new Map<string, Evaluation | null>(signed.map((a, i) => [a.id, evals[i]]))
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

  const activeLoans = useMemo(() => apps.filter(a => a.status === 'signed'),  [apps])
  const pendingApps = useMemo(() => apps.filter(a => a.status === 'submitted' || a.status === 'approved'), [apps])
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

  const activityFeed    = useMemo(() => buildActivityFeed(apps, payments), [apps, payments])
  const ACT_PER_PAGE    = 5
  const actTotalPages   = Math.ceil(activityFeed.length / ACT_PER_PAGE)
  const visibleActivity = activityFeed.slice(actPage * ACT_PER_PAGE, (actPage + 1) * ACT_PER_PAGE)

  // ── Hero subtitle ───────────────────────────────────────────────────────────

  const heroSubtitle = useMemo(() => {
    if (activeLoans.length === 0 && pendingApps.length === 0) {
      return <p className={styles.subtitle}>Empieza solicitando tu primer crédito con garantía.</p>
    }
    if (activeLoans.length > 0) {
      return (
        <p className={styles.subtitle}>
          Tienes <strong>{activeLoans.length} préstamo{activeLoans.length !== 1 ? 's' : ''} activo{activeLoans.length !== 1 ? 's' : ''}</strong> con salud financiera en buen estado.
        </p>
      )
    }
    return (
      <p className={styles.subtitle}>
        Tienes <strong>{pendingApps.length} solicitud{pendingApps.length !== 1 ? 'es' : ''} en evaluación</strong>. Te notificaremos pronto.
      </p>
    )
  }, [activeLoans, pendingApps])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div>
          <p className={styles.greeting}>Hola, {firstName} 👋</p>
          {heroSubtitle}
        </div>
        <div className={styles.verified_badge}>
          <span aria-hidden="true">◌</span>
          Perfil Verificado
        </div>
      </section>

      {/* ── Stats row ── */}
      <div className={styles.stats_row}>
        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_green}`}><IconLoan /></span>
          <div className={styles.stat_body}>
            <span>Crédito activo</span>
            <strong>{totalCredit > 0 ? `S/ ${fmt(totalCredit)}` : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_blue}`}><IconWallet /></span>
          <div className={styles.stat_body}>
            <span>Próxima cuota</span>
            <strong>{nextPayment ? `S/ ${fmt(nextPayment.amount)}` : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_violet}`}><IconShield /></span>
          <div className={styles.stat_body}>
            <span>Garantías activas</span>
            <strong>{activeGs.length > 0 ? activeGs.length : '—'}</strong>
          </div>
        </div>

        <div className={styles.stat_card}>
          <span className={`${styles.stat_icon} ${styles.stat_icon_amber}`}><IconDocument /></span>
          <div className={styles.stat_body}>
            <span>Solicitudes</span>
            <strong>{apps.length > 0 ? apps.length : '—'}</strong>
          </div>
        </div>
      </div>

      {/* ── Activity + Next payment ── */}
      <section className={styles.activity_grid}>
        <article className={styles.activity_card} aria-labelledby="activity-title">
          <div className={styles.section_head}>
            <h2 id="activity-title">Actividad Reciente</h2>
          </div>
          <div className={styles.activity_list}>
            {activityFeed.length === 0 ? (
              <p className={styles.activity_empty}>Aún no tienes actividad registrada.</p>
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
            <span className={styles.payment_label}>Próximo pago</span>
          </div>

          {nextPayment ? (
            <>
              <div className={styles.payment_body}>
                <strong id="next-payment-title">S/ {fmt(nextPayment.amount)}</strong>
                <p>Vence el {fmtDate(nextPayment.dueDate)}</p>
                <span className={styles.payment_loan_label}>{nextPayment.loanLabel}</span>
              </div>
              <div className={styles.payment_separator} />
              <button type="button" className={styles.primary_link} onClick={onPay}>
                Pagar Ahora
              </button>
            </>
          ) : (
            <>
              <div className={styles.payment_body}>
                <strong id="next-payment-title" className={styles.payment_none}>Sin pagos</strong>
                <p>No tienes cuotas pendientes por el momento.</p>
              </div>
              <div className={styles.payment_separator} />
              <button type="button" className={styles.primary_link} onClick={onSolicitar}>
                Solicitar crédito
              </button>
            </>
          )}
        </aside>
      </section>

      {/* ── Articles (static) ── */}
      <section className={styles.inspire_section} aria-labelledby="inspire-title">
        <div className={styles.section_head}>
          <h2 id="inspire-title">Infórmate ahora</h2>
          <span className={styles.section_hint}>Tips para tu crecimiento patrimonial</span>
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
                  <span className={styles.article_read}>Leer →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer banner ── */}
      <section className={styles.footer_banner} aria-label="Ventajas de la plataforma">
        <div className={styles.footer_copy}>
          <h2>Tu confianza es nuestra prioridad</h2>
          <p>Regulados por la SBS para dar mayor tranquilidad y seguridad a cada operación.</p>
        </div>
        <div className={styles.footer_stats}>
          <div><strong>99.8%</strong><span>Disponibilidad</span></div>
          <div><strong>24/7</strong><span>Soporte VIP</span></div>
          <div><strong>S/ 2M+</strong><span>Desembolsados</span></div>
        </div>
      </section>
    </>
  )
}
