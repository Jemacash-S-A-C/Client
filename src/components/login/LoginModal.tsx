import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconEye, IconEyeOff, IconGoogle } from './LoginIcons'
import { LegalModal, type LegalType } from '../layout/LegalModal'
import { forgotPassword } from '../../services/auth.service'
import { socialAvatars } from './socialAvatars'
import styles from './LoginModal.module.css'

type LoginPayload = {
  identifier: string
  password: string
}

type LoginModalProps = {
  open: boolean
  onClose: () => void
  onNavigateToRegister: () => void
  onSubmit: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>
  onGoogleLogin?: () => void
  defaultIdentifier?: string
}

export function LoginModal({
  open,
  onClose,
  onNavigateToRegister,
  onSubmit,
  onGoogleLogin,
  defaultIdentifier,
}: LoginModalProps) {
  const { t } = useTranslation()
  const [view, setView] = useState<'login' | 'forgot' | 'forgot_sent'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [legalOpen, setLegalOpen] = useState<LegalType | null>(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const titleId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (!open) return
    setView('login')
    setIdentifier(defaultIdentifier ?? '')
    setPassword('')
    setShowPassword(false)
    setError('')
    setLoading(false)
    setLegalOpen(null)
    setForgotEmail('')

    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [defaultIdentifier, onClose, open])

  if (!open) return null

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(forgotEmail)
      setView('forgot_sent')
    } catch {
      setError(t('login.forgot.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await onSubmit({ identifier, password })
      if (!result.success) {
        setError(result.message ?? 'No fue posible iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  const aside = (
    <aside className={styles.login_aside} aria-label="Jemacash">
      <div className={styles.login_aside_building} aria-hidden="true" />
      <div className={styles.login_aside_orb} aria-hidden="true" />
      <div className={styles.login_aside_arc} aria-hidden="true" />
      <div className={styles.login_aside_scrim} />
      <div className={styles.login_aside_content}>
        <p className={styles.login_aside_brand}>Jemacash</p>
        <div className={styles.login_aside_copy}>
          <h2 className={styles.login_aside_title}>{t('login.aside.title')}</h2>
          <p className={styles.login_aside_sub}>{t('login.aside.sub')}</p>
        </div>
        <div className={styles.login_social_pill}>
          <div className={styles.login_avatar_stack} aria-hidden="true">
            {socialAvatars.map((avatar, index) => (
              <img key={index} className={styles.login_avatar} src={avatar} alt="" />
            ))}
          </div>
          <div className={styles.login_social_text}>
            <strong>{t('login.aside.users')}</strong>
            <span>{t('login.aside.trust')}</span>
          </div>
        </div>
      </div>
    </aside>
  )

  if (view === 'forgot' || view === 'forgot_sent') {
    return (
      <div className={styles.login_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.login_split}>
          {aside}
          <div className={styles.login_panel}>
            <button type="button" className={styles.login_close} onClick={onClose} aria-label={t('login.close')}>
              <span aria-hidden="true">×</span>
            </button>

            {view === 'forgot_sent' ? (
              <div className={styles.login_form}>
                <header className={styles.login_form_header}>
                  <h2 id={titleId}>{t('login.forgot.sentTitle')}</h2>
                  <p>
                    {t('login.forgot.sentDesc', { email: forgotEmail })}
                  </p>
                </header>
                <button
                  type="button"
                  className={styles.login_submit}
                  onClick={() => setView('login')}
                >
                  {t('login.forgot.returnToLogin')}
                </button>
              </div>
            ) : (
              <form className={styles.login_form} onSubmit={handleForgot}>
                <header className={styles.login_form_header}>
                  <h2 id={titleId}>{t('login.forgot.title')}</h2>
                  <p>{t('login.forgot.desc')}</p>
                </header>

                <div className={styles.login_field}>
                  <label htmlFor="forgot-email">{t('login.forgot.emailLabel')}</label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('login.identifierPlaceholder')}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className={styles.login_submit} disabled={loading}>
                  {loading ? t('login.forgot.sending') : t('login.forgot.send')}
                </button>

                {error && <p className={styles.login_error} role="alert">{error}</p>}

                <p className={styles.login_register_prompt}>
                  <button
                    type="button"
                    className={styles.login_register_link}
                    onClick={() => { setError(''); setView('login') }}
                  >
                    {t('login.forgot.back')}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.login_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.login_split}>
        {aside}

        <div className={styles.login_panel}>
          <button type="button" className={styles.login_close} onClick={onClose} aria-label={t('login.close')}>
            <span aria-hidden="true">×</span>
          </button>

          <form className={styles.login_form} onSubmit={handleSubmit}>
            <header className={styles.login_form_header}>
              <h2 id={titleId}>{t('login.title')}</h2>
              <p>{t('login.subtitle')}</p>
            </header>

            <div className={styles.login_field}>
              <label htmlFor="login-identifier">{t('login.identifier')}</label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder={t('login.identifierPlaceholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.login_field}>
              <div className={styles.login_label_row}>
                <label htmlFor={passwordId}>{t('login.password')}</label>
                <button
                  type="button"
                  className={styles.login_link_inline}
                  onClick={() => { setError(''); setForgotEmail(identifier.includes('@') ? identifier : ''); setView('forgot') }}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
              <div className={styles.login_password_wrap}>
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.login_toggle_visibility}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.login_submit} disabled={loading}>
              {loading ? t('login.submitting') : <>{t('login.submit')} <span aria-hidden="true">→</span></>}
            </button>

            {error ? (
              <p className={styles.login_error} role="alert">
                {error}
              </p>
            ) : null}

            <div className={styles.login_divider}>
              <span>{t('login.orContinueWith')}</span>
            </div>

            <div className={styles.login_oauth_row}>
              <button
                type="button"
                className={styles.login_oauth_btn}
                onClick={onGoogleLogin}
                disabled={loading || !onGoogleLogin}
              >
                <IconGoogle className={styles.login_oauth_icon} />
                Google
              </button>
            </div>

            <p className={styles.login_register_prompt}>
              {t('login.noAccount')}{' '}
              <button
                type="button"
                className={styles.login_register_link}
                onClick={onNavigateToRegister}
                disabled={loading}
              >
                {t('login.register')}
              </button>
            </p>

            <nav className={styles.login_legal} aria-label="Enlaces legales">
              <button type="button" className={styles.login_legal_btn} onClick={() => setLegalOpen('soporte')}>{t('login.help')}</button>
              <button type="button" className={styles.login_legal_btn} onClick={() => setLegalOpen('privacidad')}>{t('login.privacy')}</button>
              <button type="button" className={styles.login_legal_btn} onClick={() => setLegalOpen('terminos')}>{t('login.terms')}</button>
            </nav>

            {legalOpen && <LegalModal type={legalOpen} onClose={() => setLegalOpen(null)} />}
          </form>
        </div>
      </div>
    </div>
  )
}
