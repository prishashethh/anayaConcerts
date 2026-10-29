import { useState } from 'react'
import { spotifySearchUrl } from '../api'

export function SongList({ songs }) {
  return (
    <ul className="songs">
      {songs.map((s, i) => (
        <li key={i}>
          <a href={spotifySearchUrl(s)} target="_blank" rel="noreferrer" title="Find on Spotify">
            <SpotifyIcon />
            <span>
              <strong>{s.title}</strong>
              {s.artist && <span className="muted"> · {s.artist}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function SongEditor({ songs, onChange, defaultArtist }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')

  function add() {
    if (!title.trim()) return
    onChange([...songs, { title: title.trim(), artist: artist.trim() || defaultArtist.trim() }])
    setTitle('')
    setArtist('')
  }

  return (
    <div className="song-editor">
      {songs.map((s, i) => (
        <span key={i} className="chip">
          {s.title}
          {s.artist && <span className="muted"> · {s.artist}</span>}
          <button type="button" onClick={() => onChange(songs.filter((_, j) => j !== i))} aria-label="Remove">
            ×
          </button>
        </span>
      ))}
      <div className="song-inputs" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}>
        <input placeholder="Song" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder={defaultArtist || 'Artist'} value={artist} onChange={(e) => setArtist(e.target.value)} />
        <button type="button" className="btn small" onClick={add}>
          Add
        </button>
      </div>
    </div>
  )
}

function SpotifyIcon() {
  return (
    <svg className="spotify" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        d="M17.2 10.6c-2.8-1.7-7.4-1.8-10-1-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3-.9 8.1-.7 11.3 1.2.4.2.5.8.3 1.2-.3.3-.8.4-1.2.2zm-.1 2.6c-.2.3-.6.4-1 .2-2.3-1.4-5.9-1.9-8.6-1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.1-.9 7-.5 9.7 1.2.3.2.4.7.3 1zm-1 2.5c-.2.3-.5.3-.8.2-2-1.2-4.5-1.5-7.5-.8-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 3.2-.7 6-.4 8.3.9.3.2.4.5.3.8z"
        fill="#fff"
      />
    </svg>
  )
}
