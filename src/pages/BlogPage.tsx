import styles from './BlogPage.module.css'

type BlogPageProps = { 
  featuredBackgroundSrc: string
  onPostClick: (postId: string) => void
}

const recentStories = [
  {
    id: '1',
    category: 'Seguridad',
    title: 'Protegiendo tus activos: Nueva ley de Ciberseguridad 2024',
    excerpt:
      'Analizamos el impacto de las nuevas regulaciones en la banca digital peruana y qué significa para tus transacciones diarias en S/.',
    readTime: '6 min lectura',
    tone: 'security',
  },
  {
    id: '2',
    category: 'Educación Financiera',
    title: 'Inversión Inteligente: Guía para principiantes en el BVL',
    excerpt:
      '¿Tienes S/ 500 para invertir? Te mostramos los primeros pasos para entrar al mercado de valores desde Perú.',
    readTime: '8 min lectura',
    tone: 'education',
  },
  {
    id: '3',
    category: 'Mercado',
    title: 'Tipo de Cambio: Perspectivas del Sol frente al Dólar',
    excerpt:
      'Expertos analizan la volatilidad del tipo de cambio y recomiendan estrategias para manejar tus ahorros bimonetarios.',
    readTime: '5 min lectura',
    tone: 'market',
  },
  {
    id: '4',
    category: 'Tecnología',
    title: 'Open Banking en Perú: El futuro de la personalización',
    excerpt:
      'Cómo Jemacash está liderando la adopción de estándares abiertos para ofrecerte mejores tasas y servicios personalizados.',
    readTime: '7 min lectura',
    tone: 'tech',
  },
] as const

const trendingStories = recentStories

export default function BlogPage({ featuredBackgroundSrc, onPostClick }: BlogPageProps) {
  return (
    <div className={styles.blog_page}>
      <section className={styles.blog_featured} aria-labelledby="blog-featured-title">
        <div className={styles.blog_featured_overlay} aria-hidden="true" />
        <img
          className={styles.blog_featured_image}
          src={featuredBackgroundSrc}
          alt="Visual del artículo destacado"
          decoding="async"
        />
        <div className={styles.blog_featured_content}>
          <p className={styles.blog_featured_badge}>Destacado</p>
          <h1 id="blog-featured-title" className={styles.blog_featured_title}>
            El Futuro del Ahorro en el Perú: Cómo maximizar tus S/ en 2024
          </h1>
          <p className={styles.blog_featured_excerpt}>
            Descubre las estrategias clave y herramientas digitales para proteger tu capital y
            hacer crecer tus ahorros en soles est...
          </p>
          <button 
            type="button"
            className={styles.blog_featured_cta}
            onClick={() => onPostClick('1')}
          >
            Leer artículo completo
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className={styles.blog_content} aria-label="Contenido del blog">
        <div className={styles.blog_recent}>
          <div className={styles.blog_recent_header}>
            <h2 className={styles.blog_recent_title}>Recent Stories</h2>
            
          </div>

          <div className={styles.blog_cards_grid}>
            {recentStories.map((story) => (
              <article className={styles.blog_card} key={story.id}>
                <div className={`${styles.blog_card_visual} ${styles[`tone_${story.tone}`]}`}>
                  <span className={styles.blog_card_badge}>{story.category}</span>
                </div>
                <div className={styles.blog_card_body}>
                  <h3 className={styles.blog_card_title}>{story.title}</h3>
                  <p className={styles.blog_card_excerpt}>{story.excerpt}</p>
                  <div className={styles.blog_card_footer}>
                    <p className={styles.blog_card_time}>
                      <span aria-hidden="true">◷</span>
                      {story.readTime}
                    </p>
                    <button 
                      type="button" 
                      className={styles.blog_card_link}
                      onClick={() => onPostClick(story.id)}
                    >
                      Leer más →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.blog_sidebar} aria-label="Barra lateral">
          <div className={styles.blog_newsletter}>
            <h3>Únete a nuestra comunidad financiera</h3>
            <p>
              Recibe consejos exclusivos de inversión y noticias del mercado peruano directamente
              en tu correo.
            </p>
            <label htmlFor="blog-email">Correo electrónico</label>
            <input id="blog-email" type="email" placeholder="tu@email.com" />
            <button type="button">Suscribirme ahora</button>
            <small>Respetamos tu privacidad. Desuscríbete en cualquier momento.</small>
          </div>

          <div className={styles.blog_trending}>
            <h3>Trending en Jemacash</h3>
            {trendingStories.map((story) => (
              <article 
                key={story.id} 
                className={styles.blog_trending_article}
                onClick={() => onPostClick(story.id)}
              >
                <div className={`${styles.blog_trending_image} ${styles[`tone_${story.tone}`]}`} />
                <div>
                  <span className={styles.blog_trending_badge}>{story.category}</span>
                  <h4>{story.title}</h4>
                  <p>{story.readTime}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}
