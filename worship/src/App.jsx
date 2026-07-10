import { useEffect, useMemo, useState } from 'react'
import { getSupabase } from './lib/supabaseClient.js'
import { makeApi } from './services/api.js'
import SignIn from './components/SignIn.jsx'
import RosterTab from './components/RosterTab.jsx'
import PlanTab from './components/PlanTab.jsx'
import SongsTab from './components/SongsTab.jsx'
import PeopleTab from './components/PeopleTab.jsx'
import TeamsTab from './components/TeamsTab.jsx'
import RemindersTab from './components/RemindersTab.jsx'

const TABS = ['Roster', 'Plan', 'Songs', 'People', 'Teams', 'Reminders']

export default function App() {
  const [supabase, setSupabase] = useState(null)
  const [bootError, setBootError] = useState(null)
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(null) // null = checking
  const [tab, setTab] = useState('Roster')

  useEffect(() => {
    let sub
    getSupabase()
      .then((sb) => {
        setSupabase(sb)
        sb.auth.getSession().then(({ data }) => setSession(data.session))
        sub = sb.auth.onAuthStateChange((_evt, s) => setSession(s)).data.subscription
      })
      .catch((e) => setBootError(e.message))
    return () => sub?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) { setIsAdmin(null); return }
    supabase
      .from('ws_admins')
      .select('email')
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [supabase, session])

  const api = useMemo(() => (supabase ? makeApi(supabase) : null), [supabase])

  if (bootError) return <div className="boot-error">{bootError}</div>
  if (!supabase) return <div className="boot-loading">Loading…</div>
  if (!session) return <SignIn supabase={supabase} />
  if (isAdmin === null) return <div className="boot-loading">Checking access…</div>
  if (!isAdmin) {
    return (
      <div className="boot-error">
        <p>Signed in as {session.user.email}, but this account isn’t an admin.</p>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Worship Scheduler</h1>
        <nav>
          {TABS.map((t) => (
            <button key={t} className={t === tab ? 'tab active' : 'tab'} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="header-right">
          <span className="user-email">{session.user.email}</span>
          <button className="link" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      <main>
        {tab === 'Roster' && <RosterTab api={api} />}
        {tab === 'Plan' && <PlanTab api={api} />}
        {tab === 'Songs' && <SongsTab api={api} />}
        {tab === 'People' && <PeopleTab api={api} />}
        {tab === 'Teams' && <TeamsTab api={api} />}
        {tab === 'Reminders' && <RemindersTab api={api} />}
      </main>
    </div>
  )
}
