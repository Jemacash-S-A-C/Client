import styles from './Pagination.module.css'

interface Props {
  page: number
  total: number
  onChange: (p: number) => void
}

export function Pagination({ page, total, onChange }: Props) {
  if (total <= 1) return null
  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
      >
        ← Anterior
      </button>
      <div className={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === page ? styles.dot_active : ''}`}
            onClick={() => onChange(i)}
            aria-label={`Página ${i + 1}`}
          />
        ))}
      </div>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(page + 1)}
        disabled={page === total - 1}
      >
        Siguiente →
      </button>
    </div>
  )
}
