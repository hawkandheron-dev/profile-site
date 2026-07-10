import { formatDate, formatPhone } from './dates.js'

/**
 * Compose the day-before reminder message for a service.
 * Used by the roster "Copy reminder" button, the Reminders tab preview,
 * and mirrored by the worship-reminder edge function.
 *
 * assignments: [{ person: {display_name, phone}, role: {name} }] (assigned only)
 * songs: [{ song: {title}, slot, key_override, links: [{url,label}] }]
 */
export function composeReminder(service, assignments, songs) {
  const lines = []
  lines.push(`Worship reminder for ${formatDate(service.service_date)}${service.special ? ` (${service.special})` : ''}`)
  if (service.practice_time) lines.push(`Practice: ${service.practice_time}`)
  lines.push('')
  lines.push('Team:')
  for (const a of assignments) {
    lines.push(`- ${a.person.display_name}: ${a.role?.name || ''}`)
  }
  if (songs.length) {
    lines.push('')
    lines.push('Songs:')
    for (const s of songs) {
      const links = (s.links || []).map((l) => l.url)
      lines.push(`- ${s.song.title}${s.key_override ? ` (${s.key_override})` : ''}${links.length ? ' ' + links.join(' ') : ''}`)
    }
  }
  if (service.notes) {
    lines.push('')
    lines.push(`Notes: ${service.notes}`)
  }
  return lines.join('\n')
}

/** Comma-separated phone list — the spreadsheet formula, reborn. */
export function phoneList(assignments) {
  return assignments
    .map((a) => a.person.phone)
    .filter(Boolean)
    .map((p) => formatPhone(p))
    .join(', ')
}
