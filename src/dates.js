// Dates are stored as 'YYYY-MM-DD'; parse them as local dates so they never shift a day.
export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return parseDate(iso).toLocaleDateString('en-US', opts)
}

export function todayISO() {
  const t = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

export function daysUntil(iso) {
  return Math.round((parseDate(iso) - parseDate(todayISO())) / 86400000)
}
