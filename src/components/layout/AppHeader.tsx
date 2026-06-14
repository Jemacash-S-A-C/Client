import { useState } from "react";
import { useTranslation } from 'react-i18next'
import styles from "./AppHeader.module.css";
import jemacashLogo from '../../assets/partner_logos/jemacashlogo.png'

export type AppPage = "home" | "nosotros" | "valuar";

type AppHeaderProps = {
  activePage: AppPage
  onGoHome: () => void
  onGoNosotros: () => void
  onGoValuar: () => void
  onPidePrestamo: () => void
  onLogin: () => void
}

export function AppHeader({
  activePage,
  onGoHome,
  onGoNosotros,
  onGoValuar,
  onPidePrestamo,
  onLogin,
}: AppHeaderProps) {
  const { t } = useTranslation()
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
  return (
    <header className={styles.topbar}>
      <div className={styles.topbar_inner}>
        <button type="button" className={`${styles.brand} ${styles.brand_button}`} onClick={goHome}>
          <img src={jemacashLogo} alt="Jemacash" className={styles.brand_logo} />
        </button>

        <nav className={styles.menu} aria-label="Navegación principal">
          <button type="button" className={`${styles.menu_link} ${styles.menu_link_ghost}`} onClick={goHome}>
            {t('header.loans')}
          </button>
          <button
            type="button"
            className={`${styles.menu_link} ${activePage === "valuar" ? styles.menu_link_active : styles.menu_link_ghost}`}
            onClick={goValuar}
          >
            {t('header.valuate')}
          </button>
          <button
            type="button"
            className={`${styles.menu_link} ${activePage === "nosotros" ? styles.menu_link_active : styles.menu_link_ghost}`}
            onClick={goNosotros}
          >
            {t('header.about')}
          </button>
        </nav>

        <div className={styles.actions}>
          <button className={styles.pill_btn} type="button" onClick={onPidePrestamo}>
            {t('header.request')}
          </button>
          <button type="button" className={styles.login_link} onClick={onLogin}>
            {t('header.login')}
          </button>
          <button
            type="button"
            className={styles.menu_toggle}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-menu"
            aria-label={t('header.openMenu')}
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
          {t('header.loans')}
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "valuar" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={goValuar}
        >
          {t('header.valuate')}
        </button>
        <button
          type="button"
          className={`${styles.menu_link} ${activePage === "nosotros" ? styles.menu_link_active : styles.menu_link_ghost}`}
          onClick={goNosotros}
        >
          {t('header.about')}
        </button>
        <button className={styles.mobile_cta} type="button" onClick={onPidePrestamo}>
          {t('header.request')}
        </button>
        <button type="button" className={styles.mobile_login_link} onClick={onLogin}>
          {t('header.login')}
        </button>
      </nav>
    </header>
  );
}
