import { useState } from 'react'
import styles from './AppFooter.module.css'
import { LegalModal, type LegalType } from './LegalModal'

export function AppFooter() {
  const [modal, setModal] = useState<LegalType | null>(null)

  return (
    <>
      <footer className={styles.footer} aria-label="Pie de página">
        <div className={styles.inner}>
          <section className={styles.brand}>
            <h4>Jemacash</h4>
            <p>
              La primera plataforma de empeño digital impulsada por inteligencia artificial en
              Latinoamérica. Democratizamos el acceso al crédito rápido y transparente.
            </p>
          </section>

          <nav className={styles.links} aria-label="Enlaces de ayuda">
            <h5>Enlaces rápidos</h5>
            <button type="button" onClick={() => setModal('terminos')}>Términos y Condiciones</button>
            <button type="button" onClick={() => setModal('privacidad')}>Privacidad</button>
            <button type="button" onClick={() => setModal('regulacion')}>Regulación Bancaria</button>
            <button type="button" onClick={() => setModal('soporte')}>Soporte</button>
          </nav>

          <section className={styles.newsletter}>
            <h5>Mantente informado</h5>
            <p>Recibe consejos financieros, novedades de mercado y alertas de seguridad.</p>
            <form>
              <input type="email" placeholder="tu@email.com" aria-label="Correo electrónico" />
              <button type="button">Suscribirme</button>
            </form>
          </section>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 Jemacash. Miembro de la Red de Transparencia Financiera.</p>
        </div>
      </footer>

      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </>
  )
}

export default AppFooter
