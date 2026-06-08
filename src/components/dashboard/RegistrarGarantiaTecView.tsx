import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createDraftGuarantee, createGuarantee, confirmGuarantee, valuateDevice, updateGuaranteeAi, getGuarantee } from '../../services/guarantee.service'
import type { AiValuationResult, GuaranteeSpecs } from '../../types/api.types'
import { getAccessToken } from '../../utils/api'
import { IconShield, IconCheck } from './icons'
import {
  DEVICE_CATALOG, getYearRange, buildYearOptions,
  getProcessorGroups, RAM_BY_CATEGORY, STORAGE_BY_CATEGORY,
  CATEGORY_HAS_BATTERY, CATEGORY_HAS_SCREEN,
} from './deviceCatalog'
import type { DeviceCategory } from './deviceCatalog'
import styles from './RegistrarGarantiaTecView.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M0 19h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 19l1-2h4l1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function IconDesktop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Image compression (same as AuditorTecnicoView) ───────────────────────────

function compressImage(dataUrl: string, maxSide = 512, quality = 0.55): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height, 1))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ── Constants ─────────────────────────────────────────────────────────────────

const UNKNOWN_BRAND     = 'Otra marca'
const UNKNOWN_MODEL     = 'Otro modelo'
const UNKNOWN_PROCESSOR = 'Otro procesador'

const DEVICE_CATEGORIES = [
  { id: 'laptop',     label: 'Laptop',     icon: IconLaptop  },
  { id: 'smartphone', label: 'Smartphone', icon: IconPhone   },
  { id: 'tablet',     label: 'Tablet',     icon: IconTablet  },
  { id: 'desktop',    label: 'Desktop',    icon: IconDesktop },
] as const

const CONDITION_OPTIONS = [
  {
    id: 'excelente',
    labelKey: 'regGar.condition.excelente.label',
    stars: '★★★',
    descKey: 'regGar.condition.excelente.desc',
  },
  {
    id: 'bueno',
    labelKey: 'regGar.condition.bueno.label',
    stars: '★★',
    descKey: 'regGar.condition.bueno.desc',
  },
  {
    id: 'regular',
    labelKey: 'regGar.condition.regular.label',
    stars: '★',
    descKey: 'regGar.condition.regular.desc',
  },
] as const

const PHOTO_SLOTS = [
  { id: 'frontal', labelKey: 'regGar.photo.frontal.label', descKey: 'regGar.photo.frontal.desc' },
  { id: 'trasero', labelKey: 'regGar.photo.trasero.label', descKey: 'regGar.photo.trasero.desc' },
  { id: 'general', labelKey: 'regGar.photo.general.label', descKey: 'regGar.photo.general.desc' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type Step1 = {
  device_category: string
  brand: string          // known brand name  |  UNKNOWN_BRAND
  custom_brand: string   // used when brand === UNKNOWN_BRAND
  model: string          // known model name  |  UNKNOWN_MODEL  |  ''
  custom_model: string   // used when model === UNKNOWN_MODEL or brand === UNKNOWN_BRAND
  manufacture_year: string
  serial_number: string
  imei: string
  is_reconditioned: boolean
}

type Step2 = {
  condition: string
  processor: string          // known value | UNKNOWN_PROCESSOR | ''
  processor_custom: string   // used when processor === UNKNOWN_PROCESSOR
  ram: string
  storage: string
  battery_health: string
  screen_size: string
}

type Step3 = { photos: Map<string, string> }


// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldRow({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className={styles.reg_field}>
      <label className={styles.reg_label}>
        {label}{required && <span className={styles.reg_required}>*</span>}
      </label>
      {children}
    </div>
  )
}

function isUnknownModel(s1: Step1): boolean {
  return s1.brand === UNKNOWN_BRAND || s1.model === UNKNOWN_MODEL
}

function effectiveBrand(s1: Step1): string {
  return s1.brand === UNKNOWN_BRAND ? s1.custom_brand.trim() : s1.brand
}

function effectiveModel(s1: Step1): string {
  return (s1.brand === UNKNOWN_BRAND || s1.model === UNKNOWN_MODEL)
    ? s1.custom_model.trim()
    : s1.model
}

// ── OS detection ─────────────────────────────────────────────────────────────

type ClientOS = 'windows' | 'macos' | 'ios' | 'android' | 'other'

function detectOS(): ClientOS {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua))          return 'ios'
  if (/Android/i.test(ua))                   return 'android'
  if (/Win32|Win64|WOW64|Windows/i.test(ua)) return 'windows'
  if (/Macintosh|MacIntel/i.test(ua))        return 'macos'
  return 'other'
}

// ── Form draft persistence ────────────────────────────────────────────────────
// Saves all non-photo state to localStorage so the user can leave mid-form and
// resume later. Photos are also persisted (compressed, typically < 200 KB each).

const DRAFT_KEY = 'jemacash_reg_tec_draft_v1'

function loadFormDraft(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null
  } catch { return null }
}

function clearFormDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RegistrarGarantiaTecView({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()

  // ── Restore persisted draft (evaluated once on mount) ──────────────────────
  // We store the parsed draft in a ref so it's read from localStorage only once,
  // not on every render.
  const _initDraftRef = useRef<Record<string, unknown> | null | undefined>(undefined)
  if (_initDraftRef.current === undefined) _initDraftRef.current = loadFormDraft()
  const _d = _initDraftRef.current

  const [step, setStep] = useState<number>(typeof _d?.step === 'number' ? _d.step as number : 0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const STEPS = [
    t('regGar.step.device'),
    t('regGar.step.specs'),
    t('regGar.step.photos'),
    t('regGar.step.valuation'),
  ]

  const [s1, setS1] = useState<Step1>((_d?.s1 as Step1 | undefined) ?? {
    device_category: '',
    brand: '',
    custom_brand: '',
    model: '',
    custom_model: '',
    manufacture_year: '',
    serial_number: '',
    imei: '',
    is_reconditioned: false,
  })

  const [s2, setS2] = useState<Step2>((_d?.s2 as Step2 | undefined) ?? {
    condition: '',
    processor: '',
    processor_custom: '',
    ram: '',
    storage: '',
    battery_health: '85',
    screen_size: '',
  })

  const [s3, setS3] = useState<Step3>({
    photos: new Map(Array.isArray(_d?.photos) ? _d.photos as [string, string][] : []),
  })
  const [pendingSlot, setPendingSlot] = useState<string | null>(null)
  const [imageSizeError, setImageSizeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── AI Valuation state ──────────────────────────────────────────────────────

  type AiState = 'idle' | 'running' | 'done' | 'failed'
  // Restore AI result from draft; never restore 'running' (user must re-trigger)
  const _restoredAiResult = (_d?.aiResult as AiValuationResult | undefined) ?? null
  const [aiState, setAiState]   = useState<AiState>(_restoredAiResult ? 'done' : 'idle')
  const [aiResult, setAiResult] = useState<AiValuationResult | null>(_restoredAiResult)
  const aiRef = useRef<{ cancelled: boolean; started: boolean }>({ cancelled: false, started: false })
  /** true when AI result came from localStorage → skip re-running on step 3 entry */
  const aiRestoredRef = useRef(_restoredAiResult !== null)

  // ── Guarantee + audit state ────────────────────────────────────────────────

  const _auditValues = ['none', 'verified', 'discrepancy'] as const
  const [draftGuaranteeId, setDraftGuaranteeId] = useState<string | null>(
    typeof _d?.draftGuaranteeId === 'string' ? _d.draftGuaranteeId : null
  )
  const [auditVerified, setAuditVerified] = useState<'none' | 'verified' | 'discrepancy'>(
    _auditValues.includes(_d?.auditVerified as typeof _auditValues[number])
      ? _d!.auditVerified as typeof _auditValues[number]
      : 'none'
  )
  const [checkingAudit, setCheckingAudit]     = useState(false)
  const [discrepancyNotes, setDiscrepancyNotes] = useState<string | null>(
    typeof _d?.discrepancyNotes === 'string' ? _d.discrepancyNotes : null
  )
  const [macDownloaded, setMacDownloaded] = useState<boolean>(_d?.macDownloaded === true)
  const [macCopied, setMacCopied]         = useState(false)
  const clientOS = useMemo(() => detectOS(), [])
  /** true when AI data was already saved to the draft guarantee during a previous visit */
  const aiSavedRef = useRef(_restoredAiResult !== null && typeof _d?.draftGuaranteeId === 'string')

  async function runValuation() {
    try {
      const cat       = s1.device_category as DeviceCategory
      const rawPhotos = [...s3.photos.values()]
      const photos    = rawPhotos.length > 0
        ? await Promise.all(rawPhotos.map((p) => compressImage(p)))
        : []
      const procLabel = s2.processor === UNKNOWN_PROCESSOR ? s2.processor_custom.trim() : s2.processor

      const result = await valuateDevice({
        device_category:  s1.device_category,
        brand:            effectiveBrand(s1),
        model:            effectiveModel(s1),
        manufacture_year: s1.manufacture_year,
        processor:        procLabel,
        ram:              s2.ram,
        storage:          s2.storage,
        battery_health:   CATEGORY_HAS_BATTERY[cat] ? s2.battery_health : undefined,
        screen_size:      CATEGORY_HAS_SCREEN[cat] && s2.screen_size ? s2.screen_size : undefined,
        condition:        s2.condition,
        is_reconditioned: s1.is_reconditioned,
        photos,
      })

      if (!aiRef.current.cancelled) {
        setAiResult(result)
        setAiState('done')
      }
    } catch {
      if (!aiRef.current.cancelled) {
        setAiState('failed')
      }
    }
  }

  function handleRetryAi() {
    aiRef.current = { cancelled: false, started: true }
    setAiState('running')
    setAiResult(null)
    aiSavedRef.current = false
    runValuation()
  }

  // Auto-run AI when reaching step 3; reset all audit state on back-navigation
  useEffect(() => {
    if (step !== 3) {
      aiRef.current.cancelled = true
      aiRef.current.started   = false
      setAiState('idle')
      setAiResult(null)
      aiSavedRef.current = false
      setDraftGuaranteeId(null)
      setAuditVerified('none')
      setDiscrepancyNotes(null)
      setMacDownloaded(false)
      return
    }
    if (!aiRef.current.started) {
      aiRef.current = { cancelled: false, started: true }
      if (aiRestoredRef.current) {
        // AI result was restored from localStorage — no need to re-run the analysis
        aiRestoredRef.current = false // allow normal re-run if user navigates away and returns
      } else {
        setAiState('running')
        runValuation()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Auto-save AI result once a draft guarantee exists
  useEffect(() => {
    if (!draftGuaranteeId || !aiResult || aiSavedRef.current) return
    aiSavedRef.current = true
    updateGuaranteeAi(draftGuaranteeId, {
      ai_market_value:         aiResult.market_value_pen,
      ai_resale_value:         aiResult.resale_value_pen,
      ai_max_loan:             aiResult.max_loan_pen,
      ai_condition_score:      aiResult.condition_score,
      ai_depreciation_factors: aiResult.depreciation_factors,
      ai_confidence:           aiResult.confidence,
      ai_reasoning:            aiResult.reasoning,
      ai_visual_condition:     aiResult.visual_condition,
    }).catch(() => { /* non-critical */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftGuaranteeId, aiResult])

  // Persist form draft to localStorage on every relevant state change so the
  // user can leave mid-form and resume exactly where they left off.
  useEffect(() => {
    // Don't save an empty form — at least a device category must be selected
    if (step === 0 && !s1.device_category) return
    try {
      const data: Record<string, unknown> = {
        step,
        s1,
        s2,
        // Map → serializable array of [slotId, dataUrl] pairs
        photos: [...s3.photos.entries()],
        auditVerified,
        macDownloaded,
      }
      if (aiResult)           data.aiResult           = aiResult
      if (draftGuaranteeId)   data.draftGuaranteeId   = draftGuaranteeId
      if (discrepancyNotes)   data.discrepancyNotes   = discrepancyNotes
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
    } catch { /* quota exceeded or private browsing — ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, s1, s2, s3, aiResult, draftGuaranteeId, auditVerified, discrepancyNotes, macDownloaded])

  // ── Guarantee helpers ──────────────────────────────────────────────────────

  function buildGuaranteePayload() {
    const brand = effectiveBrand(s1)
    const model = effectiveModel(s1)
    const name  = `${brand} ${model}`.trim()
    const cat   = s1.device_category as DeviceCategory
    const specs: Record<string, string> = {
      processor: s2.processor === UNKNOWN_PROCESSOR ? s2.processor_custom.trim() : s2.processor,
      ram:       s2.ram,
      storage:   s2.storage,
    }
    if (CATEGORY_HAS_BATTERY[cat])                specs.battery_health    = s2.battery_health
    if (CATEGORY_HAS_SCREEN[cat] && s2.screen_size) specs.screen_size     = s2.screen_size
    if (s1.imei)                                  specs.imei              = s1.imei
    if (s1.is_reconditioned)                      specs.is_reconditioned  = 'true'
    if (isUnknownModel(s1))                       specs.needs_verification = 'true'
    return {
      type:             'tecnologia',
      name,
      description:      `Condición: ${s2.condition}. ${s1.device_category} ${s1.manufacture_year}.`,
      device_category:  s1.device_category,
      brand,
      model,
      manufacture_year: s1.manufacture_year,
      serial_number:    s1.serial_number,
      condition:        s2.condition,
      specs:            specs as GuaranteeSpecs,
      // photo_urls are NOT included here: raw base64 images are large (up to 2 MB each) and
      // are already used by the AI valuation. They are saved via handleSubmit on final confirm.
    }
  }

  /** Lazily creates a DRAFT guarantee (invisible in dashboard) and returns its ID.
   *  Called by download handlers so the auditor has a target guarantee to report to. */
  async function ensureDraftGuarantee(): Promise<string | null> {
    if (draftGuaranteeId) return draftGuaranteeId
    try {
      const created = await createDraftGuarantee(buildGuaranteePayload())
      setDraftGuaranteeId(created.id)
      return created.id
    } catch (err) {
      console.error('Error creando borrador de garantía:', err)
      return null
    }
  }

  async function handleDownloadAuditorSingle() {
    const token = getAccessToken()
    if (!token) return
    const id = await ensureDraftGuarantee()
    if (!id) return
    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
      const exeRes = await fetch('/downloads/Jemacash-Auditor.exe')
      if (!exeRes.ok) throw new Error('No se pudo descargar el auditor')
      const exeBuffer = await exeRes.arrayBuffer()

      const config      = { ApiUrl: apiUrl, GuaranteeId: id, AccessToken: token }
      const sentinel    = '###JEMACASH_CONFIG###'
      const configBytes = new TextEncoder().encode(sentinel + JSON.stringify(config))

      const combined = new Uint8Array(exeBuffer.byteLength + configBytes.byteLength)
      combined.set(new Uint8Array(exeBuffer), 0)
      combined.set(configBytes, exeBuffer.byteLength)

      const blob = new Blob([combined], { type: 'application/octet-stream' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'Jemacash-Auditor.exe'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error descargando auditor:', err)
    }
  }

  async function handleDownloadAuditorMac() {
    const token = getAccessToken()
    if (!token) return
    const id = await ensureDraftGuarantee()
    if (!id) return
    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
      const shRes = await fetch('/downloads/Jemacash-Auditor.sh')
      if (!shRes.ok) throw new Error('No se pudo descargar el auditor')
      const scriptText = await shRes.text()

      const config     = { ApiUrl: apiUrl, GuaranteeId: id, AccessToken: token }
      const sentinel   = '###JEMACASH_CONFIG###'
      const withConfig = scriptText + '\n' + sentinel + JSON.stringify(config) + '\n'

      const blob = new Blob([withConfig], { type: 'text/plain' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'Jemacash-Auditor.sh'
      a.click()
      URL.revokeObjectURL(url)
      setMacDownloaded(true)
    } catch (err) {
      console.error('Error descargando auditor macOS:', err)
    }
  }

  async function handleCheckAudit() {
    if (!draftGuaranteeId) return
    setCheckingAudit(true)
    try {
      const fresh  = await getGuarantee(draftGuaranteeId)
      const audVer = fresh.specs?.audit_verified
      if (audVer === 'true') {
        setAuditVerified('verified')
      } else if (audVer === 'discrepancy') {
        setAuditVerified('discrepancy')
        setDiscrepancyNotes(fresh.specs?.audit_discrepancy_notes ?? 'Los datos del dispositivo no coinciden con los declarados.')
      }
    } catch { /* ignore */ }
    finally { setCheckingAudit(false) }
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function step0Valid(): boolean {
    if (!s1.device_category) return false
    const brandOk = s1.brand === UNKNOWN_BRAND
      ? s1.custom_brand.trim() !== ''
      : s1.brand !== ''
    const modelOk = s1.brand === UNKNOWN_BRAND
      ? s1.custom_model.trim() !== ''
      : s1.model === UNKNOWN_MODEL
      ? s1.custom_model.trim() !== ''
      : s1.model !== ''
    return brandOk && modelOk && s1.manufacture_year !== '' && s1.serial_number.trim() !== ''
  }

  function canAdvance() {
    if (step === 0) return step0Valid()
    if (step === 1) {
      const processorOk = s2.processor === UNKNOWN_PROCESSOR
        ? s2.processor_custom.trim() !== ''
        : s2.processor !== ''
      return s2.condition !== '' && processorOk && s2.ram !== '' && s2.storage !== ''
    }
    if (step === 2) return s3.photos.size >= 3
    if (step === 3) {
      // AI must finish before anything else
      const aiDone = aiState === 'done' || aiState === 'failed'
      if (!aiDone) return false
      if (aiState === 'done' && aiResult) {
        // Photos must match the declared device
        if (!aiResult.device_match_valid) return false
        // Resale value must meet the S/ 350 minimum
        if (aiResult.resale_value_pen < 350) return false
      }
      // Laptops and desktops require a passed hardware audit before registering
      const requiresAudit = s1.device_category === 'laptop' || s1.device_category === 'desktop'
      if (requiresAudit) return auditVerified === 'verified'
      return true
    }
    return false
  }

  function handlePhotoCardClick(slotId: string) {
    setPendingSlot(slotId)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingSlot) return
    if (file.size > 2 * 1024 * 1024) {
      setImageSizeError('La imagen debe ser menor a 2 MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setS3((prev) => {
        const next = new Map(prev.photos)
        next.set(pendingSlot, reader.result as string)
        return { photos: next }
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (draftGuaranteeId) {
        // Laptop / desktop went through the audit: confirm draft → status ACTIVE → visible
        await confirmGuarantee(draftGuaranteeId)
      } else {
        // Smartphone / tablet: create guarantee directly and save AI data
        const created = await createGuarantee(buildGuaranteePayload())
        if (aiResult && !aiSavedRef.current) {
          aiSavedRef.current = true
          updateGuaranteeAi(created.id, {
            ai_market_value:         aiResult.market_value_pen,
            ai_resale_value:         aiResult.resale_value_pen,
            ai_max_loan:             aiResult.max_loan_pen,
            ai_condition_score:      aiResult.condition_score,
            ai_depreciation_factors: aiResult.depreciation_factors,
            ai_confidence:           aiResult.confidence,
            ai_reasoning:            aiResult.reasoning,
            ai_visual_condition:     aiResult.visual_condition,
          }).catch(() => { /* non-critical */ })
        }
      }
      clearFormDraft()
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al registrar la garantía.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render steps ────────────────────────────────────────────────────────────

  function renderStep0() {
    const catalogBrands = s1.device_category
      ? (DEVICE_CATALOG[s1.device_category as DeviceCategory] ?? [])
      : []
    const catalogModels = s1.brand && s1.brand !== UNKNOWN_BRAND
      ? (catalogBrands.find((b) => b.brand === s1.brand)?.models ?? [])
      : []
    const yearOptions = buildYearOptions(s1.device_category, s1.brand, s1.model)
    const [yearMin, yearMax] = getYearRange(s1.device_category, s1.brand, s1.model)
    const showYearRange = s1.model !== '' && s1.model !== UNKNOWN_MODEL && s1.brand !== UNKNOWN_BRAND
    const unknown = isUnknownModel(s1)

    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>{t('regGar.step0.desc')}</p>

        {/* Category selector */}
        <FieldRow label={t('regGar.step0.deviceType')} required>
          <div className={styles.reg_category_grid}>
            {DEVICE_CATEGORIES.map(({ id, label, icon: CatIcon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.reg_category_btn} ${s1.device_category === id ? styles.reg_category_active : ''}`}
                onClick={() => {
                  setS1((p) => ({
                    ...p,
                    device_category: id,
                    brand: '', custom_brand: '',
                    model: '', custom_model: '',
                    manufacture_year: '',
                  }))
                  setS2((p) => ({ ...p, processor: '', processor_custom: '', ram: '', storage: '' }))
                }}
              >
                <span className={styles.reg_cat_icon}><CatIcon /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </FieldRow>

        <div className={styles.reg_two_col}>
          {/* ── Brand ── */}
          <FieldRow label={t('regGar.step0.brand')} required>
            {s1.device_category ? (
              <>
                <select
                  className={styles.reg_select}
                  value={s1.brand}
                  onChange={(e) => {
                    setS1((p) => ({
                      ...p,
                      brand: e.target.value,
                      custom_brand: '',
                      model: '', custom_model: '',
                      manufacture_year: '',
                    }))
                    setS2((p) => ({ ...p, processor: '', processor_custom: '' }))
                  }}
                >
                  <option value="">{t('regGar.step0.selectBrand')}</option>
                  {catalogBrands.map((b) => (
                    <option key={b.brand} value={b.brand}>{b.brand}</option>
                  ))}
                  <option value={UNKNOWN_BRAND}>{t('regGar.step0.unknownBrand')}</option>
                </select>
                {s1.brand === UNKNOWN_BRAND && (
                  <input
                    type="text"
                    className={styles.reg_input}
                    placeholder={t('regGar.step0.brandPlaceholder')}
                    value={s1.custom_brand}
                    onChange={(e) => setS1((p) => ({ ...p, custom_brand: e.target.value }))}
                    style={{ marginTop: '0.4rem' }}
                  />
                )}
              </>
            ) : (
              <input
                disabled
                className={styles.reg_input}
                placeholder={t('regGar.step0.selectTypeFirst')}
                style={{ color: '#94a3b8', cursor: 'not-allowed' }}
              />
            )}
          </FieldRow>

          {/* ── Model ── */}
          <FieldRow label={t('regGar.step0.model')} required>
            {!s1.device_category || !s1.brand ? (
              <input
                disabled
                className={styles.reg_input}
                placeholder={t('regGar.step0.selectBrandFirst')}
                style={{ color: '#94a3b8', cursor: 'not-allowed' }}
              />
            ) : s1.brand === UNKNOWN_BRAND ? (
              <input
                type="text"
                className={styles.reg_input}
                placeholder={t('regGar.step0.modelPlaceholder')}
                value={s1.custom_model}
                onChange={(e) => setS1((p) => ({ ...p, custom_model: e.target.value }))}
              />
            ) : (
              <>
                <select
                  className={styles.reg_select}
                  value={s1.model}
                  onChange={(e) => {
                    const newModel = e.target.value
                    setS1((p) => {
                      const [min, max] = getYearRange(p.device_category, p.brand, newModel)
                      const yr = Number(p.manufacture_year)
                      const stillValid = p.manufacture_year !== '' && yr >= min && yr <= max
                      return {
                        ...p,
                        model: newModel,
                        custom_model: '',
                        manufacture_year: stillValid ? p.manufacture_year : '',
                      }
                    })
                    // Reset processor: chip options change per model
                    setS2((p) => ({ ...p, processor: '', processor_custom: '' }))
                  }}
                >
                  <option value="">{t('regGar.step0.selectModel')}</option>
                  {catalogModels.map((m) => (
                    <option key={m.model} value={m.model}>{m.model}</option>
                  ))}
                  <option value={UNKNOWN_MODEL}>{t('regGar.step0.unknownModel')}</option>
                </select>
                {s1.model === UNKNOWN_MODEL && (
                  <input
                    type="text"
                    className={styles.reg_input}
                    placeholder={t('regGar.step0.modelPlaceholder')}
                    value={s1.custom_model}
                    onChange={(e) => setS1((p) => ({ ...p, custom_model: e.target.value }))}
                    style={{ marginTop: '0.4rem' }}
                  />
                )}
              </>
            )}
          </FieldRow>
        </div>

        {/* Unknown model warning */}
        {unknown && (
          <div className={styles.reg_warn_box}>
            <IconAlert />
            <p dangerouslySetInnerHTML={{ __html: t('regGar.step0.unknownWarning') }} />
          </div>
        )}

        <div className={styles.reg_two_col}>
          {/* ── Year ── */}
          <FieldRow label={t('regGar.step0.year')} required>
            <select
              className={styles.reg_select}
              value={s1.manufacture_year}
              disabled={!s1.brand || (s1.brand === UNKNOWN_BRAND ? false : !s1.model)}
              onChange={(e) => setS1((p) => ({ ...p, manufacture_year: e.target.value }))}
            >
              <option value="">{t('regGar.step0.selectYear')}</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {showYearRange && yearOptions.length > 0 && (
              <span className={styles.reg_year_hint}>
                {t('regGar.step0.yearRange', { min: yearMin, max: yearMax })}
              </span>
            )}
          </FieldRow>

          {/* ── Serial number ── */}
          <FieldRow label={t('regGar.step0.serial')} required>
            <input
              type="text"
              className={styles.reg_input}
              placeholder={t('regGar.step0.serialPlaceholder')}
              value={s1.serial_number}
              onChange={(e) => setS1((p) => ({ ...p, serial_number: e.target.value }))}
            />
          </FieldRow>
        </div>

        {/* IMEI — smartphones only */}
        {s1.device_category === 'smartphone' && (
          <FieldRow label={t('regGar.step0.imei')}>
            <input
              type="text"
              className={styles.reg_input}
              placeholder={t('regGar.step0.imeiPlaceholder')}
              value={s1.imei}
              onChange={(e) => setS1((p) => ({ ...p, imei: e.target.value }))}
            />
          </FieldRow>
        )}

        {/* Reconditioned */}
        <label className={styles.reg_checkbox_row}>
          <input
            type="checkbox"
            checked={s1.is_reconditioned}
            onChange={(e) => setS1((p) => ({ ...p, is_reconditioned: e.target.checked }))}
          />
          <span>{t('regGar.step0.reconditioned')}</span>
        </label>

        {s1.is_reconditioned && (
          <div className={styles.reg_info_box}>
            <IconShield />
            <p>{t('regGar.step0.reconditionedInfo')}</p>
          </div>
        )}

        <div className={styles.reg_info_box}>
          <IconShield />
          <p>{t('regGar.step0.serialInfo')}</p>
        </div>
      </div>
    )
  }

  function renderStep1() {
    const cat         = s1.device_category as DeviceCategory
    const brandKey    = s1.brand === UNKNOWN_BRAND ? '' : s1.brand
    const modelKey    = s1.model === UNKNOWN_MODEL ? '' : s1.model
    const procGroups  = cat ? getProcessorGroups(cat, brandKey, modelKey) : []
    const ramOptions  = cat ? RAM_BY_CATEGORY[cat]     : RAM_BY_CATEGORY.laptop
    const storOpts    = cat ? STORAGE_BY_CATEGORY[cat] : STORAGE_BY_CATEGORY.laptop
    const hasBattery  = !cat || CATEGORY_HAS_BATTERY[cat]
    const hasScreen   = !cat || CATEGORY_HAS_SCREEN[cat]

    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>{t('regGar.step1.desc')}</p>

        {/* ── Condition ── */}
        <FieldRow label={t('regGar.step1.condition')} required>
          <div className={styles.reg_condition_grid}>
            {CONDITION_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.reg_condition_btn} ${s2.condition === c.id ? styles.reg_condition_active : ''}`}
                onClick={() => setS2((p) => ({ ...p, condition: c.id }))}
              >
                <span className={styles.reg_cond_stars}>{c.stars}</span>
                <strong>{t(c.labelKey)}</strong>
                <p>{t(c.descKey)}</p>
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Processor — grouped select ── */}
        <FieldRow label={t('regGar.step1.processor')} required>
          <select
            className={styles.reg_select}
            value={s2.processor}
            onChange={(e) => setS2((p) => ({ ...p, processor: e.target.value, processor_custom: '' }))}
          >
            <option value="">{t('regGar.step1.selectProcessor')}</option>
            {procGroups.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.processors.map((proc) => (
                  <option key={proc} value={proc}>{proc}</option>
                ))}
              </optgroup>
            ))}
            <option value={UNKNOWN_PROCESSOR}>{t('regGar.step1.unknownProcessor')}</option>
          </select>
          {s2.processor === UNKNOWN_PROCESSOR && (
            <input
              type="text"
              className={styles.reg_input}
              placeholder={t('regGar.step1.processorPlaceholder')}
              value={s2.processor_custom}
              onChange={(e) => setS2((p) => ({ ...p, processor_custom: e.target.value }))}
              style={{ marginTop: '0.4rem' }}
            />
          )}
        </FieldRow>

        {/* ── RAM ── */}
        <FieldRow label={t('regGar.step1.ram')} required>
          <div className={styles.reg_pills}>
            {ramOptions.map((r) => (
              <button
                key={r}
                type="button"
                className={`${styles.reg_pill} ${s2.ram === r ? styles.reg_pill_active : ''}`}
                onClick={() => setS2((p) => ({ ...p, ram: r }))}
              >
                {r}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Storage ── */}
        <FieldRow label={t('regGar.step1.storage')} required>
          <div className={styles.reg_pills}>
            {storOpts.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.reg_pill} ${s2.storage === s ? styles.reg_pill_active : ''}`}
                onClick={() => setS2((p) => ({ ...p, storage: s }))}
              >
                {s}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* ── Battery (not for desktop) ── */}
        {hasBattery && (
          <FieldRow label={t('regGar.step1.battery', { pct: s2.battery_health })}>
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={s2.battery_health}
              onChange={(e) => setS2((p) => ({ ...p, battery_health: e.target.value }))}
              className={styles.reg_slider}
              style={{ '--pct': `${((Number(s2.battery_health) - 30) / 70) * 100}%` } as React.CSSProperties}
            />
            <div className={styles.reg_slider_labels}>
              <span>30%</span><span>100%</span>
            </div>
          </FieldRow>
        )}

        {/* ── Screen size (not for desktop) ── */}
        {hasScreen && (
          <FieldRow label={t('regGar.step1.screen')}>
            <input
              type="text"
              className={styles.reg_input}
              placeholder={t('regGar.step1.screenPlaceholder')}
              value={s2.screen_size}
              onChange={(e) => setS2((p) => ({ ...p, screen_size: e.target.value }))}
            />
          </FieldRow>
        )}
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>{t('regGar.step2.desc')}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div className={styles.reg_photos_grid}>
          {PHOTO_SLOTS.map((slot) => {
            const dataUrl = s3.photos.get(slot.id)
            const done = !!dataUrl
            return (
              <button
                key={slot.id}
                type="button"
                className={`${styles.reg_photo_card} ${done ? styles.reg_photo_done : ''}`}
                onClick={() => handlePhotoCardClick(slot.id)}
              >
                {done ? (
                  <img
                    src={dataUrl}
                    alt={t(slot.labelKey)}
                    className={styles.reg_photo_preview}
                  />
                ) : (
                  <span className={styles.reg_photo_icon}>
                    <IconCamera />
                  </span>
                )}
                <strong>{t(slot.labelKey)}</strong>
                <p>{t(slot.descKey)}</p>
                <span className={done ? styles.reg_photo_cargada : styles.reg_photo_pendiente}>
                  {done ? t('regGar.step2.loaded') : t('regGar.step2.tap')}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.reg_photos_count}>
          <span className={s3.photos.size >= 3 ? styles.reg_photos_ok : styles.reg_photos_warn}>
            {t('regGar.step2.photoCount', { count: s3.photos.size })}
          </span>
        </div>

        <div className={styles.reg_info_box}>
          <IconCamera />
          <p>{t('regGar.step2.photoInfo')}</p>
        </div>
      </div>
    )
  }

  function renderStep3() {
    const catLabel     = DEVICE_CATEGORIES.find((c) => c.id === s1.device_category)?.label ?? s1.device_category
    const condLabel    = CONDITION_OPTIONS.find((c) => c.id === s2.condition)
    const condLabelStr = condLabel ? t(condLabel.labelKey) : s2.condition
    const brand        = effectiveBrand(s1)
    const model        = effectiveModel(s1)
    const unknown      = isUnknownModel(s1)
    const cat          = s1.device_category as DeviceCategory
    const procLabel    = s2.processor === UNKNOWN_PROCESSOR ? s2.processor_custom : s2.processor
    const hasBattery   = !cat || CATEGORY_HAS_BATTERY[cat]
    const hasScreen    = !cat || CATEGORY_HAS_SCREEN[cat]

    // All AI checks must pass before the auditor download is allowed
    const aiAnalysisOk =
      aiState === 'done' &&
      aiResult !== null &&
      aiResult.device_match_valid === true &&
      aiResult.resale_value_pen >= 350

    return (
      <div className={styles.reg_step_body}>
        <p className={styles.reg_step_desc}>{t('regGar.step3.desc')}</p>

        {/* ── AI Valuation — Running ── */}
        {aiState === 'running' && (
          <div className={styles.reg_ai_block}>
            <div className={styles.reg_ai_spinner_lg} />
            <div>
              <h3 className={styles.reg_ai_title}>{t('regGar.step3.ai.running')}</h3>
              <p className={styles.reg_ai_desc}>{t('regGar.step3.ai.runningDesc')}</p>
            </div>
          </div>
        )}

        {/* ── AI Valuation — Done ── */}
        {aiState === 'done' && aiResult && (
          <div className={styles.reg_ai_result}>

            <div className={styles.reg_ai_result_header}>
              <span className={styles.reg_ai_result_badge}>IA · Groq</span>
              <strong style={{ fontSize: '0.95rem', color: '#14230a' }}>{t('regGar.step3.ai.done')}</strong>
              <button type="button" className={styles.reg_ai_reanalyze} onClick={handleRetryAi}>
                {t('regGar.step3.ai.retryBtn')}
              </button>
            </div>

            {/* Device identity validation */}
            {aiResult.device_match_valid ? (
              <div className={styles.reg_info_box} style={{ borderColor: '#0f7d3f', background: '#f0fdf4', marginBottom: '0.75rem' }}>
                <IconShield />
                <p style={{ color: '#0f7d3f', margin: 0 }}>
                  ✓ Dispositivo verificado — las fotos corresponden al {effectiveBrand(s1)} {effectiveModel(s1)} declarado.
                </p>
              </div>
            ) : (
              <div className={styles.reg_warn_box} style={{ marginBottom: '0.75rem' }}>
                <IconAlert />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Dispositivo no verificado</strong>
                  <p style={{ margin: 0 }}>
                    {aiResult.match_rejection_reason ?? 'Las fotos no corresponden al modelo declarado. Sube fotos claras y nítidas del dispositivo correcto.'}
                  </p>
                </div>
              </div>
            )}

            <div className={styles.reg_ai_values}>
              <div className={`${styles.reg_ai_value_card} ${styles.reg_ai_value_main}`}>
                <span>{t('regGar.step3.ai.resaleValue')}</span>
                <strong>S/ {aiResult.resale_value_pen.toLocaleString('es-PE')}</strong>
                <small>{t('regGar.step3.ai.resaleNote')}</small>
              </div>
              <div className={styles.reg_ai_value_card}>
                <span>{t('regGar.step3.ai.marketValue')}</span>
                <strong>S/ {aiResult.market_value_pen.toLocaleString('es-PE')}</strong>
                <small>{t('regGar.step3.ai.marketNote')}</small>
              </div>
              <div className={`${styles.reg_ai_value_card} ${styles.reg_ai_value_loan}`}>
                <span>{t('regGar.step3.ai.maxLoan')}</span>
                <strong>S/ {aiResult.max_loan_pen.toLocaleString('es-PE')}</strong>
                <small>{t('regGar.step3.ai.loanNote')}</small>
              </div>
            </div>

            {/* Minimum value guard — S/ 350 */}
            {aiResult.resale_value_pen < 350 && (
              <div className={styles.reg_warn_box} style={{ marginTop: '0.5rem' }}>
                <IconAlert />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    Valor de reventa insuficiente
                  </strong>
                  <p style={{ margin: 0 }}>
                    El valor de reventa estimado es{' '}
                    <strong>S/ {aiResult.resale_value_pen.toLocaleString('es-PE')}</strong>,
                    por debajo del mínimo requerido de <strong>S/ 350</strong>.
                    No es posible registrar este dispositivo como garantía.
                  </p>
                </div>
              </div>
            )}

            <div className={styles.reg_ai_score_row}>
              <span>{t('regGar.step3.ai.condScore')}</span>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${aiResult.condition_score * 10}%`,
                  background: aiResult.condition_score >= 7
                    ? 'linear-gradient(to right, #0f7d3f, #22c55e)'
                    : 'linear-gradient(to right, #d97706, #f59e0b)',
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#14230a', whiteSpace: 'nowrap' }}>
                {aiResult.condition_score.toFixed(1)} / 10
              </strong>
            </div>

            {aiResult.depreciation_factors && aiResult.depreciation_factors.length > 0 && (
              <div className={styles.reg_ai_factors}>
                <span className={styles.reg_ai_factors_label}>{t('regGar.step3.ai.factors')}</span>
                <div className={styles.reg_ai_factors_list}>
                  {aiResult.depreciation_factors.map((f) => (
                    <span key={f} className={styles.reg_ai_factor_tag}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {aiResult.reasoning && (
              <p className={styles.reg_ai_reasoning}>{aiResult.reasoning}</p>
            )}

          </div>
        )}

        {/* ── AI Valuation — Failed ── */}
        {aiState === 'failed' && (
          <div className={styles.reg_warn_box}>
            <IconAlert />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{t('regGar.step3.ai.failed')}</strong>
              <p style={{ margin: '0 0 0.6rem' }}>{t('regGar.step3.ai.failedDesc')}</p>
              <button
                type="button"
                style={{
                  fontSize: '0.8rem', fontWeight: 600, color: '#92400e',
                  background: '#fef3c7', border: '1px solid #fcd34d',
                  borderRadius: 6, padding: '0.3rem 0.75rem', cursor: 'pointer',
                }}
                onClick={handleRetryAi}
              >
                {t('regGar.step3.ai.retryBtn')}
              </button>
            </div>
          </div>
        )}

        {/* ── Platform verification tiles ── */}
        <div className={styles.reg_verify_grid}>
          {/* Windows — functional for laptops and desktops */}
          <div
            className={styles.reg_verify_tile}
            style={clientOS !== 'windows' && (s1.device_category === 'laptop' || s1.device_category === 'desktop') ? { opacity: 0.5 } : undefined}
          >
            <span className={styles.reg_verify_tile_icon}>⊞</span>
            <strong>Windows</strong>
            {clientOS === 'windows' && (s1.device_category === 'laptop' || s1.device_category === 'desktop') && (
              <span style={{ fontSize: '0.6rem', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>Tu sistema</span>
            )}
            {(s1.device_category === 'laptop' || s1.device_category === 'desktop') ? (
              <>
                {auditVerified === 'verified' ? (
                  <span className={styles.reg_verify_coming} style={{ color: '#0f7d3f' }}>✓ Auditoría completada</span>
                ) : auditVerified === 'discrepancy' ? (
                  <span className={styles.reg_verify_coming} style={{ color: '#dc2626' }}>✗ Discrepancia detectada</span>
                ) : (
                  <span className={styles.reg_verify_coming} style={{ color: '#d97706' }}>Requerido</span>
                )}
                {auditVerified === 'discrepancy' && discrepancyNotes && (
                  <p style={{ fontSize: '0.7rem', color: '#dc2626', textAlign: 'center', margin: '0.25rem 0 0', lineHeight: 1.3 }}>
                    {discrepancyNotes}
                  </p>
                )}
                {auditVerified === 'none' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                    <button
                      type="button"
                      className={styles.reg_verify_download_btn}
                      onClick={handleDownloadAuditorSingle}
                      disabled={!aiAnalysisOk}
                    >
                      Descargar
                    </button>
                    {draftGuaranteeId && (
                      <button
                        type="button"
                        className={styles.reg_verify_download_btn}
                        onClick={handleCheckAudit}
                        disabled={checkingAudit}
                        style={{ fontSize: '0.75rem', opacity: 0.85 }}
                      >
                        {checkingAudit ? 'Verificando...' : 'Ya ejecuté el auditor'}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <span className={styles.reg_verify_coming}>Próximamente</span>
                <button type="button" className={styles.reg_verify_download_btn} disabled>Descargar</button>
              </>
            )}
          </div>

          {/* macOS — functional for laptops and desktops */}
          <div
            className={styles.reg_verify_tile}
            style={clientOS !== 'macos' && (s1.device_category === 'laptop' || s1.device_category === 'desktop') ? { opacity: 0.5 } : undefined}
          >
            <span className={styles.reg_verify_tile_icon}></span>
            <strong>macOS</strong>
            {clientOS === 'macos' && (s1.device_category === 'laptop' || s1.device_category === 'desktop') && (
              <span style={{ fontSize: '0.6rem', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>Tu sistema</span>
            )}
            {(s1.device_category === 'laptop' || s1.device_category === 'desktop') ? (
              <>
                {auditVerified === 'verified' ? (
                  <span className={styles.reg_verify_coming} style={{ color: '#0f7d3f' }}>✓ Auditoría completada</span>
                ) : auditVerified === 'discrepancy' ? (
                  <span className={styles.reg_verify_coming} style={{ color: '#dc2626' }}>✗ Discrepancia detectada</span>
                ) : (
                  <span className={styles.reg_verify_coming} style={{ color: '#d97706' }}>Requerido</span>
                )}
                {auditVerified === 'discrepancy' && discrepancyNotes && (
                  <p style={{ fontSize: '0.7rem', color: '#dc2626', textAlign: 'center', margin: '0.25rem 0 0', lineHeight: 1.3 }}>
                    {discrepancyNotes}
                  </p>
                )}
                {auditVerified === 'none' && !macDownloaded && (
                  <button
                    type="button"
                    className={styles.reg_verify_download_btn}
                    onClick={handleDownloadAuditorMac}
                    disabled={!aiAnalysisOk}
                  >
                    Descargar
                  </button>
                )}
                {auditVerified === 'none' && macDownloaded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <span style={{ fontSize: '0.7rem', color: '#0f7d3f', fontWeight: 600, textAlign: 'center' }}>
                      ✓ Archivo descargado
                    </span>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem', fontSize: '0.68rem', color: '#374151', lineHeight: 1.6 }}>
                      <p style={{ margin: '0 0 0.4rem', fontWeight: 600 }}>Cómo ejecutarlo:</p>
                      <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>1.</strong> Abre <strong>Terminal</strong>
                        <br />
                        <span style={{ color: '#6b7280' }}>Presiona <kbd style={{ background: '#e5e7eb', padding: '0 3px', borderRadius: 3 }}>⌘</kbd> + <kbd style={{ background: '#e5e7eb', padding: '0 3px', borderRadius: 3 }}>Espacio</kbd>, escribe <em>Terminal</em> y presiona Enter</span>
                      </p>
                      <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>2.</strong> Copia y pega este comando:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#1e293b', borderRadius: 6, padding: '0.35rem 0.5rem' }}>
                        <code style={{ color: '#86efac', fontSize: '0.63rem', flex: 1, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          bash ~/Downloads/Jemacash-Auditor.sh
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('bash ~/Downloads/Jemacash-Auditor.sh').catch(() => {})
                            setMacCopied(true)
                            setTimeout(() => setMacCopied(false), 2000)
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: macCopied ? '#86efac' : '#94a3b8', fontSize: '0.75rem', padding: '0 2px', flexShrink: 0 }}
                          title="Copiar comando"
                        >
                          {macCopied ? '✓' : '⧉'}
                        </button>
                      </div>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        <strong>3.</strong> Presiona <kbd style={{ background: '#e5e7eb', padding: '0 3px', borderRadius: 3 }}>Enter</kbd> y espera el mensaje de éxito
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.reg_verify_download_btn}
                      onClick={handleCheckAudit}
                      disabled={checkingAudit}
                      style={{ fontSize: '0.75rem', opacity: 0.85 }}
                    >
                      {checkingAudit ? 'Verificando...' : 'Ya lo ejecuté'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className={styles.reg_verify_coming}>Próximamente</span>
                <button type="button" className={styles.reg_verify_download_btn} disabled>Descargar</button>
              </>
            )}
          </div>

          {/* Android / iOS — coming soon */}
          {[
            { id: 'android', label: 'Android', icon: '🤖' },
            { id: 'ios',     label: 'iOS',     icon: '' },
          ].map((p) => (
            <div key={p.id} className={styles.reg_verify_tile}>
              <span className={styles.reg_verify_tile_icon}>{p.icon}</span>
              <strong>{p.label}</strong>
              <span className={styles.reg_verify_coming}>Próximamente</span>
              <button type="button" className={styles.reg_verify_download_btn} disabled>Descargar</button>
            </div>
          ))}
        </div>

        <div className={styles.reg_info_box}>
          <IconShield />
          <p>{t('regGar.step3.verifyInfo')}</p>
        </div>

        <div className={styles.reg_summary}>
          <h3>{t('regGar.step3.summary.title')}</h3>
          <div className={styles.reg_summary_grid}>
            <div><span>{t('regGar.step3.summary.device')}</span><strong>{catLabel}</strong></div>
            <div>
              <span>{t('regGar.step3.summary.brand')}</span>
              <strong>{brand} {model}{unknown ? ' *' : ''}</strong>
            </div>
            <div><span>{t('regGar.step3.summary.year')}</span><strong>{s1.manufacture_year}</strong></div>
            <div><span>{t('regGar.step3.summary.serial')}</span><strong>{s1.serial_number}</strong></div>
            <div><span>{t('regGar.step3.summary.condition')}</span><strong>{condLabelStr}</strong></div>
            <div><span>{t('regGar.step3.summary.processor')}</span><strong>{procLabel}</strong></div>
            <div><span>{t('regGar.step3.summary.ram')}</span><strong>{s2.ram}</strong></div>
            <div><span>{t('regGar.step3.summary.storage')}</span><strong>{s2.storage}</strong></div>
            {hasBattery && <div><span>{t('regGar.step3.summary.battery')}</span><strong>{s2.battery_health}%</strong></div>}
            <div><span>{t('regGar.step3.summary.photos')}</span><strong>{s3.photos.size} / 3</strong></div>
            {hasScreen && s2.screen_size && (
              <div><span>{t('regGar.step3.summary.screen')}</span><strong>{s2.screen_size}</strong></div>
            )}
            {s1.is_reconditioned && (
              <div><span>{t('regGar.step3.summary.reconditioned')}</span><strong>{t('regGar.step3.summary.reconditionedValue')}</strong></div>
            )}
          </div>
          {unknown && (
            <p className={styles.reg_summary_unknown}>
              {t('regGar.step3.summary.unknownNote')}
            </p>
          )}
        </div>

        <div className={styles.reg_legal}>
          <IconShield />
          <p>{t('regGar.step3.legal')}</p>
        </div>

        {submitError && (
          <p role="alert" className={styles.reg_error}>{submitError}</p>
        )}
      </div>
    )
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3]

  const stepTitles = [
    t('regGar.step0.title'),
    t('regGar.step1.title'),
    t('regGar.step2.title'),
    t('regGar.step3.title'),
  ]

  return (
    <div className={styles.reg_page}>

      <header className={styles.reg_header}>
        <span className={styles.reg_brand}>Jemacash</span>
        <button type="button" className={styles.reg_back_btn} onClick={onBack}>
          {t('regGar.back')}
        </button>
      </header>

      <div className={styles.reg_stepper}>
        {STEPS.map((label, i) => (
          <div key={label} className={styles.reg_step_item}>
            <div className={`${styles.reg_step_dot} ${i < step ? styles.reg_step_done : i === step ? styles.reg_step_active : styles.reg_step_pending}`}>
              {i < step ? <IconCheck /> : <span>{i + 1}</span>}
            </div>
            <span className={`${styles.reg_step_lbl} ${i === step ? styles.reg_step_lbl_active : ''}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`${styles.reg_step_line} ${i < step ? styles.reg_step_line_done : ''}`} />
            )}
          </div>
        ))}
      </div>

      <main className={styles.reg_main}>
        <div className={styles.reg_card}>
          <div className={styles.reg_card_head}>
            <div className={styles.reg_card_icon}>
              <IconLaptop />
            </div>
            <div>
              <h2 className={styles.reg_card_title}>{stepTitles[step]}</h2>
              <p className={styles.reg_card_subtitle}>{t('regGar.stepOf', { step: step + 1, total: STEPS.length })}</p>
            </div>
          </div>

          {stepRenderers[step]()}
        </div>
      </main>

      <div className={styles.reg_nav_bar}>
        <button
          type="button"
          className={styles.reg_nav_back}
          onClick={() => { if (step === 0) { clearFormDraft(); onBack() } else { setStep((s) => s - 1) } }}
        >
          {step === 0 ? t('regGar.cancel') : t('regGar.prev')}
        </button>

        <div className={styles.reg_nav_dots}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.reg_nav_dot} ${i === step ? styles.reg_nav_dot_active : i < step ? styles.reg_nav_dot_done : ''}`} />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className={styles.reg_nav_next}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            {t('regGar.next')} <IconChevron />
          </button>
        ) : (
          <button
            type="button"
            className={styles.reg_nav_submit}
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
          >
            {submitting ? t('regGar.registering') : t('regGar.register')}
          </button>
        )}
      </div>

      {imageSizeError && (
        <div
          className={styles.reg_modal_overlay}
          role="presentation"
          onClick={() => setImageSizeError(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="image-size-error-title"
            className={styles.reg_modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="image-size-error-title" className={styles.reg_modal_title}>
              Archivo demasiado grande
            </h3>
            <p className={styles.reg_modal_text}>{imageSizeError}</p>
            <div className={styles.reg_modal_actions}>
              <button
                type="button"
                className={styles.reg_modal_btn}
                onClick={() => setImageSizeError(null)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
