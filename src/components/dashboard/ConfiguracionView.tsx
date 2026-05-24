import { useState } from 'react'
import type { UserSession } from '../../types/api.types'
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
} from './icons'
import styles from './ConfiguracionView.module.css'

// ─── Shared Toggle component ──────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`${styles.toggle} ${on ? styles.toggle_on : styles.toggle_off}`} aria-hidden="true">
      <span className={styles.toggle_thumb} />
    </span>
  )
}

// ─── PerfilView ───────────────────────────────────────────────────────────────

function PerfilView({ user }: { user: UserSession }) {
  return (
    <div className={styles.perfil_grid}>
      <div className={styles.perfil_header_card}>
        <div className={styles.perfil_avatar_wrap}>
          <div className={styles.perfil_avatar}>
            <span>{user.initials}</span>
          </div>
          <button type="button" className={styles.perfil_edit_btn} aria-label="Editar foto">
            <IconEdit />
          </button>
        </div>
        <div className={styles.perfil_header_info}>
          <h2>{user.displayName}</h2>
          <span className={styles.perfil_since}>
            <IconCalendar />
            Miembro desde Enero 2023
          </span>
        </div>
        <span className={styles.perfil_verified_badge}>
          <IconShield />
          Cuenta Verificada
        </span>
      </div>

      <div className={styles.perfil_data_grid}>
        <div className={styles.perfil_data_card}>
          <div className={styles.perfil_card_head}>
            <span className={styles.perfil_card_icon}><IconPerson /></span>
            <h3>Datos Personales</h3>
          </div>
          <div className={styles.perfil_fields}>
            <label className={styles.perfil_field}>
              <span>NOMBRE COMPLETO</span>
              <input type="text" defaultValue={user.displayName} />
            </label>
            <label className={styles.perfil_field}>
              <span>FECHA DE NACIMIENTO</span>
              <input type="text" defaultValue="12 de Mayo, 1990" />
            </label>
            <label className={styles.perfil_field}>
              <span>DNI / DOCUMENTO DE IDENTIDAD</span>
              <input type="text" defaultValue="72.441.902-K" />
            </label>
          </div>
        </div>

        <div className={styles.perfil_data_card}>
          <div className={styles.perfil_card_head}>
            <span className={styles.perfil_card_icon}><IconContact /></span>
            <h3>Información de Contacto</h3>
          </div>
          <div className={styles.perfil_fields}>
            <label className={styles.perfil_field}>
              <span>CORREO ELECTRÓNICO</span>
              <input type="email" defaultValue={user.identifier} />
            </label>
            <label className={styles.perfil_field}>
              <span>NÚMERO DE TELÉFONO</span>
              <input type="tel" defaultValue={user.phone ?? ''} />
            </label>
            <label className={styles.perfil_field}>
              <span>DIRECCIÓN RESIDENCIAL</span>
              <input type="text" defaultValue="Calle Mayor 123, 4B, Madrid" />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.perfil_action_bar}>
        <div className={styles.perfil_security_note}>
          <span className={styles.perfil_shield_icon}><IconShield /></span>
          <span>Tus datos están protegidos con encriptación de grado bancario.</span>
        </div>
        <div className={styles.perfil_action_btns}>
          <button type="button" className={styles.cancel_btn}>Cancelar</button>
          <button type="button" className={styles.pay_btn}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  )
}

// ─── MetodosPagoView ──────────────────────────────────────────────────────────

const bankAccounts = [
  { bank: 'BCP', name: 'Cuenta Ahorros Soles', account: '•••• 1930 4582 9102', status: 'Verificada' },
  { bank: 'BBVA', name: 'Cuenta Corriente Dólares', account: '•••• 0011 2045 6678', status: 'Verificada' },
] as const

