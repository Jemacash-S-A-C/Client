import { useEffect, useId, useState } from 'react'
import { IconEye, IconEyeOff } from './LoginIcons'
import { resetPasswordWithToken } from '../../services/auth.service'
import styles from './LoginModal.module.css'

type Props = {
  token: string
  onClose: () => void
  onSuccess: () => void
}

export function ResetPasswordModal({ token, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const titleId = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPasswordWithToken(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El enlace es inválido o ya expiró.')
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
          <h2 className={styles.login_aside_title}>Nueva contraseña, nueva etapa.</h2>
          <p className={styles.login_aside_sub}>
            Elige una contraseña segura para proteger tu cuenta Jemacash.
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
  )

  return (
    <div className={styles.login_overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.login_split}>
        {aside}

        <div className={styles.login_panel}>
          <button type="button" className={styles.login_close} onClick={onClose} aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>

          {done ? (
            <div className={styles.login_form}>
              <header className={styles.login_form_header}>
                <h2 id={titleId}>¡Contraseña actualizada!</h2>
                <p>Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión.</p>
              </header>
              <button type="button" className={styles.login_submit} onClick={onSuccess}>
                Iniciar sesión
              </button>
            </div>
          ) : (
            <form className={styles.login_form} onSubmit={handleSubmit}>
              <header className={styles.login_form_header}>
                <h2 id={titleId}>Nueva contraseña</h2>
                <p>Ingresa y confirma tu nueva contraseña. Mínimo 8 caracteres.</p>
              </header>

              <div className={styles.login_field}>
                <label htmlFor="reset-password">Nueva contraseña</label>
                <div className={styles.login_password_wrap}>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
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

              <div className={styles.login_field}>
                <label htmlFor="reset-confirm">Confirmar contraseña</label>
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className={styles.login_submit} disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>

              {error && <p className={styles.login_error} role="alert">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
