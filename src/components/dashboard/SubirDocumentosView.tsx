import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleFormat } from '../../utils/tz'
import type { LoanDocument, DocumentType } from '../../types/api.types'
import { getDocuments, uploadDocument, deleteDocument, fileToBase64 } from '../../services/document.service'
import { IconCheck, IconWarning, IconPlus } from './icons'
import styles from './SubirDocumentosView.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16v1a4 4 0 004 4h10a4 4 0 004-4v-1" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Document category config ──────────────────────────────────────────────────

interface DocSlotCfg {
  type: DocumentType
  labelKey: string
  descKey: string
  accepts: string
  required: boolean
  soon?: boolean
}

const DOC_SLOTS: DocSlotCfg[] = [
  {
    type: 'dni',
    labelKey: 'docs.slot.dni.label',
    descKey:  'docs.slot.dni.desc',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'pay_stub',
    labelKey: 'docs.slot.payStub.label',
    descKey:  'docs.slot.payStub.desc',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'utility_bill',
    labelKey: 'docs.slot.utilityBill.label',
    descKey:  'docs.slot.utilityBill.desc',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'soat',
    labelKey: 'docs.slot.soat.label',
    descKey:  'docs.slot.soat.desc',
    accepts: 'image/*,.pdf',
    required: false,
    soon: true,
  },
  {
    type: 'vehicle_card',
    labelKey: 'docs.slot.vehicleCard.label',
    descKey:  'docs.slot.vehicleCard.desc',
    accepts: 'image/*,.pdf',
    required: false,
    soon: true,
  },
  {
    type: 'other',
    labelKey: 'docs.slot.other.label',
    descKey:  'docs.slot.other.desc',
    accepts: 'image/*,.pdf,.doc,.docx',
    required: false,
  },
]

