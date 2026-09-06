const MAX_DIMENSION = 800
const JPEG_QUALITY = 0.7
const MAX_SOURCE_BYTES = 20 * 1024 * 1024 // 20MB - a sanity cap on the *source* file, well before any resizing happens

// resizes down to at most 800px on the longest side and re-encodes as JPEG
// at 70% quality before it ever touches state or localStorage - climb
// photos are stored inline as base64 (see project notes: chose this over
// Firebase Storage to keep the app working with zero backend for everyone
// who never signs in), so keeping each one small matters a lot more here
// than it would with real file storage
export function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('That file is not an image.'))
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return Promise.reject(new Error('That image is too large (max 20MB).'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("That doesn't look like a valid image."))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not process that image.'))
          return
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}