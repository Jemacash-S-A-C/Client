import officeImg from '../../assets/representative_images/main_page.png'
import valuationImg from '../../assets/valuacion_img/valuacion_card.png'
import {
  IconPerson,
  IconCar,
  IconCalendar,
  IconDocument,
  IconPlus,
  IconFilter,
  IconDownload,
  IconCheck,
} from './icons'
import styles from './MisPrestamosView.module.css'

const loans = [
  {
    id: 'IM #Pú-99283',
    type: 'Préstamo Personal',
    icon: IconPerson,
    total: 12500,
    paid: 8250,
    remaining: 4250,
    nextPayment: '15 de Noviembre, 2023',
  },
  {
    id: 'IM #ge-44120',
    type: 'Préstamo Vehicular',
    icon: IconCar,
    total: 45000,
    paid: 15000,
    remaining: 30000,
    nextPayment: '28 de Noviembre, 2023',
  },
] as const

const guarantees = [
  {
    name: 'Toyota Hilux 2022',
    detail: 'Placa: ABC-123',
    value: 115000,
    tag: 'Vehículo',
    image: valuationImg,
  },
  {
    name: 'MacBook Pro M2 Max',
    detail: 'S/N: C02DW5...',
    value: 9500,
    tag: 'Tecnología',
    image: officeImg,
  },
] as const

const movements = [
  {
    concept: 'Cuota 08 - Préstamo Personal',
    id: '#TRX-00129',
    date: '15 Oct, 2023',
    amount: 1250,
    status: 'pagado',
  },
  {
    concept: 'Cuota 04 - Préstamo Vehicular',
    id: '#TRX-00115',
    date: '28 Sep, 2023',
    amount: 3100,
    status: 'pagado',
  },
  {
    concept: 'Mantenimiento de Cuenta',
    id: '#TRX-00101',
    date: '10 Sep, 2023',
    amount: 15,
    status: 'pendiente',
  },
] as const

export function MisPrestamosView() {
  const fmt = (n: number) =>
    n.toLocaleString('es-PE', { minimumFractionDigits: 2 })

  return (
    <div className={styles.view_grid}>
      <div className={styles.view_header}>
        <div>
          <h1 className={styles.view_title}>Estado de mis Créditos</h1>
          <p className={styles.view_sub}>Monitorea el progreso de tus préstamos activos en tiempo real.</p>
        </div>
        <span className={styles.badge_active}>2 Préstamos Activos</span>
      </div>

      <div className={styles.loans_grid}>
        {loans.map((loan) => {
          const LoanIcon = loan.icon
          const pct = Math.round((loan.paid / loan.total) * 100)
          return (
            <article key={loan.id} className={styles.loan_card}>
              <div className={styles.loan_top}>
                <span className={styles.loan_icon_wrap}>
                  <LoanIcon />
                </span>
                <div className={styles.loan_identity}>
                  <strong>{loan.type}</strong>
                  <span>{loan.id}</span>
                </div>
                <div className={styles.loan_total_block}>
                  <span className={styles.loan_total_label}>MONTO TOTAL</span>
                  <strong className={styles.loan_total}>S/ {fmt(loan.total)}</strong>
                </div>
              </div>

              <div className={styles.loan_amounts}>
                <span className={styles.amount_paid}>Pagado: S/ {fmt(loan.paid)}</span>
                <span className={styles.amount_remaining}>Restante: S/ {fmt(loan.remaining)}</span>
              </div>

              <div className={styles.progress_bar}>
                <div className={styles.progress_fill} style={{ width: `${pct}%` }} />
              </div>

              <div className={styles.loan_footer}>
                <div className={styles.next_payment}>
                  <IconCalendar />
                  <div>
                    <span>Próximo Pago</span>
                    <strong>{loan.nextPayment}</strong>
                  </div>
                </div>
                <button type="button" className={styles.pay_btn}>Pagar Ahora</button>
              </div>
            </article>
          )
        })}
      </div>

      <section className={styles.guarantees_section}>
        <h2 className={styles.section_title}>Tus Garantías Activas</h2>
        <div className={styles.guarantees_grid}>
          {guarantees.map((g) => (
            <article key={g.name} className={styles.guarantee_card}>
              <div className={styles.guarantee_img_wrap}>
                <img src={g.image} alt={g.name} />
                <span className={styles.guarantee_tag}>{g.tag}</span>
              </div>
              <div className={styles.guarantee_body}>
                <strong>{g.name}</strong>
                <span>{g.detail}</span>
                <div className={styles.guarantee_value}>
                  <span>Valor Estimado</span>
                  <strong>S/ {fmt(g.value)}</strong>
                </div>
                <button type="button" className={styles.doc_btn}>
                  <IconDocument />
                  Ver Documentos Legales
                </button>
              </div>
            </article>
          ))}

          <article className={styles.guarantee_card_new}>
            <button type="button" className={styles.new_guarantee_btn}>
              <span className={styles.new_guarantee_icon}><IconPlus /></span>
              <strong>Vincular Nueva Garantía</strong>
              <span>Aumenta tu capacidad de crédito vinculando nuevos activos.</span>
            </button>
          </article>
        </div>
      </section>

      <section className={styles.movements_section}>
        <div className={styles.movements_head}>
          <h2 className={styles.section_title}>Historial de Movimientos</h2>
          <div className={styles.movements_actions}>
            <button type="button" className={styles.outline_btn}>
              <IconFilter />
              Filtrar
            </button>
            <button type="button" className={styles.outline_btn}>
              <IconDownload />
              Exportar
            </button>
          </div>
        </div>

        <div className={styles.movements_table}>
          <div className={styles.table_header}>
            <span>CONCEPTO / ID</span>
            <span>FECHA</span>
            <span>IMPORTE</span>
            <span>ESTADO</span>
            <span>ACCIÓN</span>
          </div>

          {movements.map((m) => (
            <div key={m.id} className={styles.table_row}>
              <div className={styles.table_concept}>
                <span className={`${styles.concept_dot} ${m.status === 'pagado' ? styles.dot_green : styles.dot_purple}`}>
                  {m.status === 'pagado' ? <IconCheck /> : <span />}
                </span>
                <div>
                  <strong>{m.concept}</strong>
                  <span>{m.id}</span>
                </div>
              </div>
              <span className={styles.table_date}>{m.date}</span>
              <span className={styles.table_amount}>S/ {fmt(m.amount)}</span>
              <span className={`${styles.status_badge} ${m.status === 'pagado' ? styles.status_paid : styles.status_pending}`}>
                {m.status === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
              </span>
              <button type="button" className={styles.action_link}>
                {m.status === 'pagado' ? 'Detalles' : 'Pagar'}
              </button>
            </div>
          ))}

          <div className={styles.load_more}>
            <button type="button" className={styles.load_more_btn}>
              Cargar más movimientos ↓
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
