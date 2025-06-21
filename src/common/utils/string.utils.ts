import slugify from 'slugify'

export const escapeSpecialChars = (str: string) => {
  return str.replaceAll(/[+*?()]/g, String.raw`\$&`)
}

export function convertSlug(text: string): string {
  return slugify(text, {
    lower: true,
    remove: /[^\w\s()-]/g,
  })
}

export const getFileName = (fileName: string) => {
  const index = fileName.indexOf('.')
  const file = slugify(fileName.slice(0, Math.max(0, index)))
  const extension = fileName.slice(Math.max(0, index))

  return `${file}-${Date.now()}${extension}`
}

export const isOriginalURL = (url: string) => {
  const regex = /^https?:\/\//
  return regex.test(url)
}
