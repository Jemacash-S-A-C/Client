import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleFormat } from '../../utils/tz'
import type { LoanDocument, DocumentType } from '../../types/api.types'
import {
  getDocumentsByApplication,
  uploadDocument,
  deleteDocument,
  fileToBase64,
} from '../../services/document.service'
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

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────

interface DocCfg {
  type: DocumentType
  label: string
  desc: string
  accepts: string
}

const REQUIRED_DOCS: DocCfg[] = [
  { type: 'dni',          label: 'DNI / Documento de Identidad', desc: 'Ambas caras del DNI vigente',              accepts: 'image/*,.pdf' },
  { type: 'pay_stub',     label: 'Boleta de Pago',               desc: 'Última boleta o recibo de honorarios',     accepts: 'image/*,.pdf' },
  { type: 'utility_bill', label: 'Recibo de Domicilio',          desc: 'Agua, luz o teléfono — máx. 3 meses',      accepts: 'image/*,.pdf' },
]

const OPTIONAL_DOCS: DocCfg[] = [
  { type: 'other', label: 'Documento adicional', desc: 'Cualquier respaldo complementario', accepts: 'image/*,.pdf,.doc,.docx' },
]

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',   color: '#d97706', bg: '#fef3c7' },
  reviewing: { label: 'En revisión', color: '#2563eb', bg: '#dbeafe' },
  verified:  { label: 'Verificado',  color: '#0f7d3f', bg: '#d9f0da' },
  rejected:  { label: 'Rechazado',   color: '#dc2626', bg: '#fef2f2' },
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ── Single doc row ────────────────────────────────────────────────────────────

