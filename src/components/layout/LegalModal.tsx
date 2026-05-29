import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LegalModal.module.css'

export type LegalType = 'terminos' | 'privacidad' | 'regulacion' | 'soporte'

interface Props {
  type: LegalType
  onClose: () => void
}

// ── Content map ───────────────────────────────────────────────────────────────

const TITLES: Record<LegalType, string> = {
  terminos:   'Términos y Condiciones',
  privacidad: 'Política de Privacidad',
  regulacion: 'Regulación Bancaria',
  soporte:    'Centro de Soporte',
}

function Terminos() {
  return (
    <div className={styles.content}>
      <p className={styles.updated}>Última actualización: 1 de enero de 2026</p>

      <h3>1. Aceptación de los términos</h3>
      <p>Al acceder y utilizar los servicios de <strong>Jemacash</strong>, usted acepta estar sujeto a los presentes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>

      <h3>2. Descripción del servicio</h3>
      <p>Jemacash es una plataforma de empeño digital que facilita préstamos con garantía de bienes muebles (tecnología y vehículos). Operamos como intermediario financiero bajo supervisión de la Superintendencia de Banca, Seguros y AFP del Perú (SBS).</p>

      <h3>3. Requisitos de elegibilidad</h3>
      <ul>
        <li>Ser mayor de 18 años y ciudadano peruano o extranjero con residencia legal.</li>
        <li>Contar con DNI vigente o carné de extranjería.</li>
        <li>Presentar comprobante de ingresos y domicilio.</li>
        <li>No tener antecedentes de morosidad grave en el sistema financiero.</li>
      </ul>

      <h3>4. Condiciones del préstamo</h3>
      <p>Los préstamos tienen un monto mínimo de <strong>S/ 100</strong> y un máximo de <strong>S/ 50,000</strong>. La tasa de interés mensual aplicable es del <strong>1.25% (TEA 16.08%)</strong> bajo el sistema de amortización francesa. Los plazos disponibles son 12, 24, 36 y 48 meses.</p>

      <h3>5. Garantías</h3>
      <p>El solicitante deberá registrar un bien mueble como garantía. El monto del préstamo no podrá exceder el 80% del valor tasado de la garantía. Jemacash se reserva el derecho de verificar y rechazar garantías que no cumplan con los estándares de calidad requeridos.</p>

      <h3>6. Incumplimiento y mora</h3>
      <p>En caso de incumplimiento en el pago de dos o más cuotas consecutivas, Jemacash podrá iniciar el proceso de ejecución de la garantía conforme a la legislación peruana vigente. Se aplicará una penalidad por mora del <strong>3% mensual</strong> sobre el saldo vencido.</p>

      <h3>7. Firma digital</h3>
      <p>La firma del contrato de préstamo se realiza de forma digital mediante el sistema integrado en la plataforma. Dicha firma tiene plena validez legal conforme a la Ley N° 27269 de Firmas y Certificados Digitales del Perú.</p>

      <h3>8. Modificaciones</h3>
      <p>Jemacash se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios con al menos 30 días de anticipación mediante correo electrónico.</p>

      <h3>9. Jurisdicción</h3>
      <p>Cualquier controversia derivada de estos términos será sometida a los tribunales competentes de la ciudad de Lima, Perú, bajo la legislación peruana vigente.</p>
    </div>
  )
}

