import { Lazy } from './lazy.utils'

export const isNotNil = <T>(value: null | T | undefined): value is T =>
  value !== null && value !== undefined

export const isNil = <T>(value: null | T | undefined): value is null | undefined => !isNotNil(value)

export const isPromise = <T>(value: Promise<T> | T): value is Promise<T> =>
  value && typeof value == 'object' && (value instanceof Promise || 'then' in value)

export const isLazy = (value: unknown): value is Lazy<unknown> =>
  typeof value == 'object' && value instanceof Lazy
