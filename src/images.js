// Resize photos in the browser before upload so storage stays small and pages load fast.
export async function resizeImage(file, maxSize, quality = 0.85) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`Couldn't read "${file.name}". If it's a HEIC photo, export it as JPEG first.`)
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Couldn't process "${file.name}"`))),
      'image/jpeg',
      quality,
    ),
  )
}
