import { type ReactElement, useState, useRef, useEffect } from 'react'
import type { UserSession } from '../../types/api.types'
import { createSignature, getSignature } from '../../services/signature.service'
import {
  IconDocument,
  IconShield,
  IconCheck,
  IconDownload,
  IconRefresh,
  IconPerson,
  IconWallet,
} from './icons'
import styles from './FirmaVerificacionView.module.css'

const CONTRACT_TEXT = `CONTRATO DE PRÉSTAMO DE DINERO

Conste por el presente documento el Contrato de Préstamo de Dinero que celebran de una parte JEMACASH S.A.C., con R.U.C. N° 20601234567, con domicilio en Lima, a quien en adelante se le denominará LA EMPRESA; y de la otra parte, el CLIENTE debidamente identificado con los datos proporcionados en la solicitud.

PRIMERA: OBJETO DEL CONTRATO. LA EMPRESA otorga un préstamo al CLIENTE por el monto especificado en el resumen del crédito. El CLIENTE se obliga a devolver dicho monto más los intereses pactados de acuerdo al cronograma de pagos.

SEGUNDA: INTERESES Y COMISIONES. Las partes acuerdan una Tasa Efectiva Anual (TEA) fija por la vigencia del crédito. En caso de mora, se aplicarán las tasas legales máximas permitidas por la Superintendencia de Banca y Seguros del Perú (SBS).

TERCERA: GARANTÍA. El CLIENTE autoriza el uso del activo registrado como garantía para respaldar la operación crediticia, de conformidad con la normativa vigente.

CUARTA: RESOLUCIÓN ANTICIPADA. El CLIENTE podrá cancelar anticipadamente el préstamo sin penalidad, previa comunicación formal a LA EMPRESA con no menos de 5 días hábiles de anticipación.`

const DOCS: { id: string; label: string; icon: () => ReactElement; colorClass: string }[] = [
  { id: 'dni_front',  label: 'DNI Frontal',      icon: IconPerson,   colorClass: 'blue'  },
  { id: 'dni_back',   label: 'DNI Posterior',    icon: IconWallet,   colorClass: 'blue'  },
  { id: 'selfie',     label: 'Selfie con DNI',   icon: IconPerson,   colorClass: 'dark'  },
  { id: 'contrato',   label: 'Contrato Firmado', icon: IconDocument, colorClass: 'green' },
]

function SignaturePad({
  onSigned,
  onConfirm,
  disabled,
}: {
  onSigned: (v: boolean) => void
  onConfirm: (base64: string) => void
  disabled?: boolean
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
        <span className={styles.sig_placeholder}>Área ✏️ Firma</span>
      )}
      <div className={styles.sig_actions}>
        <button type="button" className={styles.sig_clear_btn} onClick={clear} disabled={disabled}>
          <IconRefresh /> Limpiar
        </button>
        <button
          type="button"
          className={`${styles.sig_confirm_btn} ${hasStrokes && !disabled ? styles.sig_confirm_active : ''}`}
          disabled={!hasStrokes || disabled}
          onClick={() => {
            if (!window.confirm('¿Seguro que quiere registrar esta firma?')) return
            const base64 = canvasRef.current?.toDataURL('image/png') ?? ''
            onConfirm(base64)
          }}
        >
          <IconCheck /> Confirmar Firma
        </button>
      </div>
    </div>
  )
}

