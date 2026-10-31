import { useEffect, useMemo, useState } from 'react'
import { deleteCountdown, saveConcert } from '../api'
import { todayISO } from '../dates'
import Modal from './Modal'
import PeopleInput from './PeopleInput'
import { SongEditor } from './Songs'

export default function ConcertForm({ concert, prefill, countdownId, concerts, onClose, onSaved }) {
  const start = concert || prefill || {}
  const [artist, setArtist] = useState(start.artist || '')
  const [date, setDate] = useState(start.date || '')
  const [venue, setVenue] = useState(start.venue || '')
  const [companions, setCompanions] = useState(start.companions || [])
  const [newSongs, setNewSongs] = useState(start.new_songs || [])
  const [favSongs, setFavSongs] = useState(start.fav_songs || [])
  const [notes, setNotes] = useState(start.notes || '')

  const [photos, setPhotos] = useState(() =>
    (concert?.photos || []).map((p) => ({ key: p.id, existing: p, preview: p.thumbUrl })),
  )
  const [removed, setRemoved] = useState([])
  const [coverKey, setCoverKey] = useState(concert?.cover?.id ?? null)

  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  const knownPeople = useMemo(
    () => [...new Set(concerts.flatMap((c) => c.companions))].sort((a, b) => a.localeCompare(b)),
    [concerts],
  )

  // Free the object URLs made for local previews.
  useEffect(() => () => photos.forEach((p) => p.file && URL.revokeObjectURL(p.preview)), []) // eslint-disable-line

  function addFiles(files) {
    const items = [...files]
      .filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name))
      .map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }))
    setPhotos((prev) => [...prev, ...items])
    if (!coverKey && items[0]) setCoverKey(items[0].key)
  }

  function removePhoto(item) {
    const rest = photos.filter((p) => p !== item)
    setPhotos(rest)
    if (item.existing) setRemoved((r) => [...r, item.existing])
    if (item.file) URL.revokeObjectURL(item.preview)
    if (coverKey === item.key) setCoverKey(rest[0]?.key ?? null)
  }

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setStatus('Saving…')
    try {
      const saved = await saveConcert(
        {
          id: concert?.id,
          fields: {
            artist: artist.trim(),
            date,
            venue: venue.trim() || null,
            companions,
            new_songs: newSongs,
            fav_songs: favSongs,
            notes: notes.trim() || null,
          },
          photoItems: photos,
          removed,
          coverKey,
        },
        setStatus,
      )
      if (countdownId) await deleteCountdown(countdownId)
      onSaved(saved, !concert)
    } catch (err) {
      setError(err.message)
      setStatus(null)
    }
  }

  const busy = status !== null

  return (
    <Modal onClose={busy ? null : onClose} className="form-modal">
      <form className="form" onSubmit={submit}>
        <h2>{concert ? 'Edit concert' : 'Add a concert'}</h2>

        <div className="form-grid">
          <label>
            Artist
            <input value={artist} onChange={(e) => setArtist(e.target.value)} required autoFocus={!concert} />
          </label>
          <label>
            Date
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="span-2">
            Venue
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Madison Square Garden" />
          </label>
          <label className="span-2">
            Went with
            <PeopleInput people={companions} onChange={setCompanions} suggestions={knownPeople} />
          </label>
        </div>

        <fieldset>
          <legend>Photos</legend>
          <div className="photo-grid">
            {photos.map((p) => (
              <div key={p.key} className={`photo-thumb ${coverKey === p.key ? 'is-cover' : ''}`}>
                <img src={p.preview} alt="" />
                <button type="button" className="cover-btn" onClick={() => setCoverKey(p.key)}>
                  {coverKey === p.key ? '★ Cover' : '☆ Make cover'}
                </button>
                <button type="button" className="remove-btn" onClick={() => removePhoto(p)} aria-label="Remove photo">
                  ×
                </button>
              </div>
            ))}
            <label
              className="photo-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addFiles(e.dataTransfer.files)
              }}
            >
              <input type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              <span className="plus">+</span>
              <span>Add photos</span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>New songs discovered</legend>
          <SongEditor songs={newSongs} onChange={setNewSongs} defaultArtist={artist} />
        </fieldset>

        <fieldset>
          <legend>Favorite songs</legend>
          <SongEditor songs={favSongs} onChange={setFavSongs} defaultArtist={artist} />
        </fieldset>

        <label>
          Notes
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember…" />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {status || (concert ? 'Save changes' : 'Save concert')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