function MetodosPagoView() {
  return (
    <div className={styles.mp_grid}>

      {/* Cuentas Vinculadas */}
      <section className={styles.mp_section}>
        <div className={styles.mp_section_head}>
          <div className={styles.mp_section_title}>
            <span className={styles.mp_section_icon}><IconWalletDigital /></span>
            <h2>Cuentas Vinculadas</h2>
          </div>
          <span className={styles.badge_active}>2 ACTIVAS</span>
        </div>

        <div className={styles.mp_cards_grid}>
          {/* Tarjeta de Débito */}
          <div className={styles.debit_card}>
            <div className={styles.dc_top}>
              <span className={styles.dc_label}>Tarjeta de Débito</span>
              <span className={styles.dc_nfc}><IconNfc /></span>
            </div>
            <div className={styles.dc_dots}>• • • •&nbsp;&nbsp;• • • •&nbsp;&nbsp;• • • •</div>
            <div className={styles.dc_number}>4 5 8 2</div>
            <div className={styles.dc_bottom}>
              <div>
                <span className={styles.dc_meta_label}>TITULAR</span>
                <span className={styles.dc_meta_val}>JUAN CARLOS PÉREZ</span>
              </div>
              <div>
                <span className={styles.dc_meta_label}>EXPIRA</span>
                <span className={styles.dc_meta_val}>12/26</span>
              </div>
            </div>
          </div>

          {/* Billetera Digital */}
          <div className={styles.wallet_card}>
            <div className={styles.wc_top}>
              <span className={styles.wc_icon}><IconWalletDigital /></span>
              <span className={styles.wc_badge}>Yape / Plin</span>
            </div>
            <strong className={styles.wc_name}>Billetera Digital</strong>
            <span className={styles.wc_linked}>Vinculado al número +51 987 ••• 321</span>
            <span className={styles.wc_default}>
              <IconShield />
              Configurado por defecto
            </span>
          </div>

          {/* Añadir Nuevo */}
          <button type="button" className={styles.add_method_card}>
            <span className={styles.add_method_icon}><IconPlus /></span>
            <strong>Añadir Nuevo Método</strong>
            <span>Tarjeta o Billetera Digital</span>
          </button>
        </div>
      </section>

      {/* Cuentas Bancarias */}
      <section className={styles.mp_section}>
        <div className={styles.mp_section_head}>
          <div className={styles.mp_section_title}>
            <span className={styles.mp_section_icon}><IconBank /></span>
            <h2>Cuentas Bancarias Vinculadas</h2>
          </div>
          <button type="button" className={styles.link_button_green}>Ver todas</button>
        </div>

        <div className={styles.bank_list}>
          {bankAccounts.map((b) => (
            <div key={b.bank + b.name} className={styles.bank_row}>
              <span className={styles.bank_icon}><IconBank /></span>
              <div className={styles.bank_info}>
                <strong>{b.bank} - {b.name}</strong>
                <span>Cuenta: {b.account}</span>
              </div>
              <div className={styles.bank_status}>
                <span className={styles.bank_status_label}>ESTADO</span>
                <strong className={styles.bank_status_val}>{b.status}</strong>
              </div>
              <button type="button" className={styles.bank_delete} aria-label="Eliminar cuenta">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Info transferencias */}
      <div className={styles.transfer_info_banner}>
        <span className={styles.tib_icon}><IconInfo /></span>
        <div>
          <strong>Información sobre transferencias</strong>
          <p>Las transferencias a cuentas bancarias pueden tardar hasta 24 horas hábiles dependiendo de tu entidad financiera. Jemacash no cobra comisiones por retiros a cuentas vinculadas.</p>
        </div>
      </div>

      {/* Promo cards */}
      <div className={styles.mp_promo_grid}>
        <div className={styles.promo_dark}>
          <span className={styles.promo_tag}>NOVEDAD</span>
          <h3>Tu seguridad es nuestra prioridad</h3>
          <p>Hemos actualizado nuestros protocolos de encriptación para proteger tus métodos de pago.</p>
          <button type="button" className={styles.promo_btn}>Saber más</button>
        </div>

        <div className={styles.promo_light}>
          <span className={styles.promo_pro_label}>CONSEJO PRO</span>
          <blockquote className={styles.promo_quote}>
            "Vincular tu cuenta bancaria principal te permite realizar retiros instantáneos los fines de semana."
          </blockquote>
          <div className={styles.promo_author}>
            <span className={styles.promo_author_avatar}>JT</span>
            <div>
              <strong>Equipo Jemacash</strong>
              <span>Soporte</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── SeguridadView ────────────────────────────────────────────────────────────

function SeguridadView() {
  const [twoFaOn, setTwoFaOn] = useState(true)
  const [bioOn, setBioOn] = useState(true)

  return (
    <div className={styles.sec_grid}>

      {/* Hero panel */}
      <div className={styles.sec_hero}>
        <div className={styles.sec_hero_copy}>
          <h1 className={styles.view_title}>Panel de Seguridad</h1>
          <p className={styles.view_sub}>
            Protege tu cuenta y tus fondos en S/. con los estándares<br />
            más altos de la industria financiera.
          </p>
        </div>
        <div className={styles.sec_ring_wrap} aria-label="Fortaleza de seguridad: 75%">
          <svg className={styles.sec_ring} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#d9f0da" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#0f7d3f"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50 * 0.75} ${2 * Math.PI * 50}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className={styles.sec_ring_label}>
            <strong>75%</strong>
            <span>FORTALEZA</span>
          </div>
        </div>
      </div>

      {/* Two column */}
      <div className={styles.sec_cols}>

        {/* Cambiar Contraseña */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconRefresh /></span>
            <h2>Cambiar Contraseña</h2>
          </div>
          <div className={styles.sec_fields}>
            <label className={styles.perfil_field}>
              <span>Contraseña Actual</span>
              <input type="password" defaultValue="password1" />
            </label>
            <label className={styles.perfil_field}>
              <span>Nueva Contraseña</span>
              <input type="password" defaultValue="password1" />
            </label>
            <label className={styles.perfil_field}>
              <span>Confirmar Nueva Contraseña</span>
              <input type="password" defaultValue="password1" />
            </label>
          </div>
          <button type="button" className={styles.sec_update_btn}>Actualizar Contraseña</button>
        </div>

        {/* Right column */}
        <div className={styles.sec_right_col}>

          {/* 2FA */}
          <div className={styles.sec_card}>
            <div className={styles.sec_card_head}>
              <span className={styles.sec_card_icon}><IconShield /></span>
              <h2>Autenticación (2FA)</h2>
              <button
                type="button"
                className={styles.toggle_btn}
                onClick={() => setTwoFaOn((v) => !v)}
                aria-label={`2FA ${twoFaOn ? 'activada' : 'desactivada'}`}
              >
                <Toggle on={twoFaOn} />
              </button>
            </div>
            <div className={styles.twofa_list}>
              <div className={styles.twofa_row}>
                <span className={styles.twofa_icon}><IconPhone /></span>
                <div className={styles.twofa_info}>
                  <strong>App de Autenticación</strong>
                  <span>Google Authenticator o Authy</span>
                </div>
                <span className={styles.twofa_status_active}>ACTIVO</span>
              </div>
              <div className={styles.twofa_row}>
                <span className={styles.twofa_icon}><IconSms /></span>
                <div className={styles.twofa_info}>
                  <strong>Código vía SMS</strong>
                  <span>+51.987 ••• 321</span>
                </div>
                <button type="button" className={styles.twofa_activate}>Activar</button>
              </div>
            </div>
          </div>

          {/* Biometría */}
          <div className={styles.sec_card}>
            <div className={styles.sec_card_head}>
              <span className={styles.sec_card_icon}><IconFingerprint /></span>
              <div className={styles.sec_bio_title}>
                <h2>Biometría</h2>
                <span>Face ID / Huella Digital</span>
              </div>
              <button
                type="button"
                className={styles.toggle_btn}
                onClick={() => setBioOn((v) => !v)}
                aria-label={`Biometría ${bioOn ? 'activada' : 'desactivada'}`}
              >
                <Toggle on={bioOn} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── PreferenciasView ─────────────────────────────────────────────────────────

const notificationChannels = [
  { id: 'email', label: 'Correo Electrónico', desc: 'Resúmenes mensuales y alertas de seguridad', defaultOn: true },
  { id: 'sms', label: 'SMS', desc: 'Alertas transaccionales críticas', defaultOn: false },
  { id: 'push', label: 'Push Notifications', desc: 'Notificaciones en tiempo real en tu móvil', defaultOn: true },
] as const

function PreferenciasView() {
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    email: true,
    sms: false,
    push: true,
  })

  return (
    <div className={styles.pref_grid}>
      <div>
        <h1 className={styles.view_title}>Preferencias</h1>
        <p className={styles.view_sub}>
          Personaliza tu experiencia en Jemacash. Ajusta cómo recibes noticias, tu moneda local<br />
          y la privacidad de tus datos.
        </p>
      </div>

      <div className={styles.pref_cols}>
        {/* Canales de Notificación */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconBell2 /></span>
            <h2>Canales de Notificación</h2>
          </div>
          <div className={styles.pref_notif_list}>
            {notificationChannels.map((ch) => (
              <div key={ch.id} className={styles.pref_notif_row}>
                <div className={styles.pref_notif_copy}>
                  <strong>{ch.label}</strong>
                  <span>{ch.desc}</span>
                </div>
                <button
                  type="button"
                  className={styles.toggle_btn}
                  onClick={() => setNotifState((s) => ({ ...s, [ch.id]: !s[ch.id] }))}
                  aria-label={`${ch.label} ${notifState[ch.id] ? 'activado' : 'desactivado'}`}
                >
                  <Toggle on={notifState[ch.id] ?? ch.defaultOn} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ajustes Regionales */}
        <div className={styles.sec_card}>
          <div className={styles.sec_card_head}>
            <span className={styles.sec_card_icon}><IconGlobe /></span>
            <h2>Ajustes Regionales</h2>
          </div>
          <div className={styles.pref_select_list}>
            <label className={styles.pref_select_field}>
              <span>Moneda Principal</span>
              <div className={styles.pref_select_wrap}>
                <select defaultValue="pen">
                  <option value="pen">Soles S/ (Perú)</option>
                  <option value="usd">Dólares USD</option>
                  <option value="eur">Euros EUR</option>
                </select>
                <span className={styles.pref_select_arrow}><IconChevronDown /></span>
              </div>
            </label>
            <label className={styles.pref_select_field}>
              <span>Idioma de la Interfaz</span>
              <div className={styles.pref_select_wrap}>
                <select defaultValue="es">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
                <span className={styles.pref_select_arrow}><IconChevronDown /></span>
              </div>
            </label>
            <label className={styles.pref_select_field}>
              <span>Zona Horaria</span>
              <div className={styles.pref_select_wrap}>
                <select defaultValue="lima">
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

      {/* Security commitment banner */}
      <div className={styles.pref_commitment}>
        <div className={styles.pref_commitment_copy}>
          <strong>Tu seguridad es nuestro compromiso</strong>
          <p>Configura estas opciones con la tranquilidad de que Jemacash utiliza encriptación de nivel bancario para cada ajuste que realices.</p>
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

const configTabs: { id: ConfigTab; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'metodos', label: 'Métodos de Pago' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'preferencias', label: 'Preferencias' },
]

export function ConfiguracionView({ user }: { user: UserSession }) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('perfil')

  return (
    <div className={styles.config_wrap}>
      <nav className={styles.config_tabs} aria-label="Secciones de configuración">
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

      {activeTab === 'perfil' && <PerfilView user={user} />}
      {activeTab === 'metodos' && <MetodosPagoView />}
      {activeTab === 'seguridad' && <SeguridadView />}
      {activeTab === 'preferencias' && <PreferenciasView />}
    </div>
  )
}