function Privacidad() {
  return (
    <div className={styles.content}>
      <p className={styles.updated}>Última actualización: 1 de enero de 2026</p>

      <h3>1. Responsable del tratamiento</h3>
      <p><strong>Jemacash S.A.C.</strong>, con RUC 20612345678, domiciliada en Av. Javier Prado Este 4200, San Borja, Lima, es responsable del tratamiento de sus datos personales.</p>

      <h3>2. Datos que recopilamos</h3>
      <ul>
        <li><strong>Datos de identificación:</strong> Nombre completo, DNI, fecha de nacimiento, fotografía.</li>
        <li><strong>Datos de contacto:</strong> Correo electrónico, teléfono, dirección.</li>
        <li><strong>Datos financieros:</strong> Ingresos, historial crediticio, información bancaria.</li>
        <li><strong>Datos de garantías:</strong> Fotografías, características técnicas y valor estimado de bienes.</li>
        <li><strong>Datos de uso:</strong> Actividad en la plataforma, preferencias y registros de acceso.</li>
      </ul>

      <h3>3. Finalidad del tratamiento</h3>
      <p>Sus datos son utilizados para: evaluación crediticia, cumplimiento de obligaciones contractuales, prevención de fraude, mejora de nuestros servicios, y comunicaciones comerciales (solo con su consentimiento expreso).</p>

      <h3>4. Base legal</h3>
      <p>El tratamiento de sus datos se realiza al amparo de la <strong>Ley N° 29733</strong> de Protección de Datos Personales del Perú y su reglamento aprobado por DS 003-2013-JUS.</p>

      <h3>5. Compartición de datos</h3>
      <p>No vendemos sus datos personales. Podemos compartirlos con: la SBS y entidades reguladoras según obligación legal, bureaus de crédito como Equifax e Infocorp, y proveedores tecnológicos bajo estrictos acuerdos de confidencialidad.</p>

      <h3>6. Sus derechos (ARCO)</h3>
      <p>Usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición sobre sus datos. Para ejercerlos, escriba a <strong>privacidad@jemacash.pe</strong> indicando su identidad y la solicitud específica. Respondemos en un plazo máximo de 20 días hábiles.</p>

      <h3>7. Seguridad</h3>
      <p>Implementamos medidas técnicas y organizativas de seguridad incluyendo cifrado TLS 1.3, autenticación multifactor y auditorías periódicas de seguridad para proteger sus datos.</p>

      <h3>8. Cookies</h3>
      <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas (con su consentimiento) para mejorar la experiencia de usuario. Puede gestionar sus preferencias desde la configuración de su navegador.</p>
    </div>
  )
}

function Regulacion() {
  return (
    <div className={styles.content}>

      <div className={styles.reg_badge_row}>
        <div className={styles.reg_badge}>
          <span className={styles.reg_badge_icon}>🏛️</span>
          <div>
            <strong>Supervisado por la SBS</strong>
            <span>Superintendencia de Banca, Seguros y AFP</span>
          </div>
        </div>
        <div className={styles.reg_badge}>
          <span className={styles.reg_badge_icon}>🔒</span>
          <div>
            <strong>Operador autorizado</strong>
            <span>Resolución SBS N° 2024-00847</span>
          </div>
        </div>
        <div className={styles.reg_badge}>
          <span className={styles.reg_badge_icon}>📋</span>
          <div>
            <strong>LAFT compliant</strong>
            <span>Sistema Anti Lavado de Activos</span>
          </div>
        </div>
      </div>

      <h3>Marco normativo aplicable</h3>
      <p>Jemacash opera bajo el marco legal financiero peruano, cumpliendo con las siguientes normas principales:</p>

      <div className={styles.law_list}>
        <div className={styles.law_item}>
          <span className={styles.law_tag}>Ley 26702</span>
          <div>
            <strong>Ley General del Sistema Financiero</strong>
            <p>Ley General del Sistema Financiero y del Sistema de Seguros y Orgánica de la Superintendencia de Banca y Seguros.</p>
          </div>
        </div>
        <div className={styles.law_item}>
          <span className={styles.law_tag}>Ley 27287</span>
          <div>
            <strong>Ley de Títulos Valores</strong>
            <p>Regula los instrumentos financieros y garantías mobiliarias utilizadas en las operaciones de préstamo.</p>
          </div>
        </div>
        <div className={styles.law_item}>
          <span className={styles.law_tag}>Ley 28587</span>
          <div>
            <strong>Ley de Transparencia</strong>
            <p>Ley Complementaria a la Ley de Protección al Consumidor en Materia de Servicios Financieros.</p>
          </div>
        </div>
        <div className={styles.law_item}>
          <span className={styles.law_tag}>DS 003-2013</span>
          <div>
            <strong>Protección de Datos Personales</strong>
            <p>Reglamento de la Ley N° 29733 que regula el tratamiento de datos de nuestros usuarios.</p>
          </div>
        </div>
        <div className={styles.law_item}>
          <span className={styles.law_tag}>Circular SBS</span>
          <div>
            <strong>Prevención de Lavado de Activos</strong>
            <p>Circular G-136-2009 y modificatorias. Implementamos un Sistema de Prevención LAFT robusto.</p>
          </div>
        </div>
      </div>

      <h3>Tasas de interés registradas</h3>
      <p>Nuestras tasas de interés están registradas y supervisadas por la SBS. La TCEA (Tasa de Costo Efectivo Anual) aplicable a cada operación es informada al cliente antes de la firma del contrato, conforme al Reglamento de Transparencia.</p>

      <div className={styles.rate_table}>
        <div className={styles.rate_row}>
          <span>Tasa mensual nominal</span>
          <strong>1.25%</strong>
        </div>
        <div className={styles.rate_row}>
          <span>TEA (Tasa Efectiva Anual)</span>
          <strong>16.08%</strong>
        </div>
        <div className={styles.rate_row}>
          <span>Tasa de mora mensual</span>
          <strong>3.00%</strong>
        </div>
      </div>

      <h3>Mecanismo de resolución de disputas</h3>
      <p>Si tiene una queja o reclamo, puede acudir al <strong>Defensor del Cliente Financiero</strong> o presentar su reclamo directamente ante la SBS a través de <strong>www.sbs.gob.pe</strong>. Nuestro plazo de respuesta interno es de 10 días hábiles.</p>
    </div>
  )
}

