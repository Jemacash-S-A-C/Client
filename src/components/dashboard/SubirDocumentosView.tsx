import { useEffect, useRef, useState } from 'react'
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
  label: string
  description: string
  accepts: string
  required: boolean
}

const DOC_SLOTS: DocSlotCfg[] = [
  {
    type: 'dni',
    label: 'DNI / Documento de Identidad',
    description: 'Ambas caras del DNI vigente (JPG, PNG o PDF)',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'pay_stub',
    label: 'Boleta de Pago',
    description: 'Última boleta de pago o recibo de honorarios (PDF)',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'utility_bill',
    label: 'Recibo de Domicilio',
    description: 'Agua, luz o teléfono con dirección legible (máx. 3 meses)',
    accepts: 'image/*,.pdf',
    required: true,
  },
  {
    type: 'soat',
    label: 'SOAT Vigente',
    description: 'Solo si tu garantía es un vehículo',
    accepts: 'image/*,.pdf',
    required: false,
  },
  {
    type: 'vehicle_card',
    label: 'Tarjeta de Propiedad Vehicular',
    description: 'Solo si tu garantía es un vehículo',
    accepts: 'image/*,.pdf',
    required: false,
  },
  {
    type: 'other',
    label: 'Otro Documento',
    description: 'Cualquier otro respaldo adicional',
    accepts: 'image/*,.pdf,.doc,.docx',
    required: false,
  },
]

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',    color: '#d97706', bg: '#fef3c7' },
  reviewing: { label: 'En revisión',  color: '#2563eb', bg: '#dbeafe' },
  verified:  { label: 'Verificado',   color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { label: 'Rechazado',    color: '#dc2626', bg: '#fef2f2' },
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Upload slot ───────────────────────────────────────────────────────────────

interface SlotProps {
  cfg: DocSlotCfg
  uploaded: LoanDocument[]
  onUpload: (cfg: DocSlotCfg, file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function DocSlot({ cfg, uploaded, onUpload, onDelete }: SlotProps) {
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
    <div className={`${styles.slot} ${cfg.required ? styles.slot_required : ''}`}>
      <div className={styles.slot_header}>
        <div className={styles.slot_title_wrap}>
          <span className={styles.slot_icon}>
            {cfg.type === 'dni' || cfg.type === 'passport' ? <IconFile /> : <IconImage />}
          </span>
          <div>
            <strong className={styles.slot_label}>
              {cfg.label}
              {cfg.required && <span className={styles.required_dot}>*</span>}
            </strong>
            <span className={styles.slot_desc}>{cfg.description}</span>
          </div>
        </div>
        {uploaded.length === 0 && (
          <span className={`${styles.slot_badge} ${styles.slot_badge_missing}`}>Sin subir</span>
        )}
        {uploaded.length > 0 && (
          <span
            className={styles.slot_badge}
            style={{
              color: STATUS_CFG[uploaded[0].status].color,
              background: STATUS_CFG[uploaded[0].status].bg,
            }}
          >
            {STATUS_CFG[uploaded[0].status].label}
          </span>
        )}
      </div>

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
                <span>{fmtSize(doc.file_size)} · {fmtDate(doc.created_at)}</span>
              </div>
              <span
                className={styles.uploaded_status}
                style={{
                  color: STATUS_CFG[doc.status].color,
                  background: STATUS_CFG[doc.status].bg,
                }}
              >
                {STATUS_CFG[doc.status].label}
              </span>
              {doc.status !== 'verified' && (
                <button
                  type="button"
                  className={styles.delete_btn}
                  onClick={() => { void onDelete(doc.id) }}
                  aria-label="Eliminar documento"
                >
                  <IconTrash />
                </button>
              )}
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
        aria-label={`Subir ${cfg.label}`}
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
              {uploaded.length > 0 ? 'Reemplazar archivo' : 'Arrastra aquí o haz clic para subir'}
            </span>
            <span className={styles.dropzone_hint}>PDF, JPG o PNG · máx. 5 MB</span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SubirDocumentosView({ onBack }: { onBack?: () => void }) {
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
          <h1 className={styles.page_title}>Subir Documentos</h1>
          <p className={styles.page_sub}>
            Sube los documentos requeridos para agilizar la evaluación de tu solicitud.
          </p>
        </div>
        {onBack && (
          <button type="button" className={styles.back_btn} onClick={onBack}>
            ← Volver a Firma
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progress_card}>
        <div className={styles.progress_top}>
          <div className={styles.progress_label}>
            <strong>Documentos requeridos</strong>
            <span>{reqDone} de {required.length} completados</span>
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
            <span>Subidos</span>
          </div>
          <div>
            <strong>{verified}</strong>
            <span>Verificados</span>
          </div>
          <div>
            <strong>{total - verified}</strong>
            <span>En revisión</span>
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
          <strong>Documentos marcados con <span className={styles.required_dot_inline}>*</span> son obligatorios</strong>
          <p>Los documentos opcionales pueden acelerar la aprobación si tu solicitud incluye garantía vehicular.</p>
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
          <strong>Tus documentos están protegidos</strong>
          <p>Toda la información es encriptada y tratada bajo la normativa SBS Perú y la Ley N° 29733 de Protección de Datos Personales.</p>
        </div>
      </div>

    </div>
  )
}
