import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserSession } from '../../types/api.types'
import { createSignature, getSignature } from '../../services/signature.service'
import { getDocuments } from '../../services/document.service'
import { getApplication } from '../../services/application.service'
import {
  IconDocument,
  IconShield,
  IconCheck,
  IconRefresh,
  IconWarning,
} from './icons'
import styles from './FirmaVerificacionView.module.css'


const REQUIRED_DOCS: { type: string; label: string }[] = [
  { type: 'dni',          label: 'DNI / Documento de Identidad' },
  { type: 'pay_stub',     label: 'Boleta de Pago'               },
  { type: 'utility_bill', label: 'Recibo de Domicilio'          },
]

function SignaturePad({
  onSigned,
  onConfirm,
  disabled,
  t,
}: {
  onSigned: (v: boolean) => void
  onConfirm: (base64: string) => void
  disabled?: boolean
  t: (key: string) => string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.strokeStyle = '#1a221c'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasStrokes) { setHasStrokes(true); onSigned(true) }
  }

  function stopDraw() { drawing.current = false }

  function clear() {
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onSigned(false)
  }

  return (
    <div className={styles.sig_wrap}>
      <canvas
        ref={canvasRef}
        width={560}
        height={160}
        className={styles.sig_canvas}
        style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      {!hasStrokes && (
        <span className={styles.sig_placeholder}>{t('firma.pad.area')}</span>
      )}
      <div className={styles.sig_actions}>
        <button type="button" className={styles.sig_clear_btn} onClick={clear} disabled={disabled}>
          <IconRefresh /> {t('firma.pad.clear')}
        </button>
        <button
          type="button"
          className={`${styles.sig_confirm_btn} ${hasStrokes && !disabled ? styles.sig_confirm_active : ''}`}
          disabled={!hasStrokes || disabled}
          onClick={() => {
            if (!window.confirm(t('firma.pad.confirmDialog'))) return
            const base64 = canvasRef.current?.toDataURL('image/png') ?? ''
            onConfirm(base64)
          }}
        >
          <IconCheck /> {t('firma.pad.confirm')}
        </button>
      </div>
    </div>
  )
}

