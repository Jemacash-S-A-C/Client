import { type ReactElement, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './UserDashboard.module.css'
import type { UserSession } from '../types/api.types'
import {
  IconSettings,
  IconChart,
  IconWallet,
  IconDocument,
  IconCalendar,
  IconShield,
} from '../components/dashboard/icons'

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
import { ResumenView } from '../components/dashboard/ResumenView'
import { MisPrestamosView } from '../components/dashboard/MisPrestamosView'
import { MisSolicitudesView } from '../components/dashboard/MisSolicitudesView'
import { ConfiguracionView } from '../components/dashboard/ConfiguracionView'
import { CalendarioView } from '../components/dashboard/CalendarioView'
import { SolicitarPrestamoView } from '../components/dashboard/SolicitarPrestamoView'
import { AuditorTecnicoView } from '../components/dashboard/AuditorTecnicoView'
import { TasacionResultadosView } from '../components/dashboard/TasacionResultadosView'
import { FirmaVerificacionView } from '../components/dashboard/FirmaVerificacionView'
import { MisGarantiasView } from '../components/dashboard/MisGarantiasView'
import { RegistrarGarantiaTecView } from '../components/dashboard/RegistrarGarantiaTecView'
import { RegistrarGarantiaVehView } from '../components/dashboard/RegistrarGarantiaVehView'
import { PagarCuotaView } from '../components/dashboard/PagarCuotaView'
import { DetalleSolicitudView } from '../components/dashboard/DetalleSolicitudView'
import { SubirDocumentosView } from '../components/dashboard/SubirDocumentosView'
import type { LoanPaymentInfo } from '../components/dashboard/PagarCuotaView'
import type { LoanApplication } from '../types/api.types'
import { getEvaluation } from '../services/evaluation.service'
import { getDocumentsByApplication } from '../services/document.service'
import { mpConfirm } from '../services/payment.service'

type ActiveView =
  | 'resumen'
  | 'prestamos'
  | 'solicitudes'
  | 'garantias'
  | 'documentos'
  | 'configuracion'
  | 'calendario'
  | 'solicitar'
  | 'auditoria'
  | 'tasacion'
  | 'firma'
  | 'registrar-garantia-tec'
  | 'registrar-garantia-veh'
  | 'pagar-cuota'
  | 'detalle-solicitud'

type UserDashboardProps = {
  user: UserSession
  onLogout: () => void
  onUserUpdate: (updated: UserSession) => void
}

export default function UserDashboard({ user, onLogout, onUserUpdate }: UserDashboardProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const navItems: { view: ActiveView; label: string; icon: () => ReactElement }[] = [
    { view: 'resumen',       label: t('nav.resume'),           icon: IconChart    },
    { view: 'prestamos',     label: t('nav.myLoans'),          icon: IconWallet   },
    { view: 'garantias',     label: t('nav.myGuarantees'),     icon: IconShield   },
    { view: 'solicitudes',   label: t('nav.myApplications'),   icon: IconDocument },
    { view: 'configuracion', label: t('nav.settings'),         icon: IconSettings },
    { view: 'calendario',    label: t('nav.calendar'),         icon: IconCalendar },
  ]
  const [activeView, setActiveView] = useState<ActiveView>('resumen')
  const skipNextHistoryPushRef = useRef(false)
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null)
  const [activeApprovedAmount, setActiveApprovedAmount] = useState<number | null>(null)
  const [postGuaranteeView, setPostGuaranteeView] = useState<'garantias' | 'solicitar'>('garantias')
  const [activeLoanPayment, setActiveLoanPayment] = useState<LoanPaymentInfo | null>(null)
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null)
  /** Resumable app surfaced by ResumenView — null when none */
  const [resumableApp, setResumableApp] = useState<LoanApplication | null>(null)
  const hasResumable = resumableApp !== null
  const [mpReturnMsg, setMpReturnMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const firstName = user.displayName.split(' ')[0] ?? user.displayName

  useEffect(() => {
    window.history.replaceState({ dashboardView: activeView }, '')
    const onPopState = (event: PopStateEvent) => {
      const prevView = event.state?.dashboardView as ActiveView | undefined
      if (!prevView) return
      skipNextHistoryPushRef.current = true
      setActiveView(prevView)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (skipNextHistoryPushRef.current) {
      skipNextHistoryPushRef.current = false
      return
    }
    window.history.pushState({ dashboardView: activeView }, '')
  }, [activeView])

  // ── Handle Mercado Pago Checkout Pro return ───────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mpStatus = params.get('mp_status')
    if (!mpStatus) return

    // Clean the URL immediately so a refresh doesn't re-trigger
    window.history.replaceState({ dashboardView: 'prestamos' }, '', window.location.pathname)

    if (mpStatus === 'success') {
      const collectionId = params.get('collection_id') ?? params.get('payment_id') ?? 'mp-checkout'
      const raw = localStorage.getItem('mp_pending')
      localStorage.removeItem('mp_pending')

      if (raw) {
        const pending: { applicationId: string; amount: number; cuotaNumber: number } = JSON.parse(raw)
        mpConfirm({
          application_id: pending.applicationId,
          amount: pending.amount,
          cuota_number: pending.cuotaNumber,
          mp_payment_id: collectionId,
        })
          .then(() => {
            setMpReturnMsg({ ok: true, text: '¡Pago con Mercado Pago confirmado exitosamente!' })
            setActiveView('prestamos')
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'No se pudo confirmar el pago.'
            setMpReturnMsg({ ok: false, text: msg })
            setActiveView('prestamos')
          })
      } else {
        setMpReturnMsg({ ok: true, text: '¡Pago realizado! Actualizando tu historial…' })
        setActiveView('prestamos')
      }
    } else if (mpStatus === 'failure') {
      setMpReturnMsg({ ok: false, text: 'El pago fue rechazado. Puedes intentarlo de nuevo.' })
      setActiveView('prestamos')
    } else if (mpStatus === 'pending') {
      setMpReturnMsg({ ok: false, text: 'Tu pago está pendiente de acreditación. Te avisaremos cuando se confirme.' })
      setActiveView('prestamos')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Navigate to the correct save-point for a resumable application.
   *
   *  Routing is derived entirely from server-side state — no localStorage.
   *
   *  1. draft      → solicitar
   *  2. submitted  → check evaluation.approved_amount:
   *       • null        → auditoria  (AI hasn't run or user hasn't viewed results)
   *       • set + docs missing → documentos  (tasacion accepted, docs pending)
   *       • set + docs done    → firma        (docs uploaded, ready to sign)
   *
   *  signed / approved / disbursed are terminal — not resumable.
   */
  async function handleResume(app: LoanApplication) {
    setActiveApplicationId(app.id)
    if (app.status === 'draft') {
      setActiveView('solicitar')
      return
    }
    try {
      const [ev, docs] = await Promise.all([
        getEvaluation(app.id),
        getDocumentsByApplication(app.id).catch(() => [] as Awaited<ReturnType<typeof getDocumentsByApplication>>),
      ])
      if (ev.approved_amount != null) {
        const uploaded = new Set(docs.map(d => d.document_type))
        const allDone = ['dni', 'pay_stub', 'utility_bill'].every(t => uploaded.has(t))
        setActiveView(allDone ? 'firma' : 'documentos')
        return
      }
    } catch { /* evaluation not found or network error — fall through */ }
    setActiveView('auditoria')
  }

  // ── Full-screen flow views ────────────────────────────────────────────────

  if (activeView === 'detalle-solicitud' && activeApplication) {
    return (
      <DetalleSolicitudView
        app={activeApplication}
        onBack={() => setActiveView('solicitudes')}
        onContinue={(appId) => {
          setActiveApplicationId(appId)
          setActiveView('auditoria')
        }}
      />
    )
  }

  if (activeView === 'pagar-cuota' && activeLoanPayment) {
    return (
      <PagarCuotaView
        info={activeLoanPayment}
        userEmail={user.email}
        onBack={() => setActiveView('prestamos')}
        onSuccess={() => { setActiveLoanPayment(null); setActiveView('prestamos') }}
      />
    )
  }

  if (activeView === 'registrar-garantia-tec') {
    return (
      <RegistrarGarantiaTecView
        onBack={() => setActiveView(postGuaranteeView)}
        onSuccess={() => setActiveView(postGuaranteeView)}
      />
    )
  }

  if (activeView === 'registrar-garantia-veh') {
    return (
      <RegistrarGarantiaVehView
        onBack={() => setActiveView(postGuaranteeView)}
        onSuccess={() => setActiveView(postGuaranteeView)}
      />
    )
  }

  if (activeView === 'tasacion') {
    return (
      <TasacionResultadosView
        applicationId={activeApplicationId}
        onCancel={() => {
          setActiveApplicationId(null); setResumableApp(null); setActiveView('solicitudes')
        }}
        onAccept={(amount) => { setActiveApprovedAmount(amount); setActiveView('documentos') }}
      />
    )
  }

  if (activeView === 'documentos' && activeApplicationId) {
    return (
      <SubirDocumentosView
        applicationId={activeApplicationId}
        onBack={() => setActiveView('tasacion')}
        onContinue={() => setActiveView('firma')}
      />
    )
  }

  if (activeView === 'firma') {
    return (
      <FirmaVerificacionView
        applicationId={activeApplicationId}
        approvedAmount={activeApprovedAmount}
        onFinalize={() => {
          setResumableApp(null); setActiveView('solicitudes')
        }}
        onCancelApp={() => {
          setActiveApplicationId(null); setResumableApp(null); setActiveView('solicitudes')
        }}
        user={user}
      />
    )
  }

  if (activeView === 'auditoria') {
    return (
      <AuditorTecnicoView
        applicationId={activeApplicationId}
        onCancel={() => {
          setActiveApplicationId(null); setResumableApp(null); setActiveView('solicitudes')
        }}
        onComplete={() => setActiveView('tasacion')}
      />
    )
  }

  // ── Main dashboard shell ──────────────────────────────────────────────────

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brand_name}>{t('nav.brand')}</span>
          <span className={styles.brand_subtitle}>{t('nav.brandSubtitle')}</span>
        </div>

        <nav className={styles.side_nav} aria-label="Navegación del panel">
          {navItems.map(({ view, label, icon: NavIcon }) => (
            <button
              key={view}
              type="button"
              className={`${styles.side_link} ${activeView === view ? styles.side_link_active : ''}`}
              onClick={() => setActiveView(view)}
            >
              <span className={styles.side_icon}><NavIcon /></span>
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className={`${styles.sidebar_cta} ${hasResumable ? styles.sidebar_cta_resume : ''}`}
          onClick={() => resumableApp ? handleResume(resumableApp) : setActiveView('solicitar')}
        >
          {hasResumable ? (
            <>
              <span className={styles.resume_dot} aria-hidden="true" />
              {t('nav.resumeLoan')}
            </>
          ) : (
            <>
              <span aria-hidden="true">+</span>
              {t('nav.requestLoan')}
            </>
          )}
        </button>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbar_actions}>
            <div className={styles.avatar_menu_wrap} ref={menuRef}>
              <button
                type="button"
                className={styles.user_chip}
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
              >
                <div className={styles.user_meta}>
                  <strong>{user.displayName}</strong>
                  <span>{user.role}</span>
                </div>
                <span className={styles.avatar} aria-hidden="true">
                  {user.initials}
                </span>
              </button>

              {menuOpen && (
                <div className={styles.avatar_dropdown}>
                  <div className={styles.dropdown_header}>
                    <span className={styles.dropdown_avatar}>{user.initials}</span>
                    <div className={styles.dropdown_header_meta}>
                      <strong>{user.displayName}</strong>
                      <span>{user.role}</span>
                    </div>
                  </div>
                  <div className={styles.dropdown_divider} />
                  <button
                    type="button"
                    className={styles.dropdown_item}
                    onClick={() => { setMenuOpen(false); setActiveView('configuracion') }}
                  >
                    <IconSettings /> {t('nav.settings')}
                  </button>
                  <div className={styles.dropdown_divider} />
                  <button
                    type="button"
                    className={styles.dropdown_item_danger}
                    onClick={() => { setMenuOpen(false); onLogout() }}
                  >
                    <IconLogout /> {t('topbar.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {mpReturnMsg && (
            <div
              role="alert"
              style={{
                margin: '0 0 1.25rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '0.85rem',
                background: mpReturnMsg.ok ? '#dcfce7' : '#fee2e2',
                color: mpReturnMsg.ok ? '#166534' : '#991b1b',
                fontWeight: 600,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <span>{mpReturnMsg.text}</span>
              <button
                type="button"
                onClick={() => setMpReturnMsg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, color: 'inherit', padding: 0 }}
                aria-label="Cerrar"
              >✕</button>
            </div>
          )}
          {activeView === 'resumen' && (
            <ResumenView
              firstName={firstName}
              onSolicitar={() => setActiveView('solicitar')}
              onGarantias={() => setActiveView('garantias')}
              onPay={() => setActiveView('prestamos')}
              onResume={handleResume}
              onResumableChange={setResumableApp}
            />
          )}
          {activeView === 'prestamos' && (
            <MisPrestamosView
              onPay={(info) => {
                setActiveLoanPayment(info)
                setActiveView('pagar-cuota')
              }}
            />
          )}
          {activeView === 'solicitudes' && (
            <MisSolicitudesView
              onDetalle={(app) => {
                setActiveApplication(app)
                setActiveView('detalle-solicitud')
              }}
            />
          )}
          {activeView === 'configuracion' && <ConfiguracionView user={user} onUpdate={onUserUpdate} />}
          {activeView === 'calendario' && (
            <CalendarioView
              onPay={(info) => {
                setActiveLoanPayment(info)
                setActiveView('pagar-cuota')
              }}
            />
          )}
          {activeView === 'garantias' && (
            <MisGarantiasView
              onRegisterTec={() => {
                setPostGuaranteeView('garantias')
                setActiveView('registrar-garantia-tec')
              }}
              onRegisterVeh={() => {
                setPostGuaranteeView('garantias')
                setActiveView('registrar-garantia-veh')
              }}
            />
          )}
          {activeView === 'solicitar' && (
            <SolicitarPrestamoView
              applicationId={activeApplicationId}
              onBack={() => { setActiveApplicationId(null); setActiveView('resumen') }}
              onContinue={(appId) => {
                setActiveApplicationId(appId)
                setActiveView('auditoria')
              }}
              onAddGuarantee={() => {
                setPostGuaranteeView('solicitar')
                setActiveView('registrar-garantia-tec')
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

