import { useMemo, useState } from 'react'
import { formatDate, parseDate, todayISO } from '../dates'
import { SongList } from './Songs'

// Most frequent values, returning every value tied for first.
function topOf(values) {
  const counts = {}
  for (const v of values) counts[v] = (counts[v] || 0) + 1
  const max = Math.max(0, ...Object.values(counts))
  return { names: Object.keys(counts).filter((k) => counts[k] === max), count: max }
}

// Every value with how often it appears, most frequent first.
function countAll(values) {
  const counts = {}
  for (const v of values) counts[v] = (counts[v] || 0) + 1
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export default function Recap({ concerts, onOpen }) {
  const past = concerts.filter((c) => c.date <= todayISO())
  const years = [...new Set(past.map((c) => c.date.slice(0, 4)))].sort().reverse()
  const [picked, setYear] = useState(null)
  const year = years.includes(picked) ? picked : years[0]

  const stats = useMemo(() => {
    const list = past.filter((c) => c.date.startsWith(year)).sort((a, b) => a.date.localeCompare(b.date))
    const ranked = list.filter((c) => c.rank_pos != null).sort((a, b) => a.rank_pos - b.rank_pos)
    const months = list.map((c) => parseDate(c.date).toLocaleDateString('en-US', { month: 'long' }))
    return {
      list,
      favorite: ranked[0],
      artists: new Set(list.map((c) => c.artist)).size,
      topArtist: topOf(list.map((c) => c.artist)),
      buddies: countAll(list.flatMap((c) => c.companions)),
      venues: new Set(list.map((c) => c.venue).filter(Boolean)).size,
      month: topOf(months),
      newSongs: list.flatMap((c) => c.new_songs),
      favSongs: list.flatMap((c) => c.fav_songs),
    }
  }, [past, year])

  if (!years.length) return <p className="muted">Your recap appears once you've added a concert.</p>

  const { list, favorite, topArtist, buddies, month } = stats

  return (
    <section className="recap">
      <div className="year-pills">
        {years.map((y) => (
          <button key={y} className={y === year ? 'tab active' : 'tab'} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>

      <div className="recap-hero glossy">
        <p className="eyebrow">{year} in concerts</p>
        <p className="recap-big">{list.length}</p>
        <p>
          {list.length === 1 ? 'concert' : 'concerts'} · {stats.artists} {stats.artists === 1 ? 'artist' : 'artists'} ·{' '}
          {stats.venues} {stats.venues === 1 ? 'venue' : 'venues'}
        </p>
      </div>

      <div className="recap-grid">
        {favorite && (
          <button className="stat glass fav" onClick={() => onOpen(favorite.id)}>
            {favorite.cover && <img src={favorite.cover.thumbUrl} alt="" />}
            <div>
              <p className="eyebrow">Concert of the year</p>
              <p className="stat-value">{favorite.artist}</p>
              <p className="muted">{formatDate(favorite.date)}</p>
            </div>
          </button>
        )}
        {topArtist.count > 1 && (
          <Stat label="Most seen" value={topArtist.names.join(' & ')} sub={`${topArtist.count} times`} />
        )}
        {buddies.length > 0 && (
          <div className="stat glass buddies">
            <p className="eyebrow">Concert buddies</p>
            <ol className="buddy-list">
              {buddies.map(([name, count]) => (
                <li key={name}>
                  <span className="buddy-name">{name}</span>
                  <span className="muted">
                    {count} {count === 1 ? 'show' : 'shows'}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {list.length > 1 && month.count > 1 && (
          <Stat label="Busiest month" value={month.names.join(' & ')} sub={`${month.count} concerts`} />
        )}
        <Stat label="Songs discovered" value={stats.newSongs.length} sub={`${stats.favSongs.length} favorite songs`} />
      </div>

      <div className="recap-strip">
        {list.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} title={`${c.artist} · ${formatDate(c.date)}`}>
            {c.cover ? <img src={c.cover.thumbUrl} alt="" /> : <div className="tile-placeholder" />}
          </button>
        ))}
      </div>

      {(stats.newSongs.length > 0 || stats.favSongs.length > 0) && (
        <div className="recap-songs">
          {stats.newSongs.length > 0 && (
            <div className="glass panel">
              <h3>Discovered in {year}</h3>
              <SongList songs={stats.newSongs} />
            </div>
          )}
          {stats.favSongs.length > 0 && (
            <div className="glass panel">
              <h3>Favorite songs</h3>
              <SongList songs={stats.favSongs} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="stat glass">
      <p className="eyebrow">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="muted">{sub}</p>
    </div>
  )
}
