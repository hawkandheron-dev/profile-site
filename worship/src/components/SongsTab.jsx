import { useEffect, useMemo, useState } from 'react'
import { formatShort } from '../lib/dates.js'

const SEASONS = ['General', 'Advent', 'Easter', 'Thanksgiving']

export default function SongsTab({ api }) {
  const [songs, setSongs] = useState([])
  const [tags, setTags] = useState([])
  const [lastSung, setLastSung] = useState(new Map())
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // song object being edited (or {id:null} for new)
  const [status, setStatus] = useState(null)

  async function reload() {
    try {
      const [s, t, ls] = await Promise.all([api.loadSongs(), api.loadTags(), api.loadLastSung()])
      setSongs(s)
      setTags(t)
      setLastSung(ls)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }
  useEffect(() => { reload() }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t.name])), [tags])
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    return t ? songs.filter((s) => s.title.toLowerCase().includes(t)) : songs
  }, [songs, search])

  function startEdit(song) {
    setEditing({
      id: song?.id || null,
      title: song?.title || '',
      main_key: song?.main_key || '',
      season: song?.season || 'General',
      notes: song?.notes || '',
      active: song?.active !== false,
      links: (song?.links || []).slice().sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({ url: l.url, label: l.label })),
      tagIds: (song?.tags || []).map((t) => t.tag_id),
    })
  }

  async function save() {
    try {
      const payload = {
        title: editing.title.trim(),
        main_key: editing.main_key.trim() || null,
        season: editing.season,
        notes: editing.notes.trim() || null,
        active: editing.active,
      }
      if (editing.id) payload.id = editing.id
      const saved = await api.saveSong(payload)
      await api.saveSongLinks(saved.id, editing.links.filter((l) => l.url.trim()))
      await api.saveSongTags(saved.id, editing.tagIds)
      setEditing(null)
      await reload()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  if (editing) {
    return (
      <div className="song-edit">
        <h2>{editing.id ? 'Edit song' : 'New song'}</h2>
        {status && <p className="status">{status}</p>}
        <label>Title <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>Main key <input className="key-override" value={editing.main_key} onChange={(e) => setEditing({ ...editing, main_key: e.target.value })} /></label>
        <label>Season
          <select value={editing.season} onChange={(e) => setEditing({ ...editing, season: e.target.value })}>
            {SEASONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Notes <input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></label>
        <label><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>

        <h3>Chord sheet links</h3>
        {editing.links.map((l, i) => (
          <div className="link-row" key={i}>
            <input
              className="link-label"
              value={l.label}
              placeholder="Label (e.g. Real key, Capo 3)"
              onChange={(e) => {
                const links = editing.links.slice(); links[i] = { ...l, label: e.target.value }
                setEditing({ ...editing, links })
              }}
            />
            <input
              className="link-url"
              value={l.url}
              placeholder="https://docs.google.com/…"
              onChange={(e) => {
                const links = editing.links.slice(); links[i] = { ...l, url: e.target.value }
                setEditing({ ...editing, links })
              }}
            />
            <button className="danger" onClick={() => setEditing({ ...editing, links: editing.links.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button onClick={() => setEditing({ ...editing, links: [...editing.links, { url: '', label: 'Chords' }] })}>+ Add link</button>

        <h3>Tags</h3>
        <div className="tag-grid">
          {tags.map((t) => (
            <label key={t.id} className="tag-check">
              <input
                type="checkbox"
                checked={editing.tagIds.includes(t.id)}
                onChange={(e) => setEditing({
                  ...editing,
                  tagIds: e.target.checked
                    ? [...editing.tagIds, t.id]
                    : editing.tagIds.filter((x) => x !== t.id),
                })}
              />
              {t.name}
            </label>
          ))}
        </div>

        <div className="edit-actions">
          <button className="primary" onClick={save} disabled={!editing.title.trim()}>Save</button>
          <button onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="songs">
      <div className="toolbar">
        <input placeholder="Search songs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="primary" onClick={() => startEdit(null)}>+ New song</button>
        <span className="meta">{filtered.length} songs</span>
        {status && <span className="status">{status}</span>}
      </div>
      <table className="songs-table">
        <thead>
          <tr><th>Title</th><th>Key</th><th>Season</th><th>Tags</th><th>Chords</th><th>Last sung</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id} className={s.active === false ? 'inactive' : ''}>
              <td>{s.title}</td>
              <td>{s.main_key || ''}</td>
              <td>{s.season}</td>
              <td className="tags-cell">{(s.tags || []).map((t) => tagsById.get(t.tag_id)).filter(Boolean).join(', ')}</td>
              <td>
                {(s.links || []).map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label || 'Chords'}</a>
                ))}
              </td>
              <td>{lastSung.has(s.id) ? formatShort(lastSung.get(s.id)) : '—'}</td>
              <td><button onClick={() => startEdit(s)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
