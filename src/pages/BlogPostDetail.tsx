import styles from './BlogPostDetail.module.css'

type BlogPostDetailProps = {
  postId: string
  onBack: () => void
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
    content: `
      <p>La nueva Ley de Ciberseguridad 2024 representa un cambio fundamental en cómo las instituciones financieras peruanas deben proteger los datos y transacciones de sus usuarios.</p>
      
      <h2>¿Qué cambia con esta nueva regulación?</h2>
      <p>Entre los puntos más importantes de la normativa se encuentran:</p>
      <ul>
        <li>Implementación obligatoria de autenticación de dos factores para todas las transacciones superiores a S/ 500</li>
        <li>Encriptación de extremo a extremo para todas las comunicaciones bancarias</li>
        <li>Notificación inmediata a usuarios en caso de intentos de acceso no autorizados</li>
        <li>Auditorías de seguridad trimestrales certificadas por la SBS</li>
      </ul>
      
      <h2>Impacto en tus transacciones diarias</h2>
      <p>Para el usuario común, estos cambios significan:</p>
      <ul>
        <li>Mayor seguridad al realizar transferencias y pagos</li>
        <li>Protección mejorada contra phishing y suplantación de identidad</li>
        <li>Transparencia en el manejo de datos personales</li>
        <li>Derecho a saber quién ha accedido a tu información financiera</li>
      </ul>
      
      <h2>Recomendaciones para usuarios</h2>
      <p>Para aprovechar al máximo estas protecciones:</p>
      <ul>
        <li>Mantén actualizados tus datos de contacto en el banco</li>
        <li>Activa las alertas de seguridad en todas tus cuentas</li>
        <li>Nunca compartes tus credenciales o códigos de verificación</li>
        <li>Revisa regularmente tus estados de cuenta</li>
      </ul>
      
      <h2>El rol de Jemacash</h2>
      <p>En Jemacash hemos implementado estas medidas desde antes de que fueran obligatorias, demostrando nuestro compromiso con la seguridad de nuestros usuarios. Nuestra plataforma utiliza:</p>
      <ul>
        <li>Certificación SSL de nivel bancario</li>
        <li>Sistemas de detección de fraude con IA</li>
        <li>Monitoreo 24/7 de actividades sospechosas</li>
        <li>Cumplimiento estricto con todas las normativas SBS</li>
      </ul>
    `,
  },
  {
    id: '2',
    category: 'Educación Financiera',
    title: 'Inversión Inteligente: Guía para principiantes en el BVL',
    excerpt:
      '¿Tienes S/ 500 para invertir? Te mostramos los primeros pasos para entrar al mercado de valores desde Perú.',
    readTime: '8 min lectura',
    tone: 'education',
    content: `
      <p>Invertir en la Bolsa de Valores de Lima (BVL) puede parecer intimidante, pero con S/ 500 ya puedes comenzar tu camino como inversionista.</p>
      
      <h2>¿Por dónde empezar?</h2>
      <p>El primer paso es educarse. Antes de invertir tu primer sol, debes entender:</p>
      <ul>
        <li>La diferencia entre acciones, bonos y fondos mutuos</li>
        <li>Cómo leer un estado financiero básico</li>
        <li>El concepto de riesgo vs. retorno</li>
        <li>La importancia de la diversificación</li>
      </ul>
      
      <h2>Abriendo tu cuenta en un brokerage</h2>
      <p>Para operar en la BVL necesitas una cuenta en una sociedad agente de bolsa. Los requisitos típicos incluyen:</p>
      <ul>
        <li>DNI vigente</li>
        <li>Declaración jurada de perfil de inversionista</li>
        <li>Depósito mínimo (varía según el broker)</li>
        <li>Formulario de registro</li>
      </ul>
      
      <h2>Estrategias para principiantes</h2>
      <p>Con S/ 500 recomendamos:</p>
      <ul>
        <li>Invertir en fondos mutuos indexados (menor riesgo)</li>
        <li>Comenzar con empresas consolidadas y dividendos</li>
        <li>Aplicar la estrategia de inversión periódica (dollar cost averaging)</li>
        <li>Reinvertir los dividendos para capitalización</li>
      </ul>
      
      <h2>Errores comunes a evitar</h2>
      <ul>
        <li>Invertir sin entender el instrumento</li>
        <li>Seguir recomendaciones sin investigación propia</li>
        <li>Panicselling ante caídas temporales del mercado</li>
        <li>No tener un horizonte de inversión claro</li>
      </ul>
    `,
  },
  {
    id: '3',
    category: 'Mercado',
    title: 'Tipo de Cambio: Perspectivas del Sol frente al Dólar',
    excerpt:
      'Expertos analizan la volatilidad del tipo de cambio y recomiendan estrategias para manejar tus ahorros bimonetarios.',
    readTime: '5 min lectura',
    tone: 'market',
    content: `
      <p>El tipo de cambio en Perú ha experimentado una volatilidad significativa en los últimos meses, generando incertidumbre entre quienes mantienen ahorros en dólares y soles.</p>
      
      <h2>Factores que influyen en el tipo de cambio</h2>
      <p>El valor del sol frente al dólar depende de múltiples factores:</p>
      <ul>
        <li>Precios de materias primas (cobre, oro, zinc)</li>
        <li>Política monetaria del BCR</li>
        <li>Situación económica de EE.UU. y China</li>
        <li>Flujos de capital extranjero</li>
        <li>Confianza en la economía peruana</li>
      </ul>
      
      <h2>Perspectivas para 2024</h2>
      <p>Los analistas proyectan:</p>
      <ul>
        <li>Volatilidad moderada en el primer semestre</li>
        <li>Estabilización hacia el segundo semestre</li>
        <li>Rango estimado entre S/ 3.70 y S/ 3.90 por dólar</li>
        <li>Impacto positivo de recuperación de inversiones mineras</li>
      </ul>
      
      <h2>Estrategias para ahorros bimonetarios</h2>
      <p>Para proteger tu patrimonio:</p>
      <ul>
        <li>Mantener diversificación 50/50 como punto de partida</li>
        <li>Ajustar según horizonte temporal y necesidades</li>
        <li>Considerar productos hedging como forwards</li>
        <li>Evitar conversiones impulsivas por picos temporales</li>
      </ul>
    `,
  },
  {
    id: '4',
    category: 'Tecnología',
    title: 'Open Banking en Perú: El futuro de la personalización',
    excerpt:
      'Cómo Jemacash está liderando la adopción de estándares abiertos para ofrecerte mejores tasas y servicios personalizados.',
    readTime: '7 min lectura',
    tone: 'tech',
    content: `
      <p>El Open Banking (banca abierta) está revolucionando el sector financiero mundial, y Perú no es la excepción. Esta tecnología permite que los clientes compartan sus datos financieros de forma segura con terceros autorizados.</p>
      
      <h2>¿Qué es el Open Banking?</h2>
      <p>Es un sistema que permite:</p>
      <ul>
        <li>Compartir información financiera entre instituciones con tu consentimiento</li>
        <li>Acceder a productos y servicios personalizados</li>
        <li>Comparar ofertas de diferentes entidades en un solo lugar</li>
        <li>Automatizar procesos financieros</li>
      </ul>
      
      <h2>Beneficios para el usuario</h2>
      <ul>
        <li>Mejores tasas al comparar ofertas</li>
        <li>Servicios más personalizados según tu perfil</li>
        <li>Mayor transparencia en costos y comisiones</li>
        <li>Gestión simplificada de todas tus finanzas</li>
      </ul>
      
      <h2>El enfoque de Jemacash</h2>
      <p>En Jemacash estamos adoptando estándares abiertos para:</p>
      <ul>
        <li>Ofrecer tasas competitivas basadas en tu historial real</li>
        <li>Integrar con otras plataformas financieras</li>
        <li>Proporcionar una visión 360° de tu salud financiera</li>
        <li>Automatizar procesos de aprobación de crédito</li>
      </ul>
      
      <h2>Seguridad y privacidad</h2>
      <p>Tus datos están protegidos por:</p>
      <ul>
        <li>Consentimiento explícito para cada compartición</li>
        <li>Encriptación de extremo a extremo</li>
        <li>Cumplimiento con normativas SBS y GDPR</li>
        <li>Revocación inmediata de accesos</li>
      </ul>
    `,
  },
] as const

export default function BlogPostDetail({ postId, onBack }: BlogPostDetailProps) {
  const post = recentStories.find((s) => s.id === postId)

  if (!post) {
    return (
      <div className={styles.blog_post_detail}>
        <button type="button" className={styles.back_button} onClick={onBack}>
          ← Volver al blog
        </button>
        <p>Artículo no encontrado</p>
      </div>
    )
  }

  return (
    <div className={styles.blog_post_detail}>
      <button type="button" className={styles.back_button} onClick={onBack}>
        ← Volver al blog
      </button>

      <article className={styles.post_article}>
        <header className={styles.post_header}>
          <span className={`${styles.post_badge} ${styles[`tone_${post.tone}`]}`}>{post.category}</span>
          <h1 className={styles.post_title}>{post.title}</h1>
          <p className={styles.post_excerpt}>{post.excerpt}</p>
          <p className={styles.post_read_time}>{post.readTime}</p>
        </header>

        <div 
          className={styles.post_content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}
