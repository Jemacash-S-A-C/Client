import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserProfile, UserSession } from '../../types/api.types'
import { profileToSession } from '../../types/api.types'
import { getMe } from '../../services/auth.service'
import { updateProfile, changePassword, updatePreferences } from '../../services/user.service'
import {
  getTwoFaStatus, totpSetup, totpVerify, totpDisable,
  emailOtpSend, emailOtpVerify, emailOtpDisable,
  type TwoFaStatus, type TotpSetupResponse,
} from '../../services/twofa.service'
import {
  IconPerson,
  IconCalendar,
  IconShield,
  IconEdit,
  IconContact,
  IconNfc,
  IconBank,
  IconWalletDigital,
  IconTrash,
  IconInfo,
  IconPlus,
  IconRefresh,
  IconFingerprint,
  IconPhone,
  IconSms,
  IconBell2,
  IconGlobe,
  IconChevronDown,
  IconBadgeCheck,
  IconLock2,
  IconCheck,
  IconWarning,
} from './icons'
import styles from './ConfiguracionView.module.css'

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`${styles.toggle} ${on ? styles.toggle_on : styles.toggle_off}`} aria-hidden="true">
      <span className={styles.toggle_thumb} />
    </span>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastKind = 'success' | 'error'

function Toast({ kind, msg }: { kind: ToastKind; msg: string }) {
  return (
    <div className={`${styles.toast} ${kind === 'success' ? styles.toast_ok : styles.toast_err}`}>
      {kind === 'success' ? <IconCheck /> : <IconWarning />}
      {msg}
    </div>
  )
}

// ─── PerfilView ───────────────────────────────────────────────────────────────

const AVATAR_STORAGE_KEY = (userId: string) => `jemacash.avatar.${userId}`

