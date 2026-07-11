import { useEffect, useMemo, useState } from 'react'

export default function TeamsTab({ api }) {
  const [teams, setTeams] = useState([])
  const [people, setPeople] = useState([])
  const [roles, setRoles] = useState([])
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState({}) // teamId -> {personId, roleId}
  const [status, setStatus] = useState(null)

  async function reload() {
    try {
      const [t, p, r] = await Promise.all([api.loadTeams(), api.loadPeople(), api.loadRoles()])
      setTeams(t)
      setPeople(p)
      setRoles(r)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }
  useEffect(() => { reload() }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const rolesById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles])
  const activePeople = people.filter((p) => p.status !== 'inactive')

  async function createTeam() {
    try {
      await api.saveTeam({ name: newName.trim() })
      setNewName('')
      await reload()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function addMember(teamId) {
    const a = adding[teamId]
    if (!a?.personId || !a?.roleId) return
    try {
      await api.setTeamMember(teamId, a.personId, Number(a.roleId))
      setAdding({ ...adding, [teamId]: {} })
      await reload()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <div className="teams">
      <div className="toolbar">
        <input placeholder="New team name (e.g. Team A)" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="primary" onClick={createTeam} disabled={!newName.trim()}>+ Create team</button>
        {status && <span className="status">{status}</span>}
      </div>
      <p className="hint">
        Assigning a team to a Sunday (from the Roster tab) slots in every member below —
        except anyone already marked unavailable/tentative that week. Swaps after that are
        normal cell edits.
      </p>
      {teams.map((team) => (
        <div className="team-card" key={team.id}>
          <div className="team-head">
            <h3>{team.name}</h3>
            <button className="danger" onClick={async () => { await api.deleteTeam(team.id); reload() }}>Delete team</button>
          </div>
          <table>
            <tbody>
              {(team.members || []).map((m) => (
                <tr key={m.person_id}>
                  <td>{peopleById.get(m.person_id)?.display_name || '?'}</td>
                  <td>{rolesById.get(m.role_id)?.name || '?'}</td>
                  <td>
                    <button className="danger" onClick={async () => { await api.removeTeamMember(team.id, m.person_id); reload() }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="member-add">
            <select
              value={adding[team.id]?.personId || ''}
              onChange={(e) => setAdding({ ...adding, [team.id]: { ...adding[team.id], personId: e.target.value } })}
            >
              <option value="">Person…</option>
              {activePeople.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
            <select
              value={adding[team.id]?.roleId || ''}
              onChange={(e) => setAdding({ ...adding, [team.id]: { ...adding[team.id], roleId: e.target.value } })}
            >
              <option value="">Role…</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button onClick={() => addMember(team.id)}>Add</button>
          </div>
        </div>
      ))}
      {!teams.length && <p className="empty">No teams yet — create one above.</p>}
    </div>
  )
}
