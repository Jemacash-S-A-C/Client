import { useEffect, useId, useState } from 'react'
import { IconLock, IconMail, IconPhone, IconUser } from './RegisterIcons'
import styles from './RegisterModal.module.css'

type RegisterModalProps = {
  open: boolean
  onClose: () => void
  onNavigateToLogin: () => void
  heroBackgroundSrc: string
}

export function RegisterModal({
  open,
  onClose,
  onNavigateToLogin,
  heroBackgroundSrc,
}: RegisterModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const titleId = useId()

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
    <div className={styles.register_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.register_split}>
        <aside className={styles.register_aside} style={{ backgroundImage: `url(${heroBackgroundSrc})` }}>
          <div className={styles.register_aside_scrim} />
          <div className={styles.register_aside_content}>
            <p className={styles.register_aside_brand}>Jemacash</p>
            <h2 className={styles.register_aside_title}>
              Tu aliado en el camino al éxito financiero.
            </h2>
            <p className={styles.register_aside_footer}>
              Únete a la comunidad de Jemacash y gestiona tus finanzas con la seguridad de un
              experto.
            </p>
          </div>
        </aside>

        <div className={styles.register_panel}>
          <button type="button" className={styles.register_close} onClick={onClose} aria-label="Cerrar registro">
            ×
          </button>

          <form className={styles.register_form} onSubmit={(event) => {
            event.preventDefault()
          }}>
            <header className={styles.register_form_header}>
              <h2 id={titleId}>Crear Usuario</h2>
              <p>Comienza tu viaje financiero hoy mismo.</p>
            </header>

            <div className={styles.register_field}>
              <label htmlFor="reg-fullname">Nombre completo</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}>
                  <IconUser />
                </span>
                <input
                  id="reg-fullname"
                  name="fullname"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-email">Correo electrónico</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}>
                  <IconMail />
                </span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-phone">Número de teléfono</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}>
                  <IconPhone />
                </span>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+51 987 654 321"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.register_field}>
              <label htmlFor="reg-password">Contraseña</label>
              <div className={styles.register_input_row}>
                <span className={styles.register_input_icon}>
                  <IconLock />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <label className={styles.register_terms}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              <span>
                Acepto los <a href="#">Términos y Condiciones</a> y la{' '}
                <a href="#">Política de Privacidad</a> de Jemacash.
              </span>
            </label>

            <button type="submit" className={styles.register_submit}>
              Crear cuenta
            </button>

            <p className={styles.register_login_prompt}>
              ¿Ya tienes cuenta?{' '}
              <button type="button" className={styles.register_login_link} onClick={onNavigateToLogin}>
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
