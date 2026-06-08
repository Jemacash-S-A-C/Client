import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initMercadoPago } from '@mercadopago/sdk-react'
import './index.css'
import './i18n'
import App from './App.tsx'

// Initialize once at app startup — calling it inside a component causes
// repeated inits (StrictMode double-render, HMR) which breaks Secure Fields
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? ''
if (MP_PUBLIC_KEY && !MP_PUBLIC_KEY.includes('REEMPLAZAR')) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
