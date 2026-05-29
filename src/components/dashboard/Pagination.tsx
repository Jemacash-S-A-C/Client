import { useTranslation } from 'react-i18next'
import styles from './Pagination.module.css'

interface Props {
  page: number
  total: number
  onChange: (p: number) => void
}

export function Pagination({ page, total, onChange }: Props) {
  const { t } = useTranslation()
  if (total <= 1) return null
  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
      >
        {t('prestamos.prev')}
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
        {t('prestamos.next')}
      </button>
    </div>
  )
}
