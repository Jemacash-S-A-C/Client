export function formatPenSoles(value: string): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) {
    return ''
  }
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(n)
}
