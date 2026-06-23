import { useEffect, useState } from "react";
import personImg from "../assets/partner_logos/persona.png";
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


function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMoney() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 12h.01M18 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface HomeProps {
  onRegister?: () => void
}

function Home({ onRegister }: HomeProps) {
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
          <p className={styles.eyebrow}>
            <span className={styles.eyebrow_dot} />
            Rápido · Seguro · Digital
          </p>
          <h1>
            Tu préstamo<br />al toque con<br /><em>Jemacash</em>
          </h1>
          <p className={styles.hero_desc}>
            Convertimos tus activos en liquidez inmediata. Sin trámites eternos, sin complicaciones.
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
            <button type="button" className={styles.loan_cta} onClick={onRegister}>Iniciar solicitud ahora</button>
          </article>
        </div>

        <div className={styles.hero_visual}>
          <div className={styles.hero_card}>
            <img src={personImg} alt="Visual principal de Jemacash" />
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
        <div className={styles.workflow_left}>
          <span className={styles.workflow_eyebrow}>Cómo funciona</span>
          <h2 id="workflow-heading">
            Tu préstamo<br />en tres<br /><em>simples pasos</em>
          </h2>
          <button type="button" className={styles.workflow_cta_btn} onClick={onRegister}>
            Solicitar préstamo
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <ol className={styles.workflow_grid}>
          <li className={styles.workflow_step}>
            <span className={styles.workflow_num}>01</span>
            <div className={styles.workflow_step_body}>
              <div className={styles.step_icon_box}><IconScan /></div>
              <div>
                <h3>Escanea tu artículo</h3>
                <p>Escanea tu identificación y el artículo que deseas valuar usando nuestra app.</p>
              </div>
            </div>
          </li>
          <li className={styles.workflow_step}>
            <span className={styles.workflow_num}>02</span>
            <div className={styles.workflow_step_body}>
              <div className={styles.step_icon_box}><IconVerify /></div>
              <div>
                <h3>Verificamos tu equipo</h3>
                <p>Validamos la condición de tu equipo y tu identidad en tiempo real.</p>
              </div>
            </div>
          </li>
          <li className={styles.workflow_step}>
            <span className={styles.workflow_num}>03</span>
            <div className={styles.workflow_step_body}>
              <div className={styles.step_icon_box}><IconPaid /></div>
              <div>
                <h3>Recibe tu dinero</h3>
                <p>El dinero se transfiere directo a tu cuenta o billetera digital.</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.benefits} aria-labelledby="benefits-heading">
        <div className={styles.benefits_header}>
          <h2 id="benefits-heading">
            Por qué elegir <em>Jemacash</em>
          </h2>
          <p>Todo lo que necesitas para tu préstamo, en un solo lugar.</p>
        </div>
        <div className={styles.benefits_grid}>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon_wrap}><IconBolt /></div>
            <h3>Agilidad</h3>
            <p>Te evaluamos 100% en línea para un rápido desembolso sin trámites presenciales.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon_wrap}><IconShield /></div>
            <h3>Seguridad</h3>
            <p>Tu información se encuentra segura y protegida en todo momento.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon_wrap}><IconClock /></div>
            <h3>Disponibilidad</h3>
            <p>Obtén tu dinero al instante en tu cuenta bancaria o billetera digital.</p>
          </div>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon_wrap}><IconMoney /></div>
            <h3>Inmediatez</h3>
            <p>Recibe el monto de tu préstamo en minutos una vez aceptada la oferta.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
