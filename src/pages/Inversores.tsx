import heroImg from "../assets/representative_images/istockphoto-1849172463-612x612.jpg";
import styles from "./Inversores.module.css";

function IconCoins() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 5.5A6 6 0 1 1 18.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7v4l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17l4-6 4 3 4-7 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconControl() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface InversoresProps {
  onRegister?: () => void
}

export default function Inversores({ onRegister }: InversoresProps) {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Sé prestamista">
        <div className={styles.hero_left}>
          <div className={styles.hero_copy}>
            <span className={styles.eyebrow}>Para inversores</span>
            <h1>
              Haz crecer<br />tu dinero<br /><em>prestando</em>
            </h1>
            <p className={styles.hero_desc}>
              Únete a la red de prestamistas de Jemacash y genera rendimientos competitivos
              financiando préstamos respaldados por activos reales.
            </p>
            <div className={styles.hero_actions}>
              <button type="button" className={styles.btn_primary} onClick={onRegister}>
                Quiero ser prestamista
                <IconArrow />
              </button>
              <button type="button" className={styles.btn_ghost}>
                Conoce más
              </button>
            </div>
          </div>

          <div className={styles.hero_stats}>
            <div className={styles.stat_item}>
              <strong>18%</strong>
              <span>Rendimiento anual estimado</span>
            </div>
            <div className={styles.stat_divider} aria-hidden="true" />
            <div className={styles.stat_item}>
              <strong>+5,000</strong>
              <span>Préstamos financiados</span>
            </div>
            <div className={styles.stat_divider} aria-hidden="true" />
            <div className={styles.stat_item}>
              <strong>98%</strong>
              <span>Tasa de recuperación</span>
            </div>
          </div>
        </div>

        <div className={styles.hero_visual}>
          <img src={heroImg} alt="Familia disfrutando gracias a sus inversiones" />
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className={styles.how} aria-labelledby="how-heading">
        <div className={styles.how_header}>
          <span className={styles.section_eyebrow}>Cómo funciona</span>
          <h2 id="how-heading">Tres pasos para<br /><em>empezar a ganar</em></h2>
        </div>
        <ol className={styles.how_steps}>
          <li className={styles.how_step}>
            <span className={styles.step_num}>01</span>
            <div className={styles.step_body}>
              <h3>Crea tu cuenta</h3>
              <p>Regístrate en minutos y completa tu verificación de identidad de forma 100% digital.</p>
            </div>
          </li>
          <li className={styles.how_step}>
            <span className={styles.step_num}>02</span>
            <div className={styles.step_body}>
              <h3>Fondea tu billetera</h3>
              <p>Transfiere el monto que deseas invertir. Sin montos mínimos elevados, desde S/ 500.</p>
            </div>
          </li>
          <li className={styles.how_step}>
            <span className={styles.step_num}>03</span>
            <div className={styles.step_body}>
              <h3>Elige y gana</h3>
              <p>Selecciona las operaciones que quieres financiar y recibe tus pagos puntualmente cada mes.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* ── Beneficios ── */}
      <section className={styles.benefits} aria-labelledby="benefits-heading">
        <div className={styles.benefits_header}>
          <span className={styles.section_eyebrow}>Por qué elegirnos</span>
          <h2 id="benefits-heading">Ventajas de prestar<br />con <em>Jemacash</em></h2>
        </div>
        <div className={styles.benefits_grid}>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}><IconCoins /></div>
            <h3>Rendimientos atractivos</h3>
            <p>Obtén hasta un 18% anual, muy por encima de los depósitos bancarios tradicionales.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}><IconShield /></div>
            <h3>Activos como respaldo</h3>
            <p>Cada préstamo está respaldado por activos electrónicos valuados con nuestra IA propia.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}><IconChart /></div>
            <h3>Cartera diversificada</h3>
            <p>Distribuye tu capital en múltiples operaciones para reducir el riesgo de tu inversión.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}><IconControl /></div>
            <h3>Control total</h3>
            <p>Tú decides cuánto invertir, en qué operaciones y cuándo retirar tus ganancias.</p>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className={styles.cta_banner} aria-label="Llamada a la acción">
        <div className={styles.cta_copy}>
          <h2>¿Listo para hacer<br />crecer tu capital?</h2>
          <p>Únete a los prestamistas que ya generan rendimientos con Jemacash. El proceso toma menos de 10 minutos.</p>
          <button type="button" className={styles.cta_btn} onClick={onRegister}>
            Empieza hoy
            <IconArrow />
          </button>
        </div>
        <div className={styles.cta_badge} aria-hidden="true">
          <span>S/</span>
          <strong>500</strong>
          <small>desde</small>
        </div>
      </section>

    </div>
  );
}
