import { useState } from "react";
import styles from "./AppHeader.module.css";

export type AppPage = "home" | "blog" | "nosotros" | "valuar";

type AppHeaderProps = {
  activePage: AppPage
  onGoHome: () => void
  onGoBlog: () => void
  onGoNosotros: () => void
  onGoValuar: () => void
  onPidePrestamo: () => void
  onLogin: () => void
}

export function AppHeader({
  activePage,
  onGoHome,
  onGoBlog,
  onGoNosotros,
  onGoValuar,
  onPidePrestamo,
  onLogin,
}: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const goHome = () => {
    setMobileOpen(false);
    onGoHome();
  };
  const goValuar = () => {
    setMobileOpen(false);
    onGoValuar();
  };
  const goNosotros = () => {
    setMobileOpen(false);
    onGoNosotros();
  };
  const goBlog = () => {
    setMobileOpen(false);
    onGoBlog();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbar_inner}>
        <button type="button" className={`${styles.brand} ${styles.brand_button}`} onClick={goHome}>
          Jemacash
        </button>

        <nav className={styles.menu} aria-label="Navegación principal">
          <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={goHome}>
            Préstamos
          </button>
          <button
            type="button"
            className={`${styles.menu_link} ${activePage === "valuar" ? styles.menu_link_active : styles.menu_link_ghost}`}
            onClick={goValuar}
          >
            Valuar Equipo
          </button>
          <button
            type="button"
            className={`${styles.menu_link} ${activePage === "nosotros" ? styles.menu_link_active : styles.menu_link_ghost}`}
            onClick={goNosotros}
          >
            Nosotros
          </button>
          <button
            type="button"
            className={`${styles.menu_link} ${activePage === "blog" ? styles.menu_link_active : styles.menu_link_ghost}`}
            onClick={goBlog}
          >
            Blog
          </button>
        </nav>

        <div className={styles.actions}>
          <button className={styles.pill_btn} type="button" onClick={onPidePrestamo}>
            Pide tu préstamo
          </button>
          <button type="button" className={styles.login_link} onClick={onLogin}>
            Iniciar sesión
          </button>
          <button
            type="button"
            className={styles.menu_toggle}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-menu"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      <nav
        id="mobile-site-menu"
        className={`${styles.mobile_menu} ${mobileOpen ? styles.mobile_menu_open : ""}`}
        aria-label="Navegación móvil"
      >
        <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={goHome}>
          Préstamos
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "valuar" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={goValuar}
        >
          Valuar Equipo
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "nosotros" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={goNosotros}
        >
          Nosotros
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "blog" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={goBlog}
        >
          Blog
        </button>
        <button className={styles.mobile_cta} type="button" onClick={onPidePrestamo}>
          Pide tu préstamo
        </button>
        <button type="button" className={styles.mobile_login_link} onClick={onLogin}>
          Iniciar sesión
        </button>
      </nav>
    </header>
  );
}
