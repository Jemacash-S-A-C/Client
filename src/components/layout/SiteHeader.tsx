import styles from "./SiteHeader.module.css";

export type AppPage = "home" | "blog";

type SiteHeaderProps = {
  activePage: AppPage
  onGoHome: () => void
  onGoBlog: () => void
  onPidePrestamo: () => void
}

export function SiteHeader({ activePage, onGoHome, onGoBlog, onPidePrestamo }: SiteHeaderProps) {
  return (
    <header className={styles.topbar}>
      <button type="button" className={`${styles.brand} ${styles.brand_button}`} onClick={onGoHome}>
        Jemacash
      </button>

      <nav className={styles.menu} aria-label="Navegación principal">
        <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={onGoHome}>
          Préstamos
        </button>
        <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={onGoHome}>
          Valuar Equipo
        </button>
        <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={onGoHome}>
          Nosotros
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "blog" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={onGoBlog}
        >
          Blog
        </button>
      </nav>

      <button className={styles.pill_btn} type="button" onClick={onPidePrestamo}>
        Pide tu préstamo
      </button>
    </header>
  )
}
