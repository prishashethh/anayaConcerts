import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { fetchAll, setRankPos } from './api'
import { todayISO } from './dates'
import Login from './components/Login'
import Collage from './components/Collage'
import Countdowns from './components/Countdowns'
import ConcertDetail from './components/ConcertDetail'
import ConcertForm from './components/ConcertForm'
import RankFlow from './components/RankFlow'
import Rankings from './components/Rankings'
import Recap from './components/Recap'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return session ? <Journal /> : <Login />
}

const VIEWS = [
  ['collage', 'Shows'],
  ['rankings', 'Rankings'],
  ['recap', 'Recap'],
]

function Journal() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [view, setView] = useState('collage')
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(null) // { concert?, prefill?, countdownId? }
  const [rankingId, setRankingId] = useState(null)

  const reload = useCallback(async () => {
    try {
      setData(await fetchAll())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  if (!data) {
    return <div className="center-screen">{error ? <p className="error">{error}</p> : <div className="spinner" />}</div>
  }

  const concerts = data.concerts
  const open = concerts.find((c) => c.id === openId)
  const ranking = concerts.find((c) => c.id === rankingId)

  async function afterSave(saved, isNew) {
    setEditing(null)
    await reload()
    if (isNew && saved.date <= todayISO()) startRanking(saved.id)
    else setOpenId(saved.id)
  }

  async function startRanking(id) {
    const others = concerts.filter((c) => c.id !== id && c.rank_pos != null)
    if (others.length === 0) {
      // First ranked concert: nothing to compare against.
      await setRankPos(id, 0)
      await reload()
      setOpenId(id)
    } else {
      setOpenId(null)
      setRankingId(id)
    }
  }

  async function finishRanking(pos) {
    const id = rankingId
    await setRankPos(id, pos)
    setRankingId(null)
    await reload()
    setOpenId(id)
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">
          Anaya's <em>Concerts</em>
        </h1>
        <nav className="tabs">
          {VIEWS.map(([key, label]) => (
            <button key={key} className={view === key ? 'tab active' : 'tab'} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button className="btn primary" onClick={() => setEditing({})}>
            + Add concert
          </button>
          <button className="btn ghost small" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="error banner">{error}</p>}

      <main>
        {view === 'collage' && (
          <>
            <Countdowns
              countdowns={data.countdowns}
              onChange={reload}
              onLog={(cd) => setEditing({ prefill: { artist: cd.name, date: cd.date }, countdownId: cd.id })}
            />
            <Collage concerts={concerts} onOpen={setOpenId} onAdd={() => setEditing({})} />
          </>
        )}
        {view === 'rankings' && <Rankings concerts={concerts} onOpen={setOpenId} onRank={startRanking} />}
        {view === 'recap' && <Recap concerts={concerts} onOpen={setOpenId} />}
      </main>

      {open && (
        <ConcertDetail
          concert={open}
          concerts={concerts}
          onClose={() => setOpenId(null)}
          onEdit={() => {
            setOpenId(null)
            setEditing({ concert: open })
          }}
          onRerank={async () => {
            await setRankPos(open.id, null)
            await reload()
            startRanking(open.id)
          }}
          onDeleted={async () => {
            setOpenId(null)
            await reload()
          }}
        />
      )}

      {editing && (
        <ConcertForm
          {...editing}
          concerts={concerts}
          onClose={() => setEditing(null)}
          onSaved={afterSave}
        />
      )}

      {ranking && (
        <RankFlow
          concert={ranking}
          ranked={concerts.filter((c) => c.id !== ranking.id && c.rank_pos != null).sort((a, b) => a.rank_pos - b.rank_pos)}
          onDone={finishRanking}
          onSkip={async () => {
            setRankingId(null)
            setOpenId(ranking.id)
          }}
        />
      )}
    </div>
  )
}
