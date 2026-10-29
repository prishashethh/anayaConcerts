import { useState } from 'react'

export default function PeopleInput({ people, onChange, suggestions }) {
  const [text, setText] = useState('')

  function add() {
    const name = text.trim().replace(/,$/, '')
    if (name && !people.includes(name)) onChange([...people, name])
    setText('')
  }

  return (
    <div className="people-input">
      {people.map((p) => (
        <span key={p} className="chip">
          {p}
          <button type="button" onClick={() => onChange(people.filter((x) => x !== p))} aria-label={`Remove ${p}`}>
            ×
          </button>
        </span>
      ))}
      <input
        list="people-suggestions"
        placeholder={people.length ? 'Add someone else' : 'Type a name, press Enter'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
      />
      <datalist id="people-suggestions">
        {suggestions.filter((s) => !people.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  )
}