const STATUS_COLOR_CFG: Record<string, { color: string; bg: string }> = {
  pending:   { color: '#d97706', bg: '#fef3c7' },
  reviewing: { color: '#2563eb', bg: '#dbeafe' },
  verified:  { color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { color: '#dc2626', bg: '#fef2f2' },
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  pending:   'docs.status.pending',
  reviewing: 'docs.status.reviewing',
  verified:  'docs.status.verified',
  rejected:  'docs.status.rejected',
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Upload slot ───────────────────────────────────────────────────────────────

interface SlotProps {
  cfg: DocSlotCfg
  uploaded: LoanDocument[]
  onUpload: (cfg: DocSlotCfg, file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function DocSlot({ cfg, uploaded, onUpload, onDelete }: SlotProps) {
  const { t } = useTranslation()
  const { fmtShort } = useLocaleFormat()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File) => {
    setLoading(true)
    try { await onUpload(cfg, file) } finally { setLoading(false) }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { void handleFile(file) }
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) { void handleFile(file) }
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <div className={`${styles.slot} ${cfg.required ? styles.slot_required : ''} ${cfg.soon ? styles.slot_disabled : ''}`}>
      <div className={styles.slot_header}>
        <div className={styles.slot_title_wrap}>
          <span className={styles.slot_icon}>
            {cfg.type === 'dni' || cfg.type === 'passport' ? <IconFile /> : <IconImage />}
          </span>
          <div>
            <strong className={styles.slot_label}>{t(cfg.labelKey)}</strong>
            <span className={styles.slot_desc}>{t(cfg.descKey)}</span>
          </div>
        </div>
        <span className={`${styles.slot_badge} ${cfg.soon ? styles.slot_badge_soon : styles.slot_badge_missing}`}>
          {cfg.soon ? t('docs.status.comingSoon') : uploaded.length === 0 ? t('docs.status.notUploaded') : (
            <span style={{ color: STATUS_COLOR_CFG[uploaded[0].status]?.color }}>
              {t(STATUS_LABEL_KEYS[uploaded[0].status] ?? 'docs.status.pending')}
            </span>
          )}
        </span>
      </div>

      {cfg.soon ? (
        <div className={styles.slot_soon_body}>
          {t('docs.soon.available')}
        </div>
      ) : (
        <>
          {/* Uploaded files */}
          {uploaded.length > 0 && (
            <div className={styles.uploaded_list}>
              {uploaded.map(doc => (
                <div key={doc.id} className={styles.uploaded_row}>
                  <span className={styles.uploaded_icon}>
                    {isImage(doc.mime_type) ? <IconImage /> : <IconFile />}
                  </span>
                  <div className={styles.uploaded_info}>
                    <strong>{doc.original_name}</strong>
                    <span>{fmtSize(doc.file_size)} · {fmtShort(doc.created_at)}</span>
                  </div>
                  <span
                    className={styles.uploaded_status}
                    style={{
                      color: STATUS_COLOR_CFG[doc.status]?.color,
                      background: STATUS_COLOR_CFG[doc.status]?.bg,
                    }}
                  >
                    {t(STATUS_LABEL_KEYS[doc.status] ?? 'docs.status.pending')}
                  </span>
                  <button
                    type="button"
                    className={styles.delete_btn}
                    onClick={() => { void onDelete(doc.id) }}
                    aria-label={t('docs.deleteLabel')}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`${styles.dropzone} ${dragging ? styles.dropzone_over : ''} ${loading ? styles.dropzone_loading : ''}`}
            onClick={() => !loading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && !loading && inputRef.current?.click()}
            aria-label={t(cfg.labelKey)}
          >
            <input
              ref={inputRef}
              type="file"
              accept={cfg.accepts}
              className={styles.file_input}
              onChange={onInputChange}
            />
            {loading ? (
              <span className={styles.dropzone_spinner} />
            ) : (
              <>
                <span className={styles.dropzone_icon}><IconUpload /></span>
                <span className={styles.dropzone_text}>
                  {uploaded.length > 0 ? t('docs.dropzone.replace') : t('docs.dropzone.upload')}
                </span>
                <span className={styles.dropzone_hint}>{t('docs.dropzone.hint')}</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SubirDocumentosView({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation()
  const [docs, setDocs] = useState<LoanDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDocuments()
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (cfg: DocSlotCfg, file: File) => {
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const doc = await uploadDocument({
        document_type: cfg.type,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        content_base64: base64,
      })
      setDocs(prev => [doc, ...prev])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir el archivo'
      setError(msg)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteDocument(id)
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch {
      setError('No se pudo eliminar el documento')
    }
  }

  const verified  = docs.filter(d => d.status === 'verified').length
  const total     = docs.length
  const required  = DOC_SLOTS.filter(s => s.required)
  const reqDone   = required.filter(s => docs.some(d => d.document_type === s.type)).length

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.page_header}>
        <div>
          <h1 className={styles.page_title}>{t('docs.title')}</h1>
          <p className={styles.page_sub}>{t('docs.subtitle')}</p>
        </div>
        {onBack && (
          <button type="button" className={styles.back_btn} onClick={onBack}>
            {t('docs.backToSign')}
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progress_card}>
        <div className={styles.progress_top}>
          <div className={styles.progress_label}>
            <strong>{t('docs.progress.title')}</strong>
            <span>{t('docs.progress.completed', { done: reqDone, total: required.length })}</span>
          </div>
          <span className={styles.progress_pct}>{Math.round((reqDone / required.length) * 100)}%</span>
        </div>
        <div className={styles.progress_bar_bg}>
          <div
            className={styles.progress_bar_fill}
            style={{ width: `${(reqDone / required.length) * 100}%` }}
          />
        </div>
        <div className={styles.progress_stats}>
          <div>
            <strong>{total}</strong>
            <span>{t('docs.progress.uploaded')}</span>
          </div>
          <div>
            <strong>{verified}</strong>
            <span>{t('docs.progress.verified')}</span>
          </div>
          <div>
            <strong>{total - verified}</strong>
            <span>{t('docs.progress.inReview')}</span>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className={styles.error_banner}>
          <IconWarning />
          {error}
          <button type="button" className={styles.error_close} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ── Notice ── */}
      <div className={styles.notice_banner}>
        <span className={styles.notice_icon}><IconCheck /></span>
        <div>
          <strong>{t('docs.notice.title')}</strong>
          <p>{t('docs.notice.desc')}</p>
        </div>
      </div>

      {/* ── Slots ── */}
      {loading ? (
        <div className={styles.skeleton_list}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton_slot} />)}
        </div>
      ) : (
        <div className={styles.slots_list}>
          {DOC_SLOTS.map(cfg => (
            <DocSlot
              key={cfg.type}
              cfg={cfg}
              uploaded={docs.filter(d => d.document_type === cfg.type)}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Info seal ── */}
      <div className={styles.seal_banner}>
        <div className={styles.seal_icon_wrap}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.seal_svg}>
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
              stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <strong>{t('docs.seal.title')}</strong>
          <p>{t('docs.seal.desc')}</p>
        </div>
      </div>

    </div>
  )
}
