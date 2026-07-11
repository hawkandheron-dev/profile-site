import { useCallback, useEffect, useMemo, useState } from 'react'
import { nextSunday, sundayRange, addWeeks, formatShort, toIso } from '../lib/dates.js'
import { composeReminder, phoneList } from '../lib/reminder.js'

const WINDOW_WEEKS = 12
const STATUS_OPTIONS = [
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'tentative', label: 'Tentative' },
  { value: 'available', label: 'Available' },
]

const SORTS = [
  { value: 'roster', label: 'Roster order' },
  { value: 'last-asc', label: 'Last name A→Z' },
  { value: 'last-desc', label: 'Last name Z→A' },
  { value: 'availability', label: 'Availability' },
]

// availability sort: assigned (green) on top, blank in the middle,
// unavailable at the bottom
const AVAILABILITY_RANK = { assigned: 0, tentative: 1, available: 2, unavailable: 4 }
const BLANK_RANK = 3

export default function RosterTab({ api }) {
  const [people, setPeople] = useState([])
  const [roles, setRoles] = useState([])
  const [teams, setTeams] = useState([])
  const [services, setServices] = useState([])
  const [startSunday, setStartSunday] = useState(() => addWeeks(nextSunday(), -1))
  const [status, setStatus] = useState('Loading…')
  const [copied, setCopied] = useState(null)
  const [sort, setSort] = useState('roster')
  const [anchorDate, setAnchorDate] = useState(() => toIso(nextSunday()))

  const dates = useMemo(() => sundayRange(startSunday, WINDOW_WEEKS), [startSunday])

  const reload = useCallback(async () => {
    try {
      await api.ensureServices(dates)
      const [p, r, t, s] = await Promise.all([
        api.loadPeople(),
        api.loadRoles(),
        api.loadTeams(),
        api.loadServices(dates[0], dates[dates.length - 1]),
      ])
      setPeople(p)
      setRoles(r)
      setTeams(t)
      setServices(s)
      setStatus(null)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }, [api, dates])

  useEffect(() => { reload() }, [reload])

  const rolesById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles])
  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const serviceByDate = useMemo(() => new Map(services.map((s) => [s.service_date, s])), [services])

  const activePeople = useMemo(() => {
    const rows = people.filter((p) => p.status !== 'inactive')
    const lastName = (p) => (p.last_name || p.display_name).toLowerCase()
    if (sort === 'last-asc' || sort === 'last-desc') {
      rows.sort((a, b) =>
        lastName(a).localeCompare(lastName(b)) ||
        (a.first_name || '').localeCompare(b.first_name || ''))
      if (sort === 'last-desc') rows.reverse()
    } else if (sort === 'availability') {
      const svc = serviceByDate.get(anchorDate)
      const rank = (p) => {
        const a = svc?.assignments?.find((x) => x.person_id === p.id)
        return a ? AVAILABILITY_RANK[a.status] ?? BLANK_RANK : BLANK_RANK
      }
      rows.sort((a, b) => rank(a) - rank(b) || lastName(a).localeCompare(lastName(b)))
    }
    return rows
  }, [people, sort, anchorDate, serviceByDate])

  async function onCellChange(service, person, value) {
    try {
      if (value === '') {
        await api.clearAssignment(service.id, person.id)
      } else if (value.startsWith('role:')) {
        await api.setAssignment(service.id, person.id, { roleId: Number(value.slice(5)), status: 'assigned' })
      } else {
        await api.setAssignment(service.id, person.id, { status: value })
      }
      const s = await api.loadService(service.id)
      setServices((prev) => prev.map((x) => (x.id === s.id ? s : x)))
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function onApplyTeam(service, teamId) {
    if (!teamId) return
    const team = teams.find((t) => t.id === teamId)
    try {
      await api.applyTeam(service, team, service.assignments)
      const s = await api.loadService(service.id)
      setServices((prev) => prev.map((x) => (x.id === s.id ? s : x)))
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function onCopyReminder(service) {
    const assigned = service.assignments
      .filter((a) => a.status === 'assigned')
      .map((a) => ({ person: peopleById.get(a.person_id), role: rolesById.get(a.role_id) }))
      .filter((a) => a.person)
      .sort((a, b) => (a.role?.sort_order || 0) - (b.role?.sort_order || 0))
    let songs = []
    try { songs = await api.loadServiceSongs(service.id) } catch { /* songs optional */ }
    const text = composeReminder(service, assigned, songs) + '\n\nPhones: ' + phoneList(assigned)
    await navigator.clipboard.writeText(text)
    setCopied(service.id)
    setTimeout(() => setCopied(null), 2500)
    try {
      await api.logReminder(service.id, 'copy', assigned.map((a) => ({
        name: a.person.display_name, phone: a.person.phone || null,
      })))
    } catch { /* log is best-effort */ }
  }

  function cellValue(service, personId) {
    const a = service?.assignments?.find((x) => x.person_id === personId)
    if (!a) return ''
    return a.status === 'assigned' ? `role:${a.role_id}` : a.status
  }

  return (
    <div className="roster">
      <div className="toolbar">
        <button onClick={() => setStartSunday((s) => addWeeks(s, -4))}>← Earlier</button>
        <span>{formatShort(dates[0])} – {formatShort(dates[dates.length - 1])}</span>
        <button onClick={() => setStartSunday((s) => addWeeks(s, 4))}>Later →</button>
        <button onClick={() => setStartSunday(addWeeks(nextSunday(), -1))}>Today</button>
        <label>Sort:&nbsp;
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        {sort === 'availability' && <span className="meta">by {formatShort(anchorDate)} — click a date to change</span>}
        {status && <span className="status">{status}</span>}
      </div>
      <div className="grid-scroll">
        <table className="roster-grid">
          <thead>
            <tr>
              <th className="sticky-col">Musician</th>
              {dates.map((d) => {
                const svc = serviceByDate.get(d)
                const isNext = d === toIso(nextSunday())
                return (
                  <th key={d} className={isNext ? 'next-sunday' : ''}>
                    <div
                      className={sort === 'availability' && d === anchorDate ? 'col-date sort-anchor' : 'col-date'}
                      title="Click to sort by this week's availability"
                      onClick={() => { setAnchorDate(d); setSort('availability') }}
                    >
                      {formatShort(d)}{sort === 'availability' && d === anchorDate ? ' ▼' : ''}
                    </div>
                    {svc?.special && <div className="col-special">{svc.special}</div>}
                    {svc?.notes && <div className="col-note" title={svc.notes}>📝</div>}
                    {svc && (
                      <div className="col-actions">
                        <select
                          className="team-apply"
                          value=""
                          title="Apply sub-team"
                          onChange={(e) => onApplyTeam(svc, e.target.value)}
                        >
                          <option value="">Team…</option>
                          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button
                          className="copy-btn"
                          title="Copy reminder message + phone list"
                          onClick={() => onCopyReminder(svc)}
                        >
                          {copied === svc.id ? '✓' : '📋'}
                        </button>
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {activePeople.map((p) => (
              <tr key={p.id}>
                <td className="sticky-col person-cell" title={(p.instruments || []).join(', ')}>
                  {p.display_name}
                  {p.status === 'guest' && <span className="guest-badge">guest</span>}
                </td>
                {dates.map((d) => {
                  const svc = serviceByDate.get(d)
                  if (!svc) return <td key={d} />
                  const val = cellValue(svc, p.id)
                  const a = svc.assignments?.find((x) => x.person_id === p.id)
                  const cls = val.startsWith('role:') ? 'cell assigned' : val ? `cell ${val}` : 'cell'
                  return (
                    <td key={d} className={cls} title={a?.note || ''}>
                      <select value={val} onChange={(e) => onCellChange(svc, p, e.target.value)}>
                        <option value="">—</option>
                        <optgroup label="Roles">
                          {roles.map((r) => (
                            <option key={r.id} value={`role:${r.id}`}>{r.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Availability">
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </optgroup>
                      </select>
                      {a?.note ? <span className="note-dot" title={a.note}>•</span> : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
