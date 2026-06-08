import officeHero from "../assets/representative_images/main_page.png";
import teamPhoto from "../assets/representative_images/istockphoto-1849172463-612x612.jpg";
import styles from "./Nosotros.module.css";

function IconGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8.25 6v-1a3.25 3.25 0 0 1 3.25-3.25h1.5A3.25 3.25 0 0 1 11.75 17v1.5h-8Zm8.5 0V17c0-.72-.2-1.39-.56-1.97a3.24 3.24 0 0 1 2.81-1.62h1.5A3.25 3.25 0 0 1 19.25 17v1.5h-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconHead() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c-4.14 0-7.5 3.36-7.5 7.5 0 3.25 2.08 6 5 7.03V21h5v-2.97a7.5 7.5 0 0 0-2.5-14.53Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12.5" cy="11.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4s-10-1-14 3-2 10 2 12 8-1 10-5 2-10 2-10Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M8 16c2-2 4-4 8-6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 5 6v6.5c0 4.25 2.85 7.32 7 8.5 4.15-1.18 7-4.25 7-8.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="m9.5 12.3 1.8 1.8 3.3-3.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function Nosotros() {
  return (
    <div className={styles.nosotros_page}>
      <section className={styles.hero} aria-labelledby="nosotros-mision">
        <div className={styles.hero_copy}>
          <p className={styles.badge}>Nuestra misión</p>
          <h1 id="nosotros-mision">Redefiniendo el progreso financiero en Perú.</h1>
          <p>
            En Jemacash, no solo movemos capital; impulsamos sueños peruanos a través de una
            plataforma diseñada para ser el defensor de tu libertad financiera.
          </p>
          <div className={styles.hero_actions}>
            <a href="#">Únete a la visión</a>
            <button type="button">Conoce el impacto</button>
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

      <section className={styles.team} aria-labelledby="team-heading">
        <header className={styles.team_header}>
          <h2 id="team-heading">Las mentes detrás del cambio</h2>
          <p>
            Liderazgo que combina la experiencia bancaria tradicional con la innovación tecnológica
            más disruptiva.
          </p>
        </header>

        <div className={styles.team_grid}>
          <article className={styles.leader_card}>
            <img src={teamPhoto} alt="Retrato de Matias Cohailla" />
            <div>
              <span>CO-FOUNDER & CEO</span>
              <h3>Matias Cohailla</h3>
              <p>
                "Nuestra meta es que cada peruano vea en la tecnología no una barrera, sino un
                aliado para su crecimiento."
              </p>
            </div>
          </article>

          <article className={styles.leader_card}>
            <img src={teamPhoto} alt="Retrato de Jheremy String" />
            <div>
              <span>CO-FOUNDER & CTO</span>
              <h3>Jheremy String</h3>
              <p>
                "Construimos algoritmos éticos que entienden la realidad humana, no solo los
                números de una cuenta."
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-heading">
        <div className={styles.values_collage}>
          <div className={`${styles.tile} ${styles.tile_icon}`}>
            <IconGroup />
          </div>
          <div className={`${styles.tile} ${styles.tile_photo_a}`} />
          <div className={`${styles.tile} ${styles.tile_photo_b}`} />
          <div className={`${styles.tile} ${styles.tile_icon_soft}`}>
            <IconShield />
          </div>
        </div>

        <div className={styles.values_copy}>
          <h2 id="values-heading">Tecnología con alma humana.</h2>
          <div className={styles.value_item}>
            <span className={`${styles.value_icon} ${styles.value_icon_green}`}>
              <IconEye />
            </span>
            <div>
              <h3>Transparencia Radical</h3>
              <p>
                Eliminamos la letra pequeña. Nuestra interfaz está diseñada para que cada sol de tu
                cuenta sea rastreable y entendible.
              </p>
            </div>
          </div>
          <div className={styles.value_item}>
            <span className={`${styles.value_icon} ${styles.value_icon_lilac}`}>
              <IconHead />
            </span>
            <div>
              <h3>Empatía Algorítmica</h3>
              <p>
                Nuestros sistemas de riesgo no solo miran el pasado, entienden el potencial y el
                contexto de la economía local.
              </p>
            </div>
          </div>
          <div className={styles.value_item}>
            <span className={`${styles.value_icon} ${styles.value_icon_pink}`}>
              <IconLeaf />
            </span>
            <div>
              <h3>Diseño Consciente</h3>
              <p>
                Minimalismo que reduce el estrés financiero. Un entorno digital que respira calma y
                seguridad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
