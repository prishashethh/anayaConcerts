export function rankedList(concerts) {
  return concerts.filter((c) => c.rank_pos != null).sort((a, b) => a.rank_pos - b.rank_pos)
}

// Position between the neighbours at `index` in an already-sorted ranked list.
export function positionAt(ranked, index) {
  const before = ranked[index - 1]?.rank_pos
  const after = ranked[index]?.rank_pos
  if (before == null && after == null) return 0
  if (before == null) return after - 1
  if (after == null) return before + 1
  return (before + after) / 2
}
