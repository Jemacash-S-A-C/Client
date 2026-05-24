import styles from "./ValuarEquipo.module.css";
import valuationVisual from "../assets/valuacion_img/valuacion_card.png";
import editorialVisual from "../assets/representative_images/istockphoto-1849172463-612x612.jpg";

function IconDevice() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="16" y="7" width="5" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.9" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function IconCar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5.5 13.2 7 8.8c.2-.7.86-1.2 1.6-1.2h6.8c.74 0 1.4.5 1.6 1.2l1.5 4.4" stroke="currentColor" strokeWidth="1.9" />
      <rect x="4" y="11" width="16" height="6.2" rx="1.6" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="7.5" cy="17.6" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="17.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 11.3 8-6 8 6v8.2H4v-8.2Z" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9.5 19.5v-5h5v5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12.1 2.6 2.6L16 9.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 2.1 4.7L19 10l-4.9 2.3L12 17l-2.1-4.7L5 10l4.9-2.3L12 3Z" fill="currentColor" />
    </svg>
  );
}

function IconGauge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m12 12 4-3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function ValuarEquipo() {
  return (
    <div className={styles.valuar_page}>
      <section className={styles.hero}>
        <h1>Valuación de Activos</h1>
        <p>
          Obtén una pre-visualización inmediata del valor de tu patrimonio con nuestro motor de
          valuación inteligente, respaldado por datos del mercado local en tiempo real.
        </p>
      </section>

      <section className={styles.preval}>
        <div className={styles.preval_left}>
          <article className={styles.box}>
            <h2>1. SELECCIONA CATEGORÍA</h2>
            <div className={styles.categories}>
              <button type="button" className={styles.category}>
                <IconDevice />
                <span>Tecnología</span>
              </button>
              <button type="button" className={`${styles.category} ${styles.active}`}>
                <IconCar />
                <span>Vehículos</span>
              </button>
              <button type="button" className={styles.category}>
                <IconHome />
                <span>Inmuebles</span>
              </button>
            </div>
          </article>

          <article className={styles.box}>
            <h2>2. DETALLES DEL ACTIVO</h2>
            <div className={styles.form_grid}>
              <label>
                Marca / Fabricante
                <input type="text" placeholder="Ej: Toyota" />
              </label>
              <label>
                Modelo
                <input type="text" placeholder="Ej: RAV4 Hybrid" />
              </label>
              <label>
                Año de Fabricación
                <select defaultValue="2022">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </label>
              <label>
                Ubicación (Ciudad)
                <input type="text" placeholder="Ej: Lima, Miraflores" />
              </label>
            </div>
            <button type="button" className={styles.recalc}>
              Recalcular Valuación
            </button>
          </article>
        </div>

        <aside className={styles.preval_side}>
          <article className={styles.result}>
            <span className={styles.result_badge}>
              <IconSpark />
            </span>
            <p className={styles.result_kicker}>RESULTADO DE PRE-VALUACIÓN</p>
            <p className={styles.result_meta}>Basado en tendencias de mercado Mayo 2024</p>
            <p className={styles.result_label}>Rango Estimado(S/)</p>
            <p className={styles.result_value}>45,000 - 52,000</p>
            <div className={styles.result_footer}>
              <div>
                <span className={styles.meta_icon}>
                  <IconGauge />
                </span>
                <small>CONFIANZA</small>
                <strong>Alta (94%)</strong>
              </div>
              <div>
                <span className={`${styles.meta_icon} ${styles.meta_icon_lilac}`}>
                  <IconClock />
                </span>
                <small>VIGENCIA</small>
                <strong>15 Días</strong>
              </div>
            </div>
          </article>

          <article className={styles.similar}>
            <img src={valuationVisual} alt="Activo similar: vehículo recomendado" />
            <div className={styles.similar_overlay}>
              <span>ACTIVO SIMILAR RECIENTE</span>
              <strong>Toyota RAV4 2022</strong>
            </div>
          </article>
        </aside>
      </section>

      <section className={styles.editorial}>
        <img src={editorialVisual} alt="Analistas revisando valuación de activos" />
        <div className={styles.editorial_copy}>
          <h2>Valuación Editorial: Más que Simples Números</h2>
          <p>
            Nuestro algoritmo no solo promedia precios; analiza la curva de depreciación específica
            por marca, la demanda regional y factores macroeconómicos que influyen en el valor real
            de reventa.
          </p>
          <ul>
            <li>
              <IconCheck />
              Data-points de más de 50,000 transacciones mensuales.
            </li>
            <li>
              <IconCheck />
              Ajuste por condición y kilometraje proyectado.
            </li>
            <li>
              <IconCheck />
              Integración con registros de propiedad oficiales.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
