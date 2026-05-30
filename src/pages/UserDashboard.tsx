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
  const [activeView, setActiveView] = useState<ActiveView>('resumen')
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null)
  const [activeApprovedAmount, setActiveApprovedAmount] = useState<number | null>(null)
  const [postGuaranteeView, setPostGuaranteeView] = useState<'garantias' | 'solicitar'>('garantias')
  const [activeLoanPayment, setActiveLoanPayment] = useState<LoanPaymentInfo | null>(null)
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null)
  const [returnFromDocsTo, setReturnFromDocsTo] = useState<'firma' | null>(null)

  const firstName = user.displayName.split(' ')[0] ?? user.displayName

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
        onBack={() => setActiveView('auditoria')}
        onAccept={(amount) => { setActiveApprovedAmount(amount); setActiveView('firma') }}
      />
    )
  }

  if (activeView === 'firma') {
    return (
      <FirmaVerificacionView
        applicationId={activeApplicationId}
        approvedAmount={activeApprovedAmount}
        onBack={() => setActiveView('tasacion')}
        onFinalize={() => setActiveView('solicitudes')}
        onGoToDocuments={() => {
          setReturnFromDocsTo('firma')
          setActiveView('documentos')
        }}
        user={user}
      />
    )
  }

  if (activeView === 'auditoria') {
    return (
      <AuditorTecnicoView
        applicationId={activeApplicationId}
        onBack={() => setActiveView('solicitar')}
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
          className={styles.sidebar_cta}
          onClick={() => setActiveView('solicitar')}
        >
          <span aria-hidden="true">+</span>
          {t('nav.requestLoan')}
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
              onBack={() => setActiveView('resumen')}
              onContinue={(applicationId) => {
                setActiveApplicationId(applicationId)
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