interface DocRowProps {
  cfg: DocCfg
  applicationId: string
  uploaded: LoanDocument[]
  onUpload: (cfg: DocCfg, file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function DocRow({ cfg, applicationId: _applicationId, uploaded, onUpload, onDelete }: DocRowProps) {
  const { fmtShort } = useLocaleFormat()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const primary = uploaded[0] ?? null
  const isDone = uploaded.length > 0

  const handleFile = async (file: File) => {
    setLoading(true)
    try { await onUpload(cfg, file) } finally { setLoading(false) }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  return (
    <div className={`${styles.doc_row} ${isDone ? styles.doc_row_done : ''}`}>
      {/* Status dot */}
      <div className={`${styles.doc_dot} ${isDone ? styles.doc_dot_done : ''}`}>
        {isDone && <IconCheck />}
      </div>

      {/* Info */}
      <div className={styles.doc_info}>
        <strong className={styles.doc_label}>{cfg.label}</strong>
        <span className={styles.doc_desc}>{cfg.desc}</span>

        {/* Uploaded file(s) */}
        {uploaded.length > 0 && (
          <div className={styles.doc_files}>
            {uploaded.map(doc => (
              <div key={doc.id} className={styles.doc_file_chip}>
                <span className={styles.doc_file_icon}><IconFile /></span>
                <span className={styles.doc_file_name}>{doc.original_name}</span>
                <span className={styles.doc_file_size}>{fmtSize(doc.file_size)}</span>
                {primary && (
                  <span
                    className={styles.doc_file_status}
                    style={{
                      color: STATUS_CFG[doc.status]?.color,
                      background: STATUS_CFG[doc.status]?.bg,
                    }}
                  >
                    {STATUS_CFG[doc.status]?.label ?? doc.status}
                  </span>
                )}
                <span className={styles.doc_file_date}>{fmtShort(doc.created_at)}</span>
                <button
                  type="button"
                  className={styles.doc_file_delete}
                  onClick={() => void onDelete(doc.id)}
                  aria-label="Eliminar"
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload zone */}
      <div
        className={`${styles.doc_upload} ${dragging ? styles.doc_upload_over : ''} ${loading ? styles.doc_upload_loading : ''}`}
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
          className={styles.doc_upload_input}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        {loading
          ? <span className={styles.doc_upload_spinner} />
          : <><span className={styles.doc_upload_icon}><IconUpload /></span><span>{isDone ? 'Reemplazar' : 'Subir'}</span></>
        }
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SubirDocumentosView({
  applicationId,
  onBack,
  onContinue,
}: {
  applicationId: string
  onBack?: () => void
  onContinue?: () => void
}) {
  const { t } = useTranslation()
  const [docs, setDocs] = useState<LoanDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDocumentsByApplication(applicationId)
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [applicationId])

  const handleUpload = async (cfg: DocCfg, file: File) => {
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const doc = await uploadDocument({
        document_type: cfg.type,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        content_base64: base64,
        application_id: applicationId,
      })
      setDocs(prev => [doc, ...prev.filter(d => d.id !== doc.id)])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo')
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

  const reqDone = REQUIRED_DOCS.filter(cfg =>
    docs.some(d => d.document_type === cfg.type),
  ).length
  const allRequiredDone = reqDone === REQUIRED_DOCS.length

  return (
    <div className={styles.page}>

      {/* ── Header bar ── */}
      <header className={styles.header}>
        <span className={styles.header_brand}>Jemacash</span>
        <span className={styles.header_step}>
          Documentos requeridos · {reqDone}/{REQUIRED_DOCS.length}
        </span>
      </header>

      {/* ── Content ── */}
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{t('docs.title')}</h1>
          <p className={styles.subtitle}>
            Necesitamos verificar tu identidad e ingresos antes de proceder con la firma del contrato.
            Sube los tres documentos requeridos.
          </p>
        </div>

        {/* Progress strip */}
        <div className={styles.progress_strip}>
          <div
            className={styles.progress_fill}
            style={{ width: `${(reqDone / REQUIRED_DOCS.length) * 100}%` }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className={styles.error_banner}>
            ⚠ {error}
            <button type="button" className={styles.error_close} onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Required docs */}
        <section>
          <p className={styles.section_label}>DOCUMENTOS OBLIGATORIOS</p>
          {loading ? (
            <div className={styles.skeleton_list}>
              {REQUIRED_DOCS.map((_, i) => <div key={i} className={styles.skeleton_item} />)}
            </div>
          ) : (
            <div className={styles.doc_list}>
              {REQUIRED_DOCS.map(cfg => (
                <DocRow
                  key={cfg.type}
                  cfg={cfg}
                  applicationId={applicationId}
                  uploaded={docs.filter(d => d.document_type === cfg.type)}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Optional docs */}
        {!loading && (
          <section>
            <p className={styles.section_label}>DOCUMENTOS OPCIONALES</p>
            <div className={styles.doc_list}>
              {OPTIONAL_DOCS.map(cfg => (
                <DocRow
                  key={cfg.type}
                  cfg={cfg}
                  applicationId={applicationId}
                  uploaded={docs.filter(d => d.document_type === cfg.type)}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Hint when not all required */}
        {!loading && !allRequiredDone && onContinue && (
          <p className={styles.pending_hint}>
            Faltan {REQUIRED_DOCS.length - reqDone} documento{REQUIRED_DOCS.length - reqDone !== 1 ? 's' : ''} para continuar.
          </p>
        )}
      </main>

      {/* ── Bottom navigation bar ── */}
      <footer className={styles.footer}>
        <div className={styles.footer_seals}>
          <span>🔒 Cifrado AES-256</span>
          <span>·</span>
          <span>Normativa SBS Perú</span>
        </div>
        <div className={styles.footer_actions}>
          {onBack && (
            <button type="button" className={styles.back_btn} onClick={onBack}>
              <IconArrowLeft /> Volver
            </button>
          )}
          {onContinue && (
            <button
              type="button"
              className={`${styles.continue_btn} ${allRequiredDone ? styles.continue_btn_active : ''}`}
              disabled={!allRequiredDone}
              onClick={onContinue}
            >
              Continuar a la Firma →
            </button>
          )}
        </div>
      </footer>

    </div>
  )
}