export function FirmaVerificacionView({
  onBack,
  onFinalize,
  user,
  applicationId,
  approvedAmount,
}: {
  onBack: () => void
  onFinalize: () => void
  user: UserSession
  applicationId?: string | null
  approvedAmount?: number | null
}) {
  const [, setSigned] = useState(false)
  const [uploaded, setUploaded] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitDone, setSubmitDone] = useState(false)
  const [alreadySigned, setAlreadySigned] = useState(false)

  useEffect(() => {
    if (!applicationId) return
    getSignature(applicationId)
      .then(() => { setAlreadySigned(true); setSubmitDone(true) })
      .catch(() => { /* no signature yet */ })
  }, [applicationId])

  const isSignedOrDone = alreadySigned || submitDone

  const displayAmount = approvedAmount != null
    ? Number(approvedAmount).toLocaleString('es-PE', { minimumFractionDigits: 2 })
    : '—'

  function toggleDoc(id: string) {
    setUploaded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleConfirmSignature(base64: string) {
    setSigned(true)
    if (!applicationId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createSignature(applicationId, {
        signature_base64: base64,
        document_urls: Array.from(uploaded).map((id) => `mock://${id}`),
      })
      setSubmitDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar la firma.')
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
          <h1 className={styles.frm_title}>Firma y Verificación de Identidad</h1>
          <p className={styles.frm_sub}>
            Por favor, revisa tu contrato y completa la verificación de identidad para proceder con el desembolso de tu préstamo.
          </p>
        </div>

        <div className={styles.frm_grid}>

          {/* ── Left ── */}
          <div className={styles.frm_left}>

            {/* Resumen */}
            <div className={styles.frm_summary}>
              <div className={styles.frm_summary_head}>
                <span className={styles.frm_summary_icon}><IconDocument /></span>
                <strong>Resumen del préstamo</strong>
              </div>
              <div className={styles.frm_summary_vals}>
                <div><span>Monto</span><strong>S/ {displayAmount}</strong></div>
                <div><span>Plazo</span><strong>12 meses</strong></div>
                <div><span>TEA</span><strong>18.5%</strong></div>
              </div>
            </div>

            {/* Contrato */}
            <div className={styles.frm_contract}>
              <div className={styles.frm_contract_head}>
                <div className={styles.frm_contract_title}>
                  <span className={styles.frm_contract_icon}><IconDocument /></span>
                  <strong>Contrato de Crédito</strong>
                </div>
                <span className={styles.frm_page_badge}>PÁG 1 DE 8</span>
              </div>
              <div className={styles.frm_contract_body}>
                <pre className={styles.frm_contract_text}>{CONTRACT_TEXT}</pre>
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className={styles.frm_right}>

            {/* Firma digital */}
            <div className={styles.frm_section}>
              <h2 className={styles.frm_section_title}>Módulo de Firma Digital</h2>
              <p className={styles.frm_section_sub}>Dibuja tu firma tal como aparece en tu DNI</p>
              <SignaturePad onSigned={setSigned} onConfirm={handleConfirmSignature} disabled={isSignedOrDone} />
              {isSignedOrDone && (
                <p style={{ fontSize: '0.8rem', color: '#0f7d3f', marginTop: '0.5rem' }}>
                  Firma ya registrada
                </p>
              )}
              {submitting && (
                <p style={{ fontSize: '0.8rem', color: '#0f7d3f', marginTop: '0.5rem' }}>
                  Guardando firma…
                </p>
              )}
              {submitError && (
                <p role="alert" style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.5rem' }}>
                  {submitError}
                </p>
              )}
            </div>

            {/* Documentos */}
            <div className={styles.frm_section}>
              <h2 className={styles.frm_section_title}>Centro de Carga de Documentos</h2>
              <div className={styles.frm_docs_grid}>
                {DOCS.map((doc) => {
                  const DocIcon = doc.icon
                  const done = uploaded.has(doc.id)
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      className={`${styles.frm_doc_card} ${done ? styles.frm_doc_done : ''}`}
                      onClick={() => toggleDoc(doc.id)}
                    >
                      <span className={[
                        styles.frm_doc_icon,
                        done ? styles.frm_doc_icon_done : styles[`frm_doc_icon_${doc.colorClass}` as keyof typeof styles],
                      ].join(' ')}>
                        <DocIcon />
                      </span>
                      <div className={styles.frm_doc_info}>
                        <strong>{doc.label}</strong>
                        <span className={done ? styles.frm_doc_cargado : styles.frm_doc_pendiente}>
                          {done ? 'CARGADO' : 'PENDIENTE'}
                        </span>
                      </div>
                      <span className={styles.frm_doc_upload}>
                        {done ? <IconCheck /> : <IconDownload />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className={styles.frm_bottom_bar}>
        <div className={styles.frm_bottom_seals}>
          <div className={styles.frm_seal_item}>
            <span><IconShield /></span>
            <div><strong>SUPERVISADO POR</strong><span>LA SBS</span></div>
          </div>
          <div className={styles.frm_seal_item}>
            <span><IconShield /></span>
            <div><strong>SSL CERTIFIED</strong><span>256-BIT</span></div>
          </div>
        </div>
        <button
          type="button"
          className={styles.frm_finalize_btn}
          onClick={submitDone ? onFinalize : onBack}
          disabled={submitting}
        >
          {submitDone ? 'Solicitud Completada ✓' : 'Finalizar y Solicitar Desembolso →'}
        </button>
      </div>

    </div>
  )
}
