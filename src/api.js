import { supabase } from './supabase'
import { resizeImage } from './images'

const BUCKET = 'photos'
const URL_TTL = 60 * 60 * 24 // signed photo links last a day

function check({ data, error }) {
  if (error) throw error
  return data
}

async function signUrls(paths) {
  if (!paths.length) return {}
  const data = check(await supabase.storage.from(BUCKET).createSignedUrls(paths, URL_TTL))
  return Object.fromEntries(data.map((d) => [d.path, d.signedUrl]))
}

export async function fetchAll() {
  const [concerts, photos, countdowns] = await Promise.all([
    supabase.from('concerts').select('*').order('date', { ascending: false }).then(check),
    supabase.from('photos').select('*').order('created_at').then(check),
    supabase.from('countdowns').select('*').order('date').then(check),
  ])

  const urls = await signUrls(photos.flatMap((p) => [p.path, p.thumb_path]))
  const byConcert = {}
  for (const p of photos) {
    ;(byConcert[p.concert_id] ||= []).push({ ...p, url: urls[p.path], thumbUrl: urls[p.thumb_path] })
  }

  return {
    concerts: concerts.map((c) => {
      const list = byConcert[c.id] || []
      const cover = list.find((p) => p.path === c.cover_path) || list[0] || null
      return { ...c, photos: list, cover }
    }),
    countdowns,
  }
}

async function uploadPhoto(concertId, file) {
  const [full, thumb] = await Promise.all([resizeImage(file, 2000), resizeImage(file, 700, 0.8)])
  const id = crypto.randomUUID()
  const path = `${concertId}/${id}.jpg`
  const thumb_path = `${concertId}/${id}_thumb.jpg`
  const opts = { contentType: 'image/jpeg' }
  check(await supabase.storage.from(BUCKET).upload(path, full, opts))
  check(await supabase.storage.from(BUCKET).upload(thumb_path, thumb, opts))
  check(await supabase.from('photos').insert({ concert_id: concertId, path, thumb_path }))
  return path
}

async function removePhotos(photos) {
  if (!photos.length) return
  check(await supabase.storage.from(BUCKET).remove(photos.flatMap((p) => [p.path, p.thumb_path])))
  check(await supabase.from('photos').delete().in('id', photos.map((p) => p.id)))
}

/**
 * Create or update a concert.
 * photoItems: [{ key, existing?: photo, file?: File }] — the final photo list
 * removed:    existing photos the user deleted
 * coverKey:   key of the item chosen as cover
 */
export async function saveConcert({ id, fields, photoItems, removed, coverKey }, onProgress) {
  const row = id
    ? check(await supabase.from('concerts').update(fields).eq('id', id).select().single())
    : check(await supabase.from('concerts').insert(fields).select().single())

  await removePhotos(removed)

  const newItems = photoItems.filter((item) => item.file)
  const pathByKey = {}
  for (const [i, item] of newItems.entries()) {
    onProgress?.(`Uploading photo ${i + 1} of ${newItems.length}…`)
    pathByKey[item.key] = await uploadPhoto(row.id, item.file)
  }
  for (const item of photoItems) if (item.existing) pathByKey[item.key] = item.existing.path

  const cover_path = pathByKey[coverKey] ?? null
  if (cover_path !== row.cover_path) {
    check(await supabase.from('concerts').update({ cover_path }).eq('id', row.id))
  }
  return { ...row, cover_path }
}

export async function deleteConcert(concert) {
  await removePhotos(concert.photos)
  check(await supabase.from('concerts').delete().eq('id', concert.id))
}

export async function setRankPos(id, rank_pos) {
  check(await supabase.from('concerts').update({ rank_pos }).eq('id', id))
}

export async function addCountdown(name, date) {
  check(await supabase.from('countdowns').insert({ name, date }))
}

export async function deleteCountdown(id) {
  check(await supabase.from('countdowns').delete().eq('id', id))
}

export function spotifySearchUrl(song) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist || ''}`.trim())}`
}
