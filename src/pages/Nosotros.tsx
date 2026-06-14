import officeHero from "../assets/representative_images/main_page.png";
import styles from "./Nosotros.module.css";

export default function Nosotros() {
  return (
    <div className={styles.nosotros_page}>
      <section className={styles.hero} aria-labelledby="nosotros-mision">
        <div className={styles.hero_copy}>
          <p className={styles.badge}>Nuestra misión</p>
          <h1 id="nosotros-mision">
            Redefiniendo el<br />progreso financiero<br /><em>en Perú.</em>
          </h1>
          <p>
            En Jemacash impulsamos sueños peruanos a través de una plataforma
            diseñada para ser el defensor de tu libertad financiera.
          </p>
          <div className={styles.hero_actions}>
            <button type="button" className={styles.hero_btn_primary}>Únete a la visión</button>
            <button type="button" className={styles.hero_btn_ghost}>Conoce el impacto</button>
          </div>
        </div>

        <div className={styles.hero_visual}>
          <img src={officeHero} alt="Equipo reunido en la oficina de Jemacash" />
          <article className={styles.stat_card} aria-label="Impacto de Jemacash">
            <strong>+100k</strong>
            <p>Familias peruanas transformando su realidad financiera con Jemacash.</p>
          </article>
        </div>
      </section>

      <section className={styles.about} aria-labelledby="about-heading">
        <div className={styles.about_intro}>
          <span className={styles.about_eyebrow}>Quiénes somos</span>
          <h2 id="about-heading" className={styles.about_title}>
            Una plataforma especializada,<br />no un fondo tradicional
          </h2>
        </div>

        <div className={styles.about_body}>
          <p>
            Jemacash es una plataforma especializada en soluciones de financiamiento, enfocada en
            brindarte acceso rápido y seguro a préstamos respaldados por tus activos electrónicos.
          </p>
          <p>
            Nuestro rol es actuar como el aliado que te acompaña en cada paso: desde la valuación
            de tu equipo hasta el desembolso en tu cuenta. No somos un banco tradicional: somos el
            sistema que hace que el financiamiento funcione con agilidad y rigor.
          </p>
          <p>
            A lo largo de los años hemos desarrollado tecnología propia para la valuación de
            activos: modelos de inteligencia artificial entrenados con datos reales del mercado
            peruano, que transforman información dispersa en una evaluación objetiva y justa.
          </p>
        </div>

        <div className={styles.about_stats}>
          <div className={styles.about_stat}>
            <strong>+10 años</strong>
            <span>de experiencia en el sector financiero peruano</span>
          </div>
          <div className={styles.about_stat}>
            <strong>IA propia</strong>
            <span>modelos entrenados con datos reales del mercado local</span>
          </div>
          <div className={styles.about_stat}>
            <strong>100% digital</strong>
            <span>valuación y desembolso sin trámites presenciales</span>
          </div>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-heading">
        <header className={styles.principles_header}>
          <span className={styles.principles_eyebrow}>Nuestros principios</span>
          <h2 id="principles-heading">Lo que nos guía<br />en cada decisión</h2>
        </header>

        <ol className={styles.principles_list}>
          <li className={styles.principle_row}>
            <span className={styles.principle_num}>01</span>
            <h3 className={styles.principle_name}>Rigor analítico</h3>
            <p className={styles.principle_desc}>Cada decisión parte de datos verificados, no de suposiciones. Nuestros modelos de calificación usan bases de datos históricas reales de cada cliente.</p>
          </li>
          <li className={styles.principle_row}>
            <span className={styles.principle_num}>02</span>
            <h3 className={styles.principle_name}>Estructuras sólidas</h3>
            <p className={styles.principle_desc}>Diseñamos los mecanismos operativos antes de que se necesiten. La protección al cliente está construida desde el día uno.</p>
          </li>
          <li className={styles.principle_row}>
            <span className={styles.principle_num}>03</span>
            <h3 className={styles.principle_name}>Vigilancia continua</h3>
            <p className={styles.principle_desc}>El seguimiento no termina al cerrar el trato. Monitoreamos cada operación con reportes estandarizados y alertas tempranas.</p>
          </li>
          <li className={styles.principle_row}>
            <span className={styles.principle_num}>04</span>
            <h3 className={styles.principle_name}>Tecnología aplicada</h3>
            <p className={styles.principle_desc}>Desarrollamos modelos de inteligencia artificial entrenados con datos históricos reales del mercado peruano de créditos y pagos.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
