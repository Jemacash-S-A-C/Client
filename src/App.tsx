import { useCallback, useEffect, useState } from 'react'
import BlogPage from './pages/BlogPage'
import AppFooter from './components/layout/AppFooter'
import { LoginModal } from './components/login/LoginModal'
import { AppHeader } from './components/layout/AppHeader'
import { RegisterModal } from './components/register/RegisterModal'
import heroImg from './assets/hero.png'
import './App.css'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import ValuarEquipo from './pages/ValuarEquipo'
import UserDashboard from './pages/UserDashboard'
import { getAccessToken, clearTokens } from './utils/api'
import { loginUser, registerUser, logoutUser, getMe } from './services/auth.service'
import { profileToSession, type UserSession } from './types/api.types'

type AuthModal = null | 'register' | 'login'
type Page = 'home' | 'blog' | 'nosotros' | 'valuar'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [authModal, setAuthModal] = useState<AuthModal>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginPrefill, setLoginPrefill] = useState('')

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = getAccessToken()
    if (!token) { setAuthLoading(false); return }
    getMe()
      .then((profile) => setSession(profileToSession(profile)))
      .catch(() => clearTokens())
      .finally(() => setAuthLoading(false))
  }, [])

  // ── Listen for forced logout (401 with no refresh) ────────────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      setSession(null)
      setPage('home')
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  // ── Auth modal helpers ────────────────────────────────────────────────────
  const openRegister = useCallback(() => setAuthModal('register'), [])
  const closeAuthModals = useCallback(() => setAuthModal(null), [])

  const goToLogin = useCallback((prefillIdentifier?: string) => {
    setLoginPrefill(prefillIdentifier ?? '')
    setAuthModal('login')
  }, [])

  const goToRegister = useCallback(() => setAuthModal('register'), [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (payload: { identifier: string; password: string; remember: boolean }) => {
      try {
        const { user } = await loginUser(payload.identifier, payload.password)
        setSession(profileToSession(user))
        setAuthModal(null)
        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No fue posible iniciar sesión.'
        return { success: false, message: msg }
      }
    },
    [],
  )

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = useCallback(
    async (payload: {
      fullName: string
      email: string
      phone: string
      password: string
      termsAccepted: boolean
    }) => {
      if (!payload.termsAccepted) {
        return { success: false, message: 'Debes aceptar los términos para continuar.' }
      }
      const { fullName, email, phone, password } = payload
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
        return { success: false, message: 'Completa todos los campos antes de continuar.' }
      }
      try {
        await registerUser({ full_name: fullName.trim(), email: email.trim(), password, phone: phone.trim() })
        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No fue posible completar el registro.'
        return { success: false, message: msg }
      }
    },
    [],
  )

  // ── Profile update ────────────────────────────────────────────────────────
  const handleUserUpdate = useCallback((updated: UserSession) => {
    setSession(updated)
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await logoutUser()
    setSession(null)
    setPage('home')
  }, [])

  // ── Loading splash ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ fontFamily: 'sans-serif', color: '#0f7d3f', fontSize: '1rem' }}>Cargando…</span>
      </div>
    )
  }

  if (session) {
    return <UserDashboard user={session} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
  }

  return (
    <>
      <main className={`landing${page === 'blog' ? ' landing--blog' : ''}`}>
        <AppHeader
          activePage={page}
          onGoHome={() => setPage('home')}
          onGoBlog={() => setPage('blog')}
          onGoNosotros={() => setPage('nosotros')}
          onGoValuar={() => setPage('valuar')}
          onPidePrestamo={openRegister}
        />

        {page === 'home' ? (
          <Home />
        ) : page === 'blog' ? (
          <BlogPage featuredBackgroundSrc={heroImg} />
        ) : page === 'valuar' ? (
          <ValuarEquipo />
        ) : (
          <Nosotros />
        )}

        <AppFooter />
      </main>

      <RegisterModal
        open={authModal === 'register'}
        onClose={closeAuthModals}
        onNavigateToLogin={goToLogin}
        onSubmit={handleRegister}
        heroBackgroundSrc={heroImg}
      />
      <LoginModal
        open={authModal === 'login'}
        onClose={closeAuthModals}
        onNavigateToRegister={goToRegister}
        onSubmit={handleLogin}
        defaultIdentifier={loginPrefill}
      />
    </>
  )
}

export default App
