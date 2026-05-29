import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './AppFooter.module.css'
import { LegalModal, type LegalType } from './LegalModal'

export function AppFooter() {
  const { t } = useTranslation()
  const [modal, setModal] = useState<LegalType | null>(null)

  return (
    <>
      <footer className={styles.footer} aria-label="Pie de página">
        <div className={styles.inner}>
          <section className={styles.brand}>
            <h4>Jemacash</h4>
            <p>{t('footer.tagline')}</p>
          </section>

          <nav className={styles.links} aria-label="Enlaces de ayuda">
            <h5>{t('footer.quickLinks')}</h5>
            <button type="button" onClick={() => setModal('terminos')}>{t('footer.terms')}</button>
            <button type="button" onClick={() => setModal('privacidad')}>{t('footer.privacy')}</button>
            <button type="button" onClick={() => setModal('regulacion')}>{t('footer.regulation')}</button>
            <button type="button" onClick={() => setModal('soporte')}>{t('footer.support')}</button>
          </nav>

          <section className={styles.newsletter}>
            <h5>{t('footer.newsletter')}</h5>
            <p>{t('footer.newsletterDesc')}</p>
            <form>
              <input type="email" placeholder={t('footer.emailPlaceholder')} aria-label="Correo electrónico" />
              <button type="button">{t('footer.subscribe')}</button>
            </form>
          </section>
        </div>

        <div className={styles.bottom}>
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>

      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </>
  )
}

export default AppFooter