export function FirmaVerificacionView({
  onFinalize,
  onGoToDocuments,
  user,
  applicationId,
  approvedAmount,
}: {
  onFinalize: () => void
  onGoToDocuments: () => void
  user: UserSession
  applicationId?: string | null
  approvedAmount?: number | null
}) {
  const { t } = useTranslation()
  const [, setSigned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitDone, setSubmitDone] = useState(false)
  const [autoApproved, setAutoApproved] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)
  const [docsStatus, setDocsStatus] = useState<'loading' | 'ok' | 'missing'>('loading')
  const [missingDocs, setMissingDocs] = useState<string[]>([])
  /** Base64 of the drawn signature — set after "Confirmar Firma", before actual submission */
  const [capturedSignature, setCapturedSignature] = useState<string | null>(null)

  useEffect(() => {
    if (!applicationId) return
    getSignature(applicationId)
      .then(() => {
        setAlreadySigned(true)
        setAutoApproved(true) // always show the pickup coordination card
        setSubmitDone(true)
      })
      .catch(() => { /* no signature yet */ })
  }, [applicationId])

  useEffect(() => {
    getDocuments()
      .then(docs => {
        const uploaded = new Set(docs.map(d => d.document_type))
        const missing = REQUIRED_DOCS.filter(r => !uploaded.has(r.type)).map(r => r.label)
        setMissingDocs(missing)
        setDocsStatus(missing.length === 0 ? 'ok' : 'missing')
      })
      .catch(() => {
        setMissingDocs(REQUIRED_DOCS.map(r => r.label))
        setDocsStatus('missing')
      })
  }, [])

  // Pad is locked once signature is captured or the form is done
  const isSignedOrDone = alreadySigned || submitDone || !!capturedSignature
  const docsBlocking = docsStatus !== 'ok'

  const displayAmount = approvedAmount != null
    ? Number(approvedAmount).toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '—'

  /** Step 1 — user confirmed their drawing; store locally, don't hit API yet */
  function handleCapture(base64: string) {
    setSigned(true)
    setCapturedSignature(base64)
  }

  /** Step 2 — user clicked "Aceptar solicitud"; now submit to backend */
  async function handleSubmitSignature() {
    if (!capturedSignature || !applicationId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createSignature(applicationId, {
        signature_base64: capturedSignature,
        document_urls: [],
      })
      // Both approved and signed paths lead to pickup coordination — always show that card
      setAutoApproved(true)
      setSubmitDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar la firma.')
      // Let user retry — clear captured so they can re-draw if needed
      setCapturedSignature(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.frm_page}>

      {/* Header */}
      <header className={styles.frm_header}>
        <span className={styles.frm_brand}>Jemacash</span>
        <div className={styles.frm_header_right}>
          <span className={styles.frm_avatar}>{user.initials}</span>
        </div>
      </header>

      {/* Main */}
      <main className={styles.frm_main}>
        <div>
          <h1 className={styles.frm_title}>{t('firma.title')}</h1>
          <p className={styles.frm_sub}>{t('firma.subtitle')}</p>
        </div>

        <div className={styles.frm_grid}>

          {/* ── Left ── */}
          <div className={styles.frm_left}>

            {/* Resumen */}
            <div className={styles.frm_summary}>
              <div className={styles.frm_summary_head}>
                <span className={styles.frm_summary_icon}><IconDocument /></span>
                <strong>{t('firma.summary.title')}</strong>
              </div>
              <div className={styles.frm_summary_vals}>
                <div><span>{t('firma.summary.amount')}</span><strong>S/ {displayAmount}</strong></div>
                <div><span>{t('firma.summary.term')}</span><strong>{t('firma.summary.months')}</strong></div>
                <div><span>{t('firma.summary.tea')}</span><strong>18.5%</strong></div>
              </div>
            </div>

            {/* Contrato */}
            <div className={styles.frm_contract}>
              <div className={styles.frm_contract_head}>
                <div className={styles.frm_contract_title}>
                  <span className={styles.frm_contract_icon}><IconDocument /></span>
                  <strong>{t('firma.contract.title')}</strong>
                </div>
                <span className={styles.frm_page_badge}>{t('firma.contract.page')}</span>
              </div>
              <div className={styles.frm_contract_body}>
                <pre className={styles.frm_contract_text}>{t('firma.contract.text')}</pre>
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className={styles.frm_right}>

            {submitDone ? (
              autoApproved ? (
                /* ── Auto-approved panel ── */
                <div className={styles.frm_success_panel}>
                  <div className={styles.frm_success_icon_wrap} style={{ background: '#0f7d3f' }}>
                    <IconCheck />
                  </div>
                  <h2 className={styles.frm_success_title}>{t('firma.success.approved.title')}</h2>
                  <p className={styles.frm_success_desc}>{t('firma.success.approved.desc')}</p>

                  <div className={styles.frm_success_review_box}>
                    <span className={styles.frm_success_review_label}>{t('firma.success.approved.whatNow')}</span>
                    <ul className={styles.frm_success_review_list}>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.approved.item1')}</li>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.approved.item2')}</li>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.approved.item3')}</li>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.approved.item4')}</li>
                    </ul>
                  </div>

                  <p className={styles.frm_success_time} style={{ background: '#f0f9f2', borderColor: '#d9f0da', color: '#0f7d3f' }}>
                    <span className={styles.frm_success_clock}>📦</span>
                    {t('firma.success.approved.time')}
                  </p>
                </div>
              ) : (
                /* ── Manual review panel ── */
                <div className={styles.frm_success_panel}>
                  <div className={styles.frm_success_icon_wrap} style={{ background: '#b45309' }}>
                    <IconCheck />
                  </div>
                  <h2 className={styles.frm_success_title}>{t('firma.success.review.title')}</h2>
                  <p className={styles.frm_success_desc}>{t('firma.success.review.desc')}</p>

                  <div className={styles.frm_success_review_box}>
                    <span className={styles.frm_success_review_label}>{t('firma.success.review.whatNow')}</span>
                    <ul className={styles.frm_success_review_list}>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.review.item1')}</li>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.review.item2')}</li>
                      <li><span className={styles.frm_success_check}><IconCheck /></span>{t('firma.success.review.item3')}</li>
                    </ul>
                  </div>

                  <p className={styles.frm_success_time}>
                    <span className={styles.frm_success_clock}>⏱</span>
                    {t('firma.success.review.time')}
                  </p>
                </div>
              )
            ) : capturedSignature ? (
              /* ── Step 2: signature captured, waiting for user to accept ── */
              <div className={styles.frm_captured_panel}>
                <div className={styles.frm_captured_badge}>
                  <span className={styles.frm_captured_check}><IconCheck /></span>
                  <strong>{t('firma.captured')}</strong>
                </div>
                <p className={styles.frm_captured_desc}>{t('firma.capturedDesc')}</p>

                <img
                  src={capturedSignature}
                  alt="Vista previa de tu firma"
                  className={styles.frm_captured_img}
                />

                {submitError && (
                  <p role="alert" className={styles.frm_captured_error}>{submitError}</p>
                )}

                <div className={styles.frm_captured_actions}>
                  <button
                    type="button"
                    className={styles.frm_redo_btn}
                    onClick={() => { setCapturedSignature(null); setSigned(false) }}
                    disabled={submitting}
                  >
                    {t('firma.redoBtn')}
                  </button>
                  <button
                    type="button"
                    className={styles.frm_accept_btn}
                    onClick={handleSubmitSignature}
                    disabled={submitting}
                  >
                    {submitting ? t('firma.acceptSubmitting') : t('firma.acceptBtn')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Firma digital */}
                <div className={styles.frm_section}>
                  <h2 className={styles.frm_section_title}>{t('firma.pad.title')}</h2>
                  <p className={styles.frm_section_sub}>{t('firma.pad.sub')}</p>
                  <SignaturePad onSigned={setSigned} onConfirm={handleCapture} disabled={isSignedOrDone || docsBlocking} t={t} />
                  {docsBlocking && docsStatus !== 'loading' && (
                    <p style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '0.5rem' }}>
                      {t('firma.pad.docsBlocking')}
                    </p>
                  )}
                </div>

                {/* Documentos */}
                <div className={styles.frm_section}>
                  <h2 className={styles.frm_section_title}>{t('firma.docs.title')}</h2>

                  {docsStatus === 'loading' && (
                    <div className={styles.frm_docs_loading}>
                      <span className={styles.frm_docs_spinner} />
                      <span>{t('firma.docs.loading')}</span>
                    </div>
                  )}

                  {docsStatus === 'ok' && (
                    <div className={styles.frm_docs_ok}>
                      <span className={styles.frm_docs_ok_icon}><IconCheck /></span>
                      <div>
                        <strong>{t('firma.docs.ok.title')}</strong>
                        <span>{t('firma.docs.ok.desc')}</span>
                      </div>
                    </div>
                  )}

                  {docsStatus === 'missing' && (
                    <div className={styles.frm_docs_missing}>
                      <div className={styles.frm_docs_missing_head}>
                        <span className={styles.frm_docs_missing_icon}><IconWarning /></span>
                        <div>
                          <strong>{t('firma.docs.missing.title')}</strong>
                          <span>{t('firma.docs.missing.desc')}</span>
                        </div>
                      </div>
                      <ul className={styles.frm_docs_missing_list}>
                        {missingDocs.map(label => (
                          <li key={label}>{label}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className={styles.frm_docs_upload_btn}
                        onClick={onGoToDocuments}
                      >
                        {t('firma.docs.uploadBtn')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className={styles.frm_bottom_bar}>
        <div className={styles.frm_bottom_seals}>
          <div className={styles.frm_seal_item}>
            <span><IconShield /></span>
            <div><strong>{t('firma.seals.supervisedBy')}</strong><span>{t('firma.seals.sbs')}</span></div>
          </div>
          <div className={styles.frm_seal_item}>
            <span><IconShield /></span>
            <div><strong>{t('firma.seals.ssl')}</strong><span>{t('firma.seals.bit')}</span></div>
          </div>
        </div>
        <div className={styles.frm_actions_row}>
          {submitDone && (
            <button
              type="button"
              className={styles.frm_finalize_btn}
              onClick={onFinalize}
            >
              {autoApproved ? t('firma.finalizeApproved') : t('firma.finalizeComplete')}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
