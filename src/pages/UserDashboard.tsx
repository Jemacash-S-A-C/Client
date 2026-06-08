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
  IconDownload,
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
import {
  FLOW_VIEWS,
  saveFlowSession,
  clearFlowSession,
  loadFlowSession,
  markFirmaStep,
  clearFirmaStep,
  hasFirmaStep,
} from '../utils/flowSession'

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
    { view: 'documentos',    label: t('nav.myDocuments'),      icon: IconDownload },
    { view: 'configuracion', label: t('nav.settings'),         icon: IconSettings },
    { view: 'calendario',    label: t('nav.calendar'),         icon: IconCalendar },
  ]
  // Lazy initializers read from localStorage so F5 restores the active flow step
  // without flashing the resumen view first.
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const s = loadFlowSession()
    return (s?.view as ActiveView | undefined) ?? 'resumen'
  })
  const skipNextHistoryPushRef = useRef(false)
  /** Set to true by "Guardar y salir" so the session useEffect skips clearing on the next run */
  const skipSessionClearRef = useRef(false)
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(() => {
    return loadFlowSession()?.appId ?? null
  })
  const [activeApprovedAmount, setActiveApprovedAmount] = useState<number | null>(null)
  const [postGuaranteeView, setPostGuaranteeView] = useState<'garantias' | 'solicitar'>(() => {
    return (loadFlowSession()?.postGuaranteeView) ?? 'garantias'
  })
  const [activeLoanPayment, setActiveLoanPayment] = useState<LoanPaymentInfo | null>(null)
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null)
  const [returnFromDocsTo, setReturnFromDocsTo] = useState<'firma' | null>(null)
  /** Resumable app surfaced by ResumenView — null when none */
  const [resumableApp, setResumableApp] = useState<LoanApplication | null>(null)
  const hasResumable = resumableApp !== null

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

  // Persist / clear the flow session whenever the active view or application changes.
  // "Guardar y salir" sets skipSessionClearRef to prevent clearing when navigating to resumen.
  useEffect(() => {
    if (FLOW_VIEWS.has(activeView)) {
      saveFlowSession({ view: activeView, appId: activeApplicationId, postGuaranteeView })
    } else if (!skipSessionClearRef.current) {
      clearFlowSession()
    }
    skipSessionClearRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, activeApplicationId, postGuaranteeView])

  // ── Mark firma save-point as soon as the view becomes active ─────────────────
  // Belt-and-suspenders: markFirmaStep is also called in onAccept from tasacion,
  // but doing it here ensures the flag is always set regardless of how the user
  // reached firma (resume, direct navigation, etc.).
  useEffect(() => {
    if (activeView === 'firma') markFirmaStep(activeApplicationId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView])

  /** Navigate to the correct save-point for a resumable application.
   *
   *  Save points:
   *  1. draft          → solicitar   (still filling out the form)
   *  2. submitted      → auditoria   (hardware scan + full audit-report)
   *     • Routes to auditoria even when AI data exists so the user can read
   *       the complete report before accepting the offer.
   *  3. submitted + firma flag → firma  (user accepted tasación; restore them
   *       directly in FirmaVerificacionView instead of making them click through
   *       auditoria → tasacion → accept again)
   *
   *  signed / approved / disbursed are terminal — they are not resumable.
   */
  function handleResume(app: LoanApplication) {
    setActiveApplicationId(app.id)
    if (app.status === 'draft') {
      setActiveView('solicitar')
    } else if (hasFirmaStep(app.id)) {
      // User already accepted the tasación offer in a previous session
      setActiveView('firma')
    } else {
      // submitted (with or without AI) → start at auditoria
      setActiveView('auditoria')
    }
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
          clearFlowSession()
          setActiveApplicationId(null); setResumableApp(null); setActiveView('solicitudes')
        }}
        onAccept={(amount) => { setActiveApprovedAmount(amount); markFirmaStep(activeApplicationId); setActiveView('firma') }}
      />
    )
  }

  if (activeView === 'firma') {
    return (
      <FirmaVerificacionView
        applicationId={activeApplicationId}
        approvedAmount={activeApprovedAmount}
        onFinalize={() => {
          clearFlowSession(); clearFirmaStep(activeApplicationId)
          setResumableApp(null); setActiveView('solicitudes')
        }}
        onGoToDocuments={() => {
          setReturnFromDocsTo('firma')
          setActiveView('documentos')
        }}
        onSaveAndExit={() => {
          // Preserve session → F5 and "Reanudar" will route back to firma
          skipSessionClearRef.current = true
          setActiveView('resumen')
        }}
        onCancelApp={() => {
          clearFlowSession(); clearFirmaStep(activeApplicationId)
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
          clearFlowSession()
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
          {activeView === 'documentos' && (
            <SubirDocumentosView
              onBack={returnFromDocsTo === 'firma' ? () => {
                setReturnFromDocsTo(null)
                setActiveView('firma')
              } : undefined}
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
              onBack={() => { clearFlowSession(); setActiveApplicationId(null); setActiveView('resumen') }}
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

// All flow-session and firma-step helpers are defined in ../utils/flowSession.ts
