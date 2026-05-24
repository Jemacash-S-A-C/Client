import { LoanCalculator } from "../components/LoanCalculator";
import heroImg from "../assets/representative_images/main_page.png";
import { useState } from "react";
import { partnerLogos } from "../data/partnerLogos";
import { workflowSteps } from "../data/workflowSteps";
import styles from "./Home.module.css";
import Footer from "../components/footer/Footer";

function Home() {
  const [amountNeeded, setAmountNeeded] = useState("17000");
  const [weeklyPayment, setWeeklyPayment] = useState("850");
  const [weeksTerm, setWeeksTerm] = useState("24");
  return (
    <>
      <section
        className={styles.hero_section}
        aria-label="Hero de préstamo Jemacash"
      >
        <div className={styles.hero_copy} data-tone="left">
          <h1>
            Tu préstamo al toque con <em>Jemacash</em>
          </h1>

          <p>
            Convertimos tus activos en liquidez inmediata con la precisión de
            nuestra inteligencia artificial. Sin trámites eternos, sin
            complicaciones.
          </p>

          <LoanCalculator
            amountNeeded={amountNeeded}
            onAmountNeededChange={setAmountNeeded}
            weeklyPayment={weeklyPayment}
            onWeeklyPaymentChange={setWeeklyPayment}
            weeksTerm={weeksTerm}
            onWeeksTermChange={setWeeksTerm}
          />
        </div>

        <div className={styles.hero_visual} data-tone="right">
          <div className={styles.photo_container}>
            <div className={`${styles.blob} ${styles.blob_tr}`} />
            <div className={`${styles.blob} ${styles.blob_bl}`} />
            <img
              className={styles.hero_photo}
              src={heroImg}
              alt="Cliente usando la app Jemacash"
            />
            <div className={styles.trust_card}>
              <span aria-hidden="true">✓</span>
              <div>
                <strong>100% Seguro</strong>
                <small>Regulado por CNV</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={styles.benefit_strip}
        aria-label="Entidades asociadas"
      >
        <h3>Paga aqui con</h3>
        <div className={styles.logo_carousel}>
          <div className={styles.logo_track}>
            {[...partnerLogos, ...partnerLogos].map((logo, index) => (
              <div className={styles.logo_item} key={`${logo.alt}-${index}`}>
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.workflow_promo_block}>
        <section
          className={styles.workflow_section}
          aria-labelledby="workflow-heading"
        >
          <div className={styles.workflow_section_inner}>
            <header className={styles.workflow_header}>
              <h2 id="workflow-heading">Precision Workflow</h2>
              <p className={styles.subtitle}>
                Tu dinero en tres pasos simples impulsados por IA
              </p>
            </header>

            <ol className={styles.workflow_grid}>
              {workflowSteps.map((item) => (
                <li key={item.step}>
                  <article className={styles.workflow_card}>
                    <div className={styles.card_head}>
                      <img src={item.img_route} className={styles.chip} />
                      <span
                        className={styles.step_watermark}
                        aria-hidden="true"
                      >
                        {item.step}
                      </span>
                    </div>
                    <h3 className={styles.workflow_title}>
                      {item.step}. {item.title}
                    </h3>
                    <p className={styles.workflow_body}>{item.text}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.promo_section} aria-label="Valor y soporte">
          <div className={styles.promo_section_inner}>
            <article className={styles.promo_main}>
              <h3>
                Valuación en segundos,
                <br />
                dinero en minutos.
              </h3>
              <p>
                Nuestra tecnología de punta analiza el mercado global para darte
                siempre el precio más justo por tus artículos electrónicos.
              </p>
              <button type="button">Descarga la App</button>
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
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Home;
