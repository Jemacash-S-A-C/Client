import { useEffect, useId, useState } from 'react'
import { IconEye, IconEyeOff, IconGoogle, IconPasskey } from './LoginIcons'
import styles from './LoginModal.module.css'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  onNavigateToRegister: () => void
}

export function LoginModal({ open, onClose, onNavigateToRegister }: LoginModalProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const titleId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className={styles.login_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.login_split}>
        <aside className={styles.login_aside} aria-label="Jemacash">
          <div className={styles.login_aside_building} aria-hidden="true" />
          <div className={styles.login_aside_scrim} />
          <div className={styles.login_aside_content}>
            <p className={styles.login_aside_brand}>Jemacash</p>
            <div className={styles.login_aside_copy}>
              <h2 className={styles.login_aside_title}>Tu futuro financiero comienza hoy.</h2>
              <p className={styles.login_aside_sub}>
                Gestione su capital con la elegancia y seguridad que solo Jemacash puede ofrecer.
                Rápida y eficiente.
              </p>
            </div>
            <div className={styles.login_social_pill}>
              <div className={styles.login_avatar_stack} aria-hidden="true">
                <span className={styles.login_avatar} />
                <span className={styles.login_avatar} />
                <span className={styles.login_avatar} />
              </div>
              <div className={styles.login_social_text}>
                <strong>+10k Usuarios</strong>
                <span>Confían en nuestra plataforma</span>
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.login_panel}>
          <button type="button" className={styles.login_close} onClick={onClose} aria-label="Cerrar">
            ×
          </button>

          <form className={styles.login_form} onSubmit={(event) => {
            event.preventDefault()
          }}>
            <header className={styles.login_form_header}>
              <h2 id={titleId}>Iniciar Sesión</h2>
              <p>Bienvenido de nuevo. Acceda a su panel de control.</p>
            </header>

            <div className={styles.login_field}>
              <label htmlFor="login-identifier">Correo electrónico o Teléfono</label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="nombre@ejemplo.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>

            <div className={styles.login_field}>
              <div className={styles.login_label_row}>
                <label htmlFor={passwordId}>Contraseña</label>
                <a className={styles.login_link_inline} href="#">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className={styles.login_password_wrap}>
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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

            <label className={styles.login_remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Mantenerme conectado</span>
            </label>

            <button type="submit" className={styles.login_submit}>
              Iniciar sesión <span aria-hidden="true">→</span>
            </button>

            <div className={styles.login_divider}>
              <span>O continuar con</span>
            </div>

            <div className={styles.login_oauth_row}>
              <button type="button" className={styles.login_oauth_btn}>
                <IconGoogle className={styles.login_oauth_icon} />
                Google
              </button>
              <button type="button" className={styles.login_oauth_btn}>
                <IconPasskey className={`${styles.login_oauth_icon} ${styles.login_oauth_icon_stroke}`} />
                Passkey
              </button>
            </div>

            <p className={styles.login_register_prompt}>
              ¿No tiene una cuenta?{' '}
              <button type="button" className={styles.login_register_link} onClick={onNavigateToRegister}>
                Regístrese gratis
              </button>
            </p>

            <nav className={styles.login_legal} aria-label="Enlaces legales">
              <a href="#">Ayuda</a>
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
            </nav>
          </form>
        </div>
      </div>
    </div>
  )
}
