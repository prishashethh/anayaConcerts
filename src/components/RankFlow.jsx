import { useState } from 'react'
import { formatDate } from '../dates'
import { positionAt } from '../ranking'
import Modal from './Modal'

// Beli-style insertion: binary search through the ranked list, one "which was better?" at a time.
export default function RankFlow({ concert, ranked, onDone, onSkip }) {
  const [lo, setLo] = useState(0)
  const [hi, setHi] = useState(ranked.length)
  const [saving, setSaving] = useState(false)

  const mid = Math.floor((lo + hi) / 2)
  const other = ranked[mid]
  const remaining = Math.ceil(Math.log2(hi - lo + 1))

  async function settle(index) {
    setSaving(true)
    await onDone(positionAt(ranked, index))
  }

  function pick(newIsBetter) {
    const [nextLo, nextHi] = newIsBetter ? [lo, mid] : [mid + 1, hi]
    if (nextLo >= nextHi) settle(nextLo)
    else {
      setLo(nextLo)
      setHi(nextHi)
    }
  }

  return (
    <Modal onClose={saving ? null : onSkip} className="rank-modal">
      <div className="rank-flow">
        <p className="eyebrow">Ranking · about {remaining} more</p>
        <h2>Which was better?</h2>
        <div className="rank-choices">
          <RankCard concert={concert} onClick={() => pick(true)} disabled={saving} />
          <span className="vs">or</span>
          <RankCard concert={other} onClick={() => pick(false)} disabled={saving} />
        </div>
        <div className="rank-footer">
          <button className="btn ghost small" disabled={saving} onClick={() => settle(mid + 1)}>
            Too close to call
          </button>
          <button className="btn ghost small" disabled={saving} onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </Modal>
  )
}

function RankCard({ concert, onClick, disabled }) {
  return (
    <button className="rank-card" onClick={onClick} disabled={disabled}>
      {concert.cover ? <img src={concert.cover.thumbUrl} alt="" /> : <div className="tile-placeholder" />}
      <div className="tile-caption">
        <span className="tile-artist">{concert.artist}</span>
        <span className="tile-date">{formatDate(concert.date)}</span>
      </div>
    </button>
  )
}
