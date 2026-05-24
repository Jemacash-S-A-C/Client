import { type ReactElement, useState } from 'react'
import styles from './UserDashboard.module.css'
import type { UserSession } from '../types/api.types'
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconChart,
  IconWallet,
  IconDocument,
  IconCalendar,
} from '../components/dashboard/icons'
import { ResumenView } from '../components/dashboard/ResumenView'
import { MisPrestamosView } from '../components/dashboard/MisPrestamosView'
import { MisSolicitudesView } from '../components/dashboard/MisSolicitudesView'
import { ConfiguracionView } from '../components/dashboard/ConfiguracionView'
import { CalendarioView } from '../components/dashboard/CalendarioView'
import { SolicitarPrestamoView } from '../components/dashboard/SolicitarPrestamoView'
import { AuditorTecnicoView } from '../components/dashboard/AuditorTecnicoView'
import { TasacionResultadosView } from '../components/dashboard/TasacionResultadosView'
import { FirmaVerificacionView } from '../components/dashboard/FirmaVerificacionView'

type ActiveView =
  | 'resumen'
  | 'prestamos'
  | 'solicitudes'
  | 'configuracion'
  | 'calendario'
  | 'solicitar'
  | 'auditoria'
  | 'tasacion'
  | 'firma'

type UserDashboardProps = {
  user: UserSession
  onLogout: () => void
}

const navItems: { view: ActiveView; label: string; icon: () => ReactElement }[] = [
  { view: 'resumen',       label: 'Resumen',        icon: IconChart    },
  { view: 'prestamos',     label: 'Mis Préstamos',  icon: IconWallet   },
  { view: 'solicitudes',   label: 'Mis Solicitudes',icon: IconDocument },
  { view: 'configuracion', label: 'Configuración',  icon: IconSettings },
  { view: 'calendario',    label: 'Calendario',     icon: IconCalendar },
]

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('resumen')
  // Active application id flows through the loan request process
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null)

  const firstName = user.displayName.split(' ')[0] ?? user.displayName

  // ── Full-screen flow views ────────────────────────────────────────────────

  if (activeView === 'tasacion') {
    return (
      <TasacionResultadosView
        applicationId={activeApplicationId}
        onBack={() => setActiveView('auditoria')}
        onAccept={() => setActiveView('firma')}
      />
    )
  }

  if (activeView === 'firma') {
    return (
      <FirmaVerificacionView
        applicationId={activeApplicationId}
        onBack={() => setActiveView('tasacion')}
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
          <span className={styles.brand_name}>Jemacash</span>
          <span className={styles.brand_subtitle}>Panel de usuario</span>
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
          Solicitar Préstamo
        </button>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <label className={styles.search_bar} aria-label="Buscar movimientos o activos">
            <IconSearch />
            <input type="search" placeholder="Buscar movimientos o activos..." />
          </label>

          <div className={styles.topbar_actions}>
            <button type="button" className={styles.icon_button} aria-label="Notificaciones">
              <IconBell />
              <span className={styles.notification_dot} aria-hidden="true" />
            </button>
            <button type="button" className={styles.icon_button} aria-label="Configuración">
              <IconSettings />
            </button>
            <button
              type="button"
              className={styles.user_chip}
              onClick={onLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <div className={styles.user_meta}>
                <strong>{user.displayName}</strong>
                <span>{user.role}</span>
              </div>
              <span className={styles.avatar} aria-hidden="true">
                {user.initials}
              </span>
            </button>
          </div>
        </header>

        <main className={styles.main}>
          {activeView === 'resumen' && <ResumenView firstName={firstName} />}
          {activeView === 'prestamos' && <MisPrestamosView />}
          {activeView === 'solicitudes' && <MisSolicitudesView />}
          {activeView === 'configuracion' && <ConfiguracionView user={user} />}
          {activeView === 'calendario' && <CalendarioView />}
          {activeView === 'solicitar' && (
            <SolicitarPrestamoView
              onBack={() => setActiveView('resumen')}
              onContinue={(applicationId) => {
                setActiveApplicationId(applicationId)
                setActiveView('auditoria')
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
