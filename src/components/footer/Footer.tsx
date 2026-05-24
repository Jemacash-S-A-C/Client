import styles from "./Footer.module.css";
export function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footerFatherContainer}>
        <div className={styles.footerContainer}>
          <h4>Jemacash</h4>
          <p>
            La primera plataforma de empeño digital impulsada por inteligencia
            artificial en Latinoamérica. Democratizando el acceso al crédito
            rápido.
          </p>
        </div>
        <div className={styles.footerContainer}>
          <h5>Enlaces Rápidos</h5>
          <ul>
            <li>Términos y Condiciones</li>
            <li>Privacidad</li>
            <li>Regulación Bancaria</li>
            <li>Soporte</li>
          </ul>
        </div>
        <div className={styles.footerContainer}>
          <h5>Mantente informado</h5>
          <p>Recibe las mejores ofertas y noticias financieras</p>
          <form action="">
            <div>
              <input type="text" />
              <button>Unirse</button>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.horizontalBorder}>
        <p>© 2026 Jemacash. Miembro de la Red de Transparencia Financiera.</p>
      </div>
    </div>
  );
}

export default Footer;
