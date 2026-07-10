import { useEffect, useState } from 'react'
import { formatPhone } from '../lib/dates.js'

export default function PeopleTab({ api }) {
  const [people, setPeople] = useState([])
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState(null)
  const [showInactive, setShowInactive] = useState(false)

  async function reload() {
    try { setPeople(await api.loadPeople()) } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  useEffect(() => { reload() }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(p) {
    setEditing({
      id: p?.id || null,
      first_name: p?.first_name || '',
      last_name: p?.last_name || '',
      display_name: p?.display_name || '',
      email: p?.email || '',
      phone: p?.phone || '',
      instruments: (p?.instruments || []).join(', '),
      can_lead: p?.can_lead || false,
      active: p?.active !== false,
      notes: p?.notes || '',
    })
  }

  async function save() {
    try {
      const payload = {
        first_name: editing.first_name.trim(),
        last_name: editing.last_name.trim(),
        display_name: editing.display_name.trim() || `${editing.first_name} ${editing.last_name}`.trim(),
        email: editing.email.trim() || null,
        phone: editing.phone.replace(/\D/g, '') || null,
        instruments: editing.instruments.split(',').map((s) => s.trim()).filter(Boolean),
        can_lead: editing.can_lead,
        active: editing.active,
        notes: editing.notes.trim() || null,
      }
      if (editing.id) payload.id = editing.id
      await api.savePerson(payload)
      setEditing(null)
      await reload()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  if (editing) {
    return (
      <div className="person-edit">
        <h2>{editing.id ? 'Edit person' : 'New person'}</h2>
        {status && <p className="status">{status}</p>}
        <label>First name <input value={editing.first_name} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} /></label>
        <label>Last name <input value={editing.last_name} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} /></label>
        <label>Display name <input value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} /></label>
        <label>Email <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></label>
        <label>Phone <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></label>
        <label>Instruments <input value={editing.instruments} placeholder="Vocals, Acoustic Guitar" onChange={(e) => setEditing({ ...editing, instruments: e.target.value })} /></label>
        <label><input type="checkbox" checked={editing.can_lead} onChange={(e) => setEditing({ ...editing, can_lead: e.target.checked })} /> Can lead</label>
        <label><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
        <label>Notes <input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></label>
        <div className="edit-actions">
          <button className="primary" onClick={save} disabled={!editing.first_name.trim()}>Save</button>
          <button onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    )
  }

  const list = people.filter((p) => showInactive || p.active)

  return (
    <div className="people">
      <div className="toolbar">
        <button className="primary" onClick={() => startEdit(null)}>+ New person</button>
        <label><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive</label>
        <span className="meta">{list.length} people</span>
        {status && <span className="status">{status}</span>}
      </div>
      <table className="people-table">
        <thead>
          <tr><th>Name</th><th>Instruments</th><th>Phone</th><th>Email</th><th>Lead?</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className={p.active ? '' : 'inactive'}>
              <td>{p.display_name}</td>
              <td>{(p.instruments || []).join(', ')}</td>
              <td>{formatPhone(p.phone)}</td>
              <td>{p.email || ''}</td>
              <td>{p.can_lead ? '✓' : ''}</td>
              <td><button onClick={() => startEdit(p)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
