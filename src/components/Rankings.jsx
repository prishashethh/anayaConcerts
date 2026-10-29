import { formatDate, todayISO } from '../dates'
import { rankedList } from '../ranking'

export default function Rankings({ concerts, onOpen, onRank }) {
  const ranked = rankedList(concerts)
  const unranked = concerts.filter((c) => c.rank_pos == null && c.date <= todayISO())

  return (
    <section className="rankings">
      <h2 className="page-title">
        Ranked <em>favourites</em>
      </h2>
      {ranked.length === 0 && <p className="muted">Nothing ranked yet. Concerts get ranked when you add them.</p>}
      <ol className="rank-list">
        {ranked.map((c, i) => (
          <li key={c.id} className="rank-row glass" onClick={() => onOpen(c.id)}>
            <span className={`rank-num ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
            {c.cover ? <img src={c.cover.thumbUrl} alt="" /> : <div className="tile-placeholder" />}
            <div>
              <strong>{c.artist}</strong>
              <span className="muted">
                {formatDate(c.date)}
                {c.venue && ` · ${c.venue}`}
              </span>
            </div>
          </li>
        ))}
      </ol>

      {unranked.length > 0 && (
        <>
          <h3 className="subhead">Not ranked yet</h3>
          <ul className="rank-list">
            {unranked.map((c) => (
              <li key={c.id} className="rank-row glass unranked">
                {c.cover ? <img src={c.cover.thumbUrl} alt="" /> : <div className="tile-placeholder" />}
                <div onClick={() => onOpen(c.id)}>
                  <strong>{c.artist}</strong>
                  <span className="muted">{formatDate(c.date)}</span>
                </div>
                <button className="btn small" onClick={() => onRank(c.id)}>
                  Rank it
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
