import { useEffect, useState } from "react";
import heroImg from "../assets/hero.png";
import promoImg from "../assets/valuacion_img/valuacion_card.png";
import styles from "./Home.module.css";

// ── Loan simulator constants (idénticos a SolicitarPrestamoView) ─────────────
const TASA_MENSUAL = 0.0125
const SIM_MIN = 100
const SIM_MAX = 50000
const PLAZO_MIN_AMOUNT: Record<number, number> = { 12: 0, 24: 4000, 36: 4000, 48: 4000 }
type SimPlazo = 12 | 24 | 36 | 48

function calcCuota(monto: number, meses: SimPlazo): number {
  const r = TASA_MENSUAL
  return (monto * r) / (1 - Math.pow(1 + r, -meses))
}

function fmtSoles(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3" stroke="currentColor" strokeWidth="1.8" />
      <rect x="8" y="8" width="8" height="8" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconVerify() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12 2.1 2.1L15.7 8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 16h8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconPaid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 10.5v3M17.5 10.5v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Home() {
  const [amount, setAmount] = useState(15000)
  const [plazo, setPlazo]   = useState<SimPlazo>(12)

  useEffect(() => {
    if (plazo !== 12 && amount < 4000) setPlazo(12)
  }, [amount, plazo])

  const cuota    = calcCuota(amount, plazo)
  const pct      = ((amount - SIM_MIN) / (SIM_MAX - SIM_MIN)) * 100
  const dynStep  = SIM_MAX <= 1000 ? 10 : SIM_MAX <= 5000 ? 50 : SIM_MAX <= 20000 ? 100 : 500

  return (
    <div className={styles.home_page}>
      <section className={styles.hero} aria-label="Hero principal">
        <div className={styles.hero_copy}>
          <p className={styles.eyebrow}>Rápido • Seguro • Digital</p>
          <h1>
            Tu préstamo al toque con <em>Jemacash</em>
          </h1>
          <p className={styles.hero_desc}>
            Convertimos tus activos en liquidez inmediata con la precisión de nuestra inteligencia
            artificial. Sin trámites eternos, sin complicaciones.
          </p>

          <article className={styles.loan_card}>
            <h2>Calcula tu préstamo</h2>
            <div className={styles.loan_row}>
              <span>¿Cuánto necesitas?</span>
              <strong>S/ {amount.toLocaleString("es-PE")}</strong>
            </div>
            <input
              type="range"
              min={SIM_MIN}
              max={SIM_MAX}
              step={dynStep}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Monto de préstamo"
              style={{ "--pct": `${pct}%` } as React.CSSProperties}
              className={styles.loan_slider}
            />
            <div className={styles.loan_slider_labels}>
              <span>S/ {SIM_MIN.toLocaleString("es-PE")}</span>
              <span>S/ {SIM_MAX.toLocaleString("es-PE")}</span>
            </div>

            <div className={styles.loan_plazo_row}>
              <small>PLAZO DE PAGO</small>
              <div className={styles.loan_pills}>
                {([12, 24, 36, 48] as SimPlazo[]).map((m) => {
                  const minReq   = PLAZO_MIN_AMOUNT[m] ?? 0
                  const disabled = amount < minReq
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.loan_pill} ${plazo === m ? styles.loan_pill_active : ""} ${disabled && m !== 12 ? styles.loan_pill_disabled : ""}`}
                      onClick={() => !disabled && setPlazo(m)}
                      disabled={disabled}
                      title={disabled && m !== 12 ? "Disponible desde S/ 4,000" : undefined}
                    >
                      {m}m
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.loan_meta}>
              <div>
                <small>CUOTA MENSUAL</small>
                <strong>S/ {fmtSoles(cuota)}</strong>
              </div>
              <div>
                <small>PLAZO</small>
                <strong>{plazo} meses</strong>
              </div>
            </div>
            <button type="button" className={styles.loan_cta}>Iniciar solicitud ahora</button>
          </article>
        </div>

        <div className={styles.hero_visual}>
          <div className={styles.hero_card}>
            <img src={heroImg} alt="Cliente usando Jemacash en su celular" />
            <div className={styles.trust_card}>
              <span aria-hidden="true">✓</span>
              <div>
                <strong>100% Seguro</strong>
                <small>Regulado por CNBV</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.workflow} aria-labelledby="workflow-heading">
        <header>
          <h2 id="workflow-heading">Precision Workflow</h2>
          <p>Tu dinero en tres pasos simples impulsados por IA</p>
        </header>
        <ol className={styles.workflow_grid}>
          <li>
            <article className={styles.step_card}>
              <div className={styles.step_icon}>
                <IconScan />
              </div>
              <span className={styles.step_num}>1</span>
              <h3>1. Scan</h3>
              <p>Escanea tu identificación y el artículo que deseas valuar usando nuestra app intuitiva.</p>
            </article>
          </li>
          <li>
            <article className={styles.step_card}>
              <div className={styles.step_icon}>
                <IconVerify />
              </div>
              <span className={styles.step_num}>2</span>
              <h3>2. Verify</h3>
              <p>Validamos la condición de tu equipo y tu identidad en tiempo real para una oferta precisa.</p>
            </article>
          </li>
          <li>
            <article className={styles.step_card}>
              <div className={styles.step_icon}>
                <IconPaid />
              </div>
              <span className={styles.step_num}>3</span>
              <h3>3. Get Paid</h3>
              <p>Una vez aceptada la oferta, el dinero se transfiere directo a tu cuenta o billetera digital.</p>
            </article>
          </li>
        </ol>
      </section>

      <section className={styles.promo} aria-label="Valuación y soporte">
        <article className={styles.promo_main}>
          <img src={promoImg} alt="" aria-hidden="true" />
          <div className={styles.promo_overlay}>
            <h3>
              Valuación en segundos,
              <br />
              dinero en minutos.
            </h3>
            <p>
              Nuestra tecnología de punta analiza el mercado global para darte siempre el precio más
              justo por tus artículos electrónicos.
            </p>
            <button type="button">Descarga la App</button>
          </div>
        </article>

        <aside className={styles.promo_side}>
          <article className={styles.promo_stat}>
            <strong>+500,000</strong>
            <span>Usuarios satisfechos en todo Perú</span>
          </article>
          <article className={styles.promo_help}>
            <h4>¿Necesitas ayuda?</h4>
            <p>Nuestros asesores están disponibles 24/7 para apoyarte.</p>
            <a href="#">Contactar soporte →</a>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default Home;