function Soporte() {
  return (
    <div className={styles.content}>

      <div className={styles.support_grid}>
        <a
          className={styles.support_card}
          href="mailto:soporte@jemacash.pe"
        >
          <span className={styles.support_icon}>✉️</span>
          <strong>Correo electrónico</strong>
          <span>soporte@jemacash.pe</span>
          <p>Respuesta en menos de 24 horas hábiles.</p>
        </a>

        <a
          className={styles.support_card}
          href="https://wa.me/51987654321"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.support_icon}>💬</span>
          <strong>WhatsApp</strong>
          <span>+51 987 654 321</span>
          <p>Lunes a viernes, 9 am – 6 pm.</p>
        </a>

        <div className={styles.support_card}>
          <span className={styles.support_icon}>📞</span>
          <strong>Teléfono</strong>
          <span>(01) 234-5678</span>
          <p>Lunes a viernes, 9 am – 6 pm.</p>
        </div>

        <div className={styles.support_card}>
          <span className={styles.support_icon}>🏢</span>
          <strong>Oficina central</strong>
          <span>Lima, San Borja</span>
          <p>Av. Javier Prado Este 4200. Con cita previa.</p>
        </div>
      </div>

      <h3>Preguntas frecuentes</h3>

      <div className={styles.faq_list}>
        <details className={styles.faq_item}>
          <summary>¿Cuánto tiempo tarda la aprobación de mi préstamo?</summary>
          <p>La evaluación de garantía toma entre 24 y 48 horas hábiles. Una vez aprobada, el desembolso se realiza en el mismo día de la firma del contrato.</p>
        </details>
        <details className={styles.faq_item}>
          <summary>¿Qué pasa si no puedo pagar una cuota?</summary>
          <p>Comunícate con nosotros antes del vencimiento. Ofrecemos opciones de refinanciamiento y extensión de plazo. Evita el cargo por mora del 3% mensual siendo proactivo.</p>
        </details>
        <details className={styles.faq_item}>
          <summary>¿Cómo recupero mi garantía una vez pagado el préstamo?</summary>
          <p>Al cancelar el saldo total, tu garantía se libera automáticamente en el sistema. Para bienes físicos, coordina la devolución con soporte dentro de los 5 días hábiles siguientes.</p>
        </details>
        <details className={styles.faq_item}>
          <summary>¿Puedo pagar antes del plazo sin penalidad?</summary>
          <p>Sí. Jemacash no cobra penalidad por prepago total o parcial. El recálculo de intereses se realiza sobre el saldo pendiente a la fecha de pago.</p>
        </details>
        <details className={styles.faq_item}>
          <summary>¿Cómo se determina el valor de mi garantía?</summary>
          <p>Un auditor técnico evalúa el bien según marca, modelo, año, condición y mercado secundario. El proceso es transparente y puedes ver el reporte completo en tu dashboard.</p>
        </details>
        <details className={styles.faq_item}>
          <summary>¿Mis datos están seguros en la plataforma?</summary>
          <p>Sí. Utilizamos cifrado TLS 1.3, autenticación en dos pasos y almacenamiento seguro conforme a la Ley 29733 de Protección de Datos Personales del Perú.</p>
        </details>
      </div>

      <div className={styles.support_notice}>
        <span>⏰</span>
        <p>Horario de atención: <strong>Lunes a viernes de 9:00 am a 6:00 pm</strong> y <strong>sábados de 9:00 am a 1:00 pm</strong>. Fuera de horario, déjanos un mensaje y te respondemos al siguiente día hábil.</p>
      </div>
    </div>
  )
}

const CONTENT: Record<LegalType, () => JSX.Element> = {
  terminos:   Terminos,
  privacidad: Privacidad,
  regulacion: Regulacion,
  soporte:    Soporte,
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function LegalModal({ type, onClose }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const Content = CONTENT[type]

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={t(`legal.type.${type}`)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2>{t(`legal.type.${type}`)}</h2>
          <button type="button" className={styles.close_btn} onClick={onClose} aria-label={t('legal.close')}>
            ✕
          </button>
        </div>
        <div className={styles.modal_body}>
          <Content />
        </div>
      </div>
    </div>
  )
}
