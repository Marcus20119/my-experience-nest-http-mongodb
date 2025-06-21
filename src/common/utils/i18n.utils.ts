import type { TranslateOptions } from 'nestjs-i18n'
import { I18nContext, i18nValidationMessage } from 'nestjs-i18n'
import type { IfAnyOrNever, Path, PathValue } from 'nestjs-i18n/dist/types'

import type { I18nTranslations } from '@/generated/i18n.generated'

/**
 * A function that translates a given key using the current I18nContext.
 * It uses async_hooks for reducing boilerplate code.
 * Warning: This only can be used in the request lifecycle.
 *
 * @param {P} key - The key to be translated.
 * @param {TranslateOptions} [options] - Optional options for translation.
 * @return {IfAnyOrNever<R, string, R>} The translated string based on the key and options.
 */
export const t = <K = I18nTranslations, P extends Path<K> = any, R = PathValue<K, P>>(
  key: P,
  options?: TranslateOptions,
): IfAnyOrNever<R, string, R> => {
  const context = I18nContext.current<K>()

  if (!context) {
    throw new Error('I18nContext not found')
  }

  return context.t(key, options)
}

export const tValueMessage = <K = I18nTranslations, P extends Path<K> = any>(key: P) =>
  i18nValidationMessage<K>(key)
