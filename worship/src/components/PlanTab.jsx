import { useCallback, useEffect, useMemo, useState } from 'react'
import { nextSunday, sundayRange, addWeeks, formatDate, formatShort, toIso } from '../lib/dates.js'

const SLOTS = ['Prelude', 'Opener', 'Offering', 'Communion', 'Closer']

export default function PlanTab({ api }) {
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState(null)
  const [planSongs, setPlanSongs] = useState([])
  const [songs, setSongs] = useState([])
  const [lastSung, setLastSung] = useState(new Map())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const start = addWeeks(nextSunday(), -8)
        const dates = sundayRange(start, 26)
        await api.ensureServices(dates)
        const svcs = await api.loadServices(dates[0], dates[dates.length - 1])
        setServices(svcs)
        const next = svcs.find((s) => s.service_date === toIso(nextSunday()))
        setServiceId(next?.id || svcs[0]?.id || null)
        const [allSongs, ls] = await Promise.all([api.loadSongs(), api.loadLastSung()])
        setSongs(allSongs)
        setLastSung(ls)
      } catch (e) {
        setStatus(`Error: ${e.message}`)
      }
    })()
  }, [api])

  const reloadPlan = useCallback(async (id) => {
    if (!id) { setPlanSongs([]); return }
    try {
      setPlanSongs(await api.loadServiceSongs(id))
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }, [api])

  useEffect(() => { reloadPlan(serviceId) }, [serviceId, reloadPlan])

  const service = services.find((s) => s.id === serviceId)

  const results = useMemo(() => {
    const t = search.trim().toLowerCase()
    if (!t) return []
    return songs
      .filter((s) => s.active !== false && s.title.toLowerCase().includes(t))
      .slice(0, 12)
  }, [search, songs])

  async function add(song) {
    try {
      await api.addServiceSong(serviceId, song.id, planSongs.length)
      setSearch('')
      await reloadPlan(serviceId)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function move(idx, delta) {
    const target = idx + delta
    if (target < 0 || target >= planSongs.length) return
    const a = planSongs[idx], b = planSongs[target]
    try {
      await Promise.all([
        api.updateServiceSong(a.id, { sort_order: target }),
        api.updateServiceSong(b.id, { sort_order: idx }),
      ])
      await reloadPlan(serviceId)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function patch(row, p) {
    try {
      await api.updateServiceSong(row.id, p)
      await reloadPlan(serviceId)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  async function remove(row) {
    try {
      await api.removeServiceSong(row.id)
      await reloadPlan(serviceId)
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <div className="plan">
      <div className="toolbar">
        <label>Service:&nbsp;
          <select value={serviceId || ''} onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {formatShort(s.service_date)}{s.special ? ` (${s.special})` : ''}
              </option>
            ))}
          </select>
        </label>
        {status && <span className="status">{status}</span>}
      </div>

      {service && (
        <>
          <h2>{formatDate(service.service_date)}{service.special ? ` — ${service.special}` : ''}</h2>
          <table className="plan-table">
            <thead>
              <tr><th></th><th>Song</th><th>Key</th><th>Slot</th><th>Override</th><th>Chords</th><th></th></tr>
            </thead>
            <tbody>
              {planSongs.map((row, i) => (
                <tr key={row.id}>
                  <td className="order-btns">
                    <button onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === planSongs.length - 1}>↓</button>
                  </td>
                  <td>{row.song.title}</td>
                  <td>{row.song.main_key || ''}</td>
                  <td>
                    <select value={row.slot || ''} onChange={(e) => patch(row, { slot: e.target.value || null })}>
                      <option value="">—</option>
                      {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      className="key-override"
                      defaultValue={row.key_override || ''}
                      placeholder="key"
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (row.key_override || null)) patch(row, { key_override: v })
                      }}
                    />
                  </td>
                  <td>
                    {(row.links || []).map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label || 'Chords'}</a>
                    ))}
                  </td>
                  <td><button className="danger" onClick={() => remove(row)}>✕</button></td>
                </tr>
              ))}
              {!planSongs.length && <tr><td colSpan={7} className="empty">No songs planned yet.</td></tr>}
            </tbody>
          </table>

          <div className="song-search">
            <input
              placeholder="Add a song — search the library…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {results.length > 0 && (
              <ul className="results">
                {results.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => add(s)}>
                      {s.title}
                      <span className="meta">
                        {s.main_key ? ` · ${s.main_key}` : ''}
                        {lastSung.has(s.id) ? ` · last sung ${formatShort(lastSung.get(s.id))}` : ' · never sung'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
