export const DEFAULT_LOCATION = 'RCF'

const DAY_MS = 24 * 60 * 60 * 1000

export function toIso(d) {
  return d.toISOString().slice(0, 10)
}

/** Date object (UTC midnight) for an ISO yyyy-mm-dd string. */
export function fromIso(iso) {
  return new Date(`${iso}T00:00:00Z`)
}

/** The Sunday on or after the given date (UTC-based; dates are calendar dates). */
export function nextSunday(from = new Date()) {
  const d = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()))
  const add = (7 - d.getUTCDay()) % 7
  return new Date(d.getTime() + add * DAY_MS)
}

/** count Sundays starting at startSunday (a Date), as ISO strings. */
export function sundayRange(startSunday, count) {
  const out = []
  for (let i = 0; i < count; i++) out.push(toIso(new Date(startSunday.getTime() + i * 7 * DAY_MS)))
  return out
}

export function addWeeks(date, weeks) {
  return new Date(date.getTime() + weeks * 7 * DAY_MS)
}

export function formatDate(iso) {
  return fromIso(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

export function formatShort(iso) {
  return fromIso(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function formatPhone(p) {
  if (!p) return ''
  const d = String(p).replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return p
}
