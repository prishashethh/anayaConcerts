import { useState } from 'react'
import { addCountdown, deleteCountdown } from '../api'
import { daysUntil, formatDate, todayISO } from '../dates'
import Modal from './Modal'

export default function Countdowns({ countdowns, onChange, onLog }) {
  const [adding, setAdding] = useState(false)

  async function remove(cd) {
    if (!confirm(`Remove the countdown for ${cd.name}?`)) return
    await deleteCountdown(cd.id)
    onChange()
  }

  return (
    <section className="countdowns">
      {countdowns.map((cd) => {
        const days = daysUntil(cd.date)
        return (
          <div key={cd.id} className={`countdown glass ${days <= 0 ? 'done' : ''}`}>
            <div className="countdown-days">
              {days > 0 ? (
                <>
                  <span className="num">{days}</span>
                  <span className="unit">{days === 1 ? 'day' : 'days'}</span>
                </>
              ) : (
                <span className="num today">{days === 0 ? 'Today!' : 'Done'}</span>
              )}
            </div>
            <div className="countdown-info">
              <strong>{cd.name}</strong>
              <span className="muted">{formatDate(cd.date)}</span>
              {days <= 0 && (
                <button className="link" onClick={() => onLog(cd)}>
                  Add it to my concerts →
                </button>
              )}
            </div>
            <button className="icon-btn" onClick={() => remove(cd)} aria-label="Remove countdown">
              ×
            </button>
          </div>
        )
      })}
      <button className="countdown add" onClick={() => setAdding(true)}>
        <span>+ Countdown</span>
      </button>
      {adding && (
        <AddCountdown
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false)
            onChange()
          }}
        />
      )}
    </section>
  )
}

function AddCountdown({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await addCountdown(name.trim(), date)
    onAdded()
  }

  return (
    <Modal onClose={onClose} className="small-modal">
      <form className="form" onSubmit={submit}>
        <h2>New countdown</h2>
        <label>
          Concert
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          Date
          <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <button className="btn primary wide" disabled={busy}>
          Start counting down
        </button>
      </form>
    </Modal>
  )
}
