import { useState } from 'react'
import { deleteConcert } from '../api'
import { formatDate } from '../dates'
import { rankedList } from '../ranking'
import Modal from './Modal'
import { SongList } from './Songs'

export default function ConcertDetail({ concert, concerts, onClose, onEdit, onRerank, onDeleted }) {
  const { photos } = concert
  const [index, setIndex] = useState(() => Math.max(0, photos.findIndex((p) => p.id === concert.cover?.id)))
  const photo = photos[index]

  const ranked = rankedList(concerts)
  const rank = ranked.findIndex((c) => c.id === concert.id) + 1

  async function remove() {
    if (!confirm(`Delete ${concert.artist} (${formatDate(concert.date)}) and all its photos? This can't be undone.`)) return
    await deleteConcert(concert)
    onDeleted()
  }

  const step = (d) => setIndex((i) => (i + d + photos.length) % photos.length)

  return (
    <Modal onClose={onClose} className="detail-modal">
      <div className="detail">
        <div className="gallery">
          <div className="gallery-main">
            {photo ? <img src={photo.url} alt="" /> : <div className="tile-placeholder" />}
            {photos.length > 1 && (
              <>
                <button className="gallery-arrow left" onClick={() => step(-1)} aria-label="Previous photo">
                  ‹
                </button>
                <button className="gallery-arrow right" onClick={() => step(1)} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="gallery-strip">
              {photos.map((p, i) => (
                <button key={p.id} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>
                  <img src={p.thumbUrl} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          {rank > 0 && (
            <span className="rank-badge">
              #{rank} <span>of {ranked.length}</span>
            </span>
          )}
          <h2 className="detail-artist">{concert.artist}</h2>
          <p className="detail-meta">
            {formatDate(concert.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {concert.venue && <> · {concert.venue}</>}
          </p>

          {concert.companions.length > 0 && (
            <Section title="Went with">
              <div className="chips">
                {concert.companions.map((p) => (
                  <span key={p} className="chip">
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          )}
          {concert.new_songs.length > 0 && (
            <Section title="New songs discovered">
              <SongList songs={concert.new_songs} />
            </Section>
          )}
          {concert.fav_songs.length > 0 && (
            <Section title="Favorite songs">
              <SongList songs={concert.fav_songs} />
            </Section>
          )}
          {concert.notes && (
            <Section title="Notes">
              <p className="notes">{concert.notes}</p>
            </Section>
          )}

          <div className="detail-actions">
            <button className="btn primary small" onClick={onEdit}>
              Edit
            </button>
            <button className="btn small" onClick={onRerank}>
              {rank > 0 ? 'Re-rank' : 'Rank it'}
            </button>
            <button className="btn ghost small danger" onClick={remove}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Section({ title, children }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
