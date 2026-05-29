import { useEffect, useId, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { IconLock, IconMail, IconPhone, IconUser } from './RegisterIcons'
import styles from './RegisterModal.module.css'

type RegisterPayload = {
  fullName: string
  email: string
  phone: string
  password: string
  termsAccepted: boolean
}

type RegisterModalProps = {
  open: boolean
  onClose: () => void
  onNavigateToLogin: (prefillIdentifier?: string) => void
  onSubmit: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>
  heroBackgroundSrc: string
}

export function RegisterModal({
  open,
  onClose,
  onNavigateToLogin,
  onSubmit,
  heroBackgroundSrc,
}: RegisterModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const titleId = useId()

  const asideStyle = {
    ['--register-hero-image' as string]: `url(${heroBackgroundSrc})`,
  } as CSSProperties

  useEffect(() => {
    if (!open) return
    setError('')
    setLoading(false)
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await onSubmit({ fullName: name, email, phone, password, termsAccepted })
      if (!result.success) {
        setError(result.message ?? 'No fue posible completar el registro.')
        return
      }
      // Success → go to login pre-filled
      onNavigateToLogin(email)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.register_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.register_split}>
        <aside className={styles.register_aside} style={asideStyle}>
          <div className={styles.register_aside_scrim} />
          <div className={styles.register_aside_content}>
            <p className={styles.register_aside_brand}>Jemacash</p>
            <h2 className={styles.register_aside_title}>
              {t('register.aside.title')}
            </h2>
            <p className={styles.register_aside_footer}>
              {t('register.aside.footer')}
            </p>
          </div>
        </aside>

        <div className={styles.register_panel}>
          <button
            type="button"
            className={styles.register_close}
            onClick={onClose}
            aria-label={t('register.close')}
          >
            <span aria-hidden="true">×</span>
          </button>

          <form className={styles.register_form} onSubmit={handleSubmit}>
            <header className={styles.register_form_header}>
              <h2 id={titleId}>{t('register.title')}</h2>
              <p>{t('register.subtitle')}</p>
            </header>

            <div className={styles.register_field}>
              <label htmlFor="reg-fullname">{t('register.fullName')}</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}><IconUser /></span>
                <input
                  id="reg-fullname"
                  name="fullname"
                  type="text"
                  autoComplete="name"
                  placeholder={t('register.fullNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-email">{t('register.email')}</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}><IconMail /></span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-phone">{t('register.phone')}</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}><IconPhone /></span>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t('register.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-password">{t('register.password')}</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}><IconLock /></span>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('register.passwordPlaceholder')}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <label className={styles.register_terms}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={loading}
              />
              <span>
                {t('register.termsAccept')} <a href="#">{t('register.termsLink')}</a> {t('register.andThe')}{' '}
                <a href="#">{t('register.privacyLink')}</a> {t('register.of')}
              </span>
            </label>

            <button type="submit" className={styles.register_submit} disabled={loading}>
              {loading ? t('register.submitting') : t('register.submit')}
            </button>

            {error ? (
              <p className={styles.register_error} role="alert">
                {error}
              </p>
            ) : null}

            <p className={styles.register_login_prompt}>
              {t('register.haveAccount')}{' '}
              <button
                type="button"
                className={styles.register_login_link}
                onClick={() => onNavigateToLogin(email)}
                disabled={loading}
              >
                {t('register.loginLink')}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
