import slugify from 'slugify'

import { DisplayName } from '../interfaces'

export const escapeSpecialChars = (str: string) => {
  return str.replaceAll(/[+*?()]/g, String.raw`\$&`)
}

export const joinDisplayName = (name: DisplayName) => {
  return name.translations?.reduce((acc, translation) => {
    return `${acc} ${translation.content}`
  }, name.original)
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
