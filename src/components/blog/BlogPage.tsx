import { useRef, useState } from 'react'
import { blogCategories, featuredPost, recentPosts } from '../../data/blogContent'
import styles from './BlogPage.module.css'

type BlogPageProps = {
  featuredBackgroundSrc: string
}

function IconClock() {
  return (
    <svg className={styles.blog_icon_clock} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function BlogPage({ featuredBackgroundSrc }: BlogPageProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const scrollStories = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      left: direction * Math.min(360, scrollerRef.current.clientWidth * 0.88),
      behavior: 'smooth',
    })
  }

  return (
    <div className={styles.blog_page}>
      <section className={styles.blog_featured} aria-labelledby="blog-featured-heading">
        <div className={styles.blog_featured_grid}>
          <div className={styles.blog_featured_visual}>
            <img src={featuredBackgroundSrc} alt="" decoding="async" />
            <div className={styles.blog_featured_visual_frame} aria-hidden="true" />
          </div>
          <div className={styles.blog_featured_copy}>
            <p className={styles.blog_kicker}>Texto largo · edición</p>
            <h1 id="blog-featured-heading" className={styles.blog_featured_title}>
              {featuredPost.title}
            </h1>
            <p className={styles.blog_featured_excerpt}>{featuredPost.excerpt}</p>
            <a className={styles.blog_featured_cta} href="#">
              Seguir leyendo
            </a>
          </div>
        </div>
      </section>

      <div className={styles.blog_layout}>
        <div className={styles.blog_main}>
          <div className={styles.blog_section_head}>
            <h2 className={styles.blog_section_title}>Lo último</h2>
            <div className={styles.blog_carousel_nav} aria-label="Desplazar lista">
              <button type="button" onClick={() => scrollStories(-1)} aria-label="Anterior">
                ←
              </button>
              <button type="button" onClick={() => scrollStories(1)} aria-label="Siguiente">
                →
              </button>
            </div>
          </div>

          <div className={styles.blog_cards_scroller} ref={scrollerRef}>
            <ul className={styles.blog_cards_track}>
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <article className={styles.blog_card}>
                    <div
                      className={`${styles.blog_card_thumb} ${styles[`blog_card_thumb_${post.thumbTone}`]}`}
                      aria-hidden="true"
                    />
                    <div className={styles.blog_card_body}>
                      <p className={styles.blog_card_category}>{post.category}</p>
                      <h3 className={styles.blog_card_title}>{post.title}</h3>
                      <p className={styles.blog_card_excerpt}>{post.excerpt}</p>
                      <div className={styles.blog_card_footer}>
                        <span className={styles.blog_card_meta}>
                          <IconClock />
                          {post.readMinutes} min
                        </span>
                        <a className={styles.blog_card_more} href="#">
                          Abrir
                        </a>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className={styles.blog_sidebar} aria-label="Barra lateral">
          <div className={`${styles.blog_widget} ${styles.blog_widget_categories}`}>
            <h3 className={styles.blog_widget_title}>Temas</h3>
            <ul className={styles.blog_category_list}>
              {blogCategories.map((cat) => (
                <li key={cat}>
                  <button type="button" className={styles.blog_category_link}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.blog_widget} ${styles.blog_widget_newsletter}`}>
            <h3 className={styles.blog_widget_newsletter_title}>Carta quincenal</h3>
            <p className={styles.blog_widget_newsletter_text}>
              Un correo corto: lo que leímos, un aviso si aparece algo raro en el sector y un solo
              enlace útil. Sin cadenas de “marketing”.
            </p>
            <label className={styles.blog_newsletter_label} htmlFor="blog-newsletter-email">
              Correo
            </label>
            <input
              id="blog-newsletter-email"
              type="email"
              className={styles.blog_newsletter_input}
              placeholder="tu@correo.com"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              autoComplete="email"
            />
            <button type="button" className={styles.blog_newsletter_submit}>
              Apuntarme
            </button>
            <p className={styles.blog_newsletter_foot}>
              Puedes salirte cuando quieras; no compartimos la lista con terceros.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
