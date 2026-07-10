import { useCallback, useEffect, useState } from 'react'
import { nextSunday, toIso, formatDate, formatShort } from '../lib/dates.js'
import { composeReminder, phoneList } from '../lib/reminder.js'
import { DEFAULT_LOCATION } from '../lib/dates.js'

export default function RemindersTab({ api }) {
  const [preview, setPreview] = useState(null)
  const [log, setLog] = useState([])
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)
  const date = toIso(nextSunday())

  const reload = useCallback(async () => {
    try {
      await api.ensureServices([date])
      const services = await api.loadServices(date, date)
      const service = services.find((s) => s.location === DEFAULT_LOCATION) || services[0]
      if (!service) { setPreview({ missing: true }); return }
      const [people, roles, songs] = await Promise.all([
        api.loadPeople(), api.loadRoles(), api.loadServiceSongs(service.id),
      ])
      const peopleById = new Map(people.map((p) => [p.id, p]))
      const rolesById = new Map(roles.map((r) => [r.id, r]))
      const assigned = service.assignments
        .filter((a) => a.status === 'assigned')
        .map((a) => ({ person: peopleById.get(a.person_id), role: rolesById.get(a.role_id) }))
        .filter((a) => a.person)
        .sort((a, b) => (a.role?.sort_order || 0) - (b.role?.sort_order || 0))
      setPreview({
        service,
        assigned,
        text: composeReminder(service, assigned, songs),
        phones: phoneList(assigned),
        emails: assigned.map((a) => a.person.email).filter(Boolean),
      })
      setLog(await api.loadReminderLog())
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }, [api, date])

  useEffect(() => { reload() }, [reload])

  async function copy() {
    await navigator.clipboard.writeText(preview.text + '\n\nPhones: ' + preview.phones)
    setStatus('Copied to clipboard.')
    try {
      await api.logReminder(preview.service.id, 'copy',
        preview.assigned.map((a) => ({ name: a.person.display_name, phone: a.person.phone || null })))
      setLog(await api.loadReminderLog())
    } catch { /* best-effort */ }
  }

  async function sendNow(dryRun) {
    setSending(true)
    setStatus(null)
    try {
      const res = await api.sendReminderNow(date, dryRun)
      setStatus(dryRun
        ? `Dry run OK — would email ${res?.email_recipients?.length ?? 0} people.`
        : `Sent — emailed ${res?.email_recipients?.length ?? 0} people.`)
      setLog(await api.loadReminderLog())
    } catch (e) {
      setStatus(`Send failed: ${e.message}. (Is the worship-reminder edge function deployed with RESEND_API_KEY set?)`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="reminders">
      <h2>Next Sunday: {formatDate(date)}</h2>
      <p className="hint">
        The scheduled job sends this automatically on Saturday mornings (9am ET) to
        everyone assigned for the next day. You can also copy it or trigger it manually here.
      </p>
      {status && <p className="status">{status}</p>}
      {preview?.missing && <p className="empty">No service found for {date}.</p>}
      {preview?.text && (
        <>
          <pre className="reminder-preview">{preview.text}</pre>
          <div className="reminder-meta">
            <div><strong>Phone list:</strong> {preview.phones || '(none on file)'}</div>
            <div><strong>Email recipients:</strong> {preview.emails.join(', ') || '(none on file)'}</div>
          </div>
          <div className="edit-actions">
            <button className="primary" onClick={copy}>Copy message + phones</button>
            <button onClick={() => sendNow(true)} disabled={sending}>Dry-run send</button>
            <button onClick={() => sendNow(false)} disabled={sending}>Send email now</button>
          </div>
        </>
      )}

      <h3>Send log</h3>
      <table className="log-table">
        <thead>
          <tr><th>When</th><th>Service</th><th>Channel</th><th>Recipients</th><th>Status</th></tr>
        </thead>
        <tbody>
          {log.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.sent_at).toLocaleString()}</td>
              <td>{l.service?.service_date ? formatShort(l.service.service_date) : '—'}</td>
              <td>{l.channel}</td>
              <td>{Array.isArray(l.recipients) ? l.recipients.length : 0}</td>
              <td>{l.status}{l.error ? ` — ${l.error}` : ''}</td>
            </tr>
          ))}
          {!log.length && <tr><td colSpan={5} className="empty">Nothing sent yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