function PerfilView({
  user,
  onUpdate,
}: {
  user: UserSession
  onUpdate: (updated: UserSession) => void
}) {
  const { t } = useTranslation()
  const [profile, setProfile]       = useState<UserProfile | null>(null)
  const [fullName, setFullName]      = useState(user.displayName)
  const [phone, setPhone]            = useState(() => {
    const raw = user.phone ?? ''
    return raw.startsWith('+51') ? raw.slice(3) : raw.replace(/\D/g, '').slice(0, 9)
  })
  const [photoUrl, setPhotoUrl]      = useState<string | null>(() => localStorage.getItem(AVATAR_STORAGE_KEY(user.id)))
  const [saving, setSaving]          = useState(false)
  const [toast, setToast]            = useState<{ kind: ToastKind; msg: string } | null>(null)
  const photoInputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMe().then((p) => {
      setProfile(p)
      setFullName(p.full_name)
      const raw = p.phone ?? ''
      setPhone(raw.startsWith('+51') ? raw.slice(3) : raw.replace(/\D/g, '').slice(0, 9))
    }).catch(() => {})
  }, [])

  const originalName  = profile?.full_name ?? user.displayName
  const rawPhone      = profile?.phone ?? user.phone ?? ''
  const originalPhone = rawPhone.startsWith('+51') ? rawPhone.slice(3) : rawPhone.replace(/\D/g, '').slice(0, 9)
  const savedPhoto    = localStorage.getItem(AVATAR_STORAGE_KEY(user.id))
  const isDirty       = fullName !== originalName || phone !== originalPhone || photoUrl !== savedPhoto

  function fmtMemberSince(dateStr?: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
  }

  function showToast(kind: ToastKind, msg: string) {
    setToast({ kind, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('error', t('config.error.saveError')); return }
    const reader = new FileReader()
    reader.onload = () => setPhotoUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSave() {
    const trimmedName = fullName.trim()
    if (!trimmedName) { showToast('error', t('config.error.emptyName')); return }
    if (phone.length > 0 && phone.length !== 9) { showToast('error', t('config.error.phoneDigits')); return }
    setSaving(true)
    try {
      const updated = await updateProfile({
        full_name: trimmedName,
        phone: phone.length === 9 ? `+51${phone}` : undefined,
      })
      setProfile(updated)
      onUpdate(profileToSession(updated))
      if (photoUrl) {
        localStorage.setItem(AVATAR_STORAGE_KEY(user.id), photoUrl)
      } else {
        localStorage.removeItem(AVATAR_STORAGE_KEY(user.id))
      }
      showToast('success', t('config.toast.saved'))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFullName(originalName)
    setPhone(originalPhone)
    setPhotoUrl(savedPhoto)
  }

  return (
    <div className={styles.perfil_grid}>
      {toast && <Toast kind={toast.kind} msg={toast.msg} />}

      <div className={styles.perfil_header_card}>
        <div className={styles.perfil_avatar_wrap}>
          <div className={styles.perfil_avatar}>
            {photoUrl
              ? <img src={photoUrl} alt="Foto de perfil" className={styles.perfil_avatar_img} />
              : <span>{user.initials}</span>
            }
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            className={styles.perfil_edit_btn}
            aria-label={t('config.profile.changePhoto')}
            onClick={() => photoInputRef.current?.click()}
          >
            <IconEdit />
          </button>
        </div>
        <div className={styles.perfil_header_info}>
          <h2>{fullName || user.displayName}</h2>
          <span className={styles.perfil_since}>
            <IconCalendar />
            {t('config.profile.memberSince', { date: fmtMemberSince(profile?.created_at) })}
          </span>
        </div>
        <span className={styles.perfil_verified_badge}>
          <IconShield />
          {t('config.profile.verified')}
        </span>
      </div>

      <div className={styles.perfil_data_grid}>
        <div className={styles.perfil_data_card}>
          <div className={styles.perfil_card_head}>
            <span className={styles.perfil_card_icon}><IconPerson /></span>
            <h3>{t('config.profile.personalData')}</h3>
          </div>
          <div className={styles.perfil_fields}>
            <label className={styles.perfil_field}>
              <span>{t('config.profile.fullName')}</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('config.profile.fullNamePlaceholder')}
              />
            </label>
            <label className={styles.perfil_field}>
              <span>{t('config.profile.email')}</span>
              <input
                type="email"
                value={user.email}
                readOnly
                className={styles.field_readonly}
                title="El correo no se puede cambiar desde aquí"
              />
            </label>
          </div>
        </div>

        <div className={styles.perfil_data_card}>
          <div className={styles.perfil_card_head}>
            <span className={styles.perfil_card_icon}><IconContact /></span>
            <h3>{t('config.profile.contact')}</h3>
          </div>
          <div className={styles.perfil_fields}>
            <div className={styles.perfil_field}>
              <span>{t('config.profile.phone')}</span>
              <div className={styles.phone_input_wrap}>
                <span className={styles.phone_prefix}>+51</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
                    setPhone(digits)
                  }}
                  placeholder="999 999 999"
                  maxLength={9}
                  className={styles.phone_input}
                />
              </div>
              {phone.length > 0 && phone.length < 9 && (
                <span className={styles.phone_hint}>{t('config.profile.phonehint')}</span>
              )}
            </div>
            <div className={styles.perfil_field}>
              <span>{t('config.profile.accountId')}</span>
              <p className={styles.field_mono}>{profile?.id?.slice(0, 16).toUpperCase() ?? '—'}…</p>
            </div>
          </div>
        </div>
      </div>

      {isDirty && (
        <div className={styles.perfil_action_bar}>
          <button type="button" className={styles.cancel_btn} onClick={handleCancel} disabled={saving}>
            {t('config.profile.cancel')}
          </button>
          <button
            type="button"
            className={styles.pay_btn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('config.profile.saving') : t('config.profile.save')}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MetodosPagoView ──────────────────────────────────────────────────────────

function MetodosPagoView() {
  const { t } = useTranslation()
  return (
    <div className={styles.soon_wrap}>
      <div className={styles.soon_icon_wrap}>
        <span className={styles.soon_icon}><IconWalletDigital /></span>
      </div>
      <span className={styles.soon_badge}>{t('config.methods.comingSoon')}</span>
      <h2 className={styles.soon_title}>{t('config.methods.title')}</h2>
      <p className={styles.soon_desc}>{t('config.methods.desc')}</p>
      <div className={styles.soon_features}>
        <div className={styles.soon_feature}>
          <span className={styles.soon_feature_icon}><IconBank /></span>
          <span>{t('config.methods.feature.bank')}</span>
        </div>
        <div className={styles.soon_feature}>
          <span className={styles.soon_feature_icon}><IconNfc /></span>
          <span>{t('config.methods.feature.cards')}</span>
        </div>
        <div className={styles.soon_feature}>
          <span className={styles.soon_feature_icon}><IconPhone /></span>
          <span>{t('config.methods.feature.wallets')}</span>
        </div>
      </div>
    </div>
  )
}

// ─── SeguridadView ────────────────────────────────────────────────────────────

type TwofaAppStep   = 'idle' | 'loading' | 'setup' | 'verifying' | 'active'
type TwofaEmailStep = 'idle' | 'input' | 'sending' | 'otp' | 'verifying' | 'active'

function SeguridadView({ user }: { user: UserSession }) {
  const { t } = useTranslation()
  // Password form
  const [current,  setCurrent]  = useState('')
  const [newPwd,   setNewPwd]   = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState<{ kind: ToastKind; msg: string } | null>(null)

  // 2FA status from backend
  const [status, setStatus]         = useState<TwoFaStatus | null>(null)

  // TOTP
  const [appStep,   setAppStep]     = useState<TwofaAppStep>('idle')
  const [appSetup,  setAppSetup]    = useState<TotpSetupResponse | null>(null)
  const [appCode,   setAppCode]     = useState('')

  // Email OTP
  const [emailStep,    setEmailStep]    = useState<TwofaEmailStep>('idle')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailOtp,     setEmailOtp]     = useState('')

  // has_google comes from the loaded profile — we fetch it in useEffect
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)

  useEffect(() => {
    getMe()
      .then((p) => setIsGoogleAccount(p.has_google))
      .catch(() => {})

    getTwoFaStatus()
      .then((s) => {
        setStatus(s)
        if (s.totp_enabled)       setAppStep('active')
        if (s.email_2fa_enabled)  {
          setEmailStep('active')
          setEmailAddress(s.email_2fa_address ?? '')
        }
      })
      .catch(() => {})
  }, [])

  function showToast(kind: ToastKind, msg: string) {
    setToast({ kind, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Password ──────────────────────────────────────────────────────────────────

  async function handleChangePassword() {
    if (!current) { showToast('error', t('config.security.error.currentRequired')); return }
    if (newPwd.length < 8) { showToast('error', t('config.security.error.minLength')); return }
    if (newPwd !== confirm) { showToast('error', t('config.security.error.noMatch')); return }
    setSaving(true)
    try {
      await changePassword(current, newPwd)
      showToast('success', t('config.toast.passwordOk'))
      setCurrent(''); setNewPwd(''); setConfirm('')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
    } finally {
      setSaving(false)
    }
  }

  // ── TOTP ──────────────────────────────────────────────────────────────────────

  async function handleTotpOpen() {
    setAppStep('loading')
    try {
      const data = await totpSetup()
      setAppSetup(data)
      setAppCode('')
      setAppStep('setup')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al generar el QR.')
      setAppStep('idle')
    }
  }

  async function handleTotpVerify() {
    if (appCode.length !== 6) { showToast('error', t('config.security.error.totpDigits')); return }
    setAppStep('verifying')
    try {
      await totpVerify(appCode)
      setAppStep('active')
      setStatus((s) => s ? { ...s, totp_enabled: true } : s)
      showToast('success', t('config.toast.totpLinked'))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
      setAppStep('setup')
    }
  }

  async function handleTotpDisable() {
    try {
      await totpDisable()
      setAppStep('idle')
      setAppSetup(null)
      setStatus((s) => s ? { ...s, totp_enabled: false } : s)
      showToast('success', t('config.toast.totpUnlinked'))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
    }
  }

  // ── Email OTP ─────────────────────────────────────────────────────────────────

  async function handleEmailSend() {
    if (!emailAddress.includes('@')) { showToast('error', t('config.security.error.invalidEmail')); return }
    setEmailStep('sending')
    try {
      await emailOtpSend(emailAddress)
      setEmailStep('otp')
      showToast('success', t('config.toast.emailOtpSent', { email: emailAddress }))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
      setEmailStep('input')
    }
  }

  async function handleEmailVerify() {
    if (emailOtp.length !== 6) { showToast('error', t('config.security.error.otpDigits')); return }
    setEmailStep('verifying')
    try {
      await emailOtpVerify(emailAddress, emailOtp)
      setEmailStep('active')
      setStatus((s) => s ? { ...s, email_2fa_enabled: true, email_2fa_address: emailAddress } : s)
      showToast('success', t('config.toast.emailOtpActive'))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
      setEmailStep('otp')
    }
  }

  async function handleEmailDisable() {
    try {
      await emailOtpDisable()
      setEmailStep('idle')
      setEmailAddress('')
      setEmailOtp('')
      setStatus((s) => s ? { ...s, email_2fa_enabled: false, email_2fa_address: null } : s)
      showToast('success', t('config.toast.emailOtpDisabled'))
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('config.error.saveError'))
    }
  }

  const securityPct = 50
    + (appStep   === 'active' ? 30 : 0)
    + (emailStep === 'active' ? 20 : 0)

  const appBusy   = appStep   === 'loading'   || appStep   === 'verifying'
  const emailBusy = emailStep === 'sending'   || emailStep === 'verifying'

  return (
    <div className={styles.sec_grid}>
      {toast && <Toast kind={toast.kind} msg={toast.msg} />}

      <div className={styles.sec_hero}>
        <div className={styles.sec_hero_copy}>
          <h1 className={styles.view_title}>{t('config.security.title')}</h1>
          <p className={styles.view_sub}>{t('config.security.sub')}</p>
        </div>
        <div className={styles.sec_ring_wrap} aria-label={`Fortaleza de seguridad: ${securityPct}%`}>
          <svg className={styles.sec_ring} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#d9f0da" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#0f7d3f"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50 * (securityPct / 100)} ${2 * Math.PI * 50}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className={styles.sec_ring_label}>
            <strong>{securityPct}%</strong>
            <span>{t('config.security.strength')}</span>
          </div>
        </div>
      </div>

      <div className={styles.sec_cols}>
        {/* ── Cambiar contraseña ── */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconRefresh /></span>
            <h2>{t('config.security.password.title')}</h2>
          </div>
          <div className={styles.sec_fields}>
            <label className={styles.perfil_field}>
              <span>{t('config.security.password.current')}</span>
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" />
            </label>
            <label className={styles.perfil_field}>
              <span>{t('config.security.password.new')}</span>
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                placeholder={t('config.security.password.newPlaceholder')} autoComplete="new-password" />
            </label>
            <label className={styles.perfil_field}>
              <span>{t('config.security.password.confirm')}</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder={t('config.security.password.confirmPlaceholder')} autoComplete="new-password" />
            </label>
          </div>
          <button type="button" className={styles.sec_update_btn} onClick={handleChangePassword} disabled={saving}>
            {saving ? t('config.security.password.updating') : t('config.security.password.update')}
          </button>
        </div>

        <div className={styles.sec_right_col}>

          {/* ── 2FA Card ── */}
          <div className={styles.sec_card}>
            <div className={styles.sec_card_head}>
              <span className={styles.sec_card_icon}><IconShield /></span>
              <h2>{t('config.security.twofa.title')}</h2>
            </div>

            {/* ── App TOTP ── */}
            <div className={styles.twofa_method}>
              <div className={styles.twofa_row}>
                <span className={styles.twofa_icon}><IconPhone /></span>
                <div className={styles.twofa_info}>
                  <strong>{t('config.security.twofa.app.title')}</strong>
                  <span>{t('config.security.twofa.app.sub')}</span>
                </div>
                {appStep === 'active' ? (
                  <button type="button" className={styles.twofa_disable} onClick={handleTotpDisable}>
                    {t('config.security.twofa.disable')}
                  </button>
                ) : appStep === 'idle' ? (
                  <button type="button" className={styles.twofa_activate} onClick={handleTotpOpen}>
                    {t('config.security.twofa.configure')}
                  </button>
                ) : appStep === 'loading' ? (
                  <span className={styles.twofa_activate}>{t('config.security.twofa.loading')}</span>
                ) : (
                  <button type="button" className={styles.twofa_activate}
                    onClick={() => { setAppStep('idle'); setAppSetup(null) }} disabled={appBusy}>
                    {t('config.security.twofa.cancel')}
                  </button>
                )}
              </div>

              {appStep === 'active' && (
                <div className={styles.twofa_active_row}>
                  <span className={styles.twofa_status_active}>{t('config.security.twofa.active')}</span>
                  <span className={styles.twofa_active_desc}>{t('config.security.twofa.app.activeDesc')}</span>
                </div>
              )}

              {(appStep === 'setup' || appStep === 'verifying') && appSetup && (
                <div className={styles.twofa_panel}>
                  <div className={styles.twofa_steps}>
                    <div className={styles.twofa_step}>
                      <span className={styles.twofa_step_num}>1</span>
                      <p dangerouslySetInnerHTML={{ __html: t('config.security.twofa.step1') }} />
                    </div>
                    <div className={styles.twofa_step}>
                      <span className={styles.twofa_step_num}>2</span>
                      <p>{t('config.security.twofa.step2')}</p>
                    </div>
                    <div className={styles.twofa_step}>
                      <span className={styles.twofa_step_num}>3</span>
                      <p>{t('config.security.twofa.step3')}</p>
                    </div>
                  </div>

                  <div className={styles.twofa_qr_wrap}>
                    <div className={styles.twofa_qr_box}>
                      <img src={appSetup.qrDataUrl} alt="QR TOTP" width={168} height={168} />
                    </div>
                    <div className={styles.twofa_secret_wrap}>
                      <span className={styles.twofa_secret_label}>{t('config.security.twofa.manualKey')}</span>
                      <code className={styles.twofa_secret}>{appSetup.secret}</code>
                      <span className={styles.twofa_secret_hint}>{t('config.security.twofa.manualKeyHint')}</span>
                    </div>
                  </div>

                  <label className={styles.perfil_field}>
                    <span>{t('config.security.twofa.verifyCode')}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      value={appCode}
                      onChange={(e) => setAppCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={styles.twofa_code_input}
                    />
                  </label>
                  <button type="button" className={styles.twofa_confirm_btn}
                    onClick={handleTotpVerify} disabled={appBusy}>
                    {appStep === 'verifying' ? t('config.security.twofa.linking') : t('config.security.twofa.link')}
                  </button>
                </div>
              )}
            </div>

            {/* ── Email OTP — solo para cuentas sin Google ── */}
            {!isGoogleAccount && (
              <div className={styles.twofa_method}>
                <div className={styles.twofa_row}>
                  <span className={styles.twofa_icon}><IconSms /></span>
                  <div className={styles.twofa_info}>
                    <strong>{t('config.security.twofa.email.title')}</strong>
                    <span>
                      {emailStep === 'active'
                        ? t('config.security.twofa.email.activeOn', { email: emailAddress })
                        : t('config.security.twofa.email.sub')}
                    </span>
                  </div>
                  {emailStep === 'active' ? (
                    <button type="button" className={styles.twofa_disable} onClick={handleEmailDisable}>
                      {t('config.security.twofa.disable')}
                    </button>
                  ) : emailStep === 'idle' ? (
                    <button type="button" className={styles.twofa_activate}
                      onClick={() => { setEmailAddress(user.email); setEmailStep('input') }}>
                      {t('config.security.twofa.email.activate')}
                    </button>
                  ) : (
                    <button type="button" className={styles.twofa_activate}
                      onClick={() => { setEmailStep('idle'); setEmailOtp('') }} disabled={emailBusy}>
                      {t('config.security.twofa.cancel')}
                    </button>
                  )}
                </div>

                {emailStep === 'active' && (
                  <div className={styles.twofa_active_row}>
                    <span className={styles.twofa_status_active}>{t('config.security.twofa.active')}</span>
                    <span className={styles.twofa_active_desc}>{t('config.security.twofa.email.activeDesc')}</span>
                  </div>
                )}

                {emailStep === 'input' && (
                  <div className={styles.twofa_panel}>
                    <p className={styles.twofa_panel_desc}>{t('config.security.twofa.email.confirmDesc')}</p>
                    <label className={styles.perfil_field}>
                      <span>{t('config.security.twofa.email.label')}</span>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="tu@correo.com"
                      />
                    </label>
                    <button type="button" className={styles.twofa_confirm_btn}
                      onClick={handleEmailSend} disabled={emailBusy}>
                      {t('config.security.twofa.email.sendCode')}
                    </button>
                  </div>
                )}

                {emailStep === 'sending' && (
                  <div className={styles.twofa_panel}>
                    <p className={styles.twofa_panel_desc}>{t('config.security.twofa.email.sending', { email: emailAddress })}</p>
                  </div>
                )}

                {(emailStep === 'otp' || emailStep === 'verifying') && (
                  <div className={styles.twofa_panel}>
                    <p className={styles.twofa_panel_desc} dangerouslySetInnerHTML={{ __html: t('config.security.twofa.email.otpDesc', { email: emailAddress }) }} />
                    <label className={styles.perfil_field}>
                      <span>{t('config.security.twofa.verifyCode')}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={styles.twofa_code_input}
                      />
                    </label>
                    <div className={styles.twofa_otp_actions}>
                      <button type="button" className={styles.twofa_confirm_btn}
                        onClick={handleEmailVerify} disabled={emailBusy}>
                        {emailStep === 'verifying' ? t('config.security.twofa.email.verifying') : t('config.security.twofa.email.verify')}
                      </button>
                      <button type="button" className={styles.twofa_resend_btn}
                        onClick={handleEmailSend} disabled={emailBusy}>
                        {t('config.security.twofa.email.resend')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Biometría — deshabilitada ── */}
          <div className={`${styles.sec_card} ${styles.sec_card_disabled}`}>
            <div className={styles.sec_card_head}>
              <span className={styles.sec_card_icon}><IconFingerprint /></span>
              <div className={styles.sec_bio_title}>
                <h2>{t('config.security.bio.title')}</h2>
                <span>{t('config.security.bio.sub')}</span>
              </div>
              <span className={styles.twofa_soon_badge}>{t('config.security.bio.comingSoon')}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── PreferenciasView ─────────────────────────────────────────────────────────

function PreferenciasView() {
  const { t, i18n } = useTranslation()
  const [loading,    setLoading]    = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)
  const [currency,   setCurrency]   = useState('pen')
  // Initialize from i18n so the selector stays in sync after remounts
  const [language,   setLanguage]   = useState(() => i18n.language.split('-')[0] || 'es')
  const [timezone,   setTimezone]   = useState('lima')
  const [toast,      setToast]      = useState<{ kind: ToastKind; msg: string } | null>(null)

  useEffect(() => {
    getMe().then((p) => {
      setNotifEmail(p.notification_email)
      setCurrency(p.pref_currency)
      // Don't override language — i18n already tracks it correctly
      setTimezone(p.pref_timezone)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function showToast(kind: ToastKind, msg: string) {
    setToast({ kind, msg })
    setTimeout(() => setToast(null), 2800)
  }

  async function save(
    patch: { notification_email?: boolean; pref_currency?: string; pref_language?: string; pref_timezone?: string },
    revert?: () => void,
  ) {
    try {
      await updatePreferences(patch)
      showToast('success', t('config.toast.prefSaved'))
    } catch {
      revert?.()
      showToast('error', t('config.toast.prefError'))
    }
  }

  function handleEmailToggle() {
    const next = !notifEmail
    setNotifEmail(next)
    save({ notification_email: next }, () => setNotifEmail(!next))
  }

  function handleCurrency(val: string) {
    const prev = currency
    setCurrency(val)
    save({ pref_currency: val }, () => setCurrency(prev))
  }

  function handleLanguage(val: string) {
    const prev = language
    setLanguage(val)
    i18n.changeLanguage(val)
    save({ pref_language: val }, () => {
      setLanguage(prev)
      i18n.changeLanguage(prev)
    })
  }

  function handleTimezone(val: string) {
    const prev = timezone
    setTimezone(val)
    save({ pref_timezone: val }, () => setTimezone(prev))
  }

  return (
    <div className={styles.pref_grid}>
      {toast && <Toast kind={toast.kind} msg={toast.msg} />}

      <div>
        <h1 className={styles.view_title}>{t('config.pref.title')}</h1>
        <p className={styles.view_sub}>{t('config.pref.sub')}</p>
      </div>

      <div className={styles.pref_cols}>
        {/* ── Canales de Notificación ── */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconBell2 /></span>
            <h2>{t('config.pref.notifications')}</h2>
          </div>
          <div className={styles.pref_notif_list}>

            {/* Email — funcional */}
            <div className={styles.pref_notif_row}>
              <div className={styles.pref_notif_copy}>
                <strong>{t('config.pref.email')}</strong>
                <span>{t('config.pref.emailDesc')}</span>
              </div>
              <button
                type="button"
                className={styles.toggle_btn}
                onClick={handleEmailToggle}
                disabled={loading}
                aria-label={notifEmail ? t('config.pref.emailEnabledLabel') : t('config.pref.emailDisabledLabel')}
              >
                <Toggle on={notifEmail} />
              </button>
            </div>

            {/* Push — Próximamente */}
            <div className={styles.pref_notif_row} style={{ opacity: 0.4, pointerEvents: 'none' }}>
              <div className={styles.pref_notif_copy}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {t('config.pref.push')}
                  <span className={styles.twofa_soon_badge}>{t('config.pref.pushSoon')}</span>
                </strong>
                <span>{t('config.pref.pushDesc')}</span>
              </div>
              <button type="button" className={styles.toggle_btn} disabled aria-label={t('config.pref.pushDisabled')}>
                <Toggle on={false} />
              </button>
            </div>

          </div>
        </div>

        {/* ── Ajustes Regionales ── */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconGlobe /></span>
            <h2>{t('config.pref.regional')}</h2>
          </div>
          <div className={styles.pref_select_list}>
            <label className={styles.pref_select_field}>
              <span>{t('config.pref.currency')}</span>
              <div className={styles.pref_select_wrap}>
                <select value="pen" disabled>
                  <option value="pen">Soles S/ (Perú)</option>
                </select>
                <span className={styles.pref_select_arrow}><IconChevronDown /></span>
              </div>
            </label>
            <label className={styles.pref_select_field}>
              <span>{t('config.pref.language')}</span>
              <div className={styles.pref_select_wrap}>
                <select
                  value={language}
                  onChange={(e) => handleLanguage(e.target.value)}
                  disabled={loading}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
                <span className={styles.pref_select_arrow}><IconChevronDown /></span>
              </div>
            </label>
            <label className={styles.pref_select_field}>
              <span>{t('config.pref.timezone')}</span>
              <div className={styles.pref_select_wrap}>
                <select
                  value={timezone}
                  onChange={(e) => handleTimezone(e.target.value)}
                  disabled={loading}
                >
                  <option value="lima">(GMT-05:00) Lima, Bogotá, Quito</option>
                  <option value="madrid">(GMT+01:00) Madrid</option>
                  <option value="miami">(GMT-05:00) Miami</option>
                </select>
                <span className={styles.pref_select_arrow}><IconChevronDown /></span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.pref_commitment}>
        <div className={styles.pref_commitment_copy}>
          <strong>{t('config.pref.commitment.title')}</strong>
          <p>{t('config.pref.commitment.desc')}</p>
        </div>
        <div className={styles.pref_commitment_icons}>
          <span><IconBadgeCheck /></span>
          <span><IconLock2 /></span>
          <span><IconShield /></span>
        </div>
      </div>
    </div>
  )
}

// ─── ConfiguracionView ────────────────────────────────────────────────────────

type ConfigTab = 'perfil' | 'metodos' | 'seguridad' | 'preferencias'

interface Props {
  user: UserSession
  onUpdate: (updated: UserSession) => void
}

export function ConfiguracionView({ user, onUpdate }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ConfigTab>('perfil')

  const configTabs: { id: ConfigTab; label: string }[] = [
    { id: 'perfil',       label: t('config.tab.profile')     },
    { id: 'metodos',      label: t('config.tab.methods')     },
    { id: 'seguridad',    label: t('config.tab.security')    },
    { id: 'preferencias', label: t('config.tab.preferences') },
  ]

  return (
    <div className={styles.config_wrap}>
      <nav className={styles.config_tabs} aria-label={t('config.tab.profile')}>
        {configTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.config_tab} ${activeTab === tab.id ? styles.config_tab_active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'perfil'       && <PerfilView user={user} onUpdate={onUpdate} />}
      {activeTab === 'metodos'      && <MetodosPagoView />}
      {activeTab === 'seguridad'    && <SeguridadView user={user} />}
      {activeTab === 'preferencias' && <PreferenciasView />}
    </div>
  )
}
