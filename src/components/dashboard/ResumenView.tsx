import officeImg from '../../assets/representative_images/main_page.png'
import marketImg from '../../assets/hero.png'
import valuationImg from '../../assets/valuacion_img/valuacion_card.png'
import {
  IconChart,
  IconLoan,
  IconWallet,
  IconDocument,
} from './icons'
import styles from './ResumenView.module.css'

const quickActions = [
  {
    title: 'Valuar nuevo activo',
    description: 'Obtén liquidez inmediata',
    icon: IconChart,
    tone: 'green',
  },
  {
    title: 'Solicitar Préstamo',
    description: 'Créditos de libre disponibilidad',
    icon: IconLoan,
    tone: 'blue',
  },
] as const

const activityItems = [
  {
    title: 'Préstamo aprobado',
    meta: '12 Oct, 2023 • Depósito Directo',
    amount: '+ S/ 5,000',
    status: 'Completado',
    tone: 'green',
    icon: IconLoan,
  },
  {
    title: 'Pago de cuota',
    meta: '05 Oct, 2023 • Cuota 04/12',
    amount: '- S/ 450',
    status: 'Completado',
    tone: 'indigo',
    icon: IconWallet,
  },
  {
    title: 'Valuación de Activo',
    meta: '28 Sep, 2023 • Camioneta Toyota',
    amount: 'En proceso',
    status: '',
    tone: 'rose',
    icon: IconDocument,
  },
] as const

const articleCards = [
  {
    tag: 'FINANZAS',
    title: 'Cómo maximizar el valor de tus activos este 2024',
    image: officeImg,
  },
  {
    tag: 'ESTRATEGIA',
    title: 'El arte de la deuda inteligente: Liquidez vs. Pasivos',
    image: marketImg,
  },
  {
    tag: 'AHORRO',
    title: 'Mitos sobre el historial crediticio en Perú',
    image: valuationImg,
  },
] as const

export function ResumenView({ firstName }: { firstName: string }) {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.greeting}>Hola, {firstName} 👋</p>
          <p className={styles.subtitle}>
            Tu salud financiera se encuentra en <strong>excelente estado</strong> este mes.
          </p>
        </div>
        <div className={styles.verified_badge}>
          <span aria-hidden="true">◌</span>
          Perfil Verificado
        </div>
      </section>

      <section className={styles.quick_section} aria-labelledby="quick-actions-title">
        <div className={styles.section_head}>
          <h2 id="quick-actions-title">Acceso Rápido</h2>
        </div>
        <div className={styles.quick_grid}>
          {quickActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <button key={action.title} type="button" className={`${styles.quick_card} ${styles[`quick_card_${action.tone}`]}`}>
                <span className={styles.quick_icon}>
                  <ActionIcon />
                </span>
                <span className={styles.quick_copy}>
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className={styles.activity_grid}>
        <article className={styles.activity_card} aria-labelledby="activity-title">
          <div className={styles.section_head}>
            <h2 id="activity-title">Resumen de Actividad Reciente</h2>
            <button type="button" className={styles.link_button}>Ver todo</button>
          </div>
          <div className={styles.activity_list}>
            {activityItems.map((item) => {
              const ActivityIcon = item.icon
              return (
                <div key={item.title} className={styles.activity_row}>
                  <span className={`${styles.activity_icon} ${styles[`activity_icon_${item.tone}`]}`}>
                    <ActivityIcon />
                  </span>
                  <div className={styles.activity_copy}>
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </div>
                  <div className={styles.activity_amount}>
                    <strong>{item.amount}</strong>
                    <span>{item.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <aside className={styles.payment_card} aria-labelledby="next-payment-title">
          <div className={styles.payment_head}>
            <span className={styles.payment_icon}><IconWallet /></span>
            <span className={styles.payment_label}>Próximo pago</span>
          </div>
          <div className={styles.payment_body}>
            <strong id="next-payment-title">S/ 450</strong>
            <p>Vence el 15 de Octubre</p>
          </div>
          <div className={styles.payment_separator} />
          <button type="button" className={styles.primary_link}>Pagar Ahora</button>
        </aside>
      </section>

      <section className={styles.inspire_section} aria-labelledby="inspire-title">
        <div className={styles.section_head}>
          <h2 id="inspire-title">Infórmate ahora</h2>
          <span className={styles.section_hint}>Tips para tu crecimiento patrimonial</span>
        </div>
        <div className={styles.article_grid}>
          {articleCards.map((card) => (
            <article key={card.title} className={styles.article_card}>
              <div className={styles.article_visual}>
                <img src={card.image} alt="" aria-hidden="true" />
                <span>{card.tag}</span>
              </div>
              <div className={styles.article_copy}>
                <h3>{card.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.footer_banner} aria-label="Ventajas de la plataforma">
        <div className={styles.footer_copy}>
          <h2>Tu confianza es nuestra prioridad</h2>
          <p>Regulados por la SBS para dar mayor tranquilidad y seguridad a cada operación.</p>
        </div>
        <div className={styles.footer_stats}>
          <div><strong>99.8%</strong><span>Disponibilidad</span></div>
          <div><strong>24/7</strong><span>Soporte VIP</span></div>
          <div><strong>S/ 2M+</strong><span>Desembolsados</span></div>
        </div>
      </section>
    </>
  )
}
