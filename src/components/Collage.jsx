import { formatDate, todayISO } from '../dates'

// Repeating size pattern so the grid reads as a collage rather than a uniform wall.
const SHAPES = ['big', '', 'tall', '', '', 'wide', '', 'tall', '', 'big', '', '']

export default function Collage({ concerts, onOpen, onAdd }) {
  const past = concerts.filter((c) => c.date <= todayISO())

  if (past.length === 0) {
    return (
      <div className="empty glass">
        <h2>No concerts yet</h2>
        <p className="muted">Add the first one and it'll show up here.</p>
        <button className="btn primary" onClick={onAdd}>
          + Add concert
        </button>
      </div>
    )
  }

  return (
    <section className="collage">
      {past.map((c, i) => (
        <button key={c.id} className={`tile ${SHAPES[i % SHAPES.length]}`} onClick={() => onOpen(c.id)}>
          {c.cover ? <img src={c.cover.thumbUrl} alt="" loading="lazy" /> : <div className="tile-placeholder" />}
          <div className="tile-caption">
            <span className="tile-artist">{c.artist}</span>
            <span className="tile-date">{formatDate(c.date)}</span>
          </div>
        </button>
      ))}
    </section>
  )
}
